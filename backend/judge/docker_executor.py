import subprocess
import os
import tempfile
from .models import Submission, TestCase
from django.utils import timezone

class LocalExecutor:
    def __init__(self):
        self.language_config = {
            'python': {
                'file': 'main.py',
                'compile_cmd': None,
                'run_cmd': ['python', 'main.py'],
                'timeout_factor': 1,
            },
            'java': {
                'file': 'Main.java',
                'compile_cmd': ['javac', 'Main.java'],
                'run_cmd': ['java', 'Main'],
                'timeout_factor': 2,
            },
            'cpp': {
                'file': 'main.cpp',
                'compile_cmd': ['g++', '-o', 'main', 'main.cpp'],
                'run_cmd': ['./main'],
                'timeout_factor': 1,
            }
        }

    def execute_submission(self, submission: Submission):
        try:
            submission.status = 'running'
            submission.save()

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
                    break
            self._update_submission(submission, results, overall_status, failed_case)
        except Exception as e:
            submission.status = 'runtime_error'
            submission.verdict = str(e)
            submission.evaluated_at = timezone.now()
            submission.save()

    def _run_test_case(self, submission, test_case):
        config = self.language_config[submission.language]
        with tempfile.TemporaryDirectory() as tempdir:
            filename = config['file']
            code_path = os.path.join(tempdir, filename)
            # Write code to file
            with open(code_path, 'w') as f:
                f.write(submission.code)
            # Compile if needed
            if config['compile_cmd']:
                compile_proc = subprocess.run(
                    config['compile_cmd'],
                    cwd=tempdir,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True
                )
                if compile_proc.returncode != 0:
                    return {
                        'status': 'compile_error',
                        'expected': '',
                        'actual': compile_proc.stderr,
                        'test_case_id': test_case.id,
                    }
            # Run the code
            input_content = test_case.input_text
            try:
                run_proc = subprocess.run(
                    config['run_cmd'],
                    cwd=tempdir,
                    input=input_content,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                    timeout=submission.problem.time_limit * config.get('timeout_factor', 1)
                )
                actual_output = run_proc.stdout.strip()
                expected_output = test_case.output_text.strip()
                if run_proc.returncode != 0:
                    status = 'runtime_error'
                elif actual_output == expected_output:
                    status = 'accepted'
                else:
                    status = 'wrong_answer'
                return {
                    'status': status,
                    'expected': expected_output,
                    'actual': actual_output if status != 'runtime_error' else run_proc.stderr,
                    'test_case_id': test_case.id,
                }
            except subprocess.TimeoutExpired:
                return {
                    'status': 'time_limit_exceeded',
                    'expected': '',
                    'actual': 'Time limit exceeded',
                    'test_case_id': test_case.id,
                }
            except Exception as e:
                return {
                    'status': 'runtime_error',
                    'expected': '',
                    'actual': str(e),
                    'test_case_id': test_case.id,
                }

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


class DockerExecutor(LocalExecutor):
    """Docker-based executor for running code submissions in isolated containers.
    Currently, this is just a wrapper around LocalExecutor for compatibility with tasks.py.
    In a production environment, this would use Docker to isolate code execution.
    """
    
    def __init__(self):
        super().__init__()
        # In a real implementation, this would initialize Docker client
        # and set up container configurations
        
    def execute_submission(self, submission: Submission):
        # For now, just use the LocalExecutor implementation
        # In a real implementation, this would create Docker containers
        # for secure code execution
        super().execute_submission(submission)