# Import general modules
import logging
import urllib
import json

# Import google modules
from google.appengine.api import urlfetch

# Import configuration
import config


# Verify captcha
def verify(captcha_response):
    # Build the form fields
    form_fields = { 'secret': config.captcha_secret, 'response': captcha_response }

    # Display in logs
    logging.info('Checking captcha...')

    # Fetch the url
    try:
        # Encode the form fields
        form_data = urllib.urlencode(form_fields)
        headers = {'Content-Type': 'application/x-www-form-urlencoded'}

        # Perform the request
        result = urlfetch.fetch(url=config.captcha_url, payload=form_data, method=urlfetch.POST, headers=headers)

        # Display in logs
        logging.info('Captcha response code: ' + str(result.status_code) + '')

        # Check the result status code
        if result.status_code == 200:
            # Parse the response json and return if the captcha is valid
            data = json.loads(result.content)
            return data['success']
        else:
            # Print error in logs and exit
            logging.error('Error response for verify captcha')
            return False
    except urlfetch.Error:
        # Print error
        logging.exception('Caught exception fetching url for verify captcha')
        return False

