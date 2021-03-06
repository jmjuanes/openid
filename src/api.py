# Python imports
import os
import json
import logging
import random
import string
import time
import sys

# Libs imports
import webapp2
from passlib.hash import pbkdf2_sha256

# Modules imports
import config
import application
import authorization
import user
import captcha
import token
import response
import resetpwd
import mailbox


# Home route
class RouteHome(webapp2.RequestHandler):
    def get(self):
        # Build the configuration object
        obj = {
            'name': config.global_name,
            'key': config.global_public_key,
            'signup': {
                'enabled': config.signup_enabled,
                'must_agree': config.signup_must_agree 
            },
            'resetpwd': {
                'enabled': config.resetpwd_enabled
            },
            'captcha': {
                'enabled': config.captcha_enabled,
                'key': config.captcha_public_key
            },
            'links': config.links,
            'footer': {
                'links': config.footer_links
            }
        }
        # Send the configuration object
        return response.sendJson(self, obj)


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
        # Check if values aren't empty
        if not data['name'] or not data['email']:
            return response.sendError(self, 400, 'Please fill all the fields')
        # Check if the user already exists
        if user.exists(data['email']):
            return response.sendError(self, 400, 'This user already exists')
        # Extract the user token from the header
        t = token.extract(self.request.headers.get('Authorization'))
        payload = None
        if t is not None:
            payload = token.decode(t, config.global_secret_key, config.token_algorithm)
            # Only admins are allowed
            if payload is None:
                return response.sendError(self, 401, 'Invalid authentication credentials')
            if payload.get('is_admin') is not True: 
                return response.sendError(self, 401, 'Only administrators are allowed')
        # Check if signup is not allowed
        if config.signup_enabled is False and payload is None:
            return response.sendError(self, 403, 'No new signups are allowed')
        # Check if the captcha is enabled
        if config.captcha_enabled is True and payload is None:
            if captcha.verify(data.get('recaptcha')) is False:
                return response.sendError(self, 400, 'Captcha answered incorrectly')
        # Initialize the user
        u = user.User(biography='', company='', location='')
        u.name = data['name']
        u.email = data['email']
        u.is_admin = config.signup_default_admin
        u.is_owner = False
        u.is_active = config.signup_default_active
        try:
            # Encrypt the password
            u.pwd = pbkdf2_sha256.hash(data['pwd'])
            # Register the user
            u.put()
        except:
            return response.sendError(self, 500, 'The user could not be registered')

        # Return a JSON with the new user's info
        return response.sendJson(self, user.to_json(u))

    # Get the list of all the users
    def get(self):
        # Only administrators authorized
        # Extract the user token from the header
        t = token.extract(self.request.headers.get('Authorization'))
        if t is None:
            return response.sendError(self, 400, 'Invalid authorization type')
        # Decode the token
        payload = token.decode(t, config.global_secret_key, config.token_algorithm)
        if payload is None:
            return response.sendError(self, 401, 'Invalid authentication credentials')
        # Check if is admin or owner
        if payload['is_admin'] is False:
            return response.sendError(self, 401, 'Only allowed to administrators')
        try:
            # Get all the applications entities from the database
            all_users = user.get_all()
            users = []
            for i in range(0, len(all_users)):
                users.append({'id': all_users[i].key.id(),
                              'name': all_users[i].name,
                              'email': all_users[i].email,
                              'is_active': all_users[i].is_active,
                              'is_admin': all_users[i].is_admin,
                              'is_owner': all_users[i].is_owner})
            # Send the list with all the users in JSON format
            response.sendJson(self, {'users': users})
        except:
            return response.sendError(self, 500, 'Users could not be retrieved')


