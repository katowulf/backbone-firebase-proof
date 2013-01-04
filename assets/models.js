/*! User.js
 *************************************/
(function ($) {
   "use strict";
   $.bb || ($.bb = {}); // namespace
   var M = $.bb.models = {};

   var ModelBase = Backbone.Model.extend({
      idAttribute: '_key',
      keys: function() {
         return _.keys(this.attributes);
      }
   });

   M.User = ModelBase.extend({
      defaults: {
         name: 'Anon Y. Mous',
         email: 'unknown@localhost'
      },
      url: function() {
         var key = this.get(this.idAttribute);
         return key? '/users/'+key : null;
      },
      initialize: function(){
         this.set('routeUrl', '#/user/delete/'+this.cid);
      }
   });

   M.Widget = ModelBase.extend({
      defaults: {
         name: 'unknown widget',
         owner: 'no owner'
      },
      url: function() {
         var key = this.get(this.idAttribute);
         return key? '/widgets/'+key : '/widgets';
      },
      initialize: function(){
         this.set('routeUrl', '#/widget/delete/'+this.cid);
      }
   });

   M.Footer = ModelBase.extend({
      defaults: {
         'route': 'home',
         'userCount': '*',
         'widgetCount': '*'
      }
   });

})(jQuery);