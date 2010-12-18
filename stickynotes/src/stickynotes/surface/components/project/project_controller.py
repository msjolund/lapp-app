# coding=UTF-8
from stickynotes.surface.application import *

class ProjectController(ApplicationController):

    @beforeAction
    def access(self):
        if "user" not in self.session:
            return self.redirect("/")

    def view(self, id):
        self._initCurrentProject(2772296566596173913)
        self.context.project = self.globalContext.currentProject
        return self.render('project.index')

    def board_add(self, id):
        name = self.post.get("name", "Unnamed board")
        board = services.ProjectService().boardCreateRich(int(id), name)
        return self.redirect(self.urlaction("project.view", id=id))

    def board_remove(self, id, projectId):
        services.ProjectService().boardDelete(int(id))
        return self.redirect(self.urlaction("project.view", id=projectId))