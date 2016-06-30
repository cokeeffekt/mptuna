var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var spotify = require('./server/spot.js');

spotify.currentlyPlaying(function () {
  console.log('iran');
});
app.use(express.static('public'));

io.on('connection', function (socket) {
  console.log('a user connected');
  socket.on('add-to-playlist', function (trackId) {
    spotify.addToPlaylist(trackId);
  });
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});

console.log(':|');
