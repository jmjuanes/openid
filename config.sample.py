# Sample configuration file
# You must rename this file as "config.py" and edit the fields below with
# your own configuration.
# Check the documentation at https://github.com/mgviz/passfort

# PassFort gobal configuration
global_name = 'PassFort'  # Service name
global_url = 'http://localhost:8080/'  # Service url
global_email = 'APP_ID@appspot.gserviceaccount.com'  # Authorized address to send emails from the application
global_public_key = 'passfort'  # Public key string
global_secret_key = 'PASSFORT_SECRET_KEY'  # Secret key string

# Owner configuration
owner_name = 'Owner'  # The owner name will be displayed in the privacy policy
owner_address = 'Fake address 123, Earth'  # The onwer address will be displayed in the privacy policy
owner_email = 'admin@email.com'  # An account registered with this email will be the owner of the website

# Available links
links = {
    'support': {'text': 'Support', 'url': 'mailto:support@email.com'},
    'privacy': {'text': 'Privacy Policy', 'url': '/statics/privacy.html'},
    'terms': {'text': 'Terms of Service', 'url': '/statics/terms.html'}
}

# Footer configuration
footer_links = ['support', 'privacy']  # Links to be displayed in the footer

# Signup configuration
signup_enabled = True  # Allow users to create a new account
signup_must_agree = ['privacy']  # New user must agree with the links provided
signup_default_active = True  # New user is active by default
signup_default_admin = False  # New user is admin by default

# ResetPwd configuratiom
resetpwd_enabled = True  # Allow users to reset his password
resetpwd_expiration = 24  # Number of hours where the resetpwd id is valid

# Captcha configuration
# Visit the ReCaptcha documentation at https://developers.google.com/recaptcha/intro
captcha_enabled = False  # force to use the captcha when login or register 
captcha_public_key = 'YOUR_CAPTCHA_KEY'  # Captcha public key
captcha_secret_key = 'YOUR_CAPTCHA_SECRET_KEY'  # Captcha secret key
captcha_url = 'https://www.google.com/recaptcha/api/siteverify'  # Captcha verification url

# Token configuration
# Read more about JSON web tokens: https://en.wikipedia.org/wiki/JSON_Web_Token
token_expiration = 7 * (24 * 60 * 60)  # number of days where the token is valid
token_algorithm = 'HS256'  # Token sign algorithm: allowed HS256 or RS256

