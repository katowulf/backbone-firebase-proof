/*! app.js
 *************************************/
(function ($, console) {
   "use strict";

   // some bindings for our footer element (accessed by various calls throughout)
   var binding;

   // a utility to update the footer text bindings
   $.bb.updateFooter = function(props) {
      _.each(props, function(v, k) {
         footerModel.set(k, v);
      });
   };

   var footerModel = new $.bb.models.Footer();
   var footerView = new $.bb.views.Footer({ el: $('footer .navbar-inner'), model: footerModel });

   jQuery(function($) {
      $.bb.updateFooter();
      BackboneFirebase.DEFAULT_INSTANCE = 'http://wordspot.firebaseio.com/muck/bbtest';
      $.bb.Router.init(footerModel);
   });

})(jQuery, window.console);