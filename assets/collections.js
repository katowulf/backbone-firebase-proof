/*! collections.js
 *************************************/
(function ($) {
   "use strict";
   $.bb || ($.bb = {}); // namespace
   var C = $.bb.lists = {};

   C.Users = Backbone.Collection.extend({
      'model': $.bb.models.User,
      'url': "/users",
      'initialize': function() {
         this.updateCount();
         this.backboneFirebase = new BackboneFirebase(this, {idAttribute: '_id', syncManager: BackboneFirebaseAutoSync});
         this.on('all', function(action, model) {
            switch(action) {
               case 'add':
               case 'remove':
                  this.updateCount();
                  break;
               default:
                  // do nothing
            }
         }, this);
      },
      'updateCount': function() {
         $.bb.updateFooter({'userCount': this.length});
      }
   });

   C.Widgets = Backbone.Collection.extend({
      model: $.bb.models.Widget,
      'url': "/widgets",
      'initialize': function(models, props) {
         this.updateCount();
         this.backboneFirebase = new BackboneFirebase(this, {idAttribute: '_id', 'syncManager': BackboneFirebaseAutoSync});
         this.on('all', function(action) {
            switch(action) {
               case 'add':
               case 'remove':
                  this.updateCount();
                  break;
               default:
               // do nothing
            }
         }, this);
      },
      'updateCount': function() {
         $.bb.updateFooter({'widgetCount': this.length});
      }
   });


})(jQuery);