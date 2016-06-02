var peer = new Peer({
  key: 'rx1g1udef1ypsyvi'
});

window.AudioContext = window.AudioContext || window.webkitAudioContext;

peer.on('open', function (id) {
  console.log('My peer ID is: ' + id);

  // ping the server to give peerid, it will respond with music.
  var conn = peer.connect('megaport-tuna-server');

  var player = $('#player').get(0);
  peer.on('call', function (call) {
    console.log('server is trying to give you music.');
    call.answer();
    call.on('stream', function (stream) {
      console.log('STREAMING!!!!');
      player.src = URL.createObjectURL(stream);

      var ctx = new window.AudioContext();
      var audioSrc = ctx.createMediaStreamSource(stream);
      var analyser = ctx.createAnalyser();
      audioSrc.connect(analyser);
      var frequencyData = new Uint8Array(analyser.frequencyBinCount);
      setInterval(function () {
        analyser.getByteFrequencyData(frequencyData);
        console.log(frequencyData);
      }, 33);
    });
  });

});

var mpApp = new Vue({
  data: {}
});

$(function () {
  mpApp.$mount('#mpTuna');
});
