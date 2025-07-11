from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from judge.models import Problem, Submission
from .services import AIAnalysisService
from .models import AIAnalysis

@api_view(['POST'])
@permission_classes([AllowAny])
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

    user = request.user if request.user.is_authenticated else None
    AIAnalysis.objects.create(
        analysis_type='complexity',
        problem_id=problem_id,
        user_code=code,
        programming_language=language,
        analysis_result=result,
        user=user
    )

    return Response(result)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze_submission(request, problem_id):
    """Analyze complexity for existing submission"""
    submission_id = request.data.get('submission_id')
    problem = get_object_or_404(Problem, id=problem_id)
    
    if not submission_id:
        return Response({'error': 'Submission ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    submission = get_object_or_404(Submission, id=submission_id, user_id=request.user.id)
    
    service = AIAnalysisService()
    result = service.analyze_complexity(submission.code, submission.language, problem.description)
    print(result)
    
    user = request.user
    # Save analysis linked to submission
    AIAnalysis.objects.create(
        analysis_type='complexity',
        user=user,
        submission=submission,
        problem=submission.problem,
        programming_language=submission.language,
        analysis_result=result,
    )
    
    return Response(result)



@api_view(['POST'])
@permission_classes([AllowAny])
def explain_problem(request, problem_id):
    """Explain problem statement"""
    problem = get_object_or_404(Problem, id=problem_id)

    #Check if explanation already exists
    existing_analysis = AIAnalysis.objects.filter(
        problem=problem, analysis_type='explanation'
    ).first()

    if existing_analysis:
        return Response(existing_analysis.analysis_result)
    
    service = AIAnalysisService()
    result = service.explain_problem(problem.description)

    user = request.user if request.user.is_authenticated else None
    AIAnalysis.objects.create(
        analysis_type='explanation',
        problem=problem,
        analysis_result = result,
        user=user
    )

    return Response(result)


@api_view(['POST'])
@permission_classes([AllowAny])
def get_hint(request):
    """get coding hint"""
    problem_id = request.data.get('problem_id')
    code = request.data.get('code')
    language = request.data.get('language')

    
    problem = get_object_or_404(Problem, id=problem_id)

    service = AIAnalysisService()
    result = service.provide_hint(problem.description, code, language)

    user = request.user if request.user.is_authenticated else None
    AIAnalysis.objects.create(
        analysis_type='hint',
        problem=problem,
        user_code=code,
        programming_language=language,
        analysis_result=result,
        user=user
    )

    return Response(result)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_analysis_history(request):
    """Get analysis history for user"""
    problem_id = request.GET.get('problem_id')
    
    queryset = AIAnalysis.objects.filter(user=request.user)
    
    if problem_id:
        queryset = queryset.filter(problem_id=problem_id)
    
    analyses = queryset.order_by('-created_at')[:50]  # Limit to last 50
    
    data = []
    for analysis in analyses:
        data.append({
            'id': analysis.id,
            'analysis_type': analysis.analysis_type,
            'problem_id': analysis.problem_id,
            'submission_id': analysis.submission_id,
            'created_at': analysis.created_at,
            'analysis_result': analysis.analysis_result,
            'processing_time': analysis.processing_time
        })
    
    return Response(data)