# Specific user route
class RouteUsersById(webapp2.RequestHandler):
    # Get the info from a user
    def get(self, user_id):
        # Only administrators authorized
        # Extract the user token from the header
        t = token.extract(self.request.headers.get('Authorization'))
        if t is None:
            return response.sendError(self, 400, 'Invalid authorization type')
        # Decode the token
        payload = token.decode(t, config.global_secret_key, config.token_algorithm)
        if payload is None:
            return response.sendError(self, 401, 'Invalid authentication credentials')
        # Check if is admin or owner
        if payload['is_admin'] is False:
            return response.sendError(self, 401, 'Only allowed to administrators')
        # Extract the user from the database
        u = user.get(id=user_id)
        if u is None:
            return response.sendError(self, 404, 'User not found')
        # If the user to delete is an admin, only the owner is allowed
        #if u.is_admin is True:
        #    if payload['is_owner'] is False:
        #        return response.sendError(self, 401, 'Only the owner can edit an administrator')
        # Get the information
        return response.sendJson(self, user.to_json(u))

    # Delete a user
    def delete(self, user_id):
        # Only administrators authorized
        # Extract the user token from the header
        t = token.extract(self.request.headers.get('Authorization'))
        if t is None:
            return response.sendError(self, 400, 'Invalid authorization type')
        # Decode the token
        payload = token.decode(t, config.global_secret_key, config.token_algorithm)
        if payload is None:
            return response.sendError(self, 401, 'Invalid authentication credentials')
        # check if is admin or owner
        if payload['is_admin'] is False:
            return response.sendError(self, 401, 'Only allowed to administrators')
        #Extract the user from the database
        u = user.get(id=user_id)
        if u is None:
            return response.sendError(self, 404, 'User not found')
        # If the user to delete is an admin, only the owner is allowed
        if u.is_admin is True:
            if payload['is_owner'] is False:
                return response.sendError(self, 401, 'Only the owner can delete administrators')
        try:
            # Delete this user from the database
            u.key.delete()
            return response.sendJson(self, user.to_json(u))
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
        t = token.extract(self.request.headers.get('Authorization'))
        if t is None:
            return response.sendError(self, 400, 'Invalid authorization type')
        # Decode the token
        payload = token.decode(t, config.global_secret_key, config.token_algorithm)
        if payload is None:
            return response.sendError(self, 401, 'Invalid authentication credentials')
        # Check for administrators
        if payload['is_admin'] is False:
            return response.sendError(self, 401, 'Only allowed to administrators')
        # Edit the user information
        u = user.get(id=user_id)
        if u is None:
            return response.sendError(self, 404, 'User not found')
        # Update if user is active
        # if isinstance(data['is_active'], bool):
        if data.get('is_active') is not None:
            #print "Changed is_active value"
            u.is_active = data['is_active']
        # If the user to edit is an admin, only the owner is allowed to change its role
        if payload['is_owner'] is True:
            if data.get('is_admin') is not None:
                #print 'Changed is_admin value of user'
                u.is_admin = data['is_admin']
        try:
            u.put()
            return response.sendJson(self, user.to_json(u))
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
        t = token.extract(self.request.headers.get('Authorization'))
        if t is None:
            return response.sendError(self, 400, 'Invalid authorization type')
        # Decode the token
        payload = token.decode(t, config.global_secret_key, config.token_algorithm)
        if payload is None:
            return response.sendError(self, 401, 'Invalid authentication credentials')
        # Get the user
        u = user.get(id=payload['id'])
        if u is None:
            return response.sendError(self, 400, 'Invalid user information')
        # Check if the user wants to update the password
        if data.get('new_pwd') is not None:
            # Check the new password
            if data['new_pwd'] != data['repeat_pwd']:
                return response.sendError(self, 400, 'Passwords do not match')
            # Check the length of the new password
            if len(data['new_pwd']) < 6:
                return response.sendError(self, 400, 'New password too short')
            # Check if the new and the old passwords are equal
            if data['new_pwd'] == data['old_pwd']:
                return response.sendError(self, 400, 'New and old passwords cannot be the same')
            # Compare old pass with database pass
            if pbkdf2_sha256.verify(data['old_pwd'], u.pwd) is False:
                return response.sendError(self, 400, 'Invalid old password')
            # Encrypt the new password
            u.pwd = pbkdf2_sha256.hash(data['new_pwd'])
        # Update the email preferences
        if data.get('email') is not None:
            if user.get(email=data['email']) is not None:
                return response.sendError(self, 400, 'This email is already being used')
            u.email = data['email']
        # Check to update the personal information
        if data.get('name') is not None:
            u.name = data['name']
        if data.get('biography') is not None:
            u.biography = data['biography']
        if data.get('company') is not None:
            u.company = data['company']
        if data.get('location') is not None:
            u.location = data['location']
        # Update the db information
        try:
            u.put()
            return response.sendJson(self, user.to_json(u))
        except:
            return response.sendError(self, 500, 'Unable to update your information')

    # Extract the user data
    def get(self):
        # Extract the user token from the header 
        t = token.extract(self.request.headers.get('Authorization'))
        if t is None:
            return response.sendError(self, 400, 'Invalid authorization type')
        # Decode the token
        payload = token.decode(t, config.global_secret_key, config.token_algorithm)
        if payload is None:
            return response.sendError(self, 401, 'Invalid authentication credentials')
        # Get the user
        u = user.get(id=payload['id'])
        if u is None:
            return response.sendError(self, 400, 'Invalid user information')
        return response.sendJson(self, user.to_json(u))


