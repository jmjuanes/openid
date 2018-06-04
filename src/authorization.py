# Import google modules
from google.appengine.ext import ndb

# Import python modules
import json


# Authorizations class
class Authorization(ndb.Model):
    app_id = ndb.StringProperty(indexed=True)
    user_id = ndb.StringProperty(indexed=True)
    grant_access = ndb.IntegerProperty(indexed=False)
    last_access = ndb.IntegerProperty(indexed=False)


# Get a single authorization
def get(app_id, user_id): 
    try:
        # Execute the query
        query = Authorization.query(Authorization.app_id == int(app_id), 
                                    Authorization.user_id == int(user_id))
        return query.get()
    except:
        return None


# Get all the applications authorized by the user
def get_all(user_id):
    try:
        # Execute the query
        query = Authorization.query(Authorization.user_id == int(user_id))
        return query.get()
    except:
        return None


# Delete all authorizations for a single application
def delete_by_application(app_id):
    try:
        auth_list = Authorization.query(Authorization.app_id == int(app_id)).fetch(keys_only=True)
        ndb.delete_multi(auths_list)
        return True
    except:
        return False


# Delete all authorizations for a single user
def delete_by_user(user_id):
    try:
        auth_list = Authorization.query(Authorization.user_id == int(user_id)).fetch(keys_only=True)
        ndb.delete_multi(auths_list)
        return True
    except:
        return False


# Export authorization information in JSON format
def to_json(a):
    obj = {'app_id': a.app_id,
            'user_id': a.user_id,
            'grant_access': a.grant_access,
            'last_access': a.last_access}
    return obj

