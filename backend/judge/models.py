from django.db import models
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
import os
from users.models import CustomUser
from django.utils.text import slugify
from django.utils import timezone

def validate_txt_file(file):
    ext = os.path.splitext(file.name)[1]
    if ext.lower() != '.txt':
        raise ValidationError('Only .txt files are allowed')
    
class Topic(models.Model):
    name = models.CharField(max_length=100, unique=True)
    
class Problem(models.Model):
    DIFFICULTY_CHOICES = [
        ('veryeasy', 'Very Easy'),
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
        ('veryhard', 'Very Hard')
    ]
    
    author = models.ForeignKey(CustomUser,default=None, null=True, blank=True, on_delete=models.CASCADE, related_name='authored_problems')
    title = models.CharField(max_length=255)
    description = models.TextField()
    difficulty = models.CharField(max_length=30, choices=DIFFICULTY_CHOICES, default='easy')
    topics = models.ManyToManyField(Topic, blank=True)
    time_limit = models.PositiveIntegerField(
        default=1000,
        validators=[MinValueValidator(100)],
        help_text="Time limit in milliseconds"
    )
    memory_limit = models.PositiveIntegerField(
        default=256,
        validators=[MinValueValidator(16)],
        help_text="Memory limit in MB"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    slug = models.SlugField(unique=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
    
    
def get_input_upload_path(instance, filename):
    count = instance.problem.test_cases.count() + 1
    return f"testcases/{instance.problem.slug}/inputs/input_{count:04}.txt"

def get_output_upload_path(instance, filename):
    count = instance.problem.test_cases.count() + 1
    return f"testcases/{instance.problem.slug}/outputs/output_{count:04}.txt"

class TestCase(models.Model):
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE, related_name='test_cases')
    name = models.CharField(max_length=255, unique=True)  # e.g. slug_input_0001
    input_text = models.TextField()
    output_text = models.TextField()
    is_sample = models.BooleanField(default=False)
    is_hidden = models.BooleanField(default=False)
    explanation = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Testcase {self.name} for {self.problem.title}"

class LanguageChoices(models.TextChoices):
    PYTHON = 'python', 'Python'
    JAVA = 'java', 'Java'
    CPP = 'cpp', 'C++'


class Submission(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('running', 'Running'),
        ('accepted', 'Accepted'),
        ('wrong_answer', 'Wrong Answer'),
        ('time_limit_exceeded', 'Time Limit Exceeded'),
        ('compilation_error', 'Compilation Error'),
        ('runtime_error', 'Runtime Error'),
        ('memory_limit_exceeded', 'Memory Limit Exceeded'),
    ]
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE)
    code = models.TextField()
    language = models.CharField(max_length=30, choices=[
        ('python', 'Python'),
        ('java', 'Java'),
        ('cpp', 'C++')
    ])
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending')
    output = models.TextField(blank=True, null=True)
    verdict = models.TextField(blank=True, null=True)
    time_taken = models.PositiveIntegerField(null=True, blank=True)
    memory_used = models.PositiveIntegerField(null=True, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    evaluated_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Submission {self.problem.title} by {self.user.username}"
    
    class Meta:
        ordering = ['-submitted_at']
        indexes = [
            models.Index(fields=['user', 'problem']),
            models.Index(fields=['status']),
        ]
    
    def save(self, *args, **kwargs):
        if not self.pk:  # Only on creation
            self.status = 'pending'
        super().save(*args, **kwargs)

    def set_evaluated_now(self):
        self.evaluated_at = timezone.now()
        self.save(update_fields=['evaluated_at'])