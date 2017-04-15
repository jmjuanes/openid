# Import google modules
from google.appengine.ext import ndb


# Applications class
class Application(ndb.Model):
    secret = ndb.StringProperty()
    name = ndb.StringProperty()
    detail = ndb.StringProperty()
    redirect = ndb.StringProperty()


# Get an application by id
def get_application(value):
    try:
        # Convert the id to integer and return the application
        value = int(value)
        return Application.get_by_id(value)
    except ValueError:
        # Catch an error: return none and exit
        return None


# Check if an application exists
def exists_application(value):
    return get_application(value) is not None


# Users class
class User(ndb.Model):
    email = ndb.StringProperty()
    name = ndb.StringProperty()
    pwd = ndb.StringProperty()
    institution = ndb.StringProperty()
    is_admin = ndb.BooleanProperty()


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
