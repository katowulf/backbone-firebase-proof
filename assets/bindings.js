/*! bindings.js
 *************************************/
(function ($, console) {
   "use strict";
   $.bb || ($.bb = {}); // namespace
   var B = $.bb.bindings = {};

   var ready = false;

   /**
    * Bind an element using html data-bind attributes.
    *
    * Props attributes:
    *    collection:  {Backbone.Collection} converts collection for use in select list
    *    type:        {String=html} `text` or `html`
    *
    * @param {jQuery} $e
    * @param {Array}  fields
    * @param {object} [props]
    */
   B.collect = function($e, fields, props) {
      props || (props = {});
      var out = {};
      $e.find(':hasAttrWithPrefix(data-bind)').each(function() {
         var attr = $(this).attr('data-bind');
         if(_.contains(fields, attr)) {
            if( !attr ) {
               console.warn('empty data binding', $e);
            }
            else {
               out[_.str.trim(attr)] = defForElType($e, attr, props);
            }
         }
      });
      console.log('collectBindings', out, fields, $e, props); //debug
      return out;
   };

   /**
    * Create a Backbone.CollectionBinder.ElManagerFactory
    * @param $e
    * @param [props]
    */
   B.factory = function($e, props) {
      props = _.extend({
         attr: 'data-name',
         template: 'data-panel'
      }, props);
      return new Backbone.CollectionBinder.ElManagerFactory(getTemplate($e, props.template), props.attr);
   };

   /**
    * @param $e
    * @param attr
    * @param [props]
    * @return {*}
    */
   function defForElType($e, attr, props) {
      var selector = '[data-bind="'+attr+'"]';
      switch($e.prop('tagName')) {
         case 'input':
         case 'textarea':
            return selector;
         case 'select':
            if( props.collection ) {
               return {
                  selector: selector,
                  converter:(new Backbone.ModelBinder.CollectionConverter(props.collection)).convert
               }
            }
            else {
               return { selector: selector, elAttribute: 'val'};
            }
         default:
            return { selector: selector, elAttribute: props.type||'html'};
      }
   }

   function getTemplate($e, template) {
      return _.str.trim($('script[type="text/template"]').filter('[name="'+template+'"]').html());
   }


})(jQuery, window.console);