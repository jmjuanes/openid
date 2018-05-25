# Import google modules
from google.appengine.ext import ndb

# Import python modules
import json


# Authorizations class
class Authorization(ndb.Model):
    app_id = ndb.StringProperty(indexed=False)
    user_id = ndb.StringProperty(indexed=False)
    grant_access = ndb.StringProperty(indexed=False)
    last_access = ndb.StringProperty(indexed=False)


# Get all the applications authorized by the user
def get_authorized_apps(user_id):
    try:
        id = int(user_id)
        # Get the apps
        query = Authorization.query(Authorization.user_id == id)
        # Execute the query
        authorized_apps = query.get()
        return authorized_apps
    except:
        return None


# Check if the application has already been authorized by the user
def already_authorized(userid, appid):
    try:
        app_id = int(appid)
        user_id = int(userid)
        # See if the app id is in some authorization entity of the user
        query = Authorization.query(Authorization.user_id == user_id,
                                    Authorization.app_id == app_id)
        # Check if it was already authorized
        if query.count() > 0:
            authorized = True
        else:
            authorized = False
        return authorized

    except:
        return None
