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
# import config


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


# Mount the app
app = webapp2.WSGIApplication([
    # General routes
    webapp2.Route('/api/', handler=RouteHome),
    # Error route
    webapp2.Route('/api/<:.*>', handler=RouteError)
], debug=True)

