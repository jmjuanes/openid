# Import libs
import os
import jinja2

# Import configuration
import config

# Initialize the jinja environment
jinja_env = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.join(os.path.dirname(__file__), 'templates/')),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

# Initialize the global variables
jinja_env.globals['openid_name'] = config.openid_name
jinja_env.globals['openid_allow_signup'] = config.openid_allow_signup
jinja_env.globals['captcha_enabled'] = config.captcha_enabled
jinja_env.globals['captcha_key'] = config.captcha_key


# Render a template
def template(self, file_name, **kwargs):
    # Set the content type
    self.response.headers['Content-Type'] = 'text/html'

    # Open the template file
    file_template = jinja_env.get_template(file_name)

    # Render the template and write to the response
    self.response.write(file_template.render(**kwargs))
