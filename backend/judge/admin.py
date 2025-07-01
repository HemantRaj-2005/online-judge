from django.contrib import admin

# Register your models here.
from .models import Problem, TestCase, Submission, Topic

@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']
    search_fields = ['name']


@admin.register(Problem)
class ProblemAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'difficulty', 'time_limit', 'memory_limit', 'created_at']
    search_fields = ['title', 'description']
    list_filter = ['difficulty', 'created_at']
    filter_horizontal = ['topics']  # for ManyToManyField


@admin.register(TestCase)
class TestCaseAdmin(admin.ModelAdmin):
    list_display = ['id', 'problem', 'is_sample', 'is_hidden']
    list_filter = ['is_sample', 'is_hidden']
    search_fields = ['problem__title']


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'problem', 'language', 'status', 'submitted_at']
    list_filter = ['language', 'status', 'submitted_at']
    search_fields = ['user__username', 'problem__title']