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
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'institution', 'bio', 'is_author']
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
            bio=validated_data.get('bio', ''),
            is_author=validated_data.get('is_author', False)
        )
        user.set_password(validated_data['password'])
        user.is_verified = False
        user.is_active = True  # User is inactive until verified
        user.save()
        return user


# class LoginSerializer(serializers.Serializer):
#     """
#     Serializer for user login.
#     Validates the email and password for user authentication.
#     """
#     email = serializers.EmailField()
#     password = serializers.CharField(write_only=True)

#     def validate(self, data):
#         email = data.get('email')
#         password = data.get('password')
        
#         if not email or not password:
#             raise serializers.ValidationError("Email and password are required.")
        
#         # Get user by email only
#         user = CustomUser.objects.filter(email=email).first()
        
#         if not user:
#             raise serializers.ValidationError("User with this email does not exist.")
        
#         # Authenticate the user
#         authenticated_user = authenticate(username=user.username, password=password)
        
#         if not authenticated_user:
#             raise serializers.ValidationError("Incorrect password.")
        
#         data['user'] = user
#         return data

class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login.
    Validates the email and password for user authentication.
    """
    class Meta:
        error_messages = {
            'email': {
                'required': 'Email is required.',
                'invalid': 'Enter a valid email address.'
            },
            'password': {
                'required': 'Password is required.'
            }
        }

    email = serializers.EmailField(
        error_messages=Meta.error_messages['email']
    )
    password = serializers.CharField(
        write_only=True,
        error_messages=Meta.error_messages['password']
    )

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        
        user = CustomUser.objects.filter(email=email).first()
        
        if not user:
            raise serializers.ValidationError({
                'email': ['User with this email does not exist.']
            })
        
        authenticated_user = authenticate(username=user.username, password=password)
        
        if not authenticated_user:
            raise serializers.ValidationError({
                'password': ['Incorrect password.']
            })
        
        data['user'] = user
        return data