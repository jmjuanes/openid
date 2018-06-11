import time
import jwt
import logging


# Generate a token
def encode(u, permissions, secret, algorithm, expiration):
    payload = dict()
    payload['is_admin'] = u.is_admin
    payload['is_owner'] = u.is_owner
    payload['is_active'] = u.is_active
    payload['id'] = u.key.id()
    payload['iat'] = int(time.time())
    payload['exp'] = int(time.time()) + expiration
    # Check the permissions to add more data to the token
    if permissions and permissions.strip():
        permissions_list = permissions.split(',')
        if 'name' in permissions_list:
            payload['name'] = u.name
        if 'email' in permissions_list:
            payload['email'] = u.email
        if 'extra' in permissions_list:
            payload['company'] = u.company
            payload['location'] = u.location
            payload['biography'] = u.biography
    # Build and return the token
    return jwt.encode(payload, secret, algorithm=algorithm)


# Decode a token
def decode(token, secret, algorithm):
    try:
        # Decode the payload
        payload = jwt.decode(token, secret, algorithms=[algorithm])
        logging.info("Token decoded")
        if payload is None:
            # logging.info("Payload is none. WHAT???")
            return None
        else:
            # Check for no expiration time
            if payload['exp'] is None:
                # Return invalid token
                # logging.info("No expiration date")
                return None
            # Check the expiration date
            current_time = int(time.time())
            if current_time > payload['exp']:
                # logging.info("Invalid token time. Current time: " + str(current_time)
                # + ". Token time: " + str(payload["exp"]))
                return None
            else:
                # Return the payload
                return payload
    except jwt.exceptions.InvalidTokenError:
        return None


# Extract the token from the Authorization header
def extract(header):
    if header is not None:
        info = header.split()
        if info[0] != 'Bearer':
            return None
        return info[1]
    else:
        return None


