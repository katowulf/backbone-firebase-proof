
// credits: http://stackoverflow.com/questions/12199008/find-html-based-on-partial-attribute
$.expr[':'].hasAttrWithPrefix = $.expr.createPseudo(function(prefix) {
   return function(obj) {
      for (var i = 0; i < obj.attributes.length; i++) {
         if (obj.attributes[i].nodeName.indexOf(prefix) === 0) return true;
      }
      return false;
   };
});