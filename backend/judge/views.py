from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from .models import Problem, Submission
from .serializers import ProblemSerializer, SubmissionCreateSerializer

class ProblemBySlugView(generics.RetrieveAPIView):
    queryset = Problem.objects.all()
    serializer_class = ProblemSerializer
    lookup_field = 'slug'
    permission_classes = [IsAuthenticatedOrReadOnly]


class SubmitToProblemView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, slug):
        try:
            problem = Problem.objects.get(slug=slug)
        except Problem.DoesNotExist:
            return Response({'error': 'Problem not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = SubmissionCreateSerializer(data=request.data)
        if serializer.is_valid():
            submission = serializer.save(user=request.user, problem=problem)
            return Response({
                'message': 'Submission received',
                'submission_id': submission.id,
                'status': submission.status
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
