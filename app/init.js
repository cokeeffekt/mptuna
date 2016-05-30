var peer = new Peer({
  key: 'rx1g1udef1ypsyvi'
});

peer.on('open', function (id) {
  console.log('My peer ID is: ' + id);

  // ping the server to give peerid, it will respond with music.
  var conn = peer.connect('megaport-tuna-server');

  peer.on('call', function (call) {
    console.log('server is trying to give you music.');
    call.answer();
    call.on('stream', function (stream) {
      console.log('STREAMING!!!!');
      $('#player').prop('src', URL.createObjectURL(stream));
    });
  });

});

var mpApp = new Vue({
  data: {}
});

$(function () {
  mpApp.$mount('#mpTuna');
});
