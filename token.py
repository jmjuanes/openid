# Import libs
import jwt
import time

# Import custom modules
import config


# Generate a token
def encode(user, secret):
    # Initialize the token payload
    payload = {'email': user.email, 'name': user.name, 'institution': user.institution, 'is_admin': user.is_admin }

    # Add the created time
    payload['iat'] = int(time.time())

    # Add the expiration
    payload['exp'] = payload['iat'] + config.token_expiration

    # Build the token
    return jwt.encode(payload, secret, algorithm='HS256')


# Decode a token
def decode(token, secret):
    return None
