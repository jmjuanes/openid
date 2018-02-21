# Python imports
import os
import logging
import random
import string
import time

# Libs imports
import webapp2
import jinja2
from passlib.hash import pbkdf2_sha256

# Modules imports
import src.captcha as captcha
import src.database.application as db_application
import src.database.user as db_user
import src.tokens as tokens
import config

# Initialize the jinja environment
jinja_loader = jinja2.FileSystemLoader(os.path.join(os.path.dirname(__file__), 'templates/'))
jinja_env = jinja2.Environment(loader=jinja_loader, extensions=['jinja2.ext.autoescape'], autoescape=True)
jinja_env.globals['openid_name'] = config.openid_name
jinja_env.globals['openid_allow_signup'] = config.openid_allow_signup
jinja_env.globals['captcha_enabled'] = config.captcha_enabled
jinja_env.globals['captcha_key'] = config.captcha_key


# Render a template
def render(self, file_name, **kwargs):
    # Change the response headers
    self.response.headers['Content-Type'] = 'text/html'

    # Render the template and write to the response
    file_template = jinja_env.get_template(file_name)
    self.response.write(file_template.render(**kwargs))


# Extract and verify the token from cookie
def checkAuthentication(self):
    # Get and verify the cookie
    token = self.request.cookies.get(config.openid_key + '_token')
    if token is not None:
        # logging.info('Has cookie --> validate the token')
        payload = tokens.decode(token, config.openid_secret, config.token_algorithm)
        if payload is not None:
            return payload
        else:
            self.response.delete_cookie(config.openid_key + '_token')
            # self.redirect('/login')
            return None
    else:
        # logging.info('Cookie not found --> redirect to login')
        # self.redirect('/login')
        return None


def deleteAuthentication(self, flag=''):
    self.response.delete_cookie(config.openid_key + '_token', path='/')
    if flag == '':
        redirect_url = '/login'
    else:
        redirect_url = '/login?flag={}'.format(flag)
    return self.redirect(redirect_url)


def generateSecret():
    secret = ''.join(
        random.SystemRandom().choice(string.ascii_lowercase + string.digits + string.ascii_uppercase) for _ in
        range(50))
    return secret


# Home route
class RouteHome(webapp2.RequestHandler):
    def get(self):
        payload = checkAuthentication(self)
        if payload is not None:
            return self.redirect('/dashboard')
        else:
            return self.redirect('/login')


# Login route
class RouteLogin(webapp2.RequestHandler):
    def get(self):
        return render(self, 'login.html')

    def post(self):
        # Get the user email and password
        user_email = self.request.get('email', default_value='')
        user_pwd = self.request.get('pwd', default_value='')

        # Check for empty email or password
        if user_email == '' or user_pwd == '':
            self.response.status_int = 400
            return render(self, 'error.html', error='Invalid user request')

        # logging.info('Logging user ' + user_email)

        # Check if the captcha is enabled
        if config.captcha_enabled is True:
            # Get the captcha value and check if the captcha is valid
            captcha_value = self.request.get('g-recaptcha-response', default_value='')
            if captcha.verify(captcha_value, config.captcha_secret, config.captcha_url) is False:
                self.response.status_int = 400
                return render(self, 'login.html', error='Invalid captcha')

        # Get the user from the database
        user = db_user.get_user(user_email)
        if user is None:
            self.response.status_int = 400
            return render(self, 'login.html', error='Email not found')

        # Check if user is active
        if user.active is False:
            self.response.status_int = 401
            return render(self, 'login.html', error='User is not active')

        # Check the password
        if pbkdf2_sha256.verify(user_pwd, user.pwd) is True:
            user_token = tokens.encode(user, config.openid_secret, config.token_algorithm, config.token_expiration)
            self.response.set_cookie(config.openid_key + '_token', user_token, path='/')
            # logging.info("cookie: " + )
            self.redirect('/dashboard')
        else:
            self.response.status_int = 400
            return render(self, 'login.html', error='Invalid email or password')


