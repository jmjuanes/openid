# Import python libs
import os
import logging

# Import modules
import webapp2
import jinja2

# Import configuration
import config


# Initialize the jinja environment
jinja_loader = jinja2.FileSystemLoader(os.path.join(os.path.dirname(__file__), '../templates/'))
jinja_env = jinja2.Environment(loader=jinja_loader, extensions=['jinja2.ext.autoescape'], autoescape=True)
# Register global variables
jinja_env.globals['name'] = config.global_name
jinja_env.globals['support_email'] = config.support_email


# Render a template
class RenderTemplate(webapp2.RequestHandler):
    def get(self, template_name):
        print "Rendering ", template_name
        # Change the response headers
        self.response.headers['Content-Type'] = 'text/html'
        # Render the template
        template = jinja_env.get_template(template_name)
        return self.response.write(template.render())


# Mount the app
app = webapp2.WSGIApplication([
    webapp2.Route('/legal/<template_name>', handler=RenderTemplate)    
], debug=True)

