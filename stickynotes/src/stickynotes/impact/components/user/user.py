# coding=UTF-8
from impact.api import *
import corecommunity as cc
from stickynotes.impact.lib.model import CsvList
import simplejson

@dashboard.model()
class User(cc.user.User):
    email = t.String(maxLength=128, nullable=True)
    @staticmethod
    def _getObjects(x, y, fieldValues):
        services.UserService().findUsers(fieldValues)


class UserService(Service):
    cc.user.UserService(User)
    Crud.addSpecific(User).addSearch("dashboardSearch")
