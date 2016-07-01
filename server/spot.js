process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

var _ = require('lodash');
var request = require('request');
var querystring = require('querystring');

var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi();

var redis = require('redis').createClient()

redis.on('error', function (err) {
  console.log('[REDIS:ERR] ' + err);
});

module.exports = new Spotify();

function Spotify() {
  var spotScope = this;
  this.playlist = [];
  this.pending = [];
  this.token = false;
  this.csrf = false;
  this.events = {};

  this.state = {};

  request('http://open.spotify.com/token', function (err, resp, body) {
    if (err) throw err;
    var b = JSON.parse(body);
    spotScope.token = b.t;

    var options = {
      url: 'https://client.spotilocal.com:4370/simplecsrf/token.json',
      headers: {
        'Origin': 'https://open.spotify.com'
      }
    };
    request(options, function (err, options, body) {
      if (err) throw err;
      var b = JSON.parse(body);
      spotScope.csrf = b.token;

      if (spotScope.pending.length > 0) {
        _.each(spotScope.pending, function (f) {
          spotScope[f[0]](f[1]);
        });

        this.pending = [];
      }
    });
  });

}

Spotify.prototype.q = function (func, cb) {
  console.log('pending');
  this.pending.push([func, cb]);
};

Spotify.prototype.currentlyPlaying = function (cb) {
  if (!this.token || !this.csrf)
    return this.q('currentlyPlaying', cb);

  this._request({
    uri: '/remote/status.json',
    cb: function (res) {
      this.state = res;
      cb(res);
    }
  });
};

Spotify.prototype.playNext = function (cb) {
  if (!this.token || !this.csrf)
    return this.q('playNext', cb);

  var parent = this;

  redis.zrange('tuna:playlist:main', 0, 1, function (err, next) {
    if (err) return console.error(err);
    console.log('next', next);

    next = next[0];
    this._request({
      uri: '/remote/play.json',
      extra: {
        play: next,
        context: next
      },
      cb: function () {
        parent.trigger('change-track');
        parent.trigger('change-playlist');

        this.currentlyPlaying();
      }
    });

    // add/increment this track in popularity list
    redis.zincrby('tuna:cache:played', 1, next);
  });
};

Spotify.prototype.addToPlaylist = function (trackId, user) {
  var parent = this;

  this._getTrackData(trackId, function (track) {
    // get current score then add to playlist
    redis.get('tuna:cache:score', function (err, score) {
      if (err) return console.error(err);

      redis.incr('tuna:cache:score');
      redis.zadd('tuna:playlist:main', score, trackId);
      parent.trigger('change-playlist');
    });
  });
};

Spotify.prototype.getPlaylist = function (cb) {
  var parent = this;

  redis.zrange('tuna:playlist:main', 0, 100, function (err, reply) {
    if (err) throw err;

    var playlist = [];
    console.log(reply);
    redis.hmget('tuna:cache:tracks', reply, function (err, tracks) {
      if (err) return console.error(err);
      var playlist = _.map(tracks, function (track) {
        track = JSON.parse(track);
        return {
          name: track.name,
          artist: track.artists[0].name,
          album: {
            name: track.album.name,
            uri: track.album.uri,
            cover: track.album.images[0].url || ''
          },
          trackId: track.id
        };
      });
      cb(playlist);
    });
  });
};

Spotify.prototype.voteTrack = function (trackId) {
  var parent = this;

  redis.zscore('tuna:playlist:main', trackId, function (err, res) {
    if (err) return console.error(err);

    if (res) {
      redis.zincrby('tuna:playlist:main', -10, trackId, function () {
        parent.trigger('change-playlist');
      });
    }
  });
};

Spotify.prototype._getTrackData = function (trackId, cb) {
  redis.hget('tuna:cache:tracks', trackId, function (err, track) {
    // return if cache hit
    if (_.isObject(track)) {
      cb(track);
      return;
    }

    // else if miss, go fetch
    spotifyApi.getTrack(trackId)
      .done(function (data) {
        var track = data.body;

        // cache for next time
        redis.hset('tuna:cache:tracks', trackId, JSON.stringify(track));

        cb(track);
      });
  });
};

Spotify.prototype._request = function (args) {
  var params = {
    oauth: this.token,
    csrf: this.csrf
  };

  if (_.isObject(args.extra))
    params = _.merge(params, args.extra);

  var fullUri = 'https://client.spotilocal.com:4371' + args.uri + '?' + querystring.stringify(params);

  var options = {
    url: fullUri,
    headers: {
      'Origin': 'https://open.spotify.com'
    }
  };

  request(options, function (err, options, body) {
    if (err) throw err;
    var b = JSON.parse(body);

    if (_.isFunction(args.cb))
      args.cb(b);
  });
};

Spotify.prototype.on = function (evnt, func) {
  if (!_.isArray(this.events[evnt]))
    this.events[evnt] = [];
  this.events[evnt].push(func);
};

Spotify.prototype.trigger = function (evnt, args) {
  var self = this;
  if (!_.isArray(this.events[evnt])) return;
  _.each(this.events[evnt], function (f) {
    f.apply(self, args);
  });
};
