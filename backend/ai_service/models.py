from django.db import models
from judge.models import Problem, Submission

# Create your models here.

class AIAnalysis(models.Model):
    ANALYSIS_TYPE=[
        ('complexity', 'Time/Space Complexity'),
        ('debug', 'Debug Analysis'),
        ('explanation', 'Code Explanation'),
        ('hint', 'Code Hint'),
        ('review', 'Code Review')
    ]

    analysis_type = models.CharField(max_length=20, choices=ANALYSIS_TYPE)
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE, related_name='ai_analyses')
    submission = models.ForeignKey(Submission, on_delete=models.CASCADE, related_name='ai_analyses')
    user_code = models.TextField()
    programming_language = models.CharField(max_length=20)

    #AI response
    analysis_result = models.JSONField()

    created_at = models.DateTimeField(auto_now_add=True)
    processing_time = models.FloatField(null=True, blank=True)  # Time taken for AI to process the request

    class Meta:
        indexes = [
            models.Index(fields=['problem', 'analysis_type']),
            models.Index(fields=['submission']),
        ]