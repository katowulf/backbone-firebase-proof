/*! User.js
 *************************************/
(function ($) {
   "use strict";
   $.bb || ($.bb = {}); // namespace
   var M = $.bb.models = {};

   var ModelBase = Backbone.Model.extend({
      idAttribute: '_id',
      'keys': function() {
         return _.keys(this.attributes);
      },
      'toJSON': function() {
         return _.omit(this.attributes, this.idAttribute, 'routeUrl');
      }
   });

   M.User = ModelBase.extend({
      defaults: {
         'name': 'Anon Y. Mous',
         'email': 'unknown@localhost'
      },
      'url': 'users',
      'initialize': function(){
         this.set({'routeUrl': '#/user/delete/'+this.cid}, {'silent': true});
      }
   });

   M.Widget = ModelBase.extend({
      'defaults': {
         'name': 'unknown widget',
         'owner': 'no owner'
      },
      'url': 'widgets',
      'initialize': function(){
         this.set({'routeUrl': '#/user/delete/'+this.cid}, {'defaults': true});
      }
   });

   M.Footer = ModelBase.extend({
      'defaults': {
         'route': 'home',
         'userCount': '*',
         'widgetCount': '*'
      }
   });

})(jQuery);