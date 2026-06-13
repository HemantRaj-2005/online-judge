from django.urls import path
from . import views

urlpatterns = [
    # Code analysis endpoints
    path('analyze-submission/<int:problem_id>/', views.analyze_submission, name='analyze_submission'),
    path('analyze-code/', views.analyze_code_view, name='analyze_code'),
    
    # Problem explanation and hints
    path('explain-problem/<int:problem_id>/', views.explain_problem, name='explain_problem'),
    path('get-hint/', views.get_hint, name='get_hint'),
]