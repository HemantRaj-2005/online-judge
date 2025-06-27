# Create backend/users/middleware.py
from django.http import JsonResponse
from django.urls import reverse

class VerificationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.allowed_paths = [
            reverse('logout'),
            reverse('resend-verify'),
            reverse('email-verify'),  # Verification endpoint
            reverse('token_refresh'),  # JWT refresh
        ]

    def __call__(self, request):
        response = self.get_response(request)
        return response

    def process_view(self, request, view_func, view_args, view_kwargs):
        if request.user.is_authenticated and not request.user.is_verified:
            if not any(request.path.startswith(path) for path in self.allowed_paths):
                return JsonResponse({
                    "error": "Account not verified",
                    "is_verified": False,
                    "email": request.user.email
                }, status=403)