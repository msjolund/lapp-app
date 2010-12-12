/* main component JS resource */
var main = {
    onDomReady: function() {
        $("input").placeholder();
        var initialsInput = $("#signup input[name=initials]")
        $("#signup input[name=username]").keydown(function (e)
        {
            var suggestion, parts, input = this;
            setTimeout( function ()
            {
                var val = input.value;
                if (val.length > 3 && val.split("@").length)
                {
                    parts = val.split("@")[0].split(".");
                    if (parts.length == 1)
                        suggestion = parts[0].substr(0,4);
                    else if (parts.length > 1)
                        suggestion = parts[0].substr(0,2) + parts[1].substr(0,4-parts[0].substr(0,2).length);
                    else
                        return;

                    initialsInput.val(suggestion)
                }
            }, 30);
        });

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
