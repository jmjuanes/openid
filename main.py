# Import general modules
import json
import time
import urlparse

# Import lib modules
import jwt
from flask import Flask
from flask import redirect
from flask import render_template
from flask import request
from passlib.hash import pbkdf2_sha256

# Import custom modules
import applications
import users
import config
import captcha

# Create the instance
app = Flask(__name__)

# Add the global variables
app.jinja_env.globals['captcha_key'] = config.captcha_key


# Main route
@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')


# Login get route
@app.route('/login', methods=['GET'])
def login_get():
    # Render the login form
    return render_template('login.html'), 200


# Login post route
@app.route('/login', methods=['POST'])
def login_post():
    # Get the user email and password
    user_email = request.form.get('email', '')
    user_pwd = request.form.get('pwd', '')

    # Check for empty email or password
    if user_email == '' or user_pwd == '':
        return render_template('error.html', error='Invalid user request')

    # Get the user
    user = users.get_user(user_email)

    # Check for user not found
    if user is None:
        return render_template('login.html', error='Email not found')

    # Check the password
    if pbkdf2_sha256.verify(user_pwd, user.pwd) is False:
        return render_template('login.html', error='Invalid email or password')
    else:
        return 'Login OK'


# Authorize get route
@app.route('/authorize', methods=['GET'])
def authorize_get():
    # Get the application id
    application_id = request.args.get('client', '')

    # Check for undefined application id
    if application_id == '':
        return render_template('error.html', error='No application id provided'), 404

    # Get the application information
    application = applications.get_application(application_id)

    # Check if the application exists
    if application is None:
        return render_template('error.html', error='Invalid application'), 404

    # Get the application state
    application_state = pbkdf2_sha256.hash(application_id)

    # Render the login template
    return render_template('authorize.html',
                           app_id=application_id,
                           app_state=application_state,
                           app_name=application.name)


# Authorize post route
@app.route('/authorize', methods=['POST'])
def authorize_post():
    # Get the user email and password
    user_email = request.form.get('email', '')
    user_pwd = request.form.get('pwd', '')

    # Check for empty email or password
    if user_email == '' or user_pwd == '':
        return render_template('error.html', error='Invalid user request'), 400

    # Get the application id and state
    application_id = request.form.get('client', '')
    application_state = request.form.get('state', '')

    # Check for empty application id or state
    if application_id == '' or application_state == '':
        return render_template('error.html', error='Invalid application request'), 400

    # Check if the request has been made by a third party application and the process should be aborted
    if pbkdf2_sha256.verify(application_id, application_state) is False:
        return render_template('error.html', error='Invalid request state'), 400

    # Check if the captcha is enabled
    if config.captcha_enabled is True:
        # Get the captcha value
        captcha_value = request.form.get('g-recaptcha-response', '')

        # Check for empty captcha
        if captcha_value == '':
            return render_template('authorize.html',
                                   app_id=application_id,
                                   app_state=application_state,
                                   error='Invalid captcha')

        # Check the captcha value
        if captcha.verify(captcha_value) is False:
            return render_template('authorize.html',
                                   app_id=application_id,
                                   app_state=application_state,
                                   error='Invalid captcha')

    # Get the application
    application = applications.get_application(application_id)

    # Check for application not found
    if application is None:
        return render_template('error.html', error='Application not found'), 404

    # Get the user
    user = users.get_user(user_email)
    print user_email
    print user

    # Check for non user
    if user is None:
        return render_template('authorize.html',
                               app_id=application_id,
                               app_state=application_state,
                               error='Email not found')
    else:
        # Check the password
        if pbkdf2_sha256.verify(user_pwd, user.pwd) is False:
            return render_template('authorize.html',
                                   app_id=application_id,
                                   app_state=application_state,
                                   error='Invalid email or password')
        else:
            # Initialize the token payload
            payload = {'email': user.email, 'name': user.name, 'institution': user.institution, 'is_admin': user.is_admin}
            payload['iat'] = int(time.time())
            payload['exp'] = payload['iat'] + config.token_expiration
            # Build the token and redirect to the site
            token = jwt.encode(payload, application.secret, algorithm='HS256')
            url = urlparse.urljoin(application.redirect, '?token=' + token)
            return redirect(url)


# Register a new user page
@app.route('/register', methods=['GET'])
def register_get():
    # Render the register page
    return render_template('register.html', error='')


# Register a new user page
@app.route('/register', methods=['POST'])
def register_post():
    # Initialize the user
    user = users.User()

    # Get the post values
    user.name = request.form.get('name', '')
    user.institution = request.form.get('institution', '')
    user.email = request.form.get('email', '')
    user.pwd = request.form.get('pwd', '')
    user.is_admin = False  # By default is not admin

    # Encrypt the password
    user.pwd = pbkdf2_sha256.hash(user.pwd)

    # Check the values
    if user.name is '' or user.institution is '' or user.email is '' or user.pwd is '':
        return render_template('register.html', error='You must fill all fields')

    # Check if the email is registered
    if users.exists_user(user.email):
        return render_template('register.html', error='The email has already registered')

    # Register the user
    user_key = user.put()

    # Display done
    return 'Register OK'


# Register a new application
@app.route('/register/application', methods=['POST'])
def register_application_post():
    # Get the form object
    f = request.form

    # Create the new application
    application = applications.Application(secret=f['secret'], name=f['name'], detail=f['detail'], redirect=f['redirect'])

    # Insert the new application into the database
    application_key = application.put()

    # Return the application information
    return json.dumps({ 'id': application_key.id() }), 200, { 'Content-Type': 'application/json' }


# Error handler
@app.errorhandler(500)
def server_error(e):
    print e
    # Log the error and stacktrace.
    # logging.exception('An error occurred during a request.')
    return render_template('error.html', error='An error occurred during a request'), 500
