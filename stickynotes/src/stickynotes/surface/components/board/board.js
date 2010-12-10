/* board component JS resource */

var board = {
    onComponentReady: function() {
        // This method gets called when board component is used (imported, extended) on a page.
    },
    
    onDomReady: function() {
        $(".add_form")
            .delegate("a", "click", function (e)
            {
                e.preventDefault();
                $(this).closest(".add_form").toggleClass("active");
                console.debug($(this).siblings(".nameform"), $(this).outerHeight(), $(this).position().top)
                if ($(this).siblings(".nameform").is(":visible"))
                {
                    $(this).siblings(".nameform").find("input[type=text]")[0].select();
                }
            })

            /*.delegate(".col h4 .remove", "click", function (e)
            {
                e.preventDefault();
                console.debug("Remove column");
                var link = $(this);
                $.get(link.attr("href"), function (response)
                {
                    console.debug("removed")
                })
            });*/

        /*$(".board .col_new form").submit(function (e)
        {
            e.preventDefault();
            var form = $(this);
            console.debug("serialized form: ",  form)
            $.post(form.attr("action"), form.serialize(), function (response) {
                console.debug("response", response);
                form.closest(".col_new").removeClass("active");

            })
        })*/

        $(".board .col h4").hover(function () { $(this).addClass("hover") }, function () { $(this).removeClass("hover") })
    }

    // Your board functionality here
};
