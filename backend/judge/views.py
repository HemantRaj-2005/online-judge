# backend/judge/views.py
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, BasePermission, AllowAny
from .models import Problem, Submission
from .serializers import ProblemSerializer, SubmissionCreateSerializer, SubmissionSerializer
from .docker_executor import LocalExecutor
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from .tasks import execute_submission_task


class IsStaffOrAuthorOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        # Allow GET for anyone, but only staff or author can update
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True
        return request.user and (request.user.is_staff or obj.author == request.user)
    def has_permission(self, request, view):
        # Allow POST for authenticated users
        if request.method == 'POST':
            return request.user and request.user.is_authenticated
        return True

class ProblemUpdateView(generics.RetrieveUpdateAPIView):
    queryset = Problem.objects.all()
    serializer_class = ProblemSerializer
    lookup_field = 'slug'
    permission_classes = [AllowAny]

class ProblemCreateView(generics.CreateAPIView):
    queryset = Problem.objects.all()
    serializer_class = ProblemSerializer
    permission_classes = [AllowAny]

class ProblemBySlugView(generics.RetrieveAPIView):
    queryset = Problem.objects.all()
    serializer_class = ProblemSerializer
    lookup_field = 'slug'
    
    @method_decorator(cache_page(60*15))  # Cache for 15 minutes
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
    permission_classes = [AllowAny]

class SubmitToProblemView(generics.CreateAPIView):

    permission_classes = [AllowAny]
    serializer_class = SubmissionCreateSerializer

    def create(self, request, slug):
        user = request.user
        if not user.is_authenticated:
            return Response(
                {'detail': 'Authentication credentials were not provided.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        try:
            problem = Problem.objects.get(slug=slug)
        except Problem.DoesNotExist:
            return Response(
                {'detail': 'Problem not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        submission = serializer.save(
            user=user,
            problem=problem,
            status='pending'
        )

        # Call the Celery task instead of executing synchronously
        execute_submission_task.delay(submission.id)

        return Response(
            {
                'id': submission.id,
                'status': submission.status
            },
            status=status.HTTP_201_CREATED
        )

    def _execute_submission(self, submission_id):
        # Synchronous execution for reliability in dev/debug
        submission = Submission.objects.get(id=submission_id)
        executor = LocalExecutor()
        executor.execute_submission(submission)

class SubmissionDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer

class ProblemListView(generics.ListAPIView):
    queryset = Problem.objects.all()
    serializer_class = ProblemSerializer
    permission_classes = [AllowAny]

class UserProblemSubmissionsView(generics.ListAPIView):
    serializer_class = SubmissionSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        problem_slug = self.kwargs['slug']
        user = self.request.user
        return Submission.objects.filter(problem__slug=problem_slug, user=user)

    serializer_class = SubmissionSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        problem_slug = self.kwargs['slug']
        username = self.kwargs['username']
        try:
            user = User.objects.get(username=username)
            # You can use user.get_user_info() here if you want to return user info
            # info = user.get_user_info()
        except User.DoesNotExist:
            return Submission.objects.none()
        return Submission.objects.filter(problem__slug=problem_slug, user=user)