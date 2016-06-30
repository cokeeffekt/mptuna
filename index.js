var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var spotify = require('./server/spot.js');

spotify.currentlyPlaying(function () {
  console.log('iran');
});
spotify.addToPlaylist('1dB3Hsi3LfViWtqE8Sj8pr', function () {
  console.log('boomticka');
});
spotify.playNext(function (trk) {
  console.log(trk);
});

app.use(express.static('public'));

io.on('connection', function (socket) {

  socket.on('add-to-playlist', function (trackId) {
    spotify.addToPlaylist(trackId);
  });

});

spotify.on('change-playlist', function () {
  io.emit('play-list', this.playlist);
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});
