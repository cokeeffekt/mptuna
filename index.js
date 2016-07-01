var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var redis = require('redis').createClient()

var Raven = require('raven');
var raven = new Raven.Client('https://8d572f37caab454fa22928fec1397311:8fb9e14b24f74a4f839c030ef39b8c18@sentry.megaport.com/33');
raven.patchGlobal();

redis.on('error', function (err) {
  console.error('[REDIS:ERR] ' + err);
});

// some init
redis.set('tuna:cache:score', 1000); // set a base score for tracks and then increment as they're added
redis.del('tuna:playlist:main'); // trash any existing playlist

var spotify = require('./server/spot.js');

app.use(express.static('public'));

io.on('connection', function (socket) {
  socket.on('add-to-playlist', function (trackId) {
    spotify.addToPlaylist(trackId);
  });
});

spotify.on('change-playlist', function () {
  this.getPlaylist(function (playlist) {
    io.emit('play-list', playlist);
  });
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});
