# Sample configuration file
# You must rename this file as "config.py" and edit the fields below with
# your own configuration.
# Check the documentation at https://github.com/mgviz/openid

# OpenID configuration
# ======================

# OpenID name
# Public name of the OpenID
openid_name = 'OPENID_NAME'

# OpenID key value
#
openid_key = 'openid'

# OpenID secret key
# This key is used when user enters into the admin page
openid_secret = 'OPENID_SECRET_KEY'

# User roles
# An array with all the available user roles
openid_roles = ['demo', 'user', 'premium']

# Default active value
# User is active by default
openid_default_active = True

# Default user role
# When a new user is registered, the default role is 'user'
openid_default_role = 'user'

# Allow signup
# Allow users to create a new account
openid_allow_signup = True


# Captcha configuration
# ======================
# Visit the ReCaptcha documentation at https://developers.google.com/recaptcha/intro

# Captcha enabled
captcha_enabled = True

# Captcha verification url
# You must not change this url
captcha_url = 'https://www.google.com/recaptcha/api/siteverify'

# Captcha key
# Enter your captcha key value
captcha_key = 'YOUR_CAPTCHA_KEY'

# Captcha secret key
# Enter your captcha secret key value
captcha_secret = 'YOUR_CAPTCHA_SECRET_KEY'


# Token configuration
# ======================
# Read more about JSON web tokens: https://en.wikipedia.org/wiki/JSON_Web_Token

# Token expiration days
# Number of days where the token is valid
token_expiration = 7 * (24 * 60 * 60)

# Token algorithm
# Set the token sign algorithm. Allowed values: HS256 or RS256
token_algorithm = 'HS256'
