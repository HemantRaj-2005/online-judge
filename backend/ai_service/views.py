from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from judge.models import Problem, Submission
from .services import AIAnalysisService
from .models import AIAnalysis

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze_complexity(request):
    """
    Analyze the time and space complexity of the given code.
    """
    code = request.data.get('code')
    language = request.data.get('language')
    problem_id = request.data.get('problem_id')

    if not code or not language or not problem_id:
        return Response({"error": "Code, language, and problem_id are required."}, status=status.HTTP_400_BAD_REQUEST)
    
    service = AIAnalysisService()
    result = service.analyze_complexity(code, language)

    analysis = AIAnalysis.objects.create(
        analysis_type='complexity',
        problem_id=problem_id,
        user_code=code,
        programming_language=language,
        analysis_result=result,
        processing_time=result.get('processing_time', 0)
    )

    return Response(result)