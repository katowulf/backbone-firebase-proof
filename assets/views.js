/*! views.js
 *************************************/
(function ($, console) {
   "use strict";
   $.bb || ($.bb = {}); // namespace
   var V = $.bb.views = {};

   var userList = null; // set by loadUsers()


   /** BASE
    ***********************/

   var ViewBase = Backbone.View.extend({

      // applies backbone-firebase bindings automatically on record changes for real-time effect
      automateSync: function() {
         this.collection.on('all', function() {
            console.log('automateSync', _.toArray(arguments)); //debug
            //todo
            //todo
            //todo
            //todo
         }, this);
         this._addSubscription(function() { this.off('all') });
      },

      // Applies Backbone.ModelBinder bindings to the data
      applyDataBindings: function(template, $to, bindings) {
         bindings = _.extend({
            routeUrl: { selector: '[href=""]', elAttribute: 'href' },
            name: { selector: '[data-name="name"]' }
         }, bindings||{});
         var factory = $.bb.bindings.factory({template: template, bindings: bindings});
         var binder = new Backbone.CollectionBinder(factory);
         binder.bind(this.collection, $to);
         // add clickable delete event

         this._subscriptions.push(binder);
      },

      // show the html panel
      show: function() {
         this.$el.show();
      },

      // hide the html panel
      hide: function() {
         this.$el.hide();
      },

      // jQuery/Bootstrap validation
      addValidation: function() {
         this.$el.find('form').validate({
            highlight: function(label) {
               $(label).closest('.control-group').addClass('error').removeClass('success');
            },
            success: function(label) {
               $(label).closest('.control-group').addClass('success').removeClass('error');
            },
            submitHandler: _.bind(this.addEntry, this)
         });
      },

      // remove a record
      addDeleteTrigger: function(selector, root) {
         var collection = this.collection;
         var $e = root? this.$el.find(root) : this.$el;
         $e.on('click.deleteTrigger', selector, function() {
            var cid = ($(this).attr('href').match(/\/([^/]+)$/)||[])[1];
            if( cid ) {
               collection.remove( collection.get(cid) );
            }
            return false;
         });
         this._addSubscription(function() { $e.off('click.deleteTrigger') });
      },

      // add a record
      addEntry: function(form, evt) {
         var values = {};
         $(form).find('input[type=text], select').each(function() {
            var $self = $(this);
            var k = _.str.trim($self.attr('name'));
            values[k] = _.str.trim($self.val());
         });
         this.collection.add([values]);
         return false;
      },

      // just changes the default text in a field
      updateInputTextOnAdd: function($e, prefix, suffix) {
         suffix || (suffix = '');
         var list = this.collection;
         var fn = _.bind(function() {
            $e.val(prefix+(list.length+1)+suffix);
         }, this);
         list.on('add', fn);
         this._addSubscription(function() { list.off('add', fn) });
      },

      _subscriptions: [], // see destroy()

      // free resources if destroyed
      destroy: function() {
         _.each(this._subscriptions, function(sub) {
            if( sub.dispose ) { sub.dispose(); }
            else if( sub.unbind ) { sub.unbind(); }
         });
         //todo models/collections?
      },

      // a wrapper for creating disposable subscriptions
      _addSubscription: function(fn) {
         this._subscriptions.push({
            dispose: _.bind(fn, this)
         });
      }
   });



   /** USERS
    ***********************/

   V.Users = ViewBase.extend({
      collection: null,
      initialize: function(props) {
         $.bb.showMessage('Loading users from database', 'info', 2);
         this.collection = loadUsers();
         this.applyDataBindings('data-panel-users', this.$el.find('.data-panel'), {email: { selector: '[data-name="email"]' }});
         this.addValidation();
         this.addDeleteTrigger('a', '.data-panel');
         this.updateInputTextOnAdd(this.$el.find('[name=name]'), 'user');
         this.updateInputTextOnAdd(this.$el.find('[name=email]'), 'user', '@localhost.com');
         this.automateSync();
      }
   });


   /** WIDGETS
    ***********************/

   V.Widgets = ViewBase.extend({
      widgets: null,
      initialize: function(props) {
         $.bb.showMessage('Loading widgets from database', 'info', 2);
         this.collection = new $.bb.lists.Widgets(null, {footerRef: props.extra.footer});
         this.applyDataBindings('data-panel-widgets', this.$el.find('.data-panel'), {owner: {selector: '[data-name="owner"]'}});
         this.addValidation();
         this.addDeleteTrigger('a', '.data-panel');
         this.syncDropdownMenu();
         this.updateInputTextOnAdd(this.$el.find('[name=name]'), 'widget ');
         this.automateSync();
      },
      syncDropdownMenu: function() {
         var users = loadUsers();
         var template = $.bb.fetchTemplate('option-template');
         var factory = new Backbone.CollectionBinder.ElManagerFactory(template, { name: { selector: '' }});
         var binder = new Backbone.CollectionBinder(factory);
         binder.bind(users, this.$el.find('select'));
         this._subscriptions.push(binder);
      }
   });


   /** FOOTER
    ***********************/

   V.Footer = Backbone.View.extend({
      initialize: function(props) {
         // we're using ModelBinder instead of CollectionBinder here, so
         // we don't call applyDataBindings() on the super
         var bindings = $.bb.bindings.collect(this.$el, this.model.keys(), props && props.bind);
         this._binder = new Backbone.ModelBinder();
         this._binder.bind(this.model, this.el, bindings);
      }
   });


   /** HOME
    ***********************/

   V.Home = ViewBase.extend({});


   // loads the shared user list only once and returns on demand
   function loadUsers() {
      if( !userList ) {
         userList = new $.bb.lists.Users();
      }
      return userList;
   }

})(jQuery, console);