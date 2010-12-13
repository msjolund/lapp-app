var note = {
    onDomReady: function() {
        note.initEdit($(".note.editable"));

        $(".board .col").droppable(
        {
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

        $(document).bind("keydown", "ctrl+n", note.editNew )

        this.addOrbitListener("onNoteMoved", note.onNoteMoved);
        this.addOrbitListener("onNoteEdited", note.onNoteEdited);
        this.addOrbitListener("onNoteRemoved", note.onNoteRemoved);
        this.addOrbitListener("onNoteCreated", note.onNoteCreated);
        this.addOrbitListener("onColumnsChanged", note.onColumnsChanged);

        $(document).click( function (e) { console.debug(e.target); if ($(e.target).closest(".note").length == 0) $(note.selectedNote).removeClass("selected");  } )
    },

    getNoteElement: function (id)
    {
        return $(".note input[value="+id+"]").closest(".note")
    },

    onNoteMoved: function (e)
    {
        var surfaceEl = $S("note_" + e.data.note.id).update(e.data);
        var col = $("div.col[colId="+e.data.note.columnId+"]");
        $(surfaceEl).closest(".note").appendTo(col.find(".notes"));
    },
    onNoteEdited: function (e)
    {
        $S("note_" + e.data.note.id).update(e.data);
    },
    onNoteRemoved: function (e)
    {
        note.getNoteElement(e.data.note.id).remove()
    },
    onNoteCreated: function (e)
    {
        if (note.getNoteElement(e.data.note.id).length) return;
        var col = $("div.col[colId="+e.data.note.columnId+"] .notes");
        var markup = $S.render("note.note", e.data);
        $(markup).appendTo(col)
    },
    onColumnsChanged: function (e)
    {
        $("#column_notification").show();
    },

    edit: function (el)
    {
        var el = $(el);
        el.draggable("disable");
        var inner=el.find(".inner .body");
        inner[0].contentEditable = true;

        inner.addClass("focused");
        inner.focusin(function () { $(this).addClass("focused")});
        var estimate = el.find(".estimate input").focusin(function () { $(this).addClass("focused")}).removeAttr("disabled");

        inner.focus().selectText();
        el.addClass("edit");

        inner.add(estimate)
            .bind('keydown', 'ctrl+return', note.onCtrlReturn)
            .bind('keydown', 'tab', note.onTab);
        estimate.bind('keydown', 'return', note.onCtrlReturn);

        var idEl = el.find("input[name=id]");
        $S("tip").update({tip: "FINISH"})
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
        var inner = noteEl.find(".inner .body");
        var estimateInput = noteEl.find(".estimate input").attr("disabled", "disabled");
        if ($.browser.msie) {
          inner[0].contentEditable = false;
        }
        else {
          $(inner[0]).removeAttr( 'contenteditable' );
        }
        if ($.browser.mozilla) {
          window.getSelection().removeAllRanges();
        }
        // if it is an existing note, save editing
        var idEl = noteEl.find("input[name=id]");
        if (idEl.length)
        {
            var estimate = noteEl.find(".estimate input").val()
            $.post("/note/edit/"+idEl.val(), { body: inner.text(), estimate: estimate }, function (response) {
                console.debug($S("note_" + response.note.id))
                console.debug(response);
                $S("note_" + response.note.id).update(response)
            }, "json");
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
        });
    },

    create: function (el, col)
    {
        var colId = $(col).attr("colId");
        var notesEl = $(col).find(".notes")[0];
        var body = el.find(".inner .body").html();
        var estimate = el.find(".estimate input").val();
        var loadingEl = $($S.render("note.note", {loading: true})).appendTo(notesEl);
        $.post("/note/create/"+colId, { body: body, estimate: estimate }, function (response) {
            var newNote = $($S.render("note.note", response));
            loadingEl.replaceWith(newNote);
            note.clearNew();
            note.initEdit(newNote);
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
                $S("note_" + response.note.id).remove()
            });
        }
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
        .draggable({ revert: true, revertDuration: 0, stack: ".note", start: function () { note.finish(this); } })
        .click( function (e) { if ($(this).closest(".col").length) { e.preventDefault(); note.selectNote($(this)); } })
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

    estimateKeydown: function (e)
    {
        if (e.which == 13)
        {
            note.saveEstimate(this);
        }
        else if (e.which == 27)
        {
            e.preventDefault();
            note.cancelEstimate(this);
        }
    },
    switchInput: function (el)
    {
        el = $(el).closest(".note")
        //debugger;
        if (el.find(".focused").hasClass("body"))
        {
            el.find(".estimate input")[0].focus();
            el.find(".estimate input")[0].select()
        }
        else
        {
            el.find(".body")[0].focus();
            el.find(".body").selectText();
        }
    }
};
