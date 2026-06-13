import os
import subprocess
import time
import tempfile
from pathlib import Path
from typing import Dict, Any, List

# Linux resource limits module (Linux-only)
try:
    import resource
except ImportError:
    resource = None

class ExecutionProvider:
    def compile(self, code: str, language: str, temp_dir: Path) -> Dict[str, Any]:
        """Compiles the source code if required by the language."""
        raise NotImplementedError

    def execute(self, run_cmd: List[str], input_text: str, time_limit_ms: int, memory_limit_mb: int, output_limit_bytes: int, temp_dir: Path) -> Dict[str, Any]:
        """Executes the compiled program/script with resource limits."""
        raise NotImplementedError


class SubprocessExecutionProvider(ExecutionProvider):
    def __init__(self):
        self.language_config = {
            'python': {
                'file_name': 'submission.py',
                'compile_cmd': None,
                'run_cmd': lambda path, f: ['python3', str(path / f)],
            },
            'cpp': {
                'file_name': 'submission.cpp',
                'compile_cmd': lambda path, f: ['g++', '-O2', '-std=c++20', str(path / f), '-o', str(path / 'submission')],
                'run_cmd': lambda path, f: [str(path / 'submission')],
            },
            'java': {
                'file_name': 'Solution.java',
                'compile_cmd': lambda path, f: ['javac', str(path / f)],
                'run_cmd': lambda path, f: ['java', '-cp', str(path), 'Solution'],
            }
        }

    def compile(self, code: str, language: str, temp_dir: Path) -> Dict[str, Any]:
        lang = language.lower()
        if lang not in self.language_config:
            return {"success": False, "error_message": f"Unsupported language: {language}", "status": "CE"}

        config = self.language_config[lang]
        file_name = config['file_name']
        
        # If Java, extract the class name if possible to match Solution or custom class
        if lang == 'java':
            class_name = self._extract_java_class_name(code)
            if class_name:
                file_name = f"{class_name}.java"
                config['run_cmd'] = lambda path, f, c=class_name: ['java', '-cp', str(path), c]

        source_path = temp_dir / file_name
        with open(source_path, 'w', encoding='utf-8') as f:
            f.write(code)

        if not config['compile_cmd']:
            return {"success": True, "file_name": file_name, "run_cmd": config['run_cmd'](temp_dir, file_name)}

        # Execute compilation
        compile_args = config['compile_cmd'](temp_dir, file_name)
        try:
            result = subprocess.run(
                compile_args,
                cwd=str(temp_dir),
                capture_output=True,
                text=True,
                timeout=15
            )
            if result.returncode != 0:
                return {
                    "success": False,
                    "status": "CE",
                    "error_message": result.stderr or result.stdout,
                }
            return {"success": True, "file_name": file_name, "run_cmd": config['run_cmd'](temp_dir, file_name)}
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "status": "CE",
                "error_message": "Compilation timed out after 15 seconds.",
            }
        except Exception as e:
            return {
                "success": False,
                "status": "CE",
                "error_message": f"Compilation failed: {str(e)}",
            }

    def execute(self, run_cmd: List[str], input_text: str, time_limit_ms: int, memory_limit_mb: int, output_limit_bytes: int, temp_dir: Path) -> Dict[str, Any]:
        time_limit_sec = time_limit_ms / 1000.0
        memory_limit_bytes = memory_limit_mb * 1024 * 1024

        def set_limits():
            if resource is None:
                return
            # Set CPU Time Limit (soft limit = time_limit_sec, hard limit = time_limit_sec + 1)
            cpu_limit = int(time_limit_sec) + 1
            resource.setrlimit(resource.RLIMIT_CPU, (cpu_limit, cpu_limit + 1))
            # Set Memory / Address Space Limit (bytes)
            resource.setrlimit(resource.RLIMIT_AS, (memory_limit_bytes, memory_limit_bytes))
            # Prevent core dump generation
            resource.setrlimit(resource.RLIMIT_CORE, (0, 0))

        start_time = time.perf_counter()
        
        try:
            # We use Popen to execute asynchronously and handle process streams safely
            # Note: preexec_fn is only supported on Unix systems
            process = subprocess.Popen(
                run_cmd,
                cwd=str(temp_dir),
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                preexec_fn=set_limits if os.name != 'nt' else None
            )

            try:
                stdout_bytes, stderr_bytes = process.communicate(
                    input=input_text.encode('utf-8'),
                    timeout=time_limit_sec
                )
            except subprocess.TimeoutExpired:
                process.kill()
                # Clean streams
                stdout_bytes, stderr_bytes = process.communicate()
                elapsed_time = int((time.perf_counter() - start_time) * 1000)
                return {
                    "status": "TLE",
                    "stdout": stdout_bytes.decode('utf-8', errors='replace'),
                    "stderr": "Time Limit Exceeded",
                    "time_taken": elapsed_time,
                    "memory_used": 0
                }

            elapsed_time = int((time.perf_counter() - start_time) * 1000) # ms
            exit_code = process.returncode

            stdout = stdout_bytes.decode('utf-8', errors='replace')
            stderr = stderr_bytes.decode('utf-8', errors='replace')

            # Retrieve memory usage from child processes if available on Unix
            # usage.ru_maxrss is in Kilobytes on Linux
            memory_kb = 0
            if resource is not None:
                try:
                    usage = resource.getrusage(resource.RUSAGE_CHILDREN)
                    memory_kb = usage.ru_maxrss
                except:
                    pass

            # Output Limit Exceeded (OLE) check
            if len(stdout_bytes) > output_limit_bytes:
                return {
                    "status": "OLE",
                    "stdout": stdout[:1000] + "... [TRUNCATED]",
                    "stderr": "Output Limit Exceeded",
                    "time_taken": elapsed_time,
                    "memory_used": memory_kb // 1024
                }

            # Check for SIGXCPU (CPU limit exceeded) or signal-based memory limit kills
            if exit_code < 0:
                # Negative exit codes correspond to negative UNIX signals
                sig = -exit_code
                if sig == 9 or sig == 15 or exit_code == 137: # SIGKILL, SIGTERM, or common OOM exit code
                    return {
                        "status": "MLE",
                        "stdout": stdout,
                        "stderr": f"Process killed by signal {sig} (Possible Out of Memory).",
                        "time_taken": elapsed_time,
                        "memory_used": memory_kb // 1024
                    }
                elif sig == 24 or sig == 9: # SIGXCPU
                    return {
                        "status": "TLE",
                        "stdout": stdout,
                        "stderr": "CPU Time Limit Exceeded.",
                        "time_taken": elapsed_time,
                        "memory_used": memory_kb // 1024
                    }

            # Check general exit code for Runtime Error
            if exit_code != 0:
                # If memory limit exceeded, Linux often exits with code 137 or MemoryError
                if "MemoryError" in stderr or exit_code == 137:
                    return {
                        "status": "MLE",
                        "stdout": stdout,
                        "stderr": stderr,
                        "time_taken": elapsed_time,
                        "memory_used": memory_kb // 1024
                    }
                return {
                    "status": "RE",
                    "stdout": stdout,
                    "stderr": stderr,
                    "time_taken": elapsed_time,
                    "memory_used": memory_kb // 1024,
                    "exit_code": exit_code
                }

            return {
                "status": "success",
                "stdout": stdout,
                "stderr": stderr,
                "time_taken": elapsed_time,
                "memory_used": memory_kb // 1024 # MB
            }

        except Exception as e:
            return {
                "status": "RE",
                "stdout": "",
                "stderr": f"Execution failed: {str(e)}",
                "time_taken": 0,
                "memory_used": 0
            }

    def _extract_java_class_name(self, code: str) -> str:
        # Find 'public class ClassName'
        import re
        match = re.search(r'public\s+class\s+(\w+)', code)
        if match:
            return match.group(1)
        return None
