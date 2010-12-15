# coding=UTF-8
from stickynotes.surface.application import *

class MainController(ApplicationController):
    def index(self):
        if "user" in self.session:
            return self.redirect("/project/view/0")
        return self.render('main.index')
