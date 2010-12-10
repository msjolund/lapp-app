/* main component JS resource */
var main = {
    onDomReady: function() {
        $("input").placeholder();

        $("ul.tabs > li > a").click(function (e) {
            e.preventDefault();
            var el = $(this);
            if (!el.closest("li").hasClass("current"))
            {
                el.closest("li").addClass("current").siblings("li.current").removeClass("current");
                el.closest("ul.tabs").siblings(".panel.current").removeClass("current").siblings(el.attr("href")).addClass("current");
            }
        })
    }
}
