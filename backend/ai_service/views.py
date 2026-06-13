from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from judge.models import Problem, Submission
from .services import AIAnalysisService
from .models import AIAnalysis


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze_submission(request, problem_id):
    """Analyze complexity for existing submission"""
    submission_id = request.data.get('submission_id')
    problem = get_object_or_404(Problem, id=problem_id)
    
    if not submission_id:
        return Response({'error': 'Submission ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    submission = get_object_or_404(Submission, id=submission_id, user_id=request.user.id)
    
    try:
        service = AIAnalysisService()
        result = service.analyze_complexity(submission.code, submission.language, problem.description)
    except Exception as e:
        return Response({
            'error': f'AI Service Unavailable: {str(e)}',
            'time_complexity': 'N/A',
            'space_complexity': 'N/A',
            'explanation': 'AI Complexity Analysis is currently unavailable. Please check the GOOGLE_GENAI_API_KEY environment variable configuration on the server.',
            'optimization': 'N/A',
            'errors': [str(e)]
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    
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
    
    try:
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
    except Exception as e:
        return Response({
            'error': f'AI Service Unavailable: {str(e)}',
            'problem_summary': 'AI Explanation is currently unavailable. Please check the GOOGLE_GENAI_API_KEY environment variable configuration on the server.',
            'approach': 'Please ask the administrator to configure the GOOGLE_GENAI_API_KEY on the backend server environment variables.',
            'algorithms': [],
            'example': None
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)


@api_view(['POST'])
@permission_classes([AllowAny])
def get_hint(request):
    """get coding hint"""
    problem_id = request.data.get('problem_id')
    code = request.data.get('code')
    language = request.data.get('language')

    problem = get_object_or_404(Problem, id=problem_id)

    try:
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
    except Exception as e:
        return Response({
            'error': f'AI Service Unavailable: {str(e)}',
            'hint': 'AI Hints are currently unavailable. Please check the GOOGLE_GENAI_API_KEY environment variable configuration on the server.',
            'approach': ['Please ask the administrator to configure the GOOGLE_GENAI_API_KEY on the backend server environment variables.'],
            'derivation': [],
            'complexity': {'time': 'N/A', 'space': 'N/A'}
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)


@api_view(['POST'])
@permission_classes([AllowAny])
def analyze_code_view(request):
    """Analyze custom code snippet input directly by the user"""
    code = request.data.get('code')
    language = request.data.get('language', 'python')
    if not code:
        return Response({'error': 'Code is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        service = AIAnalysisService()
        result = service.analyze_code(code, language)
        return Response(result)
    except Exception as e:
        return Response({
            'error': f'AI Service Unavailable: {str(e)}',
            'language': language,
            'timeComplexity': 'N/A',
            'spaceComplexity': 'N/A',
            'syntaxErrors': f'AI Analysis failed: {str(e)}',
            'codeQuality': {
                'maintainability': 'N/A',
                'readability': 'N/A',
                'style': 'N/A'
            },
            'optimizations': []
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

