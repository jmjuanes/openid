import time
import jwt


# Generate a token
def encode(user, secret, algorithm, expiration):
    payload = dict()
    payload['email'] = user.email
    payload['name'] = user.name
    payload['is_admin'] = user.is_admin
    payload['role'] = user.role
    payload['id'] = user.key.id()
    payload['iat'] = int(time.time())
    payload['exp'] = int(time.time()) + expiration

    # Build and return the token
    return jwt.encode(payload, secret, algorithm=algorithm)


# Decode a token
def decode(token, secret, algorithm):
    # Decode the payload
    try:
        payload = jwt.decode(token, secret, algorithms=[algorithm])
        if payload is None:
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
    except jwt.exceptions.InvalidTokenError:
        return None
