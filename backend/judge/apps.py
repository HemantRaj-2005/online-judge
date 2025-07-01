from django.apps import AppConfig
import os


class JudgeConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'judge'

    def ready(self):
        # Create media directories if they don't exist
        media_dirs = [
            'media/testcases/inputs',
            'media/testcases/outputs',
            'media/submissions'
        ]
        
        for dir_path in media_dirs:
            os.makedirs(dir_path, exist_ok=True)
