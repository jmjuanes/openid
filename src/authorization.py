# Import google modules
from google.appengine.ext import ndb

# Import python modules
import sys
import json


# Authorizations class
class Authorization(ndb.Model):
    app_id = ndb.IntegerProperty(indexed=True)
    user_id = ndb.IntegerProperty(indexed=True)
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
        print "Unexpected error: ", sys.exc_info()[0]
        return None


# Get all the applications authorized by the user
def get_all(user_id):
    try:
        # Execute the query
        query = Authorization.query(Authorization.user_id == int(user_id))
        return query.get()
    except:
        print "Unexpected error: ", sys.exc_info()[0]
        return None


# Delete all authorizations for a single application
def delete_by_application(app_id):
    try:
        auth_list = Authorization.query(Authorization.app_id == int(app_id)).fetch(keys_only=True)
        ndb.delete_multi(auth_list)
        return True
    except:
        print "Unexpected error: ", sys.exc_info()[0]
        return False


# Delete all authorizations for a single user
def delete_by_user(user_id):
    try:
        auth_list = Authorization.query(Authorization.user_id == int(user_id)).fetch(keys_only=True)
        ndb.delete_multi(auth_list)
        return True
    except:
        print "Unexpected error: ", sys.exc_info()[0]
        return False


# Export authorization information in JSON format
def to_json(a):
    obj = {'app_id': a.app_id,
            'user_id': a.user_id,
            'grant_access': a.grant_access,
            'last_access': a.last_access}
    return obj

