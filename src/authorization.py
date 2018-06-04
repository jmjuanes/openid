# Import google modules
from google.appengine.ext import ndb

# Import python modules
import json


# Authorizations class
class Authorization(ndb.Model):
    app_id = ndb.StringProperty(indexed=True)
    user_id = ndb.StringProperty(indexed=True)
    grant_access = ndb.StringProperty(indexed=False)
    last_access = ndb.StringProperty(indexed=False)


# Get a single authorization
def get(app_id, user_id): 
    try:
        # Conver the app_id and the user_id to integers
        app_id = int(app_id)
        user_id = int(user_id)
        # Execute the query
        query = Authorization.query(Authorization.app_id == app_id, Authorization.user_id == user_id)
        return query.get()
    except:
        return None


# Get all the applications authorized by the user
def get_all(user_id):
    try:
        user_id = int(user_id)
        # Execute the query
        query = Authorization.query(Authorization.user_id == id)
        return query.get()
    except:
        return None

