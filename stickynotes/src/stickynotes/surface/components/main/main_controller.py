# coding=UTF-8
from stickynotes.surface.application import *

class MainController(ApplicationController):
    def index(self):
        return self.render('main.index')
