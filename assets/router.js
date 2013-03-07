/*! router.js
 *************************************/
(function ($, console) {
   "use strict";
   $.bb || ($.bb = {}); // namespace

   var footer;

   $.bb.Router = {
      'init': function(footerModel) {
         footer = footerModel;
         new Router();
         Backbone.history.start();
      }
   };

   var shown = null;
   var Router = Backbone.Router.extend({
         'routes': {
            "": 'home',
            "home": "home",
            "users": "users",
            "widgets": "widgets"
         },

         'home': function() {
            console.log('route: home');
         },

         'users': function() {
            console.log('route: users');
         },

         'widgets': function(user) {
            console.log('route: widgets');
         },

         'initialize': function() {
            // runs any time a route is triggered
            this.on('all', function (trigger, args) {
               var routeData = trigger.split(":");
               if (routeData[0] === "route") {
                  var newRoute = routeData[1];
                  footer && footer.set('route', newRoute);

                  //$log.text('current route: ' + newRoute + (args? ' ('+args+')' : ''));
                  var $el = $('article[data-route="'+newRoute+'"]');
                  if( $el.length ) {
                     shown && shown.hide();
                     shown = loadView(newRoute, $el);
                  }

                  // update nav links
                  $('nav .nav li').removeClass('active').has('a[href="#/'+newRoute+'"]').addClass('active');
                  // do whatever here.
                  // routeData[1] will have the route name
               }
            });
         }
      });

   function loadView(route, $el) {
      var v = loadedViews[route];
      if( !v ) {
         var View = $.bb.views[_.str.titleize(route)];
         if( View ) {
            var props = { 'extra': {'footer': footer} };
            if( $el ) { props.el = $el; }
            else { props.tagName = 'div' }
            v = loadedViews[route] = new View(props);
         }
      }
      v && v.show();
      return v;
   }
   var loadedViews = $.bb.loadedViews = {}; // just stored in scope for debugging

})(jQuery, window.console);