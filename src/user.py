# Import google modules
from google.appengine.ext import ndb


# Users class
class User(ndb.Model):
    email = ndb.StringProperty(indexed=True)
    name = ndb.StringProperty(indexed=False)
    pwd = ndb.StringProperty(indexed=False)
    # institution = ndb.StringProperty(indexed=False)
    is_admin = ndb.BooleanProperty(indexed=False)
    role = ndb.StringProperty(indexed=False)
    active = ndb.BooleanProperty(indexed=False)


# Perform a query and get the users with the provided email
def get_user(value):
    # Get the users with this email
    query = User.query(User.email == value)

    # Check the number of users with this email
    if query.count() != 1:
        return None
    else:
        return query.get()


# Get the user using its id, not email
def getUserById(value):
    try:
        value = int(value)
        user = User.get_by_id(value)
        return user
    except ValueError:
        return None


# Extract all the users
def getAll():
    try:
        users = User.query().fetch()
        return users
    except ValueError:
        return None


# Check if an user with the provided email exists
def exists_user(value):
    return get_user(value) is not None
