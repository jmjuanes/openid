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
    def get(self):
        # Get the application id
        application_id = self.request.GET('client', '')
    
        # Get if signup is allowed
        application_signup = self.request.GET('allow_signup', 'false')
    
        # Check for undefined application id
        if application_id == '':
            return render.template(self, 'error.html', error='No application id provided'), 404
    
        # Get the application information
        application = db_application.get_application(application_id)
    
        # Check if the application exists
        if application is None:
            return render.template(self, 'error.html', error='Invalid application'), 404
    
        # Get the application state
        application_state = pbkdf2_sha256.hash(application_id)
    
        # Render the login template
        return render.template(self, 'authorize.html',
                               app_id=application_id,
                               app_state=application_state,
                               app_signup=application_signup,
                               app_name=application.name)

    def post(self):
        # Get the user email and password
        user_email = self.request.get('email', '')
        user_pwd = self.request.get('pwd', '')
    
        # Check for empty email or password
        if user_email == '' or user_pwd == '':
            return render.template(self, 'error.html', error='Invalid user request'), 400
    
        # Get the application id and state
        application_id = self.request.get('client', '')
        application_state = self.request.get('state', '')
        application_signup = self.request.get('signup', '')
    
        # Check for empty application id or state
        if application_id == '' or application_state == '':
            return render.template(self, 'error.html', error='Invalid application request'), 400
    
        # Check if the request has been made by a third party application and the process should be aborted
        if pbkdf2_sha256.verify(application_id, application_state) is False:
            return render.template(self, 'error.html', error='Invalid request state'), 400
    
        # Get the application
        application = db_application.get_application(application_id)
    
        # Check for application not found
        if application is None:
            return render.template(self, 'error.html', error='Application not found'), 404
    
        # Check if the captcha is enabled
        if config.captcha_enabled is True:
            # Get the captcha value
            captcha_value = self.request.get('g-recaptcha-response', '')
    
            # Check for empty captcha
            if captcha_value == '':
                return render.template(self, 'authorize.html',
                                       app_id=application_id,
                                       app_state=application_state,
                                       app_signup=application_signup,
                                       app_name=application.name,
                                       error='Invalid captcha')
    
            # Check the captcha value
            if captcha.verify(captcha_value) is False:
                return render.template(self, 'authorize.html',
                                       app_id=application_id,
                                       app_state=application_state,
                                       app_signup=application_signup,
                                       app_name=application.name,
                                       error='Invalid captcha')
    
        # Get the user
        user = db_user.get_user(user_email)
    
        # Check for non user
        if user is None:
            return render.template(self, 'authorize.html',
                                   app_id=application_id,
                                   app_state=application_state,
                                   app_signup=application_signup,
                                   app_name=application.name,
                                   error='Email not found')
        else:
            # Check the password
            if pbkdf2_sha256.verify(user_pwd, user.pwd) is False:
                return render.template(self, 'authorize.html',
                                       app_id=application_id,
                                       app_state=application_state,
                                       app_signup=application_signup,
                                       app_name=application.name,
                                       error='Invalid email or password')
            else:
                # Build the token
                user_token = tokens.encode(user, application.secret)
    
                # Redirect to the site
                return self.redirect(urlparse.urljoin(application.redirect, '?token=' + user_token))


# Initialize the app
app = webapp2.WSGIApplication([('/authorize', RouteAuthorize)], debug=True)
