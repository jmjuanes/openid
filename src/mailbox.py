#Import from app engine API
from google.appengine.api import mail
#from google.appengine.api import app_identity

# Import site configuration
import config

# Send a generic email
# https://cloud.google.com/appengine/docs/standard/python/mail/sending-mail-with-mail-api
def send_email(email_to, email_subject, email_body):
    # Generate the sender
    sender = ('{} Support <{}>'.format(config.global_name, config.global_email))
    print "================================"
    print email_body
    print "================================"
    return mail.send_mail(sender, email_to, email_subject, email_body)


# Send an email with the steps to reset a password
def reset_pwd(user_name, user_email, reset_id):
   # Generate the subject and the body of the email
   subject = ("Reset your {} password".format(config.global_name))
   body = []
   body.append("Hello {}:".format(user_name))
   body.append("Someone (hopefully you) has requested a password reset for your {} account.".format(config.global_name))
   body.append("You can use the following link to reset your password:")
   body.append("")
   body.append("{}#!/resetpwd/{}".format(config.global_url, reset_id))
   body.append("")
   body.append("Thank you!")
   body.append("The {} team.".format(config.global_name))
   body.append("")
   # Send the email
   return send_email(user_email, subject, "\n".join(body))

