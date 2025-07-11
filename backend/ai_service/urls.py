from django.urls import path
from . import views

urlpatterns = [
    # Code analysis endpoints
    path('analyze-complexity/', views.analyze_complexity, name='analyze_complexity'),
    path('analyze-submission/', views.analyze_submission, name='analyze_submission'),
    
    # Debug endpoints
    path('debug-code/', views.debug_code, name='debug_code'),
    path('debug-submission/', views.debug_submission, name='debug_submission'),
    
    # Problem explanation and hints
    path('explain-problem/<int:problem_id>/', views.explain_problem, name='explain_problem'),
    path('get-hint/', views.get_hint, name='get_hint'),
    
    # Analysis history
    path('analysis-history/', views.get_analysis_history, name='get_analysis_history'),
]