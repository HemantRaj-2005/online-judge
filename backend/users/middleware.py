# Create backend/users/middleware.py
from django.http import JsonResponse
from django.urls import reverse, NoReverseMatch

class VerificationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        # Don't use reverse() in __init__ as URLs may not be loaded yet
        self.allowed_paths = []

    def __call__(self, request):
        response = self.get_response(request)
        return response

    def process_view(self, request, view_func, view_args, view_kwargs):
        # Generate allowed paths dynamically when needed
        if not self.allowed_paths:
            try:
                self.allowed_paths = [
                    reverse('logout'),
                    reverse('resend-verify'),
                    reverse('token_refresh'),
                    '/api/users/email-verify/',  # Use path prefix instead of exact reverse
                ]
            except NoReverseMatch:
                # If URLs aren't fully loaded yet, use hardcoded paths as fallback
                self.allowed_paths = [
                    '/api/users/logout/',
                    '/api/users/resend-verify/',
                    '/api/users/token/refresh/',
                    '/api/users/email-verify/',
                ]
                
        if request.user.is_authenticated and not request.user.is_verified:
            if not any(request.path.startswith(path) for path in self.allowed_paths):
                return JsonResponse({
                    "error": "Account not verified",
                    "is_verified": False,
                    "email": request.user.email
                }, status=403)