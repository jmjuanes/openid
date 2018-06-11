# Sample configuration file
# You must rename this file as "config.py" and edit the fields below with
# your own configuration.
# Check the documentation at https://github.com/mgviz/passfort

# PassFort configuration
# ======================

# PassFort visible name
passfort_name = 'PassFort'

# PassFort key value
passfort_key = 'passfort'

# PassFort secret key
passfort_secret = 'PASSFORT_SECRET_KEY'

# Default active value
passfort_default_active = True

# Allow signup: allow users to create a new account
passfort_allow_signup = False

# Allow reset password: allow users to reset his password
passfort_allow_resetpwd = False


# Captcha configuration
# ======================
# Visit the ReCaptcha documentation at https://developers.google.com/recaptcha/intro

# Captcha enabled: force to use the captcha when login or register
captcha_enabled = False

# Captcha verification url (you should not change this value)
captcha_url = 'https://www.google.com/recaptcha/api/siteverify'

# Captcha key: your captcha key
captcha_key = 'YOUR_CAPTCHA_KEY'

# Captcha secret key: your captcha secret key value
captcha_secret = 'YOUR_CAPTCHA_SECRET_KEY'


# Token configuration
# ======================
# Read more about JSON web tokens: https://en.wikipedia.org/wiki/JSON_Web_Token

# Token expiration days: number of days where the token is valid
token_expiration = 7 * (24 * 60 * 60)

# Token sign algorithm: allowed HS256 or RS256
token_algorithm = 'HS256'

