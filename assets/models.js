/*! User.js
 *************************************/
(function ($) {
   "use strict";
   $.bb || ($.bb = {}); // namespace
   var M = $.bb.models = {};


   var BASE = {
      idAttribute: '_key',
      keys: function() {
         return _.keys(this.attributes);
      }
   };

   M.User = Backbone.Model.extend(_.extend({}, BASE, {
      defaults: {
         name: 'Anon Y. Mous',
         email: 'unknown@localhost'
      },
      url: function() {
         var key = this.get(this.idAttribute);
         return key? '/users/'+key : null;
      },
      initialize: function(){
         this.set('routeUrl', '#/users/'+this.cid);
      }
   }));

   M.Widget = Backbone.Model.extend(_.extend({}, BASE, {
      defaults: {
         name: 'shiny widget',
         owner: 'katowulf'
      },
      url: function() {
         var key = this.get(this.idAttribute);
         return key? '/widgets/'+key : '/widgets';
      },
      initialize: function(){
         this.set('routeUrl', '#/widgets/'+this.cid);
      }
   }));

   M.Footer = Backbone.Model.extend(_.extend({}, BASE, {
      defaults: {
         'route': 'home',
         'userCount': '*',
         'widgetCount': '*'
      },
      initialize: function() {
         this.on('all', function(action, props) {
            console.log('Footer model', action, props); //debug
         })
      }
   }));

})(jQuery);