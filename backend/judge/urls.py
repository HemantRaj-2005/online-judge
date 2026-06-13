
from django.urls import path
from . import views

urlpatterns = [
    path('problems/', views.ProblemListView.as_view(), name='problem-list'),
    path('problems/<slug:slug>/submissions/<str:username>/', views.UserProblemSubmissionsView.as_view(), name='user-problem-submissions'),
    path('problems/<slug:slug>/description/', views.ProblemBySlugView.as_view(), name='problem-description'),
    path('problems/<slug:slug>/submit/', views.SubmitToProblemView.as_view(), name='problem-submit'),
    path('problems/<slug:slug>/edit/', views.ProblemUpdateView.as_view(), name='problem-edit'),
    path('problems/<slug:slug>/testcases/', views.ProblemTestCasesView.as_view(), name='problem-testcases'),
    path('testcases/<int:pk>/', views.TestCaseDetailView.as_view(), name='testcase-detail'),
    path('problems/create/', views.ProblemCreateView.as_view(), name='problem-create'),
    path('problems/generate-testcases/', views.generate_testcases_view, name='generate-testcases'),
    path('submissions/<int:pk>/', views.SubmissionDetailView.as_view(), name='submission-detail'),
    path('topics/', views.TopicListView.as_view(), name='topic-list'),
    path('users/<str:username>/submissions/', views.UserSubmissionsView.as_view(), name='user-submissions'),
    path('judge/run/', views.JudgeRunView.as_view(), name='judge-run'),
    path('judge/submit/', views.JudgeSubmitView.as_view(), name='judge-submit'),
]
