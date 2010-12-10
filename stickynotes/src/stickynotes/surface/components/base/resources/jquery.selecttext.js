(function ($) {

 $.fn.selectText = function ()
 {
     return this.each( function () {
         var el = this;
         var doc = window.document, sel, range;
         if (window.getSelection && doc.createRange) {
             sel = window.getSelection();
             range = doc.createRange();
             range.selectNodeContents(el);
             sel.removeAllRanges();
             sel.addRange(range);
         } else if (doc.body.createTextRange) {
             range = doc.body.createTextRange();
             range.moveToElementText(el);
             range.select();
         }
     });
}

})(jQuery);