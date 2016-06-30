window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;

var mpApp = new Vue({
  data: {},
  components: {
    search: require('modules/search/search'),
    player: require('modules/player/player'),
    socket: false
  },
  created: function () {
    this.socket = io();
  },
  events: {
    'add-to-playlist': function (trackId) {
      console.log('telling servier to add track', trackId);
      this.socket.emit('add-to-playlist', trackId);
    }
  }
});

$(function () {
  mpApp.$mount('#mpTuna');
});
