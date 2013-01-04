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
(function(exports){
   "use strict";

   /**
    * Automatically synchronizes any changes on the client back to the server for real-time events.
    *
    * To use, simply pass this class (not an instance) as an option to BackboneFirebase:
    *     new BackboneFirebase(collection, {syncManager: BackboneFirebaseAutoSync});
    *
    * @param conn
    * @constructor
    */
   function SyncManager(conn) {
      this.urlPrefix = conn.options.urlPrefix;
      this.collection = conn.collection;
      this.key = conn.idAttribute;
      this.events = { create: {}, update: {}, delete: {}, tempids: {} };
      this.subscriptions = [];
      conn.collection.on('all', disposableEvent(this, conn.collection, 'all', this.process));
      conn.on('all', disposableEvent(this, conn, 'all', this.expect));
   }

   _.extend(SyncManager.prototype, {
      /**
       * Read an incoming event from the Collection, decide if it was from the server, if not, then sync it.
       *
       * @param {string} action we monitor 'add', 'update', and 'remove'
       * @param model
       */
      process: function(action, model) {
         var syncAction = getSyncAction(action);
         if( syncAction && !this.expected(action, model) ) {
            this.expect(syncAction, model);
            Backbone.sync(syncAction, model, {urlPrefix: this.urlPrefix});
         }
      },

      /**
       * When events arrive from the server, we mark them expected;
       * the collection should rebound them to us as added
       *
       * @param {string} action
       * @param model
       */
      expect: function(action, model) {
         var syncAction = getSyncAction(action);
         var modelJson = model.toJSON();
         var key = getKey(model, this.key);
         // we don't store entries without a key; we look those up the hard way
         if( syncAction &&  key ) {
            this.events[syncAction][key] = modelJson;
         }
         else if( syncAction === 'create' ) {
            this.events['tempids'][model.cid] = _.omit(modelJson, model.idAttribute, 'routeUrl');
         }
      },

      /**
       * When events arrive from the client, we check to see if they were expected (originated at the server).
       * If so, delete the expected event and ignore it. If not, return true so it is synced back to server.
       *
       * @param {string} action
       * @param model
       */
      expected: function(action, model) {
         var key, actionList, modelJson, found = false;
         var syncAction = getSyncAction(action);
         if( syncAction === 'create' && action === 'remote_create' ) {
            searchForCreateMatch(this.collection, this.events['tempids'], model);
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
      dispose: function() {
         _.each(this.subscriptions, function(sub) { sub.dispose(); });
         this.subscriptions = [];
         this.collection = null;
         this.events = null;
      }
   });


   // only intended to be used for Firebase on/off functions
   function disposableEvent(self, conn, event, fn) {
      var boundFn = _.bind(fn, self);
      self.subscriptions.push({ dispose: function() { conn.off(event, boundFn)} });
      return boundFn;
   }

   // translate incoming/outgoing events to the model we will use when calling Backbone.sync
   function getSyncAction(action) {
      var syncAction;
      switch(action) {
         case 'remote_create':
         case 'add':
         case 'create':
            syncAction = 'create';
            break;
         case 'remote_delete':
         case 'remote_destroy':
         case 'remove':
         case 'delete':
            syncAction = 'delete';
            break;
         case 'remote_update':
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

   function searchForCreateMatch(collection, tempIds, model) {
      var found = false;
      // we're checking for an update from client, so we can't rely on the id
      var existingModel = collection.get(model);
      if( existingModel ) {
         found = true;
         updateExistingModel(existingModel, model);
      }
      else {
         found = findAndUpdate(collection, tempIds, model);
      }
      return found;
   }

   function findAndUpdate(collection, tempIds, model) {
      var modelJson = _.omit(model.toJSON(), model.idAttribute, 'routeUrl');
      var matchedCid, key, matchedModel;
      _.find(tempIds, function(json, cid) {
         if(_.isEqual(modelJson, json)) {
            // we are looking for the record that had this JSON data when we sent it to the server (moments ago)
            // not the current data (don't use collection.get(cid)); it's a possibility that, if two exactly identical
            // records are created on the client, we will give the ID to the wrong record, but this is
            // inconsequential since the other ID will just get assigned to the other identical record in just a moment
            matchedCid = cid;
            return true;
         }
         return false;
      });
      if( matchedCid ) {
         matchedModel = collection.get(matchedCid);
         if( matchedModel ) {
            // if we find a match, then attempt to update the idAttribute accordingly
            key = matchedModel.idAttribute;
            model.get(key) && matchedModel.set(key, model.get(key));
         }
         delete tempIds[matchedCid];
      }
      return !!matchedCid;
   }

   function updateExistingModel(existingModel, model) {
      // but it could already exist so start by seeing if the key is there
      // if it exists, try to update it as necessary
      this.expect('update', model);
      existingModel.set(model.getJSON());
   }

   exports.BackboneFirebaseAutoSync = SyncManager;

})((typeof exports !== 'undefined' ? exports : this));
