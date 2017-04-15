# Import google modules
from google.appengine.ext import ndb


# Users class
class User(ndb.Model):
    email = ndb.StringProperty()
    name = ndb.StringProperty()
    pwd = ndb.StringProperty()
    institution = ndb.StringProperty()
    is_admin = ndb.BooleanProperty()
    active = ndb.BooleanProperty()


# Perform a query and get the users with the provided email
def get_user(value):
    # Get the users with this email
    query = User.query(User.email == value)

    # Check the number of users with this email
    if query.count() != 1:
        return None
    else:
        return query.get()


# Check if an user with the provided email exists
def exists_user(value):
    return get_user(value) is not None