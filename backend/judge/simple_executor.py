import subprocess
import os
import uuid
import shutil
from pathlib import Path
from .models import Submission, TestCase

class SimpleExecutor:
    def execute_submission(self, submission):
        language = submission.language.lower()
        code = submission.code
        problem = submission.problem
        
        # Create a unique temporary directory for this submission
        temp_dir = Path(f"/tmp/sub_{submission.id}_{uuid.uuid4().hex[:6]}")
        try:
            temp_dir.mkdir(parents=True, exist_ok=True)
            
            if language == 'python':
                file_path = temp_dir / 'submission.py'
                with open(file_path, 'w') as f:
                    f.write(code)
                command = ['python3', str(file_path)]
            
            elif language == 'java':
                # Generate a unique class name if not found in code
                class_name = self._extract_java_class_name(code) or f"Submission_{submission.id}"
                file_path = temp_dir / f'{class_name}.java'
                
                # Write the file (potentially modifying class name)
                with open(file_path, 'w') as f:
                    if f"public class {class_name}" not in code:
                        # Auto-fix the class name if needed
                        code = self._ensure_java_class_name(code, class_name)
                    f.write(code)
                
                # Compile
                compile_result = subprocess.run(
                    ['javac', str(file_path)],
                    cwd=str(temp_dir),
                    capture_output=True,
                    text=True,
                    timeout=10
                )
                
                if compile_result.returncode != 0:
                    submission.status = 'compilation_error'
                    submission.output = compile_result.stderr
                    submission.save()
                    return
                
                command = ['java', '-cp', str(temp_dir), class_name]
            
            elif language == 'cpp':
                file_path = temp_dir / 'submission.cpp'
                with open(file_path, 'w') as f:
                    f.write(code)
                
                output_file = temp_dir / 'submission'
                compile_result = subprocess.run(
                    ['g++', str(file_path), '-o', str(output_file)],
                    capture_output=True,
                    text=True,
                    timeout=10
                )
                
                if compile_result.returncode != 0:
                    submission.status = 'compilation_error'
                    submission.output = compile_result.stderr
                    submission.save()
                    return
                
                command = [str(output_file)]
            
            else:
                submission.status = 'error'
                submission.output = 'Unsupported language'
                submission.save()
                return

            # Execute against test cases
            test_cases = TestCase.objects.filter(problem=problem)
            if not test_cases.exists():
                submission.status = 'error'
                submission.output = 'No test cases found'
                submission.save()
                return
                
            all_passed = True
            output_results = []
            
            for test_case in test_cases:
                try:
                    result = subprocess.run(
                        command,
                        input=test_case.input_text,
                        capture_output=True,
                        text=True,
                        timeout=5,  # Execution timeout per test case
                        cwd=str(temp_dir)
                    )
                    
                    if result.returncode == 0:
                        # Normalize whitespace for comparison
                        normalized_output = self._normalize_output(result.stdout)
                        normalized_expected = self._normalize_output(test_case.output_text)
                        
                        if normalized_output != normalized_expected:
                            all_passed = False
                            output_results.append(
                                f"Test case {test_case.id}: Wrong Answer\n"
                                f"Expected:\n{test_case.output_text}\n"
                                f"Got:\n{result.stdout}"
                            )
                    else:
                        all_passed = False
                        output_results.append(
                            f"Test case {test_case.id}: Runtime Error\n"
                            f"{result.stderr}"
                        )
                        break
                        
                except subprocess.TimeoutExpired:
                    all_passed = False
                    output_results.append(f"Test case {test_case.id}: Time Limit Exceeded")
                    break
                except Exception as e:
                    all_passed = False
                    output_results.append(f"Test case {test_case.id}: Error - {str(e)}")
                    break
            
            # Update submission status
            if all_passed:
                submission.status = 'accepted'
                submission.output = f'All {len(test_cases)} test cases passed'
            else:
                submission.status = 'wrong_answer' if 'Wrong Answer' in '\n'.join(output_results) else 'runtime_error'
                submission.output = '\n\n'.join(output_results)
                
        except Exception as e:
            submission.status = 'error'
            submission.output = f'System error: {str(e)}'
        finally:
            submission.save()
            # Clean up the temporary directory
            self._cleanup_directory(temp_dir)

    def _cleanup_directory(self, directory):
        """Recursively remove a directory and its contents"""
        try:
            shutil.rmtree(directory, ignore_errors=True)
        except:
            pass

    def _extract_java_class_name(self, code):
        """Extract the public class name from Java code"""
        lines = code.splitlines()
        for line in lines:
            line = line.strip()
            if line.startswith('public class ') and '{' in line:
                return line.split()[2].split('{')[0].strip()
        return None

    def _ensure_java_class_name(self, code, new_class_name):
        """Ensure the code has the correct class name"""
        lines = code.splitlines()
        output = []
        for line in lines:
            stripped = line.strip()
            if stripped.startswith('public class '):
                # Replace the class name
                parts = stripped.split()
                parts[2] = new_class_name.split('{')[0]
                line = ' '.join(parts) + ' {'
            output.append(line)
        return '\n'.join(output)

    def _normalize_output(self, text):
        """Normalize output for comparison"""
        return '\n'.join(
            line.strip() 
            for line in text.splitlines() 
            if line.strip()
        )

    def _get_extension(self, language):
        """Get file extension for a language"""
        return {
            'python': 'py',
            'java': 'java',
            'cpp': 'cpp'
        }.get(language.lower(), 'txt')