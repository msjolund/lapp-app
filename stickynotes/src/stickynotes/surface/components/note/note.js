var note = {
    onDomReady: function() {
        note.initEdit($(".note.editable"));

        $(document).bind("keydown", "ctrl+n", note.editNew )

        this.addOrbitListener("onNoteMoved", note.onNoteMoved);
        this.addOrbitListener("onNoteEdited", note.onNoteEdited);
        this.addOrbitListener("onNoteRemoved", note.onNoteRemoved);
        this.addOrbitListener("onNoteCreated", note.onNoteCreated);
        this.addOrbitListener("onColumnsChanged", note.onColumnsChanged);

        $(document).click( function (e) { if ($(e.target).closest(".note").length == 0) $(note.selectedNote).removeClass("selected");  } )
    },

    getNoteElement: function (id)
    {
        return $(".note input[value="+id+"]").closest(".note")
    },
    getEstimate: function(noteEl)
    {
        var val;
        if (noteEl.find(".estimate input").length)
            val = noteEl.find(".estimate input").val();
        else
            val = noteEl.find(".estimate span").text();
        return parseInt(val);
    },
    getBody: function(noteEl)
    {
        if (noteEl.find("textarea").length)
            return $.trim(noteEl.find("textarea").val());
        else
            return $.trim(noteEl.find(".inner .body").text());
    },

    onNoteMoved: function (e)
    {
        var surfaceEl = $S("note_" + e.data.note.id).update(e.data);
        var col = $("div.col[colId="+e.data.note.columnId+"]");
        $(surfaceEl).closest(".note").appendTo(col.find(".notes"));
        col.closest(".board").trigger("change")
    },
    onNoteEdited: function (e)
    {
        var el = $S("note_" + e.data.note.id).update(e.data);
        $(el).closest(".board").trigger("change")
    },
    onNoteRemoved: function (e)
    {
        note.getNoteElement(e.data.note.id).remove()
        $(".board:first").trigger("change")
    },
    onNoteCreated: function (e)
    {
        if (note.getNoteElement(e.data.note.id).length) return;
        var col = $("div.col[colId="+e.data.note.columnId+"] .notes");
        var markup = $S.render("note.note", e.data);
        $(markup).appendTo(col)
        col.closest(".board").trigger("change")
    },
    onColumnsChanged: function (e)
    {
        $("#column_notification").show();
    },

    edit: function (el)
    {
        var el = $(el);
        if (el.is(".edit")) return;
        el.draggable("disable");
        el.addClass("edit");

        var bodyEl = el.find(".inner .body");
        var textarea = bodyEl.html($S.render("note.bodyedit", {body: note.getBody(el)})).find("textarea").addClass("focused")[0];
        textarea.focus(); textarea.select();

        var estimateEl = el.find(".estimate");
        estimateEl.html($S.render("note.estimateedit", {estimate: $.trim(estimateEl.find("span").text())}));

        estimateEl.find("input").add(textarea)
            .focusin(function () { $(this).addClass("focused") })
            .bind('keydown', 'ctrl+return', note.onCtrlReturn)
            .bind('keydown', 'return', note.onCtrlReturn)
            .bind('keydown', 'tab', note.onTab)
            .bind('keydown', 'esc', note.onEscape)

        $S("tip").update({tip: "FINISH"})
    },

    onEscape: function (e)
    {
        e.preventDefault();
        note.cancelEdit($(this).closest(".note"))
    },
    onCtrlReturn: function (e)
    {
        e.preventDefault();
        note.finish($(this).closest(".note"));
    },
    onTab: function (e)
    {
        e.preventDefault();
        note.switchInput(this)
    },

    editNew: function (e) {
        e.preventDefault();
        note.edit($("#note_new").closest(".note"));
    },

    finish: function (el)
    {
        var noteEl = $(el);
        if (!noteEl.hasClass("edit")) return;
        noteEl.removeClass("edit").draggable("enable").unbind('keydown');

        // if it is an existing note, save editing
        var idEl = noteEl.find("input[name=id]");
        if (idEl.length)
        {
            var estimate = note.getEstimate(noteEl);
            var body = note.getBody(noteEl);
            $.post("/note/edit/"+idEl.val(), { body: body, estimate: estimate }, function (response) {
                $S("note_" + response.note.id).update(response)
                noteEl.closest(".board").trigger("change")
            }, "json");
        }
        // if it is a new note and the auto-add checkbox is checked, add it to the left-most column
        else if ($("#autoadd_checkbox:checked").length)
        {
            note.create(noteEl, $(".board .col:first"));
            noteEl.closest(".board").trigger("change")
        }
        else
        {
            S.debug("New note, ignoring!")
        }
        
        $S("tip").update({tip: "DRAG"})
    },

    move: function (el, col)
    {
        var colId = $(col).attr("colId");
        var oldColId = el.find("[name=column]").val();
        if (oldColId == colId)
        {
            S.debug("ignoring move...")
            return;
        }
        var id = el.find("[name=id]").val();
        el.appendTo($(col).find(".notes")[0])
        $.getJSON("/note/move/ID/COL".replace(/ID/, id).replace(/COL/, colId), function (response) {
            $S("note_" + id).update(response)
            $(col).closest(".board").trigger("change");
        });
    },

    create: function (el, col)
    {
        var colId = $(col).attr("colId");
        var notesEl = $(col).find(".notes")[0];
        var body = note.getBody(el);
        var estimate = note.getEstimate(el);
        var loadingEl = $($S.render("note.note", {loading: true})).appendTo(notesEl);
        $.post("/note/create/"+colId, { body: body, estimate: estimate }, function (response) {
            var newNote = $($S.render("note.note", response));
            loadingEl.replaceWith(newNote);
            note.clearNew();
            note.initEdit(newNote);
            $(col).closest(".board").trigger("change");
        }, "json");

        $S("tip").update({tip: "EDIT"})
    },

    remove: function (el)
    {
        var noteEl = $(el);
        noteEl.hide();
        var idEl = noteEl.find("input[name=id]");
        if (idEl.length)
        {
            $.getJSON("/note/remove/"+idEl.val()+"/"+Surface.globalContext.boardId, function (response) {
                noteEl.remove();
                noteEl.closest(".board").trigger("change");
            });
        }
    },

    moveToBoard: function (el, boardId)
    {
        var id = el.find("[name=id]").val();
        el.remove();
        $.getJSON("/note/move_to_board/NOTE/BOARD".replace(/NOTE/, id).replace(/BOARD/, boardId), function (response) {
            console.debug("Move to board ok")
        });
    },

    clearNew: function ()
    {
        $S("note_new").clearState();
        $S("note_new").refresh();
    },

    initEdit: function (notes)
    {
        notes
        .dblclick(function (e)
        {
            S.debug("double click");
            note.edit(this);
        })
        .focusout(note.onFocusOut)
        .draggable(
            {
                refreshPositions: true,
                revert: true,
                revertDuration: 0,
                stack: ".note",
                start: note.onDragStart,
                zIndex: 900,
                stop: note.onDragEnd,
                helper: function (e, ui) {
                    return $(e.target).closest(".note").clone().appendTo(document.body);
                 }
                 /*,
                helper: function (e, ui) {
                    var pos = $(e.target).closest(".note").position();
                    console.debug(e.pageX, pos.left)
                    var x = e.pageX - pos.left - 20;
                    var y = e.pageY - pos.top - 20;
                    return $('<img src="/public/base/favicon.png" style="display: block; margin: ' + y + 'px 0 0 ' + x +'px" />').appendTo(document.body);
                }*/
            })
        .click( function (e) { if ($(this).closest(".col").length) { e.preventDefault(); note.selectNote($(this)); } })
        .hover(
          function () {
            $(this).addClass("hover");
          },
          function () {
            $(this).removeClass("hover");
          }
        );
    },

    onDragStart: function (e, ui)
    {
        note.finish(this);
        $("#project_dropdown").addClass("ondrag");
    },
    onDragEnd: function (e, ui)
    {
        $("#project_dropdown").removeClass("ondrag");
    },

    selectedNote: null,

    selectNote: function (noteEl)
    {
        if (note.selectedNote)
        {
            note.selectedNote.removeClass("selected")
        }
        note.selectedNote = noteEl.addClass("selected");
    },

    onFocusOut: function (e)
    {
        var target = $(e.target);
        target.removeClass("focused");
        setTimeout(function () {
            if ( target.closest(".note").find(".focused").length == 0 )
            {
                note.finish(target.closest(".note"));
            }
        }, 100)

    },

    cancelEdit: function (noteEl)
    {
        var id = noteEl.find("input[name=id]").val();
        $S("note_" + id).refresh();
        noteEl.removeClass("edit").draggable("enable").unbind('keydown');
    },

    switchInput: function (el)
    {
        el = $(el).closest(".note")
        if (el.find(".focused").is("textarea"))
        {
            el.find(".estimate input")[0].focus();
            el.find(".estimate input")[0].select()
        }
        else
        {
            el.find("textarea")[0].focus();
            el.find("textarea").selectText();
        }
    }
};