# Register a new user route
class RouteRegister(webapp2.RequestHandler):
    def get(self):
        # Check if signup is allowed
        if config.openid_allow_signup is False:
            return self.redirect('/login')
        return render(self, 'register.html', error='')

    def post(self):
        # Check if the signup is not allowed
        if config.openid_allow_signup is False:
            return self.redirect('/login')

        # Initialize the user
        user = db_user.User()
        user.name = self.request.get('name', default_value='')
        # user.institution = self.request.get('institution', default_value='')
        user.email = self.request.get('email', default_value='')
        user.pwd = self.request.get('pwd', default_value='')
        user.is_admin = False  # By default is not admin
        user.role = config.openid_default_role  # Default user role
        user.active = config.openid_default_active  # Default active value

        # Encrypt the password
        user.pwd = pbkdf2_sha256.hash(user.pwd)

        # Check the values
        if user.name is '' or user.email is '' or user.pwd is '':
            self.response.status_int = 400
            return render(self, 'register.html', error='You must fill all fields')

        # Check if the captcha is enabled
        if config.captcha_enabled is True:
            # Get the captcha value
            captcha_value = self.request.get('g-recaptcha-response', default_value='')

            # Check the captcha value
            if captcha.verify(captcha_value, config.captcha_secret, config.captcha_url) is False:
                self.response.status_int = 400
                return render(self, 'register.html', error='Invalid captcha')

        # Check if the email is registered
        if db_user.exists_user(user.email):
            self.response.status_int = 400
            return render(self, 'register.html', error='The email has already registered')

        # Register the user
        try:
            user_key = user.put()
            # continue_url = request.args.get('continue', '')
            return render(self, 'register-completed.html')
        except:
            return render(self, 'register.html', error='Error creating the user. Contact with the administrator')


# Render the authorize page
class RouteAuthorize(webapp2.RequestHandler):
    def get(self):
        # Get the application information
        application_id = self.request.get('client', default_value='')
        application_signup = self.request.get('allow_signup', default_value='false')

        # Check for undefined application id
        if application_id == '':
            self.response.status_int = 400
            return render(self, 'error.html', error='No application id provided')

        # Get the application information and check if exists
        application = db_application.get_application(application_id)
        if application is not None:
            return render(self, 'authorize.html',
                          app_id=application_id,
                          app_signup=application_signup,
                          app_name=application.name)
        else:
            self.response.status_int = 404
            return render(self, 'error.html', error='Invalid application')

    def post(self):
        # Get the user email and password
        user_email = self.request.get('email', default_value='')
        user_pwd = self.request.get('pwd', default_value='')

        # Check for empty email or password
        if user_email == '' or user_pwd == '':
            self.response.status_int = 400
            return render(self, 'error.html', error='Invalid user request')

        # Get the application id and state
        application_id = self.request.get('client', default_value='')
        application_signup = self.request.get('signup', default_value='false')

        # Check for empty application id
        if application_id == '':
            self.response.status_int = 400
            return render(self, 'error.html', error='Invalid application request')

        # Get the application
        application = db_application.get_application(application_id)

        # Check for application not found
        if application is None:
            self.response.status_int = 400
            return render(self, 'error.html', error='Application not found')

        # Check if the captcha is enabled
        if config.captcha_enabled is True:
            # Get the captcha value
            captcha_value = self.request.get('g-recaptcha-response', default_value='')

            # Check the captcha value
            if captcha.verify(captcha_value) is False:
                self.response.status_int = 400
                return render(self, 'authorize.html',
                              app_id=application_id,
                              app_signup=application_signup,
                              app_name=application.name,
                              error='Invalid captcha')

        # Get the user
        user = db_user.get_user(user_email)

        # Check for no user
        if user is None:
            self.response.status_int = 400
            return render(self, 'authorize.html',
                          app_id=application_id,
                          app_signup=application_signup,
                          app_name=application.name,
                          error='Email not found')
        else:
            # Check if user is active
            if user.active is False:
                self.response.status_int = 401
                return render(self, 'authorize.html',
                              app_id=application_id,
                              app_signup=application_signup,
                              app_name=application.name,
                              error='User is not active')

            # Check the password
            if pbkdf2_sha256.verify(user_pwd, user.pwd) is False:
                self.response.status_int = 400
                return render(self, 'authorize.html',
                              app_id=application_id,
                              app_signup=application_signup,
                              app_name=application.name,
                              error='Invalid email or password')
            else:
                # Build the token and the outgoing url
                user_token = tokens.encode(user, application.secret)
                # redirect_url = urlparse.urljoin(application.redirect, '?token=' + user_token)
                redirect_url = application.redirect.format(token=user_token)
                return self.redirect(str(redirect_url))


# Logout route
class RouteLogout(webapp2.RequestHandler):
    def get(self):
        return deleteAuthentication(self)


