import os
import logging

import webapp2
import jinja2
from passlib.hash import pbkdf2_sha256

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


# Home route
class RouteHome(webapp2.RequestHandler):
    def get(self):
        # Get and verify the cookie
        token = self.request.cookies.get(config.openid_key + '_token')
        if token is not None:
            # logging.info('Has cookie --> validate the token')
            payload = tokens.decode(token, config.openid_secret, config.token_algorithm)
            if payload is not None:
                return self.redirect('/dashboard')
            else:
                self.response.delete_cookie(config.openid_key + '_token')
                return self.redirect('/login')
        else:
            # logging.info('Cookie not found --> redirect to login')
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
                return render(self, 'login.html',  error='Invalid captcha')

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
                return render(self, 'register.html',  error='Invalid captcha')

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


# Mount the app
app = webapp2.WSGIApplication([
    webapp2.Route('/', handler=RouteHome),
    webapp2.Route('/login', handler=RouteLogin),
    webapp2.Route('/register', handler=RouteRegister),
    webapp2.Route('/authorize', handler=RouteAuthorize)
], debug=True)
