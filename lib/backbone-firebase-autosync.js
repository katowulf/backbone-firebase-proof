//     Backbone <-> Firebase v0.0.3
//
//     Started as a fork of Backpusher.js (https://github.com/pusher/backpusher)
//
//     Backbone <-> Firebase (c) 2012 Alex Bain
//     Backpusher originally (c) 2011-2012 Pusher
//
//     @contributor  katowulf@gmail.com
//
//     This script may be freely distributed under the MIT license.
//
(function(exports, console){
   "use strict";

   /**
    * Automatically synchronizes any changes on the client back to the server for real-time events.
    *
    * To use, simply pass this class (not an instance) as an option to BackboneFirebase:
    *     new BackboneFirebase(collection, {syncManager: BackboneFirebaseAutoSync});
    *
    * A sync manager must declare two methods for use by BackboneFirebase. See the comments below for more
    * details about each:
    *     isEcho - returns true if the event should be ignored (it's the echo we expected)
    *     dispose - tells the sync manager to stop listening for events and return all resources
    *
    * @param conn
    * @constructor
    */
   function SyncManager(conn) {
      this.urlPrefix = conn.options.urlPrefix;
      this.collection = conn.collection;
      this.key = conn.idAttribute;
      this.events = Backbone.$.syncmanagerevents = { 'create': {}, 'update': {}, 'delete': {}, 'tempids': {} }; //debug
      this.subscriptions = [];
      conn.collection.on('all', disposableEvent(this, conn.collection, 'all', this._processPushAttempt));
      conn.on('all', disposableEvent(this, conn, 'all', this._expect));
   }

   _.extend(SyncManager.prototype, {

      /**
       * When events arrive from the client, we check to see if they were expected (originated at the server).
       * If so, delete the expected event and ignore it. If not, return true so it is synced back to server.
       *
       * @param {string} action
       * @param model
       */
      'isEcho': function(action, model) {
         var key, actionList, found = false;
         var syncAction = getSyncAction(action);
         if( syncAction === 'create' && action === 'before_remote_create' ) {
            found = searchForCreateMatch(this, model);
         }
         else if( syncAction ) {
            actionList = this.events[syncAction];
            key = getKey(model, this.key);
            found = (actionList && key in actionList);
            found && delete actionList[key];
         }
         return found;
      },

      /**
       * Stop monitoring all events and do not consume any more resources.
       */
      'dispose': function() {
         _.each(this.subscriptions, function(sub) { sub.dispose(); });
         this.subscriptions = [];
         this.collection = null;
         this.events = null;
      },

      /**
       * Read an incoming event from the Collection, decide if it was from the server, if not, then sync it.
       *
       * This should not be called manually, instead, it will be called internally by SyncManager
       *
       * @param {string} action we monitor 'add', 'update', and 'remove'
       * @param model
       * @private
       */
      '_processPushAttempt': function(action, model) {
         var syncAction = getSyncAction(action);
         if( syncAction && !this.isEcho(action, model) ) {
            this._expect(syncAction, model);
            var fn = syncAction === 'create'? setIdOnSuccess(this, model) : null;
//            console.log('Backbone.sync()', syncAction, model, {'urlPrefix': this.urlPrefix, 'success': fn}); //debug
            Backbone.sync(syncAction, model, {'urlPrefix': this.urlPrefix, 'success': fn});
         }
      },

      /**
       * When events arrive from the server, we mark them expected;
       * the collection should rebound them to us as added
       *
       * @param {string} action
       * @param model
       * @param id
       * @private
       */
      '_expect': function(action, model, id) {
         var syncAction = getSyncAction(action);
         var modelJson = valueJson(model.toJSON(), this.key);
         var key = id || model.id;
         // we don't store entries without a key; we look those up the hard way
         if( syncAction &&  key ) {
            this.events[syncAction][key] = modelJson;
         }
         else if( syncAction === 'create' ) {
            this.events['tempids'][model.cid] = modelJson;
         }
      }
   });


   // only intended to be used for Firebase on/off functions
   function disposableEvent(self, conn, event, fn) {
      var boundFn = _.bind(fn, self);
      self.subscriptions.push({ 'dispose': function() { conn.off(event, boundFn)} });
      return boundFn;
   }

   // translate incoming/outgoing events to the model we will use when calling Backbone.sync
   function getSyncAction(action) {
      var syncAction;
      switch(action) {
         case 'before_remote_create':
         case 'add':
         case 'create':
            syncAction = 'create';
            break;
         case 'before_remote_destroy':
         case 'remove':
         case 'delete':
            syncAction = 'delete';
            break;
         case 'before_remote_update':
         case 'change':
         case 'update':
            syncAction = 'update';
            break;
         default:
         // do nothing
      }
      return syncAction;
   }

   function getKey(data, key) {
      if( typeof(data.get) === 'function' ) {
         return data.get(key);
      }
      else {
         return data[key];
      }
   }

   // we're checking for an update from client, which had no id, so we can't rely on the id
   function searchForCreateMatch(sync, model) {
      var found = false;
      var existingModel = sync.collection.get(model);
      if( existingModel ) {
         // if we are attempting to create a model but it already exists, update it with server data
         found = true;
      }
      else {
         found = searchTempKeys(sync, model);
      }
      return found;
   }

   function searchTempKeys(sync, model) {
      var matchedCid = false;
      var tempIds = sync.events.tempids;
      var modelJson = valueJson(model.toJSON(), sync.key);
      _.find(tempIds, function(json, cid) {
         if(_.isEqual(modelJson, json)) {
            // we are looking for the record that had this JSON data when we sent it to the server (moments ago)
            // not the current data (don't use collection.get(cid)); it's a possibility that, if two exactly identical
            // records are created on the client, that this list will contain two copies of the same data, but the
            // end result is that both of the feedback loops are ignored, so problem solved
            matchedCid = cid;
            return true;
         }
         return false;
      });
      if( matchedCid ) {
         delete tempIds[matchedCid];
      }
      return !!matchedCid;
   }
   // ensures values will be in the same order, and that the key omitted
   function valueJson(json, key) {
      return _.omit(json, key);
   }

   function setIdOnSuccess(sync, model) {
      return _.bind(function(id) {
         if( id ) {
            var key = model.idAttribute;
            sync._expect('update', model, id);
            model.set(key, id);
         }
      });
   }

   exports.BackboneFirebaseAutoSync = SyncManager;

})((typeof exports !== 'undefined' ? exports : this), console);
