from django.urls import path
from . import views

urlpatterns = [
    path('problems/', views.ProblemListView.as_view(), name='problem-list'),
    path('problems/<slug:slug>/submissions/<str:username>/', views.UserProblemSubmissionsView.as_view(), name='user-problem-submissions'),
    path('problems/<slug:slug>/description/', views.ProblemBySlugView.as_view(), name='problem-description'),
    path('problems/<slug:slug>/submit/', views.SubmitToProblemView.as_view(), name='problem-submit'),
    path('problems/<slug:slug>/edit/', views.ProblemUpdateView.as_view(), name='problem-edit'),
    path('problems/create/', views.ProblemCreateView.as_view(), name='problem-create'),
    path('submissions/<int:pk>/', views.SubmissionDetailView.as_view(), name='submission-detail'),
]
