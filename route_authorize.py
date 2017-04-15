# Import dependencies
import webapp2
import urlparse

# Import lib modules
from passlib.hash import pbkdf2_sha256

# Import modules
import captcha
import config
import db_user
import db_application
import render
import tokens


# Authorize page
class RouteAuthorize(webapp2.RequestHandler):
    # Get action
    def get(self):
        # Get the application id
        application_id = self.request.get('client', default_value='')
    
        # Get if signup is allowed
        application_signup = self.request.get('allow_signup', default_value='false')
    
        # Check for undefined application id
        if application_id == '':
            self.response.status_int = 400
            return render.template(self, 'error.html', error='No application id provided')

        # Get the application information
        application = db_application.get_application(application_id)

        # Check if the application exists
        if application is None:
            self.response.status_int = 404
            return render.template(self, 'error.html', error='Invalid application')

        # Get the application state
        application_state = pbkdf2_sha256.hash(application_id)
    
        # Render the login template
        return render.template(self, 'authorize.html',
                               app_id=application_id,
                               app_state=application_state,
                               app_signup=application_signup,
                               app_name=application.name)

    # Post action
    def post(self):
        # Get the user email and password
        user_email = self.request.get('email', default_value='')
        user_pwd = self.request.get('pwd', default_value='')
    
        # Check for empty email or password
        if user_email == '' or user_pwd == '':
            self.response.status_int = 400
            return render.template(self, 'error.html', error='Invalid user request')
    
        # Get the application id and state
        application_id = self.request.get('client', default_value='')
        application_state = self.request.get('state', default_value='')
        application_signup = self.request.get('signup', default_value='false')
    
        # Check for empty application id or state
        if application_id == '' or application_state == '':
            self.response.status_int = 400
            return render.template(self, 'error.html', error='Invalid application request')
    
        # Check if the request has been made by a third party application and the process should be aborted
        if pbkdf2_sha256.verify(application_id, application_state) is False:
            self.response.status_int = 400
            return render.template(self, 'error.html', error='Invalid request state')
    
        # Get the application
        application = db_application.get_application(application_id)
    
        # Check for application not found
        if application is None:
            self.response.status_int = 400
            return render.template(self, 'error.html', error='Application not found')
    
        # Check if the captcha is enabled
        if config.captcha_enabled is True:
            # Get the captcha value
            captcha_value = self.request.get('g-recaptcha-response', default_value='')
    
            # Check the captcha value
            if captcha.verify(captcha_value) is False:
                self.response.status_int = 400
                return render.template(self, 'authorize.html',
                                       app_id=application_id,
                                       app_state=application_state,
                                       app_signup=application_signup,
                                       app_name=application.name,
                                       error='Invalid captcha')
    
        # Get the user
        user = db_user.get_user(user_email)
    
        # Check for no user
        if user is None:
            self.response.status_int = 400
            return render.template(self, 'authorize.html',
                                   app_id=application_id,
                                   app_state=application_state,
                                   app_signup=application_signup,
                                   app_name=application.name,
                                   error='Email not found')
        else:
            # Check if user is active
            if user.active is False:
                self.response.status_int = 401
                return render.template(self, 'authorize.html',
                                       app_id=application_id,
                                       app_state=application_state,
                                       app_signup=application_signup,
                                       app_name=application.name,
                                       error='User is not active')

            # Check the password
            if pbkdf2_sha256.verify(user_pwd, user.pwd) is False:
                self.response.status_int = 400
                return render.template(self, 'authorize.html',
                                       app_id=application_id,
                                       app_state=application_state,
                                       app_signup=application_signup,
                                       app_name=application.name,
                                       error='Invalid email or password')
            else:
                # Build the token
                user_token = tokens.encode(user, application.secret)
    
                # Build the outgoing url and redirect
                redirect_url = urlparse.urljoin(application.redirect, '?token=' + user_token)
                return self.redirect(str(redirect_url))


# Initialize the app
app = webapp2.WSGIApplication([('/authorize', RouteAuthorize)], debug=True)
