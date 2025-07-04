import docker
import time
import os
from .models import Submission, TestCase
from django.utils import timezone

class DockerExecutor:
    def __init__(self):
        self.client = docker.from_env()
        self.language_config = {
            'python': {
                'image': 'python:3.9-slim',
                'compile_cmd': None,
                'run_cmd': ['python', 'main.py'],
                'timeout_factor': 1,
            },
            'java': {
                'image': 'openjdk:17-jdk-slim',
                'compile_cmd': ['javac', 'Main.java'],
                'run_cmd': ['java', 'Main'],
                'timeout_factor': 2,
            },
            'cpp': {
                'image': 'gcc:latest',
                'compile_cmd': ['g++', '-o', 'main', 'main.cpp'],
                'run_cmd': ['./main'],
                'timeout_factor': 1,
            }
        }

    def execute_submission(self, submission: Submission):
        try:
            submission.status = 'running'
            submission.save()

            # Run all test cases (not just samples)
            test_cases = submission.problem.test_cases.all()
            results = []
            overall_status = 'accepted'
            failed_case = None
            for test_case in test_cases:
                result = self._run_test_case(submission, test_case)
                results.append(result)
                if result['status'] != 'accepted':
                    overall_status = result['status']
                    failed_case = result
                    break  # Stop at first failure (common in OJ)

            self._update_submission(submission, results, overall_status, failed_case)
        except Exception as e:
            submission.status = 'runtime_error'
            submission.verdict = str(e)
            submission.evaluated_at = timezone.now()
            submission.save()

    def _run_test_case(self, submission, test_case):
        config = self.language_config[submission.language]
        container = None
        try:
            self._prepare_files(submission.code, submission.language)
            # Run container
            container = self.client.containers.run(
                image=config['image'],
                command=self._build_command(config),
                working_dir='/usr/src/app',
                mem_limit=f'{submission.problem.memory_limit}m',
                network_mode='none',
                volumes={os.path.abspath('temp'): {'bind': '/usr/src/app', 'mode': 'rw'}},
                stdin_open=True,
                detach=True,
            )
            # Attach input and get output
            input_content = test_case.input_file.read().decode('utf-8')
            # Simulate input/output (this is a placeholder, real implementation may differ)
            output = self._communicate(container, input_content)
            expected_output = test_case.output_file.read().decode('utf-8').strip()
            actual_output = output.strip()
            if actual_output == expected_output:
                status = 'accepted'
            else:
                status = 'wrong_answer'
            return {
                'status': status,
                'expected': expected_output,
                'actual': actual_output,
                'test_case_id': test_case.id,
            }
        except Exception as e:
            return {
                'status': 'runtime_error',
                'expected': '',
                'actual': str(e),
                'test_case_id': test_case.id,
            }
        finally:
            if container:
                container.remove(v=True, force=True)
            self._cleanup_files()

    def _prepare_files(self, code, language):
        os.makedirs('temp', exist_ok=True)
        filename = self._get_filename(language)
        with open(f'temp/{filename}', 'w') as f:
            f.write(code)

    def _cleanup_files(self):
        if os.path.exists('temp'):
            for file in os.listdir('temp'):
                os.remove(f'temp/{file}')
            os.rmdir('temp')

    def _get_filename(self, language):
        return {
            'python': 'main.py',
            'java': 'Main.java',
            'cpp': 'main.cpp'
        }[language]

    def _build_command(self, config):
        commands = []
        if config['compile_cmd']:
            commands.append(' '.join(config['compile_cmd']))
        commands.append(' '.join(config['run_cmd']))
        return ' && '.join(commands)

    def _update_submission(self, submission, results, overall_status, failed_case):
        submission.status = overall_status
        if overall_status == 'accepted':
            submission.verdict = 'Accepted'
        elif failed_case:
            submission.verdict = f"Failed at test case {failed_case['test_case_id']}: {failed_case['status']}\nExpected: {failed_case['expected']}\nActual: {failed_case['actual']}"
        else:
            submission.verdict = 'Error during judging.'
        submission.evaluated_at = timezone.now()
        submission.save()