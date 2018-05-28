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
import token
import response


# Home route
class RouteHome(webapp2.RequestHandler):
    def get(self):
        return response.sendJson(self, {'openid_name': config.openid_name, 'captcha_enabled': config.captcha_enabled,
                                        'captcha_key': config.captcha_key,
                                        'openid_allow_signup': config.openid_allow_signup})


# Error route
class RouteError(webapp2.RequestHandler):
    def get(self, *args, **kwargs):
        return response.sendError(self, 404, 'Not found')


# General users route
class RouteUsers(webapp2.RequestHandler):
    # Create a new user
    def post(self):
        # Parse the body to JSON
        try:
            data = json.loads(self.request.body)
        except:
            return response.sendError(self, 400, 'Bad request')

        # Initialize the user
        u = user.User()
        u.name = data['name']
        u.email = data['email']
        u.is_admin = False
        u.is_owner = False
        u.is_active = config.openid_default_active

        # Encrypt the password
        u.pwd = data['pwd']
        u.pwd = pbkdf2_sha256.hash(u.pwd)

        # Check if values aren't empty
        if not u.name or not u.email:
            return response.sendError(self, 400, 'Please fill all the fields')

        # Check if the user already exists
        if user.exists(u.email):
            return response.sendError(self, 400, 'This user already exists')

        # Check if the captcha is enabled
        if config.captcha_enabled is True:
            # Get the captcha value and check if the captcha is valid
            captcha_value = data['recaptcha']
            if captcha.verify(captcha_value, config.captcha_secret, config.captcha_url) is False:
                return response.sendError(self, 400, 'Captcha answered incorrectly')

        # Register the user
        try:
            u.put()
        except:
            return response.sendError(self, 500, 'The user could not be registered')

        # Return a JSON with the new user's info
        return user.getInfo(self, u)

    # Get the list of all the users
    def get(self):
        # Only administrators authorized
        # Extract the user token from the header
        header = self.request.headers['Authorization']
        t = token.extract(header)
        if t is None:
            return response.sendError(self, 400, 'Invalid authorization type')

        # Decode the token
        payload = token.decode(t, config.openid_secret, config.token_algorithm)
        if payload is None:
            return response.sendError(self, 401, 'Invalid authentication credentials')

        if payload['is_admin'] is False:
            return response.sendError(self, 401, 'Only allowed to administrators')

        try:
            # Get all the applications entities from the db
            all = user.getAll()
            users = []
            for i in range(0, len(all)):
                users.append({'id': all[i].key.id(),
                              'name': all[i].name,
                              'email': all[i].email,
                              'is_active': all[i].is_active,
                              'is_admin': all[i].is_admin,
                              'is_owner': all[i].is_owner})

            response.sendJson(self, {'users': users})
        except:
            return response.sendError(self, 500, 'Users could not be retrieved')


