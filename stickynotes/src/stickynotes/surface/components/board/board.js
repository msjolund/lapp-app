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
                console.debug($(this).siblings(".nameform"), $(this).outerHeight(), $(this).position().top);
                if ($(this).siblings(".nameform").is(":visible"))
                {
                    $(this).siblings(".nameform").find("input[type=text]")[0].select();
                }
            });

        $(document).ajaxError(function (event, request, settings) {
            if (request.status == 401)
            {
                window.location.href = "/";
            }
            else
            {
                alert("Sorry, something went wrong when you did what you just did.");
            }
        });

        var boardEl = $(".board:first");
         boardEl.find(".col h4").hover(function () { $(this).addClass("hover") }, function () { $(this).removeClass("hover") });

        board.onBoardChanged.call(boardEl);
        boardEl.bind("change", board.onBoardChanged);
    },

    onBoardChanged: function ()
    {
        boardEl = $(this);
        board.calculateColumns(boardEl);
        board.fixColumnHeights(boardEl);
    },

    calculateColumns: function (boardEl)
    {
        boardEl.find(".col").each( function ()
        {
            var colEstimate = 0;
            var col = $(this);
            var notes = col.find(".notes:first .note");
            notes.each( function () {
                colEstimate += note.getEstimate($(this));
            });
            col.find("h4 span.estimate .number").text(colEstimate);
        });
    },

    fixColumnHeights: function (boardEl)
    {

    }


    // Your board functionality here
};
