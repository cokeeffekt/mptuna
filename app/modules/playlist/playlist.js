module.exports = Vue.extend({
  props: ['playlist'],
  template: require('modules/playlist/playlist.tpl'),
  data: function () {
    return {
      showPlaylist: false,
    };
  },
  ready: function () {},
  methods: {},
  events: {}
});