# Specific user route
class RouteUsersById(webapp2.RequestHandler):
    # Get the info from a user
    def get(self, user_id):
        # Only administrators authorized
        # Extract the user token from the header
        header = self.request.headers['Authorization']
        t = token.extract(header)
        if t is None:
            return response.sendError(self, 400, 'Invalid authorization type')

        # Decode the token
        payload = token.decode(t, config.openid_secret, config.token_algorithm)
        if payload is None:
            return response.sendError(self, 401, 'Invalid authentication credentials')

        if payload['is_admin'] is False:
            return response.sendError(self, 401, 'Only allowed to administrators')

        u = user.get(id=user_id)
        if u is None:
            return response.sendError(self, 404, 'This user does not exist')

        # If the user to delete is an admin, only the owner is allowed
        if u.is_admin is True:
            if payload['is_owner'] is False:
                return response.sendError(self, 401, 'Only the owner can delete admins')

        # Get the information
        u = user.get(id=user_id)
        if u is None:
            return response.sendError(self, 404, 'This user does not exist')

        return user.getInfo(self, u)

    # Delete a user
    def delete(self, user_id):
        # Only administrators authorized
        # Extract the user token from the header
        header = self.request.headers['Authorization']
        t = token.extract(header)
        if t is None:
            return response.sendError(self, 400, 'Invalid authorization type')

        # Decode the token
        payload = token.decode(t, config.openid_secret, config.token_algorithm)
        if payload is None:
            return response.sendError(self, 401, 'Invalid authentication credentials')

        if payload['is_admin'] is False:
            return response.sendError(self, 401, 'Only allowed to administrators')

        u = user.get(id=user_id)
        if u is None:
            return response.sendError(self, 404, 'This user does not exist')

        # If the user to delete is an admin, only the owner is allowed
        if u.is_admin is True:
            if payload['is_owner'] is False:
                return response.sendError(self, 401, 'Only the owner can delete admins')

        try:
            u.key.delete()
            return user.getInfo(self, u)
        except:
            return response.sendError(self, 500, 'The user could not be deleted')

    # Modify user info
    def put(self, user_id):
        # Parse the body to JSON
        try:
            data = json.loads(self.request.body)
        except:
            return response.sendError(self, 400, 'Bad request')

        # Only administrators authorized
        # Extract the user token from the header
        header = self.request.headers['Authorization']
        t = token.extract(header)
        if t is None:
            return response.sendError(self, 400, 'Invalid authorization type')

        # Decode the token
        payload = token.decode(t, config.openid_secret, config.token_algorithm)
        if payload is None:
            return response.sendError(self, 401, 'Invalid authentication credentials')

        if payload['is_admin'] is False:
            return response.sendError(self, 401, 'Only allowed to administrators')

        # Edit the user information
        u = user.get(id=user_id)
        if u is None:
            return response.sendError(self, 404, 'This user does not exist')

        # Update the info
        # if isinstance(data['is_active'], bool):
        if hasattr(data, 'is_active'):
            u.is_active = data['is_active']
        # if isinstance(data['is_active'], bool):
        if hasattr(data, 'is_admin'):
            u.is_admin = data['is_admin']

        # If the user to edit is an admin, only the owner is allowed to change its role
        if u.is_admin is True:
            if payload['is_owner'] is False and u.is_active is not None:
                return response.sendError(self, 401, 'Only the owner can edit the roles')

        try:
            u.put()
            return user.getInfo(self, u)
        except:
            return response.sendError(self, 500, 'The user could not be modified')


# User over his own information route
class RouteUser(webapp2.RequestHandler):
    # The user updates his own info
    def put(self):
        # Parse the body to JSON
        try:
            data = json.loads(self.request.body)
        except:
            return response.sendError(self, 400, 'Bad request')

        # Extract the user token from the header
        header = self.request.headers['Authorization']
        t = token.extract(header)
        if t is None:
            return response.sendError(self, 400, 'Invalid authorization type')

        # Decode the token
        payload = token.decode(t, config.openid_secret, config.token_algorithm)
        if payload is None:
            return response.sendError(self, 401, 'Invalid authentication credentials')

        # Get the user
        u = user.get(id=payload['id'])
        if u is None:
            return response.sendError(self, 400, 'Invalid user information')

        # Check if the user wants to update the password

        if data.get('old_pwd') is not None:
            # Check the 3 passwords
            old_pwd = data['old_pwd']
            new_pwd = data['new_pwd']
            repeat_pwd = data['repeat_pwd']

            # Check the new password
            if new_pwd != repeat_pwd:
                return response.sendError(self, 400, 'Passwords do not match')

            if len(new_pwd) < 6:
                return response.sendError(self, 400, 'New password too short')

            if new_pwd == old_pwd:
                return response.sendError(self, 400, 'New and old passwords cannot be the same')

            # Compare old pass with database pass
            if pbkdf2_sha256.verify(old_pwd, u.pwd) is False:
                return response.sendError(self, 400, 'Invalid old password')

            # Encrypt the new password
            u.pwd = pbkdf2_sha256.hash(new_pwd)

        elif data.get('name') is not None:
            new_name = data['name']
            if len(new_name) == 0:
                return response.sendError(self, 400, 'Invalid name')
            # Update the name
            u.name = new_name

        # Update the db information
        try:
            u.put()
            return user.getInfo(self, u)
        except:
            return response.sendError(self, 500, 'Unable to update your information')

    # The user sees his own information
    def get(self):
        # Extract the user token from the header
        header = self.request.headers['Authorization']
        t = token.extract(header)
        if t is None:
            return response.sendError(self, 400, 'Invalid authorization type')

        # Decode the token
        payload = token.decode(t, config.openid_secret, config.token_algorithm)
        if payload is None:
            return response.sendError(self, 401, 'Invalid authentication credentials')

        # Get the user
        u = user.get(id=payload['id'])
        if u is None:
            return response.sendError(self, 400, 'Invalid user information')

        return user.getInfo(self, u)


