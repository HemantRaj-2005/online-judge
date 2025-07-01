from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import UserRegistrationSerializer, LoginSerializer
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.db.models import Q
from .models import CustomUser
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from .utils import send_verification_email
from django.contrib.auth import logout
from rest_framework_simplejwt.tokens import RefreshToken
# Create your views here.


class RegisterAPIView(APIView):
    """
    View for user registration.
    Handles POST requests to register a new user.
    """
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            send_verification_email(user,request)
            return Response({
                "message": "Check email for verification link.",
                "user_id": user.id,
                "email": user.email
            }, status=201)
        return Response(serializer.errors, status=400)
    

class VerifyEmailAPIView(APIView):
    """
    View for email verification.
    
    """
    def get(self,request, uidb64, token):
        """
        Verify the user's email using the provided uidb64 and token.
        """
        # Logic for verifying the email goes here
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = CustomUser.objects.get(pk=uid)

        except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
            user = None
        
        if user and default_token_generator.check_token(user, token):
            user.is_verified = True
            user.is_active = True
            user.save()
            return Response({"message": "Email verified successfully."}, status=200)
        # This is a placeholder implementation
        return Response({"message": "Verification Link Expired."}, status=400)
    
class LoginAPIView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            return Response({
                "message": "Login successful.",
                "is_verified": user.is_verified,
                "is_author": user.is_author,
                "email": user.email,
                "username": user.username,
                "access_token": str(refresh.access_token),
                "refresh_token": str(refresh),
            }, status=200)
        return Response(serializer.errors, status=400)
    

class LogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        logout(request)
        return Response({"message": "Logout successful."}, status=200)

    

#For the update and delete user
class ProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username):
        user = CustomUser.objects.get(username=username)
        user_info = user.get_user_info()
        user_info["is_author"] = user.is_author
        return Response(user_info)
    
    def put(self, request, username):
        username = CustomUser.objects.get(username=username)
        serializer = UserRegistrationSerializer(username, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message: Profile updated successfully."})
        return Response(serializer.errors, status=400)
    
    def delete(self, request, username):
        user = CustomUser.objects.get(username=username)
        user.delete()
        return Response({"message": "Profile deleted successfully."})
    
# if user still not verified
class ResendVerificationView(APIView):
    def post(self, request):
        email = request.data.get('email')
        user = CustomUser.objects.get(email=email)
        if not user.is_verified:
            send_verification_email(user, request)
            return Response({"message":"Verification Email Send"})
        return Response({"message": "User already verified"}, status=400)
