# coding=UTF-8
from stickynotes.surface.application import *

class ProjectController(ApplicationController):

    def view(self, id):
        if "user" not in self.session:
            return self.redirect("/")
        self.context.boards = services.ProjectService().findBoardsByProjectIds([2772296566596173913])
        return self.render('project.index')

    def board_add(self, id):
        if "user" not in self.session:
            return self.redirect("/")
        name = self.post.get("name", "Unnamed board")
        board = services.ProjectService().boardCreateRich(int(id), name)
        return self.redirect(self.urlaction("project.view", id=id))

    def board_remove(self, id, projectId):
        if "user" not in self.session:
            return self.redirect("/")
        services.ProjectService().boardDelete(int(id))
        return self.redirect(self.urlaction("project.view", id=projectId))