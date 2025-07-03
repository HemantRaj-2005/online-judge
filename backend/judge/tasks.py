# backend/judge/tasks.py
from celery import shared_task
from .models import Submission
from .docker_executor import DockerExecutor

@shared_task(bind=True)
def execute_submission_task(self, submission_id):
    submission = Submission.objects.get(id=submission_id)
    executor = DockerExecutor()
    executor.execute_submission(submission)