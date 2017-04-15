# Import dependencies
import webapp2
import logging

# Import lib modules
from passlib.hash import pbkdf2_sha256

# Import modules
import captcha
import config
import db_user
import render
import tokens


# Main page
class RouteLogin(webapp2.RequestHandler):
    # Login get
    def get(self):
        # Render the template
        render.template(self, 'login.html')

    # Login post
    def post(self):
        # Get the user email and password
        user_email = self.request.get('email', default_value='')
        user_pwd = self.request.get('pwd', default_value='')

        # Display in logs
        logging.info('Logging user ' + user_email)

        # Check if the captcha is enabled
        if config.captcha_enabled is True:
            # Get the captcha value
            captcha_value = self.request.get('g-recaptcha-response', '')

            # Check the captcha value
            if captcha.verify(captcha_value) is False:
                self.response.status_int = 400
                return render.template(self, 'login.html',  error='Invalid captcha')

        # Check for empty email or password
        if user_email == '' or user_pwd == '':
            self.response.status_int = 400
            return render.template(self, 'error.html', error='Invalid user request')

        # Get the user
        user = db_user.get_user(user_email)

        # Check for user not found
        if user is None:
            self.response.status_int = 400
            return render.template(self, 'login.html', error='Email not found')

        # Check the password
        if pbkdf2_sha256.verify(user_pwd, user.pwd) is False:
            self.response.status_int = 400
            return render.template(self, 'login.html', error='Invalid email or password')
        else:
            # Generate the token
            user_token = tokens.encode(user, config.openid_secret)

            # Generate the response
            #resp = make_response(render_template('home.html', email=user.email, name=user.name))

            # Set the cookie
            #resp.set_cookie('mgviz_token', user_token)

            # Do the response
            #return resp

# Initialize the app
app = webapp2.WSGIApplication([('/login', RouteLogin)], debug=True)
