/*! bindings.js
 *************************************/
(function ($, console) {
   "use strict";
   $.bb || ($.bb = {}); // namespace
   var B = $.bb.bindings = {};

   var ready = false;

   /**
    * Bind an element using html attributes. The elements accepted 'are':
    *    data-'bind': tries to determine the best choice (e.g. value for inputs, html/text for span, div, et al)
    *    data-'attr': accepts "'attr':name" (e.g. "'href':name", "'class':name") where name is a model field's name
    *
    * Props attributes:
    *    'collection':  {Backbone.Collection} converts collection for use in select list
    *    'type':        {String=html} `text` or `html`
    *
    * @param {jQuery} $e      the parent element, we apply bindings to anything below this in the DOM
    * @param {Array}  fields  the names of fields we can bind (the ones in the model)
    * @param {object} [props] see above
    */
   B.collect = function($e, fields, props) {
      props || (props = {});
      var out = {};
      $e.find('[data-bind], [data-attr]').each(function() {
         var name = _.str.trim($(this).attr('data-bind'));
         var attr = $(this).attr('data-attr');
         if( attr ) {
            var parts = attr.split(':');
            name = _.str.trim(parts[1]);
            if(_.contains(fields, name)) {
               out[name] = { selector: '[data-attr="'+attr+'"]', 'elAttribute': _.str.trim(parts[1]) };
            }
         }
         else if( name && _.contains(fields, name)) {
            out[name] = defForElType($e, name, props);
         }
      });
      return out;
   };

   /**
    * Create a Backbone.CollectionBinder.ElManagerFactory
    * @param [props]
    */
   B.factory = function(props) {
      props = _.extend({
         template: 'data-panel',
         'bindings': 'data-name'
      }, props);
      return new Backbone.CollectionBinder.ElManagerFactory(getTemplate(props.template), props.bindings);
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
                  'converter':(new Backbone.ModelBinder.CollectionConverter(props.collection)).convert
               }
            }
            else {
               return { 'selector': selector, 'default': 'val'};
            }
         default:
            return { 'selector': selector, 'elAttribute': props.type||'html'};
      }
   }

   function getTemplate(template) {
      return $.bb.fetchTemplate(template);
   }


})(jQuery, window.console);