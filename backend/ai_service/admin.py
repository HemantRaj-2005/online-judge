from django.contrib import admin

from .models import AIAnalysis

# Register your models here.
@admin.register(AIAnalysis)
class AIAnalysisAdmin(admin.ModelAdmin):
    list_display = ['id', 'analysis_type', 'problem', 'submission', 'created_at']
    search_fields = ['problem__title', 'submission__user__username']
    list_filter = ['analysis_type', 'created_at']
    raw_id_fields = ['problem', 'submission']
    readonly_fields = ['created_at', 'processing_time']
