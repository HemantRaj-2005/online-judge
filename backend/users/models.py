from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class CustomUser(AbstractUser):
    """
        Custom user model that extends the default Django user model.
        This model includes additional fields such as institution, bio, and verification status.
        It inherits from AbstractUser to retain the default user functionality while adding custom fields.
    """
    email = models.EmailField(unique=True, blank=False)
    institution = models.CharField(max_length=200, blank=True)
    bio = models.TextField(blank=True)
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return self.username
    class Meta:
        verbose_name = 'Custom User'
        verbose_name_plural = 'Custom Users'
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
    def get_short_name(self):
        return self.first_name or self.username
    def get_institution(self):
        return self.institution if self.institution else "No institution specified"
    def get_bio(self):
        return self.bio if self.bio else "No bio available"
    def is_verified_user(self):
        return self.is_verified
    def set_verification_status(self, status):
        self.is_verified = status
        self.save()
    def get_user_info(self):
        return {
            "username": self.username,
            "full_name": self.get_full_name(),
            "email": self.email,
            "institution": self.get_institution(),
            "bio": self.get_bio(),
            "is_verified": self.is_verified_user()
        }

 
    