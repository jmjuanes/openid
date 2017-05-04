# Import libs
import jwt
import time

# Import custom modules
import config


# Generate a token
def encode(user, secret):
    # Initialize the token payload
    payload = {'email': user.email, 'name': user.name, 'institution': user.institution, 'is_admin': user.is_admin }

    # Add the user role
    payload['role'] = user.role

    # Add the user id
    payload['id'] = user.key.id()

    # Add the created time
    payload['iat'] = int(time.time())

    # Add the expiration
    payload['exp'] = int(time.time()) + config.token_expiration

    # Build the token
    return jwt.encode(payload, secret, algorithm='HS256')


# Decode a token
def decode(token, secret):
    # Get the payload
    payload = jwt.decode(token, secret, algorithms=['HS256'])

    print payload

    # Check for empty payload
    if payload is None:
        # Return token not valid
        return None
    else:
        # Check for no expiration time
        if payload['exp'] is None:
            # Return invalid token
            return None

        # Check the expiration date
        if int(time.time()) < payload['exp']:
            return None
        else:
            # Return the payload
            return payload