# Main dashboard route:
class RouteDashboard(webapp2.RequestHandler):
    def get(self):
        # Step 1: check tokens
        # Step 2: check if user is admin
        # Step 3: render the user dashboard (and the admin one if the user is admin too)
        payload = checkAuthentication(self)
        if payload is not None:
            return render(self, 'dashboard/index.html', is_admin=payload["is_admin"])
        else:
            return deleteAuthentication(self)


# User profile route
class RouteDashboardProfile(webapp2.RequestHandler):
    def get(self):
        payload = checkAuthentication(self)
        if payload is not None:
            user = db_user.get_user(payload["email"])
            return render(self, 'dashboard/profile.html',
                          is_admin=payload["is_admin"],
                          name=user.name)
        else:
            return deleteAuthentication(self)

    def post(self):
        payload = checkAuthentication(self)
        if payload is not None:
            user = db_user.get_user(payload["email"])
            if user is not None:
                render_args = {"is_admin": payload["is_admin"], "name": user.name}
                if user.name != self.request.get('name', default_value=''):
                    try:
                        user.name = self.request.get('name', default_value='')
                        user.put()
                        render_args["name"] = user.name
                        render_args["alert_message"] = "Your information has been successfully updated."
                        render_args["alert_color"] = "green"
                        return render(self, "dashboard/profile.html", **render_args)
                    except:
                        render_args["alert_message"] = "Something went wrong updating your information."
                        render_args["alert_color"] = "red"
                        return render(self, "dashboard/profile.html", **render_args)
                else:
                    render_args["alert_message"] = "No information was changed."
                    render_args["alert_color"] = "yellow"
                    return render(self, "dashboard/profile.html", **render_args)
            else:
                return deleteAuthentication(self)
        else:
            return deleteAuthentication(self)


# Change password route
class RouteDashboardPassword(webapp2.RequestHandler):
    def get(self):
        payload = checkAuthentication(self)
        if payload is not None:
            return render(self, 'dashboard/account-password.html', is_admin=payload["is_admin"])
        else:
            return deleteAuthentication(self)

    def post(self):
        payload = checkAuthentication(self)
        if payload is not None:
            pwd = self.request.get('pwd', default_value='')
            new_pwd = self.request.get('new_pwd', default_value='')
            repeat_pwd = self.request.get('repeat_pwd', default_value='')
            # Create a dictionary with the non-changing info
            render_args = {"is_admin": payload["is_admin"]}
            # Not all fields are filled
            if pwd is '' or new_pwd is '' or repeat_pwd is '':
                # self.response.status_int = 400
                render_args["alert_message"] = "You must fill all the fields."
                render_args["alert_color"] = "red"
                return render(self, 'dashboard/account-password.html', **render_args)
            # New passwords do not match
            if new_pwd != repeat_pwd:
                # self.response.status_int = 400
                render_args["alert_message"] = "New passwords do not match."
                render_args["alert_color"] = "red"
                return render(self, 'dashboard/account-password.html', **render_args)
            # New and old passwords are the same
            if pwd == new_pwd:
                # self.response.status_int = 400
                render_args["alert_message"] = "Old and new passwords are the same"
                render_args["alert_color"] = "red"
                return render(self, 'dashboard/account-password.html', **render_args)

            # If we're here all the info is syntactically correct
            # Check if the old password is correct
            user = db_user.get_user(payload["email"])
            if user is not None:
                if pbkdf2_sha256.verify(pwd, user.pwd) is True:
                    try:
                        # Update the pass of the user object
                        user.pwd = pbkdf2_sha256.hash(new_pwd)
                        # Update the db
                        user.put()
                        render_args["alert_message"] = "Your password was updated successfully."
                        render_args["alert_color"] = "green"
                        return render(self, 'dashboard/account-password.html', **render_args)
                    except:
                        render_args["alert_message"] = "Something went wrong, please try again."
                        render_args["alert_color"] = "red"
                        return render(self, 'dashboard/account-password.html', **render_args)
                else:
                    # self.response.status_int = 400
                    render_args["alert_message"] = "Enter your current password correctly."
                    render_args["alert_color"] = "red"
                    return render(self, 'dashboard/account-password.html', **render_args)
            else:
                return deleteAuthentication(self)
        else:
            return deleteAuthentication(self)


