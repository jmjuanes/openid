# Import google modules
from google.appengine.ext import ndb

# Python imports
import random
import string


# Applications class
class Application(ndb.Model):
    secret = ndb.StringProperty(indexed=False)
    name = ndb.StringProperty(indexed=False)
    description = ndb.StringProperty(indexed=False)
    permissions = ndb.StringProperty(indexed=False)
    homepage_url = ndb.StringProperty(indexed=False)
    privacy_url = ndb.StringProperty(indexed=False)
    redirect_url = ndb.StringProperty(indexed=False)


# Get an application by id
def get(value):
    try:
        # Convert the id to integer and return the application
        value = int(value)
        return Application.get_by_id(value)
    except ValueError:
        return None


# Extract all the applications from the database
def get_all():
    try:
        apps = Application.query().fetch()
        return apps
    except ValueError:
        return None


# Check if an application exists
def exists(value):
    return get(value) is not None


# Generate a secret for the application
def generate_secret():
    secret = ''.join(
        random.SystemRandom().choice(string.ascii_lowercase + string.digits + string.ascii_uppercase) for _ in
        range(50))
    return secret

