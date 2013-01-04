/*! app.js
 *************************************/
(function ($, console) {
   "use strict";

   // some bindings for our footer element (used by updateFooter() below)
   var footerModel = new $.bb.models.Footer();
   var footerView = new $.bb.views.Footer({el: $('footer .navbar-inner'), model: footerModel});

   /**
    * A utility to update the footer text bindings from other views
    * @param {Object} props any of route, userCount, and/or widgetCount
    */
   $.bb.updateFooter = function(props) {
      _.each(props, function(v, k) {
         footerModel.set(k, v);
      });
   };

   /**
    * Display a message box at the base of the page
    * @param txt
    * @param [type] one of 'success', 'info', 'warning', or 'error' (defaults to 'info')
    * @param [timeout] close alert after this many seconds
    */
   $.bb.showMessage = function(txt, type, timeout) {
      if( arguments.length === 2 && typeof(type) === 'number' ) {
         timeout = type;
         type = null;
      }
      var $t = $.bb.appendTemplate($('#messages'), 'message-template', {txt: txt, class: messageClass(type)});
      $t.click($t.remove.bind($t));
      if( timeout ) {
         setTimeout(function() {
            if( $t.is(':visible') ) {
               $t.fadeOut(750, $t.remove.bind($t));
            }
         }, timeout*1000);
      }
   };

   jQuery(function($) {
      $.bb.updateFooter();
      BackboneFirebase.DEFAULT_INSTANCE = 'http://github.firebaseio.com/';
      $.bb.Router.init(footerModel);
   });

   // a little magic to change the Bootstrap default from warning to info
   function messageClass(type) {
      switch(type) {
         case 'warning':
            return '';
         case '':
            return 'alert-info';
         default:
            return 'alert-'+type;
      }
   }

})(jQuery, window.console);