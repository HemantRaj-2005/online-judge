from django.core.mail import send_mail
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.urls import reverse
from django.conf import settings

def send_verification_email(user, request):
    token = default_token_generator.make_token(user)
    uid   = urlsafe_base64_encode(force_bytes(user.pk))
    relative_link = reverse("email-verify", args=[uid, token])
    verify_url = request.build_absolute_uri(relative_link)

    subject = "Verify your account"
    plain_message = f"Hi {user.username},\n\nClick to verify: {verify_url}"
    html_message  = f"""
        <p>Hi {user.username},</p>
        <p>Thanks for registering. Confirm your e-mail by clicking the button below:</p>
        <p><a href="{verify_url}" style="padding:8px 16px;
           background:#2563eb;color:white;text-decoration:none;border-radius:4px;">
           Verify e-mail</a></p>
        <p>If you didn't request this, just ignore this message.</p>
    """

    send_mail(
        subject,
        plain_message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
        html_message=html_message,
    )
