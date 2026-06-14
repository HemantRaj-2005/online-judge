import docker
import os
import time
import shutil
import tempfile
from pathlib import Path
from django.utils import timezone
from .models import Submission, TestCase
from ai_service.services import AIAnalysisService

class DockerExecutor:
    def __init__(self):
        try:
            self.client = docker.from_env()
        except Exception as e:
            self.client = None
            print(f"Docker initialization failed: {e}")

        self.image_config = {
            'python': 'python:3.10-alpine',
            'cpp': 'gcc:11-slim',
            'java': 'openjdk:17-slim'
        }

    def execute_submission(self, submission: Submission):
        if not self.client:
            print("Docker daemon not running. Falling back to local execution.")
            from .simple_executor import SimpleExecutor
            SimpleExecutor().execute_submission(submission)
            return

        submission.status = 'running'
        submission.save()

        problem = submission.problem
        language = submission.language.lower()
        code = submission.code

        # Create a unique host temp directory
        temp_dir_host = Path(tempfile.mkdtemp(prefix=f"judge_sub_{submission.id}_"))
        
        try:
            image_name = self._get_image_name(language)
            self._ensure_image(image_name)

            # Define mount
            mounts = [
                docker.types.Mount(target='/code', source=str(temp_dir_host.resolve()), type='bind')
            ]

            # Write code file
            file_name = self._get_source_file_name(language, code, submission.id)
            code_path = temp_dir_host / file_name
            with open(code_path, 'w', encoding='utf-8') as f:
                f.write(code)

            # Compilation phase (C++ or Java)
            compile_cmd = self._get_compile_command(language, file_name)
            if compile_cmd:
                compile_container = self.client.containers.run(
                    image=image_name,
                    command=f"sh -c '{compile_cmd}'",
                    mounts=mounts,
                    network_mode="none",
                    mem_limit="512m",
                    remove=False,
                    detach=True
                )
                
                # Wait for compilation to finish (max 15 seconds)
                result = compile_container.wait(timeout=15)
                exit_code = result.get('StatusCode', 0)
                compile_logs = compile_container.logs(stdout=True, stderr=True).decode('utf-8')
                compile_container.remove(force=True)

                if exit_code != 0:
                    self._handle_compilation_error(submission, compile_logs, language)
                    return

            # Execution phase against testcases
            test_cases = TestCase.objects.filter(problem=problem)
            if not test_cases.exists():
                submission.status = 'runtime_error'
                submission.output = 'No test cases found for this problem.'
                submission.save()
                return

            all_passed = True
            max_time = 0
            max_mem = 0

            # Get run command
            run_base_cmd = self._get_run_command(language, file_name, submission.id)
            time_limit_sec = problem.time_limit / 1000.0

            for idx, test_case in enumerate(test_cases):
                # Write input.txt to mount
                input_path = temp_dir_host / 'input.txt'
                with open(input_path, 'w', encoding='utf-8') as f:
                    f.write(test_case.input_text)

                # Clear previous output files
                output_path = temp_dir_host / 'output.txt'
                error_path = temp_dir_host / 'error.txt'
                memory_path = temp_dir_host / 'memory.txt'
                
                if output_path.exists(): output_path.unlink()
                if error_path.exists(): error_path.unlink()
                if memory_path.exists(): memory_path.unlink()

                # Build shell command with input redirection, output capture, and memory logging
                shell_cmd = (
                    f"{run_base_cmd} < /code/input.txt > /code/output.txt 2> /code/error.txt; "
                    f"if [ -f /sys/fs/cgroup/memory/memory.max_usage_in_bytes ]; then cat /sys/fs/cgroup/memory/memory.max_usage_in_bytes > /code/memory.txt; "
                    f"elif [ -f /sys/fs/cgroup/memory.peak ]; then cat /sys/fs/cgroup/memory.peak > /code/memory.txt; "
                    f"elif [ -f /sys/fs/cgroup/memory.current ]; then cat /sys/fs/cgroup/memory.current > /code/memory.txt; fi"
                )

                start_time = time.perf_counter()
                
                # Memory limit is problem.memory_limit (MB)
                mem_limit_str = f"{problem.memory_limit}m"

                try:
                    container = self.client.containers.run(
                        image=image_name,
                        command=f"sh -c '{shell_cmd}'",
                        mounts=mounts,
                        network_mode="none",
                        nano_cpus=1000000000, # 1 CPU limit
                        mem_limit=mem_limit_str,
                        pids_limit=50,
                        remove=False,
                        detach=True
                    )

                    # Enforce timeout
                    try:
                        wait_result = container.wait(timeout=time_limit_sec + 0.5) # Add small grace period
                        exit_status = wait_result.get('StatusCode', 0)
                    except Exception as e:
                        # Timeout Expired or wait failed
                        container.remove(force=True)
                        all_passed = False
                        submission.status = 'time_limit_exceeded'
                        submission.output = f"Test case {idx + 1}: Time Limit Exceeded"
                        submission.verdict = self._get_tle_error_report()
                        submission.save()
                        return
                    
                    elapsed_time = int((time.perf_counter() - start_time) * 1000) # ms
                    max_time = max(max_time, elapsed_time)
                    
                    container.remove(force=True)

                    # Check OOM / exit code 137
                    if exit_status == 137:
                        all_passed = False
                        submission.status = 'memory_limit_exceeded'
                        submission.output = f"Test case {idx + 1}: Memory Limit Exceeded"
                        submission.save()
                        return

                    # Read error logs
                    stderr_content = ""
                    if error_path.exists():
                        with open(error_path, 'r', encoding='utf-8') as f:
                            stderr_content = f.read().strip()

                    # Read stdout
                    stdout_content = ""
                    if output_path.exists():
                        with open(output_path, 'r', encoding='utf-8') as f:
                            stdout_content = f.read()

                    # Read memory usage
                    mem_used_kb = 0
                    if memory_path.exists():
                        try:
                            with open(memory_path, 'r') as f:
                                mem_bytes = int(f.read().strip())
                                mem_used_kb = int(mem_bytes / 1024)
                                max_mem = max(max_mem, mem_used_kb)
                        except:
                            pass

                    # Check for runtime error
                    if exit_status != 0:
                        all_passed = False
                        self._handle_runtime_error(submission, stderr_content, language)
                        return

                    # Normalize and compare
                    norm_actual = self._normalize_output(stdout_content)
                    norm_expected = self._normalize_output(test_case.output_text)

                    if norm_actual != norm_expected:
                        all_passed = False
                        submission.status = 'wrong_answer'
                        submission.output = f"Test case {idx + 1}: Wrong Answer\nExpected:\n{test_case.output_text.strip()}\n\nGot:\n{stdout_content.strip()}"
                        submission.save()
                        return

                except Exception as e:
                    all_passed = False
                    submission.status = 'runtime_error'
                    submission.output = f"System error running container: {str(e)}"
                    submission.save()
                    return

            if all_passed:
                submission.status = 'accepted'
                submission.verdict = 'Accepted'
                submission.output = f'All {len(test_cases)} test cases passed'
                submission.time_taken = max_time
                submission.memory_used = max_mem // 1024 # MB
                submission.set_evaluated_now()
                submission.save()

        finally:
            # Clean up directory
            shutil.rmtree(temp_dir_host, ignore_errors=True)

    def _get_image_name(self, language):
        return self.image_config.get(language, 'python:3.10-alpine')

    def _ensure_image(self, image_name):
        try:
            self.client.images.get(image_name)
        except docker.errors.ImageNotFound:
            print(f"Pulling image {image_name}...")
            self.client.images.pull(image_name)

    def _get_source_file_name(self, language, code, submission_id):
        if language == 'python':
            return 'submission.py'
        elif language == 'java':
            class_name = self._extract_java_class_name(code) or f"Submission_{submission_id}"
            return f"{class_name}.java"
        elif language == 'cpp':
            return 'submission.cpp'
        return 'submission.txt'

    def _get_compile_command(self, language, file_name):
        if language == 'cpp':
            return f"g++ -O0 -std=c++17 /code/{file_name} -o /code/submission"
        elif language == 'java':
            return f"javac /code/{file_name}"
        return None

    def _get_run_command(self, language, file_name, submission_id):
        if language == 'python':
            return "python3 /code/submission.py"
        elif language == 'cpp':
            return "/code/submission"
        elif language == 'java':
            class_name = file_name.replace(".java", "")
            return f"java -cp /code {class_name}"
        return ""

    def _extract_java_class_name(self, code):
        lines = code.splitlines()
        for line in lines:
            line = line.strip()
            if line.startswith('public class ') and '{' in line:
                return line.split()[2].split('{')[0].strip()
        return None

    def _normalize_output(self, text):
        return '\n'.join(line.strip() for line in text.splitlines() if line.strip())

    def _handle_compilation_error(self, submission, raw_logs, language):
        submission.status = 'compilation_error'
        try:
            ai_service = AIAnalysisService()
            report = ai_service.generate_error_report(raw_logs, language, is_compile=True)
            import json
            submission.verdict = json.dumps(report)
            submission.output = report.get('message', raw_logs)
        except Exception as e:
            submission.verdict = raw_logs
            submission.output = raw_logs
        submission.set_evaluated_now()
        submission.save()

    def _handle_runtime_error(self, submission, raw_logs, language):
        submission.status = 'runtime_error'
        try:
            ai_service = AIAnalysisService()
            report = ai_service.generate_error_report(raw_logs, language, is_compile=False)
            import json
            submission.verdict = json.dumps(report)
            submission.output = report.get('message', raw_logs)
        except Exception as e:
            submission.verdict = raw_logs
            submission.output = raw_logs
        submission.set_evaluated_now()
        submission.save()

    def _get_tle_error_report(self):
        import json
        return json.dumps({
            "type": "TLE",
            "message": "Execution exceeded time limit.",
            "suggestion": "Reduce algorithm complexity or check for infinite loops."
        })