# Delete your account route
class RouteDashboardAccountDelete(webapp2.RequestHandler):
    def get(self):
        payload = checkAuthentication(self)
        if payload is not None:
            return render(self, 'dashboard/account-delete.html', is_admin=payload["is_admin"])
        else:
            return deleteAuthentication(self)

    def post(self):
        payload = checkAuthentication(self)
        if payload is not None:
            user = db_user.get_user(payload["email"])
            render_args = {"is_admin": payload["is_admin"]}
            if user is not None:
                pwd = self.request.get('pwd', default_value='')
                if pbkdf2_sha256.verify(pwd, user.pwd) is True:
                    try:
                        user.key.delete()
                    except Exception as e:
                        render_args["alert_message"] = "Something went wrong trying to delete your account."
                        return render(self, 'dashboard/account-delete.html', **render_args)
                    else:
                        return deleteAuthentication(self, flag="ACCOUNT_DELETED")
                else:
                    render_args["alert_message"] = "Please enter your password correctly."
                    return render(self, 'dashboard/account-delete.html', **render_args)
            else:
                return deleteAuthentication(self)
        else:
            return deleteAuthentication(self)


# Show applications list route
class RouteAdminAppsManagement(webapp2.RequestHandler):
    def get(self):
        payload = checkAuthentication(self)
        if payload is not None:
            if payload["is_admin"] is True:
                render_args = {"is_admin": payload["is_admin"]}
                # Check for an alert
                if self.request.get('flag') == "APP_DELETED":
                    render_args["alert_message"] = "The application was deleted successfully."
                    render_args["alert_color"] = "green"
                apps = db_application.getAll()
                list_apps = []
                for my_app in apps:
                    list_apps.append({"id": my_app.key.id(), "name": my_app.name, "detail": my_app.detail})
                return render(self, 'dashboard/admin-apps.html', apps=list_apps, **render_args)
            else:
                return render(self, 'dashboard/index.html', is_admin=payload["is_admin"])
        else:
            return deleteAuthentication(self)


# Create an app route
class RouteAdminAppsCreate(webapp2.RequestHandler):
    def get(self):
        payload = checkAuthentication(self)
        if payload is not None:
            if payload["is_admin"] is True:
                return render(self, 'dashboard/admin-apps-new.html', is_admin=payload["is_admin"])
            else:
                return render(self, 'dashboard/index.html', is_admin=payload["is_admin"])
        else:
            return deleteAuthentication(self)

    def post(self):
        payload = checkAuthentication(self)
        if payload is not None:
            if payload["is_admin"] is True:
                render_args = {"is_admin": payload["is_admin"]}
                # Initialize the app
                application = db_application.Application()
                application.name = self.request.get('name', default_value='')
                application.detail = self.request.get('detail', default_value='')
                application.redirect = self.request.get('redirect', default_value='')
                application.secret = generateSecret()

                # Insert the application in the db
                try:
                    app_key = application.put()
                    return self.redirect('/dashboard/admin/apps/' + str(app_key.id()) + '?flag=APP_CREATED')
                except:
                    render_args["alert_message"] = "Something went wrong creating the application."
                    render_args["alert_color"] = "red"
                    return render(self, 'dashboard/admin-apps-new.html', **render_args)
            else:
                return render(self, 'dashboard/index.html', is_admin=payload["is_admin"])
        else:
            return deleteAuthentication(self)


