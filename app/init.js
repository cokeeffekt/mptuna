window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;

var mpApp = new Vue({
  data: {},
  components: {
    search: require('modules/search/search'),
    player: require('modules/player/player')
  }
});

$(function () {
  mpApp.$mount('#mpTuna');
});
