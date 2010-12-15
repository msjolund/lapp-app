# coding=UTF-8
from stickynotes.surface.application import *

class BoardController(ApplicationController):
    @beforeAction
    def access(self):
        response = SurfaceResponse()
        if "user" not in self.session:
            response.status = "%d Not logged in" % httplib.UNAUTHORIZED
            return response

    @excludeBefore("access")
    def view(self, id):
        if "user" not in self.session:
            return self.redirect("/")
        self.context.board = services.ProjectService().boardGetFull(int(id))
        loadAll(self.context.board)
        self.globalContext.boardId = id
        self.orbitAddChannel("board_"+id)
        return self.render('board.index')

    def column_add(self, id):
        board = services.ProjectService().boardGet(int(id))
        col = models.Column()
        col.boardId = int(id)
        col.name = self.post.get("name", "Unnamed column")
        services.ProjectService().columnCreate(col)
        Orbit.sendToChannel("board_%d" % col.boardId, "onColumnsChanged", {})
        return self.redirect(self.urlaction("board.view", id=id))

    def column_remove(self, id, boardId):
        services.ProjectService().columnDelete(id)
        Orbit.sendToChannel("board_%s" % boardId, "onColumnsChanged", {})
        return self.redirect(self.urlaction("board.view", id=boardId))
    