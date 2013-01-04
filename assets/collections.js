/*! collections.js
 *************************************/
(function ($) {
   "use strict";
   $.bb || ($.bb = {}); // namespace
   var C = $.bb.lists = {};

   var DEFAULTS = {};

   C.Users = Backbone.Collection.extend(_.extend({}, DEFAULTS, {
      model: $.bb.models.User,
      url: "/users",
      footerRef: null,
      initialize: function(models, props) {
         this.footerRef = props.footerRef;
         this.updateCount();
         this.backboneFirebase = new BackboneFirebase(this);
         this.on('all', function(action) {
            switch(action) {
               case 'add':
               case 'remove':
                  console.log('Users:', action); //debug
                  this.updateCount();
                  break;
               default:
               // do nothing
            }
         }, this);
      },
      updateCount: function() {
         this.footerRef && this.footerRef.set('userCount', this.length);
      }
   }));

   C.Widgets = Backbone.Collection.extend(_.extend({}, DEFAULTS, {
      model: $.bb.models.Widget,
      url: "/widgets",
      footerRef: null,
      initialize: function(models, props) {
         this.footerRef = props.footerRef;
         this.updateCount();
         this.backboneFirebase = new BackboneFirebase(this);
         this.on('all', function(action) {
            switch(action) {
               case 'add':
               case 'remove':
                  console.log('Widgets:', action); //debug
                  this.updateCount();
                  break;
               default:
               // do nothing
            }
         }, this);
      },
      updateCount: function() {
         this.footerRef && this.footerRef.set('widgetCount', this.length);
      }
   }));


})(jQuery);