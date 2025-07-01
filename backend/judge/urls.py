from django.urls import path
from . import views

urlpatterns = [
    path('problems/<slug:slug>/description/', views.ProblemBySlugView.as_view(), name='problem-description'),
    path('problems/<slug:slug>/submit/', views.SubmitToProblemView.as_view(), name='problem-submit'),
]
