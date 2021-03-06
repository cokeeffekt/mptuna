window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;

var mpApp = new Vue({
  data: {
    playlist: [],
    showplaylist: false
  },
  components: {
    search: require('modules/search/search'),
    player: require('modules/player/player'),
    playlistPanel: require('modules/playlist/playlist'),
    socket: false
  },
  created: function () {
    var $cope = this;
    this.socket = io();

    this.socket.on('play-list', function (playlist) {
      $cope.$emit('play-list', playlist);
    });
  },
  events: {
    'add-to-playlist': function (trackId) {
      console.log('telling server to add track', trackId);
      this.socket.emit('add-to-playlist', trackId);
    },
    'play-list': function (playlist) {
      var $cope = this;
      _.each(playlist, function (s, i) {
        s.order = i;
        var ex = _.find($cope.playlist, {
          trackId: s.id
        });
        if (!ex)
          return $cope.playlist.push(s);
        _.merge(ex, s);
      });
    }
  }

});

$(function () {
  mpApp.$mount('#mpTuna');
});

// SVG icons
var svgLoad = (function (filePath) {
  if (!$) return false;
  var $map = $('<div style="display: none;"></div>');

  function build() {
    var data = localStorage.getItem('_svgLoad_data');
    $(function () {
      $map.html(data);
      $(document.body).prepend($map);
    });
  }
  $.get(filePath, function (data) {
    localStorage.setItem('_svgLoad_data', data);
    build();
  }, 'html');
  build();

})('/icons/symbol-defs.svg');
