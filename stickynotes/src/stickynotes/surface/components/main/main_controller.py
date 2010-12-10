# coding=UTF-8
from stickynotes.surface.application import *

class MainController(ApplicationController):
    def index(self):
        self.context.message = 'Hello Planet!'
        return self.render('main.index')
