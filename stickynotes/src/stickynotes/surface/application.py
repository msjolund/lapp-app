# coding=UTF-8
from surface.api import *
import stickynotes
import httplib

client = ImpactClient(stickynotes)
services = client.getServices()
models = client.getModels()
exceptions = client.getExceptions()
del client

class UserMessage():
    body = ""
    type = ""
    def __init__(self, message, type):
        self.body = message
        self.type = type

class ApplicationController(SurfaceController):
    @beforeAction
    def initPageData(self):
        self.context.user = self.session.get("user", None)

    def setErrorMessage(self, message):
        self.session["userMessage"] = UserMessage(message, "error")

    def setSuccessMessage(self, message):
        self.session["userMessage"] = UserMessage(message, "success")

    @beforeAction
    def initMessages(self):
        if "userMessage" in self.session:
            self.context.userMessage = self.session["userMessage"]
            del self.session["userMessage"]

    def _initCurrentProject(self, id):
        self.globalContext.currentProject = SurfaceDto()
        self.globalContext.currentProject.id = 2772296566596173913
        self.globalContext.currentProject.name = "Default Project"
        self.globalContext.currentProject.boards = services.ProjectService().findBoardsByProjectIds([self.globalContext.currentProject.id])