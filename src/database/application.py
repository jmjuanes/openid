# Import google modules
from google.appengine.ext import ndb


# Applications class
class Application(ndb.Model):
    secret = ndb.StringProperty(indexed=False)
    name = ndb.StringProperty(indexed=False)
    detail = ndb.StringProperty(indexed=False)
    redirect = ndb.StringProperty(indexed=False)


# Get an application by id
def get_application(value):
    try:
        # Convert the id to integer and return the application
        value = int(value)
        return Application.get_by_id(value)
    except ValueError:
        # Catch an error: return none and exit
        return None


# Extract all the apps
def getAll():
    try:
        # Get all the applications
        apps = Application.query().fetch()
        return apps
    except ValueError:
        # Catch an error: return none and exit
        return None


# Check if an application exists
def exists_application(value):
    return get_application(value) is not None