# User deleting his own account
class RouteUserDelete(webapp2.RequestHandler):
    def post(self):
        # Parse the body to JSON
        try:
            data = json.loads(self.request.body)
        except:
            return response.sendError(self, 400, 'Bad request')
        # Extract the user token from the header
        t = token.extract(self.request.headers.get('Authorization'))
        if t is None:
            return response.sendError(self, 400, 'Invalid authorization type')
        # Decode the token
        payload = token.decode(t, config.global_secret_key, config.token_algorithm)
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
            # Delete all authorizations for this user
            result = authorization.delete_by_user(payload['id'])
            if result is False:
                return response.sendError(self, 500, 'Error removing all authorizations')
            # Delete this user
            u.key.delete()
            return response.sendJson(self, {'message': "User deleted"})
        except:
            return response.sendError(self, 500, 'Unable to delete the account')


# Extract all the authorizations of a user
class RouteUserAuthorizations(webapp2.RequestHandler):
    def get(self):
        # Extract the token from the header
        t = token.extract(self.request.headers.get('Authorization'))
        if t is None:
            return response.sendError(self, 400, 'Invalid authorization type')
        # Decode the token
        payload = token.decode(t, config.global_secret_key, config.token_algorithm)
        if payload is None:
            return response.sendError(self, 401, 'Invalid authentication credentials')
        # Extract all the authorizations for this user
        try:
            all_auths = authorization.get_all(id=payload['id'])
            #print "Imported authorizations: ", len(all_auths)
            auths = []
            for i in range(0, len(all_auths)):
                # Build the authorization object
                obj = authorization.to_json(all_auths[i])
                # Get and save the application information for this authorization
                a= application.get(all_auths[i].app_id)
                obj['application'] = application.to_json(a)
                auths.append(obj)
            # Return the list with the applications registered
            response.sendJson(self, {'authorizations': auths})
        except:
            print "Unexpected error: ", sys.exc_info()[0]
            return response.sendError(self, 500, 'Authorizations could not be retrieved')


