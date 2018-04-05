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


# General users route
class RouteUsers(webapp2.RequestHandler):
    def post(self):
        # Parse the body to JSON
        try:
            data = json.loads(self.request.body)
        except:
            return renderError(self, 401, 'Unauthorized request')

        # Initialize the user
        u = user.User()
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
        if user.exists_user(u.email):
            return renderError(self, 400, 'This user already exists')

        # Check if the captcha is enabled
        # if config.captcha_enabled is True:
        #     return renderError(self, 400, 'Captcha still in progress')

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
            u = user.getUserById(user_id)
            if u is None:
                return renderError(self, 404, 'This user does not exist')

            return renderJSON(self, {'name': u.name, 'email': u.email, 'password': u.pwd,
                                     'is_admin': u.is_admin, 'active': u.active})
        except:
            return renderError(self, 500, 'The user could not be extracted from the database')

    def delete(self, user_id):
        try:
            u = user.getUserById(user_id)
            if u is None:
                return renderError(self, 404, 'This user does not exist')

            u.key.delete()
            return renderJSON(self, {'message': 'This is the deleted user info', 'name': u.name, 'email': u.email,
                                     'password': u.pwd,
                                     'is_admin': u.is_admin, 'active': u.active})
        except:
            return renderError(self, 500, 'The user could not be deleted')

    def put(self, user_id):
        try:
            u = user.getUserById(user_id)
            if u is None:
                return renderError(self, 404, 'This user does not exist')

            active = self.request.get('active')
            if active == 'True':
                active = True
            elif active == 'False':
                active = False

            u.active = active
            u.put()
            return renderJSON(self, {"active": u.active})
        except:
            return renderError(self, 500, 'The user could not be modified')


# Mount the app
app = webapp2.WSGIApplication([
    # General routes
    webapp2.Route('/api/', handler=RouteHome),
    webapp2.Route('/api/users/', handler=RouteUsers),
    webapp2.Route('/api/users/<user_id>/', handler=RouteUsersById),
    # Error route
    webapp2.Route('/api/<:.*>', handler=RouteError)
], debug=True)
