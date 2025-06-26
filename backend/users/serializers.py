from rest_framework import serializers
from django.db.models import Q
from django.contrib.auth import authenticate
from .models import CustomUser

class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    Validates and serializes the CustomUser model for user registration.
    """
    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'institution', 'bio']
        extra_kwargs = {
            'password': {'write_only': True},
            'username': {
                'error_messages': {
                    'unique': 'Username already exists.'
                }
            },
            'email': {
                'error_messages': {
                    'unique': 'Email already exists.'
                }
            }
        }

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            institution=validated_data.get('institution', ''),
            bio=validated_data.get('bio', '')
        )
        user.set_password(validated_data['password'])
        user.is_verified = False
        user.is_active = False  # User is inactive until verified
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login.
    Validates the username and password for user authentication.
    """
    username_or_email = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username_or_email = data.get('username_or_email')
        password = data.get('password')
        
        if not username_or_email or not password:
            raise serializers.ValidationError("Username or email and password are required.")
        
        # Get user by username or email
        user = CustomUser.objects.filter(
            Q(username=username_or_email) | Q(email=username_or_email)
        ).first()
        
        if not user:
            raise serializers.ValidationError("User does not exist.")
        
        # Authenticate the user
        authenticated_user = authenticate(username=user.username, password=password)
        
        if not authenticated_user:
            raise serializers.ValidationError("Incorrect password.")
        
        if not user.is_verified:
            raise serializers.ValidationError("User account is not verified.")
        
        if not user.is_active:
            raise serializers.ValidationError("Account is inactive.")
        
        data['user'] = user
        return data