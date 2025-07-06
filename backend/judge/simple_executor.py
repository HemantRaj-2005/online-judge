import subprocess
import os
from .models import Submission, TestCase

class SimpleExecutor:
    def execute_submission(self, submission):
        language = submission.language
        code = submission.code
        problem = submission.problem
        print("code")
        # Ensure the /tmp directory exists
        os.makedirs('/tmp', exist_ok=True)

        # Create a temporary file for the code
        file_path = f'/tmp/submission_{submission.id}.{self._get_extension(language)}'
        with open(file_path, 'w') as f:
            f.write(code)

        try:
            if language == 'python':
                command = ['python3', file_path]
            elif language == 'java':
                subprocess.run(['javac', file_path], check=True)
                command = ['java', '-cp', '/tmp', f'submission_{submission.id}']
            elif language == 'cpp':
                output_file = f'/tmp/submission_{submission.id}'
                subprocess.run(['g++', file_path, '-o', output_file], check=True)
                command = [output_file]
            else:
                submission.status = 'error'
                submission.output = 'Unsupported language'
                submission.save()
                return

            # Fetch the first test case
            test_case = TestCase.objects.filter(problem=problem).first()
            if not test_case:
                submission.status = 'error'
                submission.output = 'No test cases found for this problem'
                submission.save()
                return
                
            input_data = test_case.input_text

            # Execute the code with a timeout
            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                timeout=5,  # 5-second timeout
                input=input_data
            )
            print(result.stdout)
            if result.returncode == 0:
                if result.stdout.strip() == test_case.output_text.strip():
                    submission.status = 'accepted'
                else:
                    submission.status = 'wrong_answer'
                submission.output = result.stdout
            else:
                submission.status = 'runtime_error'
                submission.output = result.stderr
        except subprocess.TimeoutExpired:
            submission.status = 'time_limit_exceeded'
            submission.output = 'Time limit exceeded'
        except subprocess.CalledProcessError as e:
            submission.status = 'compilation_error'
            submission.output = e.stderr
        except Exception as e:
            submission.status = 'error'
            submission.output = str(e)
        finally:
            submission.save()
            # Clean up the temporary files
            if os.path.exists(file_path):
                os.remove(file_path)
            if language in ['java', 'cpp'] and os.path.exists(f'/tmp/submission_{submission.id}'):
                os.remove(f'/tmp/submission_{submission.id}')

    def _get_extension(self, language):
        if language == 'python':
            return 'py'
        elif language == 'java':
            return 'java'
        elif language == 'cpp':
            return 'cpp'
        else:
            return 'txt'