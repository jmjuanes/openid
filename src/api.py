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
import users
import captcha
import tokens


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


# General users route
class RouteUsers(webapp2.RequestHandler):
    def post(self):
        # Parse the body to JSON
        try:
            data = json.loads(self.request.body)
        except:
            return renderError(self, 401, 'Unauthorized request')

        # Initialize the user
        u = users.User()
        u.name = data['name']
        u.email = data['email']
        u.is_admin = False
        u.active = config.openid_default_active

        # Encrypt the password
        u.pwd = data['pwd']
        u.pwd = pbkdf2_sha256.hash(u.pwd)

        # Check if values aren't empty
        if not u.name or not u.email:
            return renderError(self, 400, 'Please fill all the fields')

        # Check if the user already exists
        if users.exists_user(u.email):
            return renderError(self, 400, 'This user already exists')

        # Check if the captcha is enabled
        if config.captcha_enabled is True:
            # Get the captcha value and check if the captcha is valid
            captcha_value = data['g-recaptcha-response']
            if captcha.verify(captcha_value, config.captcha_secret, config.captcha_url) is False:
                return renderError(self, 400, 'Answer the captcha correctly')

        # Register the user
        try:
            u.put()
        except:
            return renderError(self, 500, 'The user could not be registered')

        # Return a JSON with the new user's info
        return renderJSON(self, {'name': u.name, 'email': u.email, 'password': u.pwd,
                                 'is_admin': u.is_admin, 'active': u.active})


# Specific user route
class RouteUsersById(webapp2.RequestHandler):
    def get(self, user_id):
        try:
            u = users.getUserById(user_id)
            if u is None:
                return renderError(self, 404, 'This user does not exist')

            return renderJSON(self, {'name': u.name, 'email': u.email, 'password': u.pwd,
                                     'is_admin': u.is_admin, 'active': u.active})
        except:
            return renderError(self, 500, 'The user could not be extracted from the database')

    def delete(self, user_id):
        try:
            u = users.getUserById(user_id)
            if u is None:
                return renderError(self, 404, 'This user does not exist')

            u.key.delete()
            return renderJSON(self, {'message': 'This is the deleted user info', 'name': u.name, 'email': u.email,
                                     'password': u.pwd,
                                     'is_admin': u.is_admin, 'active': u.active})
        except:
            return renderError(self, 500, 'The user could not be deleted')

    def put(self, user_id):
        # Parse the body to JSON
        try:
            data = json.loads(self.request.body)
        except:
            return renderError(self, 401, 'Unauthorized request')

        # Edit the user information
        try:
            u = users.getUserById(user_id)
            if u is None:
                return renderError(self, 404, 'This user does not exist')

            active = data['active']
            u.active = active
            u.put()
            return renderJSON(self, {"active": u.active})
        except:
            return renderError(self, 500, 'The user could not be modified')


# Login route
class RouteLogin(webapp2.RequestHandler):
    def post(self):
        # Parse the body to JSON
        try:
            data = json.loads(self.request.body)
        except:
            return renderError(self, 401, 'Unauthorized request')

        # Check the login info
        email = data['email']
        pwd = data['pwd']

        # Check if the captcha is enabled
        if config.captcha_enabled is True:
            # Get the captcha value and check if the captcha is valid
            captcha_value = data['g-recaptcha-response']
            if captcha.verify(captcha_value, config.captcha_secret, config.captcha_url) is False:
                return renderError(self, 400, 'Answer the captcha correctly')

        # Empty information
        if not email or not pwd:
            return renderError(self, 400, 'Please fill all the fields')

        # Search the user in the db
        try:
            u = users.get_user(email)
            if u is None:
                return renderError(self, 404, 'This user does not exist')
            if u.active is False:
                return renderError(self, 401, 'This user is not active')

            # Check the password
            if pbkdf2_sha256.verify(pwd, u.pwd) is True:
                # Encode token and give it to the user
                user_token = tokens.encode(u, config.openid_secret, config.token_algorithm, config.token_expiration)
                return renderJSON(self, {"token": user_token})
            else:
                return renderError(self, 400, 'Invalid password')
        except:
            return renderError(self, 500, 'There was a problem trying to log you in')



# General applications route
class RouteApplications(webapp2.RequestHandler):
    def post(self):
        # Parse the body to JSON
        try:
            data = json.loads(self.request.body)
        except:
            return renderError(self, 401, 'Unauthorized request')

        # Check if the captcha is enabled
        if config.captcha_enabled is True:
            # Get the captcha value and check if the captcha is valid
            captcha_value = data['g-recaptcha-response']
            if captcha.verify(captcha_value, config.captcha_secret, config.captcha_url) is False:
                return renderError(self, 400, 'Answer the captcha correctly')

        # Create the application
        a = application.Application()
        a.name = data['name']
        a.detail = data['detail']
        a.redirect = data['redirect']
        a.secret = application.generateSecret()

        # Check if values aren't empty
        if not a.name or not a.detail or not a.redirect:
            return renderError(self, 400, 'Please fill all the fields')

        # Insert the application in the database
        try:
            a.put()
            renderJSON(self, {"name": a.name, "detail": a.detail, "redirect": a.redirect})
        except:
            return renderError(self, 500, 'The application could not be registered')



# Mount the app
app = webapp2.WSGIApplication([
    # General routes
    # - Users routes
    webapp2.Route('/api/', handler=RouteHome),
    webapp2.Route('/api/users/', handler=RouteUsers),
    webapp2.Route('/api/users/<user_id>/', handler=RouteUsersById),
    # - Applications routes
    webapp2.Route('/api/applications/', handler=RouteApplications),
    # - Login route
    webapp2.Route('/api/login/', handler=RouteLogin),
    # - Authorize route
    # webapp2.Route('/api/authorize/', handler=RouteAuthorize),

    # Error route
    webapp2.Route('/api/<:.*>', handler=RouteError)
], debug=True)
