/*! templates.js.js
 *************************************/
(function ($) {
   "use strict";
   $.bb || ($.bb = {}); // namespace
   var T = $.bb.templates = {};

   $('script[type="text/template"]').each(function() {
      var $this = $(this);
      T[ $this.attr('name') ] = _.str.trim($this.html());
   });
})(jQuery);