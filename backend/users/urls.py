from django.urls import path
from .views import RegisterAPIView,LoginAPIView,LogoutAPIView,ProfileAPIView,CustomTokenRefreshView
from rest_framework_simplejwt.views import TokenObtainPairView

urlpatterns = [
    path('register/', RegisterAPIView.as_view(), name='register'),
    path('login/', LoginAPIView.as_view(), name='login'),
    path('logout/', LogoutAPIView.as_view(), name='logout'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('profile/<str:username>/', ProfileAPIView.as_view(), name='user-profile'),
    path('edit-profile/<str:username>/', ProfileAPIView.as_view(), name='edit-profile'),
    path('delete-profile/<str:username>/', ProfileAPIView.as_view(), name='delete-profile'),
]