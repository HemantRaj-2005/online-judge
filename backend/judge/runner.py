import threading
import tempfile
import json
from pathlib import Path
from django.utils import timezone
from .models import Submission, TestCase
from .execution_provider import SubprocessExecutionProvider
from ai_service.services import AIAnalysisService

class SubmissionRunner:
    def __init__(self):
        self.provider = SubprocessExecutionProvider()

    def run_submission_sync(self, submission_id: int):
        try:
            submission = Submission.objects.get(id=submission_id)
        except Submission.DoesNotExist:
            return

        submission.status = 'running'
        submission.save()

        problem = submission.problem
        language = submission.language.lower()
        code = submission.code

        test_cases = TestCase.objects.filter(problem=problem)
        if not test_cases.exists():
            submission.status = 'runtime_error'
            submission.output = 'No test cases found for this problem.'
            submission.save()
            return

        all_passed = True
        max_time = 0
        max_mem = 0
        passed_count = 0
        total_count = test_cases.count()

        # Create temporary directory for compilation and running
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            
            # Compile
            comp_res = self.provider.compile(code, language, temp_path)
            if not comp_res["success"]:
                # Compilation Error
                raw_logs = comp_res.get("error_message", "Compilation Error")
                submission.status = 'compilation_error'
                # Generate AI report
                try:
                    ai_service = AIAnalysisService()
                    report = ai_service.generate_error_report(raw_logs, language, is_compile=True)
                    submission.verdict = json.dumps(report)
                    submission.output = report.get('message', raw_logs)
                except Exception as e:
                    submission.verdict = json.dumps({
                        "status": "CE",
                        "message": "Compilation Error",
                        "details": raw_logs,
                        "suggestion": "Check compiler error messages for details."
                    })
                    submission.output = raw_logs
                submission.set_evaluated_now()
                submission.save()
                return

            run_cmd = comp_res["run_cmd"]

            # Run testcases
            for idx, test_case in enumerate(test_cases):
                # Output limit = 1MB (1024 * 1024 bytes)
                exec_res = self.provider.execute(
                    run_cmd=run_cmd,
                    input_text=test_case.input_text,
                    time_limit_ms=problem.time_limit,
                    memory_limit_mb=problem.memory_limit,
                    output_limit_bytes=1024 * 1024,
                    temp_dir=temp_path
                )

                status = exec_res["status"]
                
                if status == "success":
                    # Compare output
                    stdout = exec_res["stdout"]
                    norm_actual = '\n'.join(line.strip() for line in stdout.splitlines() if line.strip())
                    norm_expected = '\n'.join(line.strip() for line in test_case.output_text.splitlines() if line.strip())

                    if norm_actual == norm_expected:
                        passed_count += 1
                        max_time = max(max_time, exec_res["time_taken"])
                        max_mem = max(max_mem, exec_res["memory_used"])
                    else:
                        all_passed = False
                        submission.status = 'wrong_answer'
                        submission.output = f"Test case {idx + 1}: Wrong Answer\nExpected:\n{test_case.output_text.strip()}\n\nGot:\n{stdout.strip()}"
                        break
                else:
                    all_passed = False
                    submission.status = self._map_status_to_db_status(status)
                    raw_logs = exec_res.get("stderr", "")
                    
                    # AI-powered Smart Error suggestion
                    if status == "RE":
                        try:
                            ai_service = AIAnalysisService()
                            report = ai_service.generate_error_report(raw_logs, language, is_compile=False)
                            submission.verdict = json.dumps(report)
                            submission.output = report.get('message', raw_logs)
                        except Exception as e:
                            submission.verdict = json.dumps({
                                "status": "RE",
                                "message": "Runtime Error",
                                "details": raw_logs,
                                "suggestion": "Check for division by zero or invalid access."
                            })
                            submission.output = raw_logs
                    else:
                        # TLE or MLE or OLE
                        verdict_msg = "Time Limit Exceeded" if status == "TLE" else ("Memory Limit Exceeded" if status == "MLE" else "Output Limit Exceeded")
                        submission.verdict = json.dumps({
                            "status": status,
                            "message": verdict_msg,
                            "suggestion": "Optimize your algorithm and check constraints."
                        })
                        submission.output = f"Test case {idx + 1}: {verdict_msg}"
                    break

            if all_passed:
                submission.status = 'accepted'
                submission.verdict = json.dumps({
                    "status": "Accepted",
                    "passed": passed_count,
                    "total": total_count,
                    "time": f"{max_time}ms",
                    "memory": f"{max_mem}MB"
                })
                submission.output = f"All {total_count} test cases passed."
                submission.time_taken = max_time
                submission.memory_used = max_mem
            else:
                submission.time_taken = max_time
                submission.memory_used = max_mem
                
            submission.set_evaluated_now()
            submission.save()

    def run_submission_async(self, submission_id: int):
        # Run asynchronously in background thread for free tier compatibility
        t = threading.Thread(target=self.run_submission_sync, args=(submission_id,))
        t.start()

    def _map_status_to_db_status(self, status: str) -> str:
        mapping = {
            "TLE": "time_limit_exceeded",
            "MLE": "memory_limit_exceeded",
            "OLE": "output_limit_exceeded",
            "RE": "runtime_error",
        }
        return mapping.get(status, "error")
