process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

var _ = require('lodash');
var request = require('request');
var querystring = require('querystring');

var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi();

module.exports = new Spotify();

function Spotify() {
  var spotScope = this;
  this.playlist = [];
  this.pending = [];
  this.token = false;
  this.csrf = false;
  this.events = {};

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

  this._request('/remote/status.json', cb);
};

Spotify.prototype.playNext = function (cb) {
  if (!this.token || !this.csrf)
    return this.q('playNext', cb);

  var track = this.playlist.shift();
  if (!track)
    return;

  this._request('/remote/play.json', cb, {
    play: track.id,
    context: track.id
  });
};

Spotify.prototype.addToPlaylist = function (trackId, user) {
  var parent = this;

  spotifyApi.getTrack(trackId)
    .done(function (data) {
      var track = data.body;

      parent.playlist.push({
        id: trackId,
        track: track.name,
        artist: track.artists[0].name,
        album: {
          name: track.album.name,
          uri: track.album.uri,
          cover: track.album.images[0].url || ''
        }
      });
      parent.trigger('change-playlist');
    });
};

Spotify.prototype._request = function (uri, cb, args) {
  var params = {
    oauth: this.token,
    csrf: this.csrf
  };

  if (typeof args === 'object')
    params = Object.assign(params, args);

  var fullUri = 'https://client.spotilocal.com:4371' + uri + '?' + querystring.stringify(params);

  var options = {
    url: fullUri,
    headers: {
      'Origin': 'https://open.spotify.com'
    }
  };

  request(options, function (err, options, body) {
    if (err) throw err;
    var b = JSON.parse(body);

    console.log('also here', b);

    cb(b);
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
