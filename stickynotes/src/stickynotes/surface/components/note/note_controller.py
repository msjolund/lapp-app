# coding=UTF-8
from stickynotes.surface.application import *

class NoteController(ApplicationController):
    @beforeAction
    def access(self):
        if "id" in self.environ["wsgiorg.routing_args"][1]:
            id = int(self.environ["wsgiorg.routing_args"][1]["id"])
            #note = services.ProjectService().noteGet(id)
            #board = services.ProjectService().boardGet(note.boardId)
            #project = services.ProjectService().projectGet(board.projectId)


        response = SurfaceResponse()
        if "user" not in self.session:
            response.status = "%d Not logged in" % httplib.UNAUTHORIZED 
            return response

    def move(self, id, column):
        col = services.ProjectService().columnGet(int(column))
        note = services.ProjectService().noteUpdateColumn(int(id), int(column), self.context.user)
        Orbit.sendToChannel("board_%d" % col.boardId, "onNoteMoved", {"note": note})
        return SurfaceResponse(jsonEncode({"note": note}))

    def create(self, column):
        body = self.post.get("body")
        col = services.ProjectService().columnGet(int(column))
        
        note = models.Note()
        note.body = body
        note.columnId = int(column)
        note.estimate = int(self.post.get("estimate", 0))
        note.lastEditedUserId = self.context.user.id
        note.initials = self.context.user.initials
        note = services.ProjectService().noteCreate(note)
        Orbit.sendToChannel("board_%s" % col.boardId, "onNoteCreated", {"note": note})
        return SurfaceResponse(jsonEncode({"note": note}))
        
    def edit(self, id):
        body = self.post.get("body")
        estimate = self.post.get("estimate", 0)
        note = services.ProjectService().noteEdit(int(id), body, estimate, self.context.user)
        col = services.ProjectService().columnGet(note.columnId)
        Orbit.sendToChannel("board_%d" % col.boardId, "onNoteEdited", {"note": note})
        return SurfaceResponse(jsonEncode({"note": note}))

    def remove(self, id, boardId):
        services.ProjectService().noteDelete(id)
        Orbit.sendToChannel("board_%s" % boardId, "onNoteRemoved", {"note": {"id": id}})
        return SurfaceResponse("ok")