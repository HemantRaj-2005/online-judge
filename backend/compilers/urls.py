from django.urls import path
from . import views

urlpatterns = [
    path('cpp', views.compile_cpp_view),
    path('java', views.compile_java_view),
    path('python', views.compile_python_view),
]
