/* board component JS resource */

var board = {
    onDomReady: function() {

        board.initDragDrop();

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
                console.debug(request)
            }
        });

        var boardEl = $(".board:first");
         boardEl.find(".col h4").hover(function () { $(this).addClass("hover") }, function () { $(this).removeClass("hover") });

        board.onBoardChanged.call(boardEl);
        boardEl.bind("change", board.onBoardChanged);
    },

    initDragDrop: function ()
    {
        $(".board .col").droppable(
        {
            tolerance: "pointer",
            drop: function( event, ui ) {
                var col = $(this).attr("colId");
                var noteEl = ui.draggable;
                if (noteEl.find("input[name=id]").length)
                {
                    S.debug("this is a move operation")
                    note.move(noteEl, this)
                }
                else
                {
                    S.debug("this is a create operation");
                    note.create(noteEl, this)
                }
            },
            hoverClass: "hover"
        });

        $("#trashcan").droppable(
        {
            tolerance: "pointer",
            drop: function( event, ui ) {
                var noteEl = ui.draggable;
                if (noteEl.find("input[name=id]").length)
                {
                    S.debug("this is a remove operation")
                    note.remove(noteEl, this)
                }
                else
                {
                    S.debug("this is a clear operation");
                    note.clearNew();
                }
            },
            hoverClass: "hover"
        });

        $("#project_dropdown").droppable(
        {
            tolerance: "pointer",
            over: function ()
            {
                $("#project_dropdown").addClass("onhover");
                $("#board_columns > .col").droppable("disable")
            },
            out: function ()
            {
                $("#project_dropdown").removeClass("onhover");
                $("#board_columns > .col").droppable("enable")
            },
            drop: function (e, ui)
            {
                $("#board_columns > .col").droppable("enable");
                if ($(this).find("ul li a.draghover").length)
                {
                    // user were dropping on a list item inside the dropdown
                    var link = $(this).find("ul li a.draghover");
                    var boardId = link.attr("boardId");
                    setTimeout(function () {
                        // setTimeout needed because moveToBoard will remove the element being dragged, which will make draggable fail to trigger "end" event
                        note.moveToBoard(ui.draggable, boardId, link.text());
                    }, 40)
                }
            }
        });
        $("#project_dropdown ul li a").droppable(
        {
            hoverClass: "draghover",
            tolerance: "pointer"
        });
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

};
