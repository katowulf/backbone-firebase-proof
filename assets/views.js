/*! views.js
 *************************************/
(function ($) {
   "use strict";
   $.bb || ($.bb = {}); // namespace
   var V = $.bb.views = {};

   var DEFAULTS = {
      initialize: function(props) {
         this.load && this.load(props);
      },
      show: function() {
         this.$el.show();
      },
      hide: function() {
         this.$el.hide();
      },
      close: function() {
         this._binder && this._binder.unbind();
      }
   };

   V.Users = Backbone.View.extend(_.extend({}, DEFAULTS, {
      users: null,
      load: function(props) {
         this.users = new $.bb.lists.Users(null, {footerRef: props.extra.footer});
         this.users.on('add', function() {
            console.log('add user record', _.toArray(arguments)); //debug
         });
         var $el = this.$el;
         var factory = $.bb.bindings.factory($el, {template: 'data-panel-users'});
         this._binder = new Backbone.CollectionBinder(factory);
         this._binder.bind(this.users, $el.find('.data-panel'));
         $el.find('form').validate({
            highlight: function(label) {
               $(label).closest('.control-group').addClass('error').removeClass('success');
            },
            success: function(label) {
               $(label).closest('.control-group').addClass('success').removeClass('error');
            },
            submitHandler: this.addUser
         });
      },
      addUser: function() {
         console.log('addUser', _.toArray(arguments)); //debug
         return false;
      },
      delUser: function() {
         console.log('delUser', _.toArray(arguments)); //debug
         return false;
      }
   }));

   V.Widgets = Backbone.View.extend(_.extend({}, DEFAULTS, {
      widgets: null,
      load: function(props) {
         this.widgets = new $.bb.lists.Widgets(null, {footerRef: props.extra.footer});
         var $el = this.$el;
         var factory = $.bb.bindings.factory($el, {template: 'data-panel-widgets'});
         this._binder = new Backbone.CollectionBinder(factory);
         this._binder.bind(this.widgets, $el.find('.data-panel'));
      }
   }));

   V.Footer = Backbone.View.extend(_.extend({}, DEFAULTS, {
      load: function(props) {
         var bindings = $.bb.bindings.collect(this.$el, this.model.keys(), props && props.bind);
         this._binder = new Backbone.ModelBinder();
         this._binder.bind(this.model, this.el, bindings);
      },
      show: function() {},
      hide: function() {}
   }));

   V.Home = Backbone.View.extend(_.extend({}, DEFAULTS));

})(jQuery);