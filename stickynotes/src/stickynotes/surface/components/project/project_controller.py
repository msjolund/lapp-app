# coding=UTF-8
from stickynotes.surface.application import *

class ProjectController(ApplicationController):

    @beforeAction
    def access(self):
        if "user" not in self.session:
            return self.redirect("/")

    def view(self, id):
        self.context.project = SurfaceDto()
        self.context.project.id = 2772296566596173913
        self.context.project.name = "Default project"
        self.context.boards = services.ProjectService().findBoardsByProjectIds([self.context.project.id])
        return self.render('project.index')

    def board_add(self, id):
        name = self.post.get("name", "Unnamed board")
        board = services.ProjectService().boardCreateRich(int(id), name)
        return self.redirect(self.urlaction("project.view", id=id))

    def board_remove(self, id, projectId):
        services.ProjectService().boardDelete(int(id))
        return self.redirect(self.urlaction("project.view", id=projectId))