# Manage a single authorization
class RouteUserAuthorizationsById(webapp2.RequestHandler):
    def post(self, app_id):
        # Extract the token from the header
        t = token.extract(self.request.headers.get('Authorization'))
        if t is None:
            return response.sendError(self, 400, 'Invalid authorization type')
        # Decode the token
        payload = token.decode(t, config.global_secret_key, config.token_algorithm)
        if payload is None:
            return response.sendError(self, 401, 'Invalid authentication credentials')
        # Import the application data
        a = application.get(app_id)
        if a is None:
            return response.sendError(self, 404, 'Application not found')
        # Import the user information
        u = user.get(payload['id'])
        if u is None:
            return response.sendError(self, 404, 'User not found')
        # Get the authentication metadata
        try:
            au = authorization.get(app_id, payload['id'])
            if au is None:
                au = authorization.Authorization(app_id=int(app_id), user_id=int(payload['id']))
                au.grant_access = int(time.time())
            # Update the last access value and update the authorization in the database
            au.last_access = int(time.time())
            au.put()
            # Generate the token for this application
            client_token = token.encode(u, a.permissions, a.secret, config.token_algorithm, config.token_expiration)
            return response.sendJson(self, {'token': client_token})
        except:
            print "Unexpected error: ", sys.exc_info()[0]
            return response.sendError(self, 500, 'Error generating authorization')

    # Delete an authorization
    def delete(self, app_id):
        # Extract the token from the header
        t = token.extract(self.request.headers.get('Authorization'))
        if t is None:
            return response.sendError(self, 400, 'Invalid authorization type')
        # Decode the token
        payload = token.decode(t, config.global_secret_key, config.token_algorithm)
        if payload is None:
            return response.sendError(self, 401, 'Invalid authentication credentials')
        # Get the authorization from the database
        au = authorization.get(app_id, payload['id'])
        if au is not None:
            try: 
                au.key.delete()
            except:
                return response.sendError(self, 500, 'Error removing authorization')
        # Delete completed
        return response.sendJson(self, {'message': 'Authorization deleted'})


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
        header = self.request.headers.get('Authorization')
        t = token.extract(header)
        if t is None:
            return response.sendError(self, 400, 'Invalid authorization type')
        # Decode the token
        payload = token.decode(t, config.global_secret_key, config.token_algorithm)
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
            return response.sendJson(self, user.to_json(u))
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
        # Only administrators authorized
        # Extract the user token from the header
        t = token.extract(self.request.headers.get('Authorization'))
        if t is None:
            return response.sendError(self, 400, 'Invalid authorization type')
        # Decode the token
        payload = token.decode(t, config.global_secret_key, config.token_algorithm)
        if payload is None:
            return response.sendError(self, 401, 'Invalid authentication credentials')
        # Check if user is an admin
        if payload['is_admin'] is False:
            return response.sendError(self, 401, 'Only allowed to administrators')
        # Check if values aren't empty
        if not data['name'] or not data['redirect_url']:
            return response.sendError(self, 400, 'Missing application name ot redirecion url')
        # Create the application
        try:
            a = application.Application()
            a.name = data['name']
            a.description = data['description']
            a.redirect_url = data['redirect_url']
            a.homepage_url = data['homepage_url']
            a.privacy_url = data['privacy_url']
            a.permissions = data['permissions']
            a.secret = application.generate_secret()
        except:
            return response.sendError(self, 500, 'Error registrating the application')
        # Insert the application in the database
        try:
            a.put()
            return response.sendJson(self, application.to_json(a))
        except:
            return response.sendError(self, 500, 'The application could not be registered')

    # Get the list of all the applications
    def get(self):
        # Only administrators authorized
        # Extract the user token from the header
        t = token.extract(self.request.headers.get('Authorization'))
        if t is None:
            return response.sendError(self, 400, 'Invalid authorization type')
        # Decode the token
        payload = token.decode(t, config.global_secret_key, config.token_algorithm)
        if payload is None:
            return response.sendError(self, 401, 'Invalid authentication credentials')
        # Check if the user is admin
        if payload['is_admin'] is False:
            return response.sendError(self, 401, 'Only allowed to administrators')
        try:
            # Get all the applications entities from the db
            all_apps = application.get_all()
            apps = []
            for i in range(0, len(all_apps)):
                obj = {
                    'id': all_apps[i].key.id(),
                    'name': all_apps[i].name,
                    'description': all_apps[i].description
                }
                apps.append(obj)
            # Return the list with the applications registered
            response.sendJson(self, {'applications': apps})
        except:
            return response.sendError(self, 500, 'Applications could not be retrieved')