# User deleting his own account
class RouteUserDelete(webapp2.RequestHandler):
    def post(self):
        # Parse the body to JSON
        try:
            data = json.loads(self.request.body)
        except:
            return response.sendError(self, 400, 'Bad request')

        # Extract the user token from the header
        header = self.request.headers['Authorization']
        t = token.extract(header)
        if t is None:
            return response.sendError(self, 400, 'Invalid authorization type')

        # Decode the token
        payload = token.decode(t, config.openid_secret, config.token_algorithm)
        if payload is None:
            return response.sendError(self, 401, 'Invalid authentication credentials')

        # Get the user
        u = user.get(id=payload['id'])
        if u is None:
            return response.sendError(self, 400, 'Invalid user information')

        del_email = data['email']
        del_pwd = data['pwd']

        # Compare input pass with user pass
        if pbkdf2_sha256.verify(del_pwd, u.pwd) is False:
            return response.sendError(self, 400, 'Invalid password')

        # Compare input email with user email
        if u.email != del_email:
            return response.sendError(self, 400, 'Invalid email')

        try:
            u.key.delete()
            return response.sendJson(self, {'message': "User deleted"})
        except:
            return response.sendError(self, 500, 'Unable to delete the account')


# User modifying his own password
class RouteUserPassword(webapp2.RequestHandler):
    # Modify the password
    def put(self):
        # Parse the body to JSON
        try:
            data = json.loads(self.request.body)
        except:
            return response.sendError(self, 400, 'Bad request')

        # Extract the user token from the header
        header = self.request.headers['Authorization']
        t = token.extract(header)
        if t is None:
            return response.sendError(self, 400, 'Invalid authorization type')

        # Decode the token
        payload = token.decode(t, config.openid_secret, config.token_algorithm)
        if payload is None:
            return response.sendError(self, 401, 'Invalid authentication credentials')

        # Check the 3 passwords
        old_pwd = data['old_pwd']
        new_pwd = data['new_pwd']
        repeat_pwd = data['repeat_pwd']

        # Check the new password
        if new_pwd != repeat_pwd:
            return response.sendError(self, 400, 'Passwords do not match')

        if len(new_pwd) < 6:
            return response.sendError(self, 400, 'New password too short')

        if new_pwd == old_pwd:
            return response.sendError(self, 400, 'New and old passwords cannot be the same')

        # Get the user
        u = user.get(id=payload['id'])
        if u is None:
            return response.sendError(self, 400, 'Invalid user information')

        # Compare old pass with database pass
        if pbkdf2_sha256.verify(old_pwd, u.pwd) is False:
            return response.sendError(self, 400, 'Invalid old password')

        # Encrypt the new password
        u.pwd = pbkdf2_sha256.hash(new_pwd)

        # Update the db information
        try:
            u.put()
            return user.getInfo(self, u)
        except:
            return response.sendError(self, 500, 'Unable to update your information')


