var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var redis = require('redis').createClient()

redis.on('error', function (err) {
  console.log('[REDIS:ERR] ' + err);
});

// some init
redis.set('tuna:cache:score', 1000); // set a base score for tracks and then increment as they're added
redis.del('tuna:playlist:main'); // trash any existing playlist

var spotify = require('./server/spot.js');

app.use(express.static('public'));

io.on('connection', function (socket) {
  console.log('a user connected');
  socket.on('add-to-playlist', function (trackId) {
    spotify.addToPlaylist(trackId);
  });
});

spotify.on('playlist-change', function () {});

http.listen(3000, function () {
  console.log('listening on *:3000');
});

console.log(':|');