# Specific application route
class RouteApplicationsById(webapp2.RequestHandler):
    # Get an application's information
    def get(self, app_id):
        a = application.get(app_id)
        if a is None:
            return response.sendError(self, 404, 'This application does not exist')
        return response.sendJson(self, application.to_json(a))

    # Delete an application
    def delete(self, app_id):
        # Only administrators authorized
        # Extract the user token from the header
        t = token.extract(self.request.headers.get('Authorization'))
        if t is None:
            return response.sendError(self, 400, 'Invalid authorization type')
        # Decode the token
        payload = token.decode(t, config.global_secret_key, config.token_algorithm)
        if payload is None:
            return response.sendError(self, 401, 'Invalid authentication credentials')
        # Check if user is an administrator
        if payload['is_admin'] is False:
            return response.sendError(self, 401, 'Only allowed to administrators')
        # Get the application from the database
        a = application.get(app_id)
        if a is None:
            return response.sendError(self, 404, 'This application does not exist')
        # Delete all authorizations for this application
        result = authorization.delete_by_application(app_id)
        if result is False:
            return response.sendError(self, 500, 'Error removing authorizations for this application')
        # Delete this application
        try:
            a.key.delete()
            return response.sendJson(self, {'message': 'Application deleted'})
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
        t = token.extract(self.request.headers.get('Authorization'))
        if t is None:
            return response.sendError(self, 400, 'Invalid authorization type')
        # Decode the token
        payload = token.decode(t, config.global_secret_key, config.token_algorithm)
        if payload is None:
            return response.sendError(self, 401, 'Invalid authentication credentials')
        # Check for administrators
        if payload['is_admin'] is False:
            return response.sendError(self, 401, 'Only allowed to administrators')
        # Edit the app information
        a = application.get(app_id)
        if a is None:
            return response.sendError(self, 404, 'This application does not exist')
        # Update the application information
        a.name = data['name']
        a.description = data['description']
        a.redirect_url = data['redirect_url']
        a.homepage_url = data['homepage_url']
        a.privacy_url = data['privacy_url']
        a.permissions = data['permissions']
        try:
            a.put()
            return response.sendJson(self, {'message': 'Application information updated'})
        except:
            return response.sendError(self, 500, 'The application could not be modified')


# Application's secret route
class RouteApplicationsSecret(webapp2.RequestHandler):
    # Get the secret
    def get(self, app_id):
        # Only administrators authorized
        # Extract the user token from the header 
        t = token.extract(self.request.headers.get('Authorization'))
        if t is None:
            return response.sendError(self, 400, 'Invalid authorization type')
        # Decode the token
        payload = token.decode(t, config.global_secret_key, config.token_algorithm)
        if payload is None:
            return response.sendError(self, 401, 'Invalid authentication credentials')
        # Check if is admin
        if payload['is_admin'] is False:
            return response.sendError(self, 401, 'Only allowed to administrators')
        # Extract the secret from the db
        a = application.get(app_id)
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
            if captcha.verify(data.get('recaptcha')) is False:
                return response.sendError(self, 400, 'Answer the captcha correctly')
        # Empty information
        if not email or not pwd:
            return response.sendError(self, 400, 'Please fill all the fields')
        # Search the user in the db
        u = user.get(email=email)
        if u is None:
            return response.sendError(self, 400, 'Invalid email or password')
        if u.is_active is False:
            return response.sendError(self, 401, 'This user is not active')
        # Check the password
        if pbkdf2_sha256.verify(pwd, u.pwd) is True:
            # Encode token and give it to the user
            t = token.encode(u, '', config.global_secret_key, config.token_algorithm, config.token_expiration)
            return response.sendJson(self, {'token': t})
        else:
            return response.sendError(self, 400, 'Invalid email or password')


