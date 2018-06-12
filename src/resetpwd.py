# Import google modules
from google.appengine.ext import ndb


# Resetpwd class
class ResetPwd(ndb.Model): 
    user_id = ndb.IntegerProperty(indexed=False)
    sent_date = ndb.IntegerProperty(indexed=False)


# Get a request by id
def get(value):
    try:
        return ResetPwd.get_by_id(int(value))
    except ValueError:
        return None