# General applications route
class RouteApplications(webapp2.RequestHandler):
    # Create a new application
    def post(self):
        # Parse the body to JSON
        try:
            data = json.loads(self.request.body)
        except:
            return response.sendError(self, 400, 'Bad request')

        # Check if the captcha is enabled
        # if config.captcha_enabled is True:
        #     # Get the captcha value and check if the captcha is valid
        #     captcha_value = data['recaptcha']
        #     if captcha.verify(captcha_value, config.captcha_secret, config.captcha_url) is False:
        #         return response.sendError(self, 400, 'Answer the captcha correctly')

        # Only administrators authorized
        # Extract the user token from the header
        header = self.request.headers['Authorization']
        t = token.extract(header)
        if t is None:
            return response.sendError(self, 400, 'Invalid authorization type')

        # Decode the token
        payload = token.decode(t, config.openid_secret, config.token_algorithm)
        if payload is None:
            return response.sendError(self, 401, 'Invalid authentication credentials')

        if payload['is_admin'] is False:
            return response.sendError(self, 401, 'Only allowed to administrators')

        # Create the application
        a = application.Application()
        a.name = data['name']
        a.detail = data['detail']
        a.redirect = data['redirect']
        a.secret = application.generateSecret()

        # Check if values aren't empty
        if not a.name or not a.detail or not a.redirect:
            return response.sendError(self, 400, 'Please fill all the fields')

        # Insert the application in the database
        try:
            a.put()
            response.sendJson(self, {"name": a.name,
                                     "detail": a.detail,
                                     "redirect": a.redirect})
        except:
            return response.sendError(self, 500, 'The application could not be registered')

    # Get the list of all the applications
    def get(self):
        # Only administrators authorized
        # Extract the user token from the header
        header = self.request.headers['Authorization']
        t = token.extract(header)
        if t is None:
            return response.sendError(self, 400, 'Invalid authorization type')

        # Decode the token
        payload = token.decode(t, config.openid_secret, config.token_algorithm)
        if payload is None:
            return response.sendError(self, 401, 'Invalid authentication credentials')

        if payload['is_admin'] is False:
            return response.sendError(self, 401, 'Only allowed to administrators')

        try:
            # Get all the applications entities from the db
            all = application.getAll()
            apps = []
            for i in range(0, len(all)):
                apps.append({'id': all[i].key.id(), 'name': all[i].name})
                # Retrieve more info if needed

            response.sendJson(self, {'applications': apps})
        except:
            return response.sendError(self, 500, 'Applications could not be retrieved')


# Specific application route
class RouteApplicationsById(webapp2.RequestHandler):
    # Get an application's information
    def get(self, app_id):
        a = application.get_application(app_id)
        if a is None:
            return response.sendError(self, 404, 'This application does not exist')
        return response.sendJson(self, {'name': a.name,
                                        'detail': a.detail,
                                        'redirect': a.redirect})

    # Delete an application
    def delete(self, app_id):
        # Only administrators authorized
        # Extract the user token from the header
        header = self.request.headers['Authorization']
        t = token.extract(header)
        if t is None:
            return response.sendError(self, 400, 'Invalid authorization type')

        # Decode the token
        payload = token.decode(t, config.openid_secret, config.token_algorithm)
        if payload is None:
            return response.sendError(self, 401, 'Invalid authentication credentials')

        if payload['is_admin'] is False:
            return response.sendError(self, 401, 'Only allowed to administrators')

        a = application.get_application(app_id)
        if a is None:
            return response.sendError(self, 404, 'This application does not exist')

        try:
            a.key.delete()
            return response.sendJson(self, {'message': 'This is the deleted application info',
                                            'name': a.name,
                                            'detail': a.detail,
                                            'redirect': a.redirect})
        except:
            return response.sendError(self, 500, 'The application could not be deleted')

    # Modify application's info
    def put(self, app_id):
        # Parse the body to JSON
        try:
            data = json.loads(self.request.body)
        except:
            return response.sendError(self, 400, 'Bad request')

        # Only administrators authorized
        # Extract the user token from the header
        header = self.request.headers['Authorization']
        t = token.extract(header)
        if t is None:
            return response.sendError(self, 400, 'Invalid authorization type')

        # Decode the token
        payload = token.decode(t, config.openid_secret, config.token_algorithm)
        if payload is None:
            return response.sendError(self, 401, 'Invalid authentication credentials')

        if payload['is_admin'] is False:
            return response.sendError(self, 401, 'Only allowed to administrators')

        # Edit the app information
        a = application.get_application(app_id)
        if a is None:
            return response.sendError(self, 404, 'This application does not exist')

        a.name = data['name']
        a.detail = data['detail']
        a.redirect = data['redirect']

        try:
            a.put()
            return response.sendJson(self, {'message': 'This is the modified application info',
                                            'name': a.name,
                                            'detail': a.detail,
                                            'redirect': a.redirect})
        except:
            return response.sendError(self, 500, 'The application could not be modified')


# Application's secret route
class RouteApplicationsSecret(webapp2.RequestHandler):
    # Get the secret
    def get(self, app_id):
        # Only administrators authorized
        # Extract the user token from the header
        header = self.request.headers['Authorization']
        t = token.extract(header)
        if t is None:
            return response.sendError(self, 400, 'Invalid authorization type')

        # Decode the token
        payload = token.decode(t, config.openid_secret, config.token_algorithm)
        if payload is None:
            return response.sendError(self, 401, 'Invalid authentication credentials')

        if payload['is_admin'] is False:
            return response.sendError(self, 401, 'Only allowed to administrators')

        # Extract the secret from the db
        a = application.get_application(app_id)
        if a is None:
            return response.sendError(self, 404, 'This application does not exist')
        return response.sendJson(self, {'secret': a.secret})


