from django.core.mail import send_mail
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.urls import reverse
from django.conf import settings
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

def send_verification_email(user, request):

    user.last_verification_email_sent = timezone.now()
    user.save()

    token = default_token_generator.make_token(user)
    uid   = urlsafe_base64_encode(force_bytes(user.pk))
    relative_link = reverse("email-verify", args=[uid, token])
    verify_url = request.build_absolute_uri(relative_link)

        # Email content
    subject = f"Verify your {settings.SITE_NAME} account"
    plain_message = f"""
    Hi {user.username},
    
    Please verify your account by clicking this link:
    {verify_url}
    
    This link will expire in 24 hours.
    
    If you didn't request this, please ignore this email.
    """
    
    html_message = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2>Hi {user.username},</h2>
        <p>Thanks for registering with {settings.SITE_NAME}. Please verify your email by clicking the button below:</p>
        
        <a href="{verify_url}" style="display: inline-block; padding: 12px 24px; 
           background: #2563eb; color: white; text-decoration: none; border-radius: 4px;
           font-weight: bold; margin: 16px 0;">
           Verify Email
        </a>
        
        <p style="color: #666; font-size: 0.9em;">
            This link will expire in 24 hours. If you didn't request this, 
            please ignore this message.
        </p>
    </div>
    """
    
    try:
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
            html_message=html_message,
        )
    except:
        # Log the error
        logger.error(f"Failed to send verification email: {e}")
        raise  