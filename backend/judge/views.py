from .models import Topic
from .serializers import TopicSerializer
from rest_framework.views import APIView
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, BasePermission, AllowAny
from .models import Problem, Submission
from .serializers import ProblemSerializer, SubmissionCreateSerializer, SubmissionSerializer
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.contrib.auth import get_user_model
import tempfile
import json
from pathlib import Path
from .runner import SubmissionRunner
from .execution_provider import SubprocessExecutionProvider



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

class TopicListView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        topics = Topic.objects.all()
        serializer = TopicSerializer(topics, many=True)
        return Response(serializer.data)
    
    
class ProblemUpdateView(generics.RetrieveUpdateAPIView):
    queryset = Problem.objects.all()
    serializer_class = ProblemSerializer
    lookup_field = 'slug'
    permission_classes = [AllowAny]

class ProblemCreateView(generics.CreateAPIView):
    queryset = Problem.objects.all()
    serializer_class = ProblemSerializer
    permission_classes = [IsAuthenticated]

class ProblemBySlugView(generics.RetrieveAPIView):
    queryset = Problem.objects.all()
    serializer_class = ProblemSerializer
    lookup_field = 'slug'
    
    # @method_decorator(cache_page(60*15))  # Cache for 15 minutes
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
    permission_classes = [AllowAny]

class SubmitToProblemView(generics.CreateAPIView):

    permission_classes = [AllowAny]
    serializer_class = SubmissionCreateSerializer

    def create(self, request, slug):
        
        user = request.user
        print(user)
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
       

        self._execute_submission(submission.id)

        submission.refresh_from_db()

        return Response(
        {
            'id': submission.id,
                'status': submission.status,
                'output': submission.output
            },
            status=status.HTTP_201_CREATED
        )

    def _execute_submission(self, submission_id):
        # Synchronous execution for reliability in dev/debug
        runner = SubmissionRunner()
        runner.run_submission_sync(submission_id)

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
    
class UserSubmissionsView(generics.ListAPIView):
    serializer_class = SubmissionSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        User = get_user_model()
        # Get the username from the URL parameters
        username = self.kwargs['username']
        try:
            user = User.objects.get(username=username)
            submissions = Submission.objects.filter(user=user).select_related('problem').order_by('-submitted_at')
            return submissions
        except User.DoesNotExist:
            return Submission.objects.none()

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


from rest_framework.decorators import api_view, permission_classes
from ai_service.services import AIAnalysisService

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_testcases_view(request):
    title = request.data.get('title')
    description = request.data.get('description')
    if not title or not description:
        return Response({"error": "Title and description are required."}, status=status.HTTP_400_BAD_REQUEST)
    
    service = AIAnalysisService()
    testcases = service.generate_test_cases(title, description)
    return Response(testcases, status=200)


class JudgeRunView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        code = request.data.get('code')
        language = request.data.get('language')
        input_text = request.data.get('input_text', '')

        if not code or not language:
            return Response(
                {"error": "Code and language are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        provider = SubprocessExecutionProvider()
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            comp_res = provider.compile(code, language, temp_path)
            if not comp_res["success"]:
                return Response({
                    "status": "CE",
                    "stdout": "",
                    "stderr": comp_res.get("error_message", ""),
                    "time_taken": 0,
                    "memory_used": 0
                }, status=status.HTTP_200_OK)

            run_cmd = comp_res["run_cmd"]
            # Default limits for custom run: 2000ms, 256MB, 1MB output
            exec_res = provider.execute(
                run_cmd=run_cmd,
                input_text=input_text,
                time_limit_ms=2000,
                memory_limit_mb=256,
                output_limit_bytes=1024 * 1024,
                temp_dir=temp_path
            )

            return Response({
                "status": exec_res["status"],
                "stdout": exec_res.get("stdout", ""),
                "stderr": exec_res.get("stderr", ""),
                "time_taken": exec_res.get("time_taken", 0),
                "memory_used": exec_res.get("memory_used", 0)
            }, status=status.HTTP_200_OK)


class JudgeSubmitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        slug = request.data.get('problem_slug')
        code = request.data.get('code')
        language = request.data.get('language')

        if not slug or not code or not language:
            return Response(
                {"error": "problem_slug, code, and language are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            problem = Problem.objects.get(slug=slug)
        except Problem.DoesNotExist:
            return Response(
                {"error": "Problem not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Create the submission in pending state
        submission = Submission.objects.create(
            user=user,
            problem=problem,
            code=code,
            language=language,
            status='pending'
        )

        # Trigger execution (synchronous or async depending on query param or setting)
        # We default to running in background thread to avoid HTTP timeout, but let user request sync
        run_async = request.query_params.get('async', 'true').lower() == 'true'
        runner = SubmissionRunner()
        if run_async:
            runner.run_submission_async(submission.id)
            return Response({
                "submission_id": submission.id,
                "status": "pending",
                "message": "Submission received and is executing in the background."
            }, status=status.HTTP_201_CREATED)
        else:
            runner.run_submission_sync(submission.id)
            submission.refresh_from_db()
            return Response({
                "submission_id": submission.id,
                "status": submission.status,
                "output": submission.output,
                "time_taken": submission.time_taken,
                "memory_used": submission.memory_used
            }, status=status.HTTP_201_CREATED)