# Edit an app route
class RouteAdminAppsOverview(webapp2.RequestHandler):
    def get(self, app_id):
        payload = checkAuthentication(self)
        if payload is not None:
            if payload["is_admin"] is True:
                render_args = {"is_admin": payload["is_admin"]}
                if self.request.get('flag') == "APP_CREATED":
                    render_args["alert_message"] = "The application was registered successfully."
                    render_args["alert_color"] = "green"
                application = db_application.get_application(app_id)
                if application is not None:
                    app_info = {"id": application.key.id(), "name": application.name, "detail": application.detail,
                                "secret": application.secret, "redirect": application.redirect,
                                "secret": application.secret}
                    return render(self, 'dashboard/admin-apps-overview.html', app=app_info, **render_args)
                else:
                    render_args["alert_message"] = "The app's info couldn't be retrieved from the database."
                    render_args["alert_color"] = "red"
                    return render(self, 'dashboard/admin-apps.html', **render_args)
            else:
                return render(self, 'dashboard/index.html', is_admin=payload["is_admin"])
        else:
            return deleteAuthentication(self)

    def post(self, app_id):
        payload = checkAuthentication(self)
        if payload is not None:
            if payload["is_admin"] is True:
                # app_id = self.request.get('app_id', default_value='')
                application = db_application.get_application(app_id)
                render_args = {"is_admin": payload["is_admin"]}
                try:
                    application.name = self.request.get('name', default_value='')
                    application.detail = self.request.get('detail', default_value='')
                    application.redirect = self.request.get('redirect', default_value='')
                    application.put()
                    app_info = {"id": application.key.id(), "name": application.name, "detail": application.detail,
                                "secret": application.secret, "redirect": application.redirect,
                                "secret": application.secret}
                    render_args["alert_message"] = "The app's information has been successfully updated."
                    render_args["alert_color"] = "green"
                    return render(self, "dashboard/admin-apps-overview.html", app=app_info, **render_args)
                except:
                    render_args["alert_message"] = "Something went wrong updating the app's information."
                    render_args["alert_color"] = "red"
                    return render(self, "dashboard/admin-apps.html", **render_args)
            else:
                return render(self, 'dashboard/index.html', is_admin=payload["is_admin"])
        else:
            return deleteAuthentication(self)


# Delete an app route
class RouteAdminAppsDelete(webapp2.RequestHandler):
    def get(self, app_id):
        payload = checkAuthentication(self)
        if payload is not None:
            if payload["is_admin"] is True:
                application = db_application.get_application(app_id)
                try:
                    application.key.delete()
                    # TERRIBLE HACK!!
                    # I'd fire myself for this kind of code
                    # https://stackoverflow.com/a/21721681/7630629
                    time.sleep(0.1)
                    return self.redirect('/dashboard/admin/apps?flag=APP_DELETED')
                except:
                    render_args = {"is_admin": payload["is_admin"]}
                    render_args["alert_message"] = "Something went wrong deleting the application."
                    render_args["alert_color"] = "red"
                    return render(self, 'dashboard/admin-apps.html', **render_args)
            else:
                return render(self, 'dashboard/index.html', is_admin=payload["is_admin"])
        else:
            deleteAuthentication(self)


# Users management route
class RouteAdminUsersManagement(webapp2.RequestHandler):
    def get(self):
        payload = checkAuthentication(self)
        if payload is not None:
            if payload["is_admin"] is True:
                render_args = {"is_admin": payload["is_admin"]}
                # Check for an alert
                if self.request.get('flag') == "USER_DELETED":
                    render_args["alert_message"] = "The user was deleted successfully."
                    render_args["alert_color"] = "blue"
                elif self.request.get('flag') == "USER_CREATED":
                    render_args["alert_message"] = "The user was created successfully."
                    render_args["alert_color"] = "green"
                users = db_user.getAll()
                list_users = []
                for my_user in users:
                    list_users.append({"id": my_user.key.id(), "name": my_user.name,
                                       "email": my_user.email, "is_admin": my_user.is_admin,
                                       "active": my_user.active})
                return render(self, 'dashboard/admin-users.html', users=list_users, **render_args)
            else:
                return render(self, 'dashboard/index.html', is_admin=payload["is_admin"])
        else:
            return deleteAuthentication(self)


# User overview route
class RouteAdminUsersOverview(webapp2.RequestHandler):
    def get(self, user_id):
        payload = checkAuthentication(self)
        if payload is not None:
            if payload["is_admin"] is True:
                user = db_user.getUserById(user_id)
                render_args = {"is_admin": payload["is_admin"]}
                if user is not None:
                    user_info = {"id": user_id, "name": user.name, "email": user.email,
                                 "is_admin": user.is_admin, "active": user.active}
                    return render(self, 'dashboard/admin-users-overview.html', user=user_info, **render_args)
                else:
                    render_args["alert_message"] = "The user couldn't be retrieved from the database."
                    render_args["alert_color"] = "red"
                    return render(self, 'dashboard/admin-users.html', **render_args)
            else:
                return render(self, 'dashboard/index.html', is_admin=payload["is_admin"])
        else:
            deleteAuthentication(self)


