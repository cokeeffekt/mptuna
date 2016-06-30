module.exports = Vue.extend({
  template: require('modules/player/player.tpl'),
  data: function () {
    return {
      odd: false,
    };
  },
  ready: function () {
    this.connectToStream();
  },
  methods: {
    connectToStream: function () {
      var peer = new Peer({
        key: 'rx1g1udef1ypsyvi'
      });

      peer.on('open', function (id) {
        console.log('My peer ID is: ' + id);

        // ping the server to give peerid, it will respond with music.
        var conn = peer.connect('megaport-tuna-server');

        var player = $('#audioPlayer').get(0);
        peer.on('call', function (call) {
          console.log('server is trying to give you music.');
          call.answer();
          call.on('stream', function (stream) {
            console.log('STREAMING!!!!');
            player.src = URL.createObjectURL(stream);
            var ctx = new AudioContext();

            var audioSrc = ctx.createMediaStreamSource(stream);
            var analyser = ctx.createAnalyser();
            audioSrc.connect(analyser);
            analyser.connect(ctx.destination);
            // analyser.fftSize = 64;
            var frequencyData = new Uint8Array(analyser.frequencyBinCount);

            // we're ready to receive some data!
            var canvas = document.getElementById('canvas'),
              cwidth = canvas.width,
              cheight = canvas.height - 2,
              meterWidth = 10, //width of the meters in the spectrum
              gap = 2, //gap between meters
              capHeight = 2,
              capStyle = '#fff',
              meterNum = 800 / (10 + 2), //count of the meters
              capYPositionArray = []; ////store the vertical position of hte caps for the preivous frame

            ctx = canvas.getContext('2d');
            gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(1, '#819196');
            gradient.addColorStop(0.5, '#ff0');
            gradient.addColorStop(0, '#f00');
            // loop
            function renderFrame() {
              var array = new Uint8Array(analyser.frequencyBinCount);
              analyser.getByteFrequencyData(array);
              var step = Math.round(array.length / meterNum); //sample limited data from the total array
              ctx.clearRect(0, 0, cwidth, cheight);
              for (var i = 0; i < meterNum; i++) {
                var value = array[i * step];
                if (capYPositionArray.length < Math.round(meterNum)) {
                  capYPositionArray.push(value);
                }
                ctx.fillStyle = capStyle;
                //draw the cap, with transition effect
                if (value < capYPositionArray[i]) {
                  ctx.fillRect(i * 12, cheight - (--capYPositionArray[i]), meterWidth, capHeight);
                } else {
                  ctx.fillRect(i * 12, cheight - value, meterWidth, capHeight);
                  capYPositionArray[i] = value;
                }
                ctx.fillStyle = gradient; //set the filllStyle to gradient for a better look
                ctx.fillRect(i * 12 /*meterWidth+gap*/ , cheight - value + capHeight, meterWidth, cheight); //the meter
              }
              requestAnimationFrame(renderFrame);
            }
            renderFrame();
            player.play();

          });
        });
      });
    }
  },

});
