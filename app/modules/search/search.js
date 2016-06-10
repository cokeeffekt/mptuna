module.exports = Vue.extend({
  template: require('modules/search/search.tpl'),
  data: function () {
    return {
      isOpen: false,
      isAnimating: false
    };
  }
});
