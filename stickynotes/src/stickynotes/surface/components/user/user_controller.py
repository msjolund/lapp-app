# coding=UTF-8
from stickynotes.surface.application import *
import corecommunity as cc


class UserController(ApplicationController):

    def view(self, userId = None):
        """
        Show details for a specified user, or current user if userId is omitted.
        """

        if userId is None:
            self.context.user = self.session.get("user")

            if self.context.user is None:
                self.context.errormsg = "No userId given"
        else:
            try:
                key = long(userId)
                self.context.user = services.UserService().findUser(key)
            except ValueError, e:
                self.context.errormsg = "Invalid userId (not a key): %s" % userId
            except cc.user.UserNotFoundException, e:
                self.context.errormsg = "User with id %s not found" % userId

        return self.render("user.view")

    def logout(self):
        """
        Invalidates session and redirects to /
        """
        self.sessionInvalidate()
        return self.redirect("/")

    def login(self):
        """
        Renders login form.
        """
        return self.render("user.login")

    def authenticate(self):
        """
        Authenticates user with given username and password. On success the User is stored in
        session['user'] and the web client is redirected to 'urlok' form post parameter value.

        If authentication fails for some reason, the web client is redirected to an error page
        providing a suitable error message. In this error page the client is provided with a
        link back to 'urlback' form post parameter value.

        See user.login.surf
        """
        username = self.post.get("username", "")
        password = self.post.get("password", "")
        urlok = self.post.get("urlok", "/")
        urlback = self.post.get("urlback", "/")

        try:
            user = services.UserService().authenticateUser(username, password)
        except cc.user.UserNotFoundException, e:
            self.setErrorMessage("No such user: %s" % username)
            return self.redirect(self.urlaction("main.index"))
        except cc.user.UserAuthenticationFailureException, e:
            self.setErrorMessage("Password error")
            return self.redirect(self.urlaction("main.index"))

        self.session["user"] = user
        return self.redirect(urlok)

    def register(self):
        """
        Renders a user registration form.
        """
        return self.render("user.register")

    def create(self):
        """
        Creates (saves) a user in database and stores the newly created user in
        session['user'] and the web client is redirected to 'urlok' form post parameter value.

        If creation fails for some reason, the web client is redirected to an error page
        providing a suitable error message. In this error page the client is provided with a
        link back to 'urlback' form post parameter value.

        See user.register.surf
        """

        username = self.post.get("username", "")
        password = self.post.get("password", "")
        email = self.post.get("username", "")
        initials = self.post.get("initials", "")
        urlok = self.post.get("urlok", "/")
        urlback = self.post.get("urlback", "/")

        if username is None or len(username) == 0:
            self.context.msg = "Missing/invalid username"
            self.context.urlback = urlback
            return self.render("user.usererror")
        if password is None or len(password) == 0:
            self.context.msg = "Missing/invalid password"
            self.context.urlback = urlback
            return self.render("user.usererror")
        if email is None or len(email) == 0:
            self.context.msg = "Missing/invalid email"
            self.context.urlback = urlback
            return self.render("user.usererror")

        user = models.User()
        user.username = username
        user.password = password
        user.initials = initials
        user.email = email

        try:
            user = services.UserService().registerUser(user)
        except cc.user.UserAlreadyExistsException, e:
            self.context.msg = "Username taken: %s" % username
            self.context.urlback = urlback
            return self.render("user.usererror")

        if user.id is not None and user.id != 0:
            self.session["user"] = user
            return self.redirect(urlok)

        self.context.msg = "Registration error"
        self.context.urlback = urlback
        return self.render("user.usererror")

    def setInitials(self):
        if not self.context.user:
            response = SurfaceResponse()
            response.status = "%d Not logged in" % httplib.UNAUTHORIZED
            return response
        user = services.UserService().findUser(self.context.user.id)
        user.initials = self.post.get("initials", "")
        services.UserService().updateUser(user)
        return SurfaceResponse("ok")
