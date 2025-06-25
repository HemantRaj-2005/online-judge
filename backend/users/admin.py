from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    # Fields to display in the admin list view
    list_display = ('username', 'email', 'institution', 'is_verified', 'is_staff')
    
    # Fields to include in the edit/add forms
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('institution', 'bio', 'is_verified')}),
    )

admin.site.register(CustomUser, CustomUserAdmin)