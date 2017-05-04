# Import dependencies
import webapp2

# Import lib modules
from passlib.hash import pbkdf2_sha256

# Import modules
import captcha
import config
import db_user
import render


# Main page
class RouteRegister(webapp2.RequestHandler):
    # Register get
    def get(self):
        # Render the register page
        return render.template(self, 'register.html', error='')

    # Register post
    def post(self):
        # Check if the captcha is enabled
        if config.captcha_enabled is True:
            # Get the captcha value
            captcha_value = self.request.get('g-recaptcha-response', default_value='')

            # Check the captcha value
            if captcha.verify(captcha_value) is False:
                self.response.status_int = 400
                return render.template(self, 'register.html',  error='Invalid captcha')
    
        # Initialize the user
        user = db_user.User()
    
        # Get the post values
        user.name = self.request.get('name', default_value='')
        user.institution = self.request.get('institution', default_value='')
        user.email = self.request.get('email', default_value='')
        user.pwd = self.request.get('pwd', default_value='')
        user.is_admin = False  # By default is not admin
        user.role = config.openid_default_role  # Default user role
        user.active = config.openid_default_active  # Default active value
    
        # Encrypt the password
        user.pwd = pbkdf2_sha256.hash(user.pwd)
    
        # Check the values
        if user.name is '' or user.institution is '' or user.email is '' or user.pwd is '':
            self.response.status_int = 400
            return render.template(self, 'register.html', error='You must fill all fields')
    
        # Check if the email is registered
        if db_user.exists_user(user.email):
            self.response.status_int = 400
            return render.template(self, 'register.html', error='The email has already registered')
    
        # Register the user
        user_key = user.put()
    
        # Get the continue argument
        # continue_url = request.args.get('continue', '')
    
        # Render the registration completed page
        return render.template(self, 'register-completed.html')

# Initialize the app
app = webapp2.WSGIApplication([('/register', RouteRegister)], debug=True)