# Login route
class RouteLogin(webapp2.RequestHandler):
    # Login with username and pass
    def post(self):
        # Parse the body to JSON
        try:
            data = json.loads(self.request.body)
        except:
            return response.sendError(self, 400, 'Bad request')

        # Check the login info
        email = data['email']
        pwd = data['pwd']

        # Check if the captcha is enabled
        if config.captcha_enabled is True:
            # Get the captcha value and check if the captcha is valid
            captcha_value = data['recaptcha']
            if captcha.verify(captcha_value, config.captcha_secret, config.captcha_url) is False:
                return response.sendError(self, 400, 'Answer the captcha correctly')

        # Empty information
        if not email or not pwd:
            return response.sendError(self, 400, 'Please fill all the fields')

        # Search the user in the db
        u = user.get(email=email)
        if u is None:
            return response.sendError(self, 404, 'This user does not exist')
        if u.is_active is False:
            return response.sendError(self, 401, 'This user is not active')

        # Check the password
        if pbkdf2_sha256.verify(pwd, u.pwd) is True:
            # Encode token and give it to the user
            user_token = token.encode(u, config.openid_secret, config.token_algorithm, config.token_expiration)
            return response.sendJson(self, {'token': user_token})
        else:
            return response.sendError(self, 400, 'Invalid password')


# Authorization route
class RouteAuthorize(webapp2.RequestHandler):
    # Authorize an app
    def post(self):
        # Parse the body to JSON
        try:
            data = json.loads(self.request.body)
        except:
            return response.sendError(self, 400, 'Bad request')

        # Check if the captcha is enabled
        if config.captcha_enabled is True:
            # Get the captcha value and check if the captcha is valid
            captcha_value = data['recaptcha']
            if captcha.verify(captcha_value, config.captcha_secret, config.captcha_url) is False:
                return response.sendError(self, 400, 'Answer the captcha correctly')

        # Get the user and application info
        email = data['email']
        pwd = data['pwd']
        app_id = data['client']

        # Empty user information
        if not email or not pwd:
            return response.sendError(self, 400, 'User information missing')
        # Empty app information
        if not app_id:
            return response.sendError(self, 400, 'App information missing')

        # Get the application
        a = application.get_application(app_id)
        if a is None:
            return response.sendError(self, 404, 'Application not found')

        # Get the user
        u = user.get(email=email)
        if u is None:
            return response.sendError(self, 404, 'User not found')

        # Check if the user is active
        if u.is_active is False:
            return response.sendError(self, 401, 'User not active')

        # If nothing went wrong, check the password
        if pbkdf2_sha256.verify(pwd, u.pwd) is True:
            client_token = token.encode(u, a.secret, config.token_algorithm, config.token_expiration)
            return response.sendJson(self, {'username': u.name,
                                            'app_name': a.name,
                                            'client_token': client_token})
        else:
            return response.sendError(self, 400, 'Invalid password')


# Mount the app
app = webapp2.WSGIApplication([
    # General routes
    webapp2.Route('/api/', handler=RouteHome),
    # Users routes
    webapp2.Route('/api/users', handler=RouteUsers),
    webapp2.Route('/api/users/<user_id>', handler=RouteUsersById),
    webapp2.Route('/api/user', handler=RouteUser),
    webapp2.Route('/api/user/password', handler=RouteUserPassword),
    webapp2.Route('/api/user/delete', handler=RouteUserDelete),
    # Applications routes
    webapp2.Route('/api/applications', handler=RouteApplications),
    webapp2.Route('/api/applications/<app_id>/secret', handler=RouteApplicationsSecret),
    webapp2.Route('/api/applications/<app_id>', handler=RouteApplicationsById),
    # Login route
    webapp2.Route('/api/login', handler=RouteLogin),
    # Authorize route
    webapp2.Route('/api/authorize', handler=RouteAuthorize),

    # Error route
    webapp2.Route('/api/<:.*>', handler=RouteError)
], debug=True)
