# Import google modules
from google.appengine.ext import ndb

# Import python modules
import json


# Users class
class User(ndb.Model):
    email = ndb.StringProperty(indexed=True)
    name = ndb.StringProperty(indexed=False)
    pwd = ndb.StringProperty(indexed=False)
    biography = ndb.StringProperty(indexed=False)
    company = ndb.StringProperty(indexed=False)
    is_admin = ndb.BooleanProperty(indexed=False)
    is_active = ndb.BooleanProperty(indexed=False)
    is_owner = ndb.BooleanProperty(indexed=False)


# Get user via his id or email
def get(id=None, email=None):
    try:
        # Get user by id
        if id is not None:
            value = int(id)
            user = User.get_by_id(value)
        # Get user by email
        elif email is not None:
            query = User.query(User.email == email)
            # Check the number of users with this email
            if query.count() != 1:
                user = None
            else:
                user = query.get()
        return user
    except:
        return None


# Extract all the users from the database
def get_all():
    try:
        users = User.query().fetch()
        return users
    except ValueError:
        return None


# Check if an user with the provided email exists
def exists(value):
    return get(email=value) is not None


# Generate Json from user
def to_json(self, u):
    self.response.headers['Content-Type'] = 'application/json'
    obj = {"id": u.key.id(),
           'name': u.name,
           'email': u.email,
           'biography': u.biography,
           'company': u.company,
           'is_admin': u.is_admin,
           'is_active': u.is_active,
           'is_owner': u.is_owner}
    return self.response.out.write(json.dumps(obj))

