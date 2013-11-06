/* Author: AS */

window.Hub = window.Hub || {};

var router = Backbone.Router.extend({
  routes: {
    "businesses/:id": "businesses"
  },
  businesses: function(id) {
    // alert('business')
  }
});
Hub.router = new router();

// on domready stuff
$(function() {
	UI.init();
	BusinessBrowser.init();
	Backbone.history.start({pushState: false});
});