# Delete a user route
class RouteAdminUsersDelete(webapp2.RequestHandler):
    def get(self, user_id):
        payload = checkAuthentication(self)
        if payload is not None:
            if payload["is_admin"] is True:
                user = db_user.getUserById(user_id)
                try:
                    user.key.delete()
                    # AWFUL HACK, YOUR MOM WOULD BE ASHAMED IF SHE KNEW YOU'RE DOING THIS!!!!
                    time.sleep(0.1)
                    self.redirect('/dashboard/admin/users?flag=USER_DELETED')
                except:
                    render_args = {"is_admin": payload["is_admin"]}
                    render_args["alert_message"] = "Something went wrong deleting the user."
                    render_args["alert_color"] = "red"
                    return render(self, 'dashboard/admin-users.html', **render_args)
            else:
                return render(self, 'dashboard/index.html', is_admin=payload["is_admin"])
        else:
            deleteAuthentication(self)


# Create a new user route
class RouteAdminUsersCreate(webapp2.RequestHandler):
    def get(self):
        payload = checkAuthentication(self)
        if payload is not None:
            if payload["is_admin"] is True:
                return render(self, 'dashboard/admin-users-new.html', is_admin=payload["is_admin"])
            else:
                return render(self, 'dashboard/index.html', is_admin=payload['is_admin'])
        else:
            deleteAuthentication(self)

    def post(self):
        payload = checkAuthentication(self)
        if payload is not None:
            if payload["is_admin"] is True:
                render_args = {"is_admin": payload["is_admin"]}
                # Initialize the user
                user = db_user.User()
                user.name = self.request.get('name', default_value='')
                user.email = self.request.get('email', default_value='')
                user.pwd = self.request.get('pwd', default_value='')
                user.is_admin = False  # By default is not admin
                user.role = config.openid_default_role  # Default user role
                user.active = config.openid_default_active  # Default active value

                # Encrypt the password
                user.pwd = pbkdf2_sha256.hash(user.pwd)

                # Check the values
                if user.name is '' or user.email is '' or user.pwd is '':
                    render_args["alert_message"] = "Please fill all the fields."
                    render_args["alert_color"] = "red"
                    return render(self, 'dashboard/admin-users-new.html', **render_args)

                # Check if the email is registered
                if db_user.exists_user(user.email):
                    render_args["alert_message"] = "This email is already registered."
                    render_args["alert_color"] = "red"
                    return render(self, 'dashboard/admin-users-new.html', **render_args)

                # Register the user
                try:
                    user_key = user.put()
                    # AWFUL HACK, YOUR MOM WOULD BE ASHAMED IF SHE KNEW YOU'RE DOING THIS!!!!
                    time.sleep(0.1)
                    self.redirect('/dashboard/admin/users?flag=USER_CREATED')
                except:
                    render_args["alert_message"] = "Something went wrong creating the user."
                    render_args["alert_color"] = "red"
                    return render(self, 'dashboard/admin-users-new.html', **render_args)

            else:
                return render(self, 'dashboard/index.html', is_admin=payload['is_admin'])
        else:
            deleteAuthentication(self)


# Mount the app
app = webapp2.WSGIApplication([
    # General routes
    webapp2.Route('/', handler=RouteHome),
    webapp2.Route('/login', handler=RouteLogin),
    webapp2.Route('/register', handler=RouteRegister),
    webapp2.Route('/authorize', handler=RouteAuthorize),
    webapp2.Route('/logout', handler=RouteLogout),
    # Dashboard routes
    webapp2.Route('/dashboard', handler=RouteDashboard),
    webapp2.Route('/dashboard/profile', handler=RouteDashboardProfile),
    webapp2.Route('/dashboard/account/password', handler=RouteDashboardPassword),
    webapp2.Route('/dashboard/account/delete', handler=RouteDashboardAccountDelete),
    # Administrator routes:
    # Apps routes
    webapp2.Route('/dashboard/admin/apps', handler=RouteAdminAppsManagement),
    webapp2.Route('/dashboard/admin/apps/new', handler=RouteAdminAppsCreate),
    webapp2.Route('/dashboard/admin/apps/<app_id>', handler=RouteAdminAppsOverview),
    webapp2.Route('/dashboard/admin/apps/<app_id>/delete', handler=RouteAdminAppsDelete),
    # Users routes
    webapp2.Route('/dashboard/admin/users', handler=RouteAdminUsersManagement),
    webapp2.Route('/dashboard/admin/users/new', handler=RouteAdminUsersCreate),
    webapp2.Route('/dashboard/admin/users/<user_id>', handler=RouteAdminUsersOverview),
    webapp2.Route('/dashboard/admin/users/<user_id>/delete', handler=RouteAdminUsersDelete)

], debug=True)
