process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
var _ = require('lodash');
var request = require('request');
module.exports = new Spotify();

function Spotify() {
  console.log('bonk');
  var spotScope = this;
  this.pending = [];
  this.token = false;
  this.csrf = false;
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
      if (spotScope.pending.length > 1) {
        _.each(spotScope.pending, function (f) {
          spotScope[f[0]](f[1]);
        });
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

  // return
  cb();
};
Spotify.prototype.addToPlaylist = function (cb) {
  if (!this.token || !this.csrf)
    return this.q('addToPlaylist', cb);

  // return
  cb();
};
