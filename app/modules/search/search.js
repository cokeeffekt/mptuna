module.exports = Vue.extend({
  template: require('modules/search/search.tpl'),
  data: function () {
    return {
      isOpen: false,
      isAnimating: false,
      spotify: new SpotifyWebApi(),
      searching: '',
      results: []
    };
  },
  watch: {
    searching: function (val) {
      var $cope = this;
      this.spotify.searchTracks(val)
        .then(function (data) {
          console.log(data.tracks.items);
          $cope.results = data.tracks.items;
        }, function (err) {
          console.error(err);
        });
    }
  },
  computed: {
    showResults: function () {
      return _.chain(this.results).map(function (r) {
        return {
          title: r.name,
          artists: _.map(r.artists, 'name')
        };
      }).value();
    }
  }
});