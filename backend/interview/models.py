from django.db import models
from users.models import CustomUser

# Create your models here.

class InterviewSession(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    topic_choices = models.JSONField(default=dict)  # Store topic choices as a JSON field
    experirence_level = models.CharField(max_length=50)
    difficulty_level = models.CharField(max_length=50)
    interview_type = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='pending')  # e.g., pending, completed, cancelled

class InterviewQuestion(models.Model):
    session = models.ForeignKey(InterviewSession, related_name='questions', on_delete=models.CASCADE)
    question_text = models.TextField()
    answer_text = models.TextField(blank=True, null=True)  # Optional field for storing answers
    feedback = models.TextField(blank=True, null=True)  # Optional field for feedback
    score = models.IntegerField(default=0)  # Score for the question
    order = models.IntegerField()  # Order of the question in the session
    