from django.urls import path
from .views import RegisterAPIView,VerifyEmailAPIView,LoginAPIView,LogoutAPIView,ProfileAPIView,ResendVerificationView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('register/', RegisterAPIView.as_view(), name='register'),
    path('email-verify/<uidb64>/<token>/', VerifyEmailAPIView.as_view(), name='email-verify'),
    path('login/', LoginAPIView.as_view(), name='login'),
    path('logout/', LogoutAPIView.as_view(), name='logout'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/<str:username>/', ProfileAPIView.as_view(), name='user-profile'),
    path('resend-verify/', ResendVerificationView.as_view(), name='resend-verify'),
]