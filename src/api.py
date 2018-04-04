# Python imports
import os
import json
import logging
import random
import string
import time

# Libs imports
import webapp2
from passlib.hash import pbkdf2_sha256

# Modules imports
import config
import application
import user
import captcha


# Render a JSON 
def renderJSON(self, obj): 
    self.response.headers['Content-Type'] = 'application/json'
    return self.response.out.write(json.dumps(obj))


# Render an error in JSON format
def renderError(self, code, message):
    self.response.headers['Content-Type'] = 'application/json'
    self.response.set_status(code)
    obj = {'message': message}
    return self.response.out.write(json.dumps(obj))


# Home route
class RouteHome(webapp2.RequestHandler):
    def get(self): 
        return renderJSON(self, {'message': 'Hello world!'})


# Error route
class RouteError(webapp2.RequestHandler):
    def get(self, *args, **kwargs):
        return renderError(self, 404, 'Not found')


# Users route
class RouteUsers(webapp2.RequestHandler):
    def post(self):
        # Initialize the user
        u = user.User()
        u.name = self.request.get('name', default_value='')
        u.email = self.request.get('email', default_value='')
        u.is_admin = False
        u.active = config.openid_default_active

        # Encrypt the password
        u.pwd = self.request.get('pwd', default_value='')
        u.pwd = pbkdf2_sha256.hash(u.pwd)

        # Check if values are correct
        if not u.name or not u.email:
            return renderError(self, 400, 'Please fill all the fields')

        # Check if the user already exists
        if user.exists_user(u.email):
            return renderError(self, 400, 'This user already exists')

        # Check if the captcha is enabled
        # if config.captcha_enabled is True:
        #     # Get the captcha value and check if the captcha is valid
        #     captcha_value = self.request.get('g-recaptcha-response', default_value='')
        #     if captcha.verify(captcha_value, config.captcha_secret, config.captcha_url) is False:
        #         return renderError(self, 400, 'Captcha was not completed correctly')

        # Register the user
        try:
            u.put()
        except:
            return renderError(self, 500, 'The user could not be registered')

        # Return a JSON with the new user's info
        renderJSON(self, {'name': u.name, 'email': u.email, 'password': u.pwd,
                          'is_admin': u.is_admin, 'active': u.active})


# Mount the app
app = webapp2.WSGIApplication([
    # General routes
    webapp2.Route('/api/', handler=RouteHome),
    webapp2.Route('/api/users/', handler=RouteUsers),
    # Error route
    webapp2.Route('/api/<:.*>', handler=RouteError)
], debug=True)