# ResetPwd route
class RouteResetPwd(webapp2.RequestHandler):
    def post(self):
        # Parse the body to JSON
        try:
            data = json.loads(self.request.body)
        except:
            return response.sendError(self, 400, 'Bad request')
        # Get the email of the user
        email = data.get('email')
        print "Email = ", email
        if email is None:
            return response.sendError(self, 400, 'No email provided')
        # Check if the captcha is enabled
        if config.captcha_enabled is True:
            # Get the captcha value and check if the captcha is valid
            if captcha.verify(data.get('recaptcha')) is False:
                return response.sendError(self, 400, 'Answer the captcha correctly')
        # Extract the user token from the header 
        t = token.extract(self.request.headers.get('Authorization'))
        is_admin = False
        if t is not None:
            # Decode the token
            payload = token.decode(t, config.global_secret_key, config.token_algorithm)
            if payload is None:
                return response.sendError(self, 401, 'Invalid authentication credentials')
            # Save user is admin
            is_admin = payload.get('is_admin') is True
        # Check if resetpwd is not enabled or user is not admin
        if config.resetpwd_enabled is False and is_admin is False:
            return response.sendError(self, 401, 'Reset password is not allowed')
        # Get the user by the email
        u = user.get(email=email)
        if u is None:
            # If the user does not exist, do nothing and send the confirmation message
            print "User not found --> no email is sent"
            return response.sendJson(self, {'status': 'ok'})
        if u.is_active is False:
            print "User is not active --> no email is sent"
            return response.sendJson(self, {'status': 'ok'})
        try: 
            # Create the new resetpwd request
            rpwd = resetpwd.ResetPwd(user_id=u.key.id(), sent_date=int(time.time()))
            rpwd.put()
        except:
            print "Error generating the resetpwd request"
            print "Unexpected error: ", sys.exc_info()[0]
            return response.sendError(self, 500, 'Error saving the request to reset the password')
        # Send the email with the steps to reset the password
        mailbox.reset_pwd(u.name, u.email, rpwd.key.id())
        return response.sendJson(self, {'status': 'ok'})


# ResetPwd by ID route
class RouteResetPwdById(webapp2.RequestHandler):
    def post(self, id):
        # Parse the body to JSON
        try:
            data = json.loads(self.request.body)
        except:
            return response.sendError(self, 400, 'Bad request')
        # Get the values
        request_pwd = data.get('pwd')
        #request_id = data.get('id')
        if request_pwd is None:
            return response.sendError(self, 400, 'Invalid request')
        # Check if the captcha is enabled
        if config.captcha_enabled is True:
            # Get the captcha value and check if the captcha is valid
            if captcha.verify(data.get('recaptcha')) is False:
                return response.sendError(self, 400, 'Answer the captcha correctly')
        # Get the request info
        r = resetpwd.get(id)
        if r is None:
            return response.sendError(self, 400, 'Request ID not found')
        # Get the user
        u = user.get(id=r.user_id)
        if u is None:
            return response.sendError(self, 400, 'The request ID is assigned to an user that does not exist')
        # Change the user password
        try:
            u.pwd = pbkdf2_sha256.hash(request_pwd)
            u.put()
            # Delete the resetpwd request
            r.key.delete()
        except:
            return response.sendError(self, 500, 'Error changing the password of the user')
        # Password changed
        return response.sendJson(self, {'status': 'ok'})



# Mount the app
app = webapp2.WSGIApplication([
    # General routes
    webapp2.Route('/api/', handler=RouteHome),
    # Users routes
    webapp2.Route('/api/users', handler=RouteUsers),
    webapp2.Route('/api/users/<user_id>', handler=RouteUsersById),
    # Authenticated user routes
    webapp2.Route('/api/user', handler=RouteUser),
    # webapp2.Route('/api/user/password', handler=RouteUserPassword),
    webapp2.Route('/api/user/delete', handler=RouteUserDelete),
    webapp2.Route('/api/user/authorizations', handler=RouteUserAuthorizations),
    webapp2.Route('/api/user/authorizations/<app_id>', handler=RouteUserAuthorizationsById),
    # Applications routes
    webapp2.Route('/api/applications', handler=RouteApplications),
    webapp2.Route('/api/applications/<app_id>/secret', handler=RouteApplicationsSecret),
    webapp2.Route('/api/applications/<app_id>', handler=RouteApplicationsById),
    # Login route
    webapp2.Route('/api/login', handler=RouteLogin),
    # Resetpwd route
    webapp2.Route('/api/resetpwd', handler=RouteResetPwd),
    webapp2.Route('/api/resetpwd/<id>', handler=RouteResetPwdById),
    # Error route
    webapp2.Route('/api/<:.*>', handler=RouteError)
], debug=True)
