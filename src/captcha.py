# Import python libs
import logging
import urllib
import json

# Import App engine API
from google.appengine.api import urlfetch

# Import configuration
import config

# Verify captcha
def verify(captcha_response):
    # Check for empty captcha response
    if captcha_response is '' or captcha_response is None:
        return False
    # Perform the request to the captcha server
    try:
        form_fields = {
            'secret': config.captcha_secret_key, 
            'response': captcha_response
        }
        form_data = urllib.urlencode(form_fields)
        headers = {'Content-Type': 'application/x-www-form-urlencoded'}
        # Perform the request
        result = urlfetch.fetch(url=config.captcha_url, payload=form_data, method=urlfetch.POST, headers=headers)
        # logging.info('Captcha response code: ' + str(result.status_code) + '')
        # Check the result status code
        if result.status_code == 200:
            data = json.loads(result.content)
            return data['success']
        else:
            logging.error('Error response for verify captcha')
            return False
    except urlfetch.Error:
        logging.exception('Caught exception fetching url for verify captcha')
        return False

