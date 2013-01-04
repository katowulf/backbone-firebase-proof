//     Backbone <-> Firebase v0.0.3
//
//     Started as a fork of Backpusher.js (https://github.com/pusher/backpusher)
//
//     Backbone <-> Firebase (c) 2012 Alex Bain
//     Backpusher originally (c) 2011-2012 Pusher
//
//     This script may be freely distributed under the MIT license.
//
(function(exports, undefined){

  var BackboneFirebase = function(collection, options) {
    this.collection = collection;
    
    // Extend the defaults with the options provided and set as `this.options`.
    this.options = Backbone.$.extend({
       urlPrefix: BackboneFirebase.DEFAULT_INSTANCE, // use default unless options provides a prefix
       idAttribute: '_firebase_name'
    }, options);

    // Optionally pass the urlPrefix in.
    this.reference = getFirebaseRef(this.options.urlPrefix, collection.url);

    // Optionally specify the idAttribute to use.
    this.idAttribute = this.options.idAttribute;
    
    if (this.options.events) {
      this.events = this.options.events;
    } else {
      this.events = BackboneFirebase.defaultEvents;
    }

    this._bindEvents();
    this.initialize(collection, options);

    return this;
  };

  _.extend(BackboneFirebase.prototype, Backbone.Events, {
    initialize: function() {},

    _bindEvents: function() {
      if (!this.events) return;

      for (var event in this.events) {
        if (this.events.hasOwnProperty(event)) {
          this.reference.on(event, _.bind(this.events[event], this));
        }
      }
    },

    _add: function(pushed_model) {
      var Collection = this.collection;

      // Set the model id attribute to be the firebase reference name.
      var attr = pushed_model.val();
      attr[this.idAttribute] = pushed_model.name();
      model = new Collection.model(attr);

      Collection.add(model);
      this.trigger('remote_create', model);

      return model;
    }
  });

  // Allows the default URL to be set globally (can still be overridden in options, too)
  BackboneFirebase.DEFAULT_INSTANCE = 'http://YOURDB.firebaseio.com';

  BackboneFirebase.defaultEvents = {
    child_added: function(pushed_model) {
      return this._add(pushed_model);
    },

    child_changed: function(pushed_model) {

      // Get existing model using the reference name as the model id.
      var model = this.collection.get(pushed_model.name());

      if (model) {
        model = model.set(pushed_model.val());

        this.trigger('remote_update', model);

        return model;
      } else {
        return this._add(pushed_model);
      }
    },

    child_removed: function(pushed_model) {

      // Get existing model using the reference name as the model id.
      var model = this.collection.get(pushed_model.name());

      if (model) {
        this.collection.remove(model);
        this.trigger('remote_destroy', model);

        return model;
      }
    }
  };

  // store the rest API for future use (some models can be bound to this instead of Firebase)
  Backbone.rest = Backbone.sync;

  // Original Backbone.sync method from v0.9.2
  Backbone.sync = function(method, model, options) {

    // Verify Firebase object exists
    if (typeof Firebase === undefined) return false;

    // Default options, unless specified.
    options = Backbone.$.extend({
       urlPrefix: BackboneFirebase.DEFAULT_INSTANCE
    }, options);

    var url = getValue(model, 'url');
    if( !url ) {
       return urlError();
    }

    // Setup the Firebase Reference
    var ref = getFirebaseRef(options.urlPrefix, url);

    // Map CRUD to Firebase actions
    switch (method) {
      case 'create':
        ref.push(model.toJSON(), function (success) {
          if (success && options.success) options.success();
          else if (!success && options.error) options.error();
        });
        break;
      case 'read':
        ref.once('value', function (data) {
          data = _.toArray(data.val());
          if (options.success) options.success(data, "success", {});
        });
        break;
      case 'update':
        ref.set(model.toJSON(), function (success) {
          if (success && options.success) options.success();
          else if (!success && options.error) options.error();
        });
        break;
      case 'delete':
        ref.remove(function (success) {
          if (success && options.success) options.success();
          else if (!success && options.error) options.error();
        });
        break;
      default:
        break;
    }

    return ref;
  };

  function urlError() {
     typeof(console) !== 'undefined' && console.error && console.error(new Error('model.url must be defined'));
  }

  function getFirebaseRef(prefix, url) {
     if( !(prefix in INSTANCES) ) {
        // prevent opening multiple instances of Firebase when using the same prefix
        // one instance to rule them all, once instance to find them, one instance to bring them all, and in Backbone.bind() them
        INSTANCES[prefix] = new Firebase(prefix);
     }
     return INSTANCES[prefix].child(url);
  }
  var INSTANCES = {};

  var getValue = function(object, prop) {
    if (!(object && object[prop])) return null;
    return _.isFunction(object[prop]) ? object[prop]() : object[prop];
  };

  exports.BackboneFirebase = BackboneFirebase;

})((typeof exports !== 'undefined' ? exports : this));