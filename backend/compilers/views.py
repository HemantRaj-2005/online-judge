from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import subprocess
import tempfile
import os
import json
import re

# Try to import resource module (Linux/Mac only)
try:
    import resource
except ImportError:
    resource = None

# --- Compilation functions ---
def compile_code_with_timeout(language, code, user_input, temp_dir, timeout=5):
    """Compile and run code with timeout and (Linux/Mac) resource limits."""
    try:
        if language == 'cpp':
            return compile_cpp(code, user_input, temp_dir, timeout)
        elif language == 'java':
            return compile_java(code, user_input, temp_dir, timeout)
        elif language == 'python':
            return compile_python(code, user_input, temp_dir, timeout)
        else:
            raise ValueError("Unsupported language")
    except subprocess.TimeoutExpired:
        raise Exception("Execution timed out")
    except subprocess.CalledProcessError as e:
        error_msg = e.stderr.decode('utf-8') if e.stderr else str(e)
        raise Exception(error_msg)
    except Exception as e:
        raise Exception(str(e))

def compile_cpp(code, user_input, temp_dir, timeout=5):
    src_path = os.path.join(temp_dir, 'main.cpp')
    exe_path = os.path.join(temp_dir, 'main')

    with open(src_path, 'w') as f:
        f.write(code)

    # Compile
    try:
        subprocess.run(
            ['g++', src_path, '-o', exe_path],
            cwd=temp_dir,
            stderr=subprocess.PIPE,
            stdout=subprocess.PIPE,
            timeout=timeout,
            check=True
        )
    except subprocess.TimeoutExpired:
        raise Exception("C++ compilation timed out")
    except subprocess.CalledProcessError as e:
        error_msg = e.stderr.decode('utf-8') if e.stderr else str(e)
        raise Exception(error_msg)

    # Run
    try:
        result = subprocess.run(
            [exe_path],
            input=user_input.encode(),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=timeout,
            check=True,
            preexec_fn=(lambda: (
                resource.setrlimit(resource.RLIMIT_CPU, (timeout, timeout)),
                resource.setrlimit(resource.RLIMIT_AS, (100 * 1024 * 1024, 100 * 1024 * 1024))
            )) if resource is not None else None
        )
        return result.stdout.decode('utf-8')
    except subprocess.TimeoutExpired:
        raise Exception("C++ execution timed out")
    except subprocess.CalledProcessError as e:
        error_msg = e.stderr.decode('utf-8') if e.stderr else str(e)
        raise Exception(error_msg)

def compile_java(code, user_input, temp_dir, timeout=5):
    class_name = "Main"
    src_path = os.path.join(temp_dir, f"{class_name}.java")

    # Extract class name
    match = re.search(r'public\s+class\s+(\w+)', code)
    if match:
        class_name = match.group(1)
        src_path = os.path.join(temp_dir, f"{class_name}.java")

    with open(src_path, 'w') as f:
        f.write(code)

    # Compile
    try:
        subprocess.run(
            ['javac', src_path],
            cwd=temp_dir,
            stderr=subprocess.PIPE,
            stdout=subprocess.PIPE,
            timeout=timeout,
            check=True
        )
    except subprocess.TimeoutExpired:
        raise Exception("Java compilation timed out")
    except subprocess.CalledProcessError as e:
        error_msg = e.stderr.decode('utf-8') if e.stderr else str(e)
        raise Exception(error_msg)

    # Run
    try:
        result = subprocess.run(
            ['java', '-cp', temp_dir, class_name],
            input=user_input.encode(),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=timeout,
            check=True,
            preexec_fn=(lambda: resource.setrlimit(
                resource.RLIMIT_AS,
                (100 * 1024 * 1024, 100 * 1024 * 1024)
            )) if resource is not None else None
        )
        return result.stdout.decode('utf-8')
    except subprocess.TimeoutExpired:
        raise Exception("Java execution timed out")
    except subprocess.CalledProcessError as e:
        error_msg = e.stderr.decode('utf-8') if e.stderr else str(e)
        raise Exception(error_msg)

def compile_python(code, user_input, temp_dir, timeout=5):
    src_path = os.path.join(temp_dir, 'main.py')

    with open(src_path, 'w') as f:
        f.write(code)
    os.chmod(src_path, 0o755)

    try:
        result = subprocess.run(
            ['python3', src_path],
            input=user_input.encode(),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=timeout,
            check=True,
            preexec_fn=(lambda: (
                resource.setrlimit(resource.RLIMIT_CPU, (timeout, timeout)),
                resource.setrlimit(resource.RLIMIT_AS, (100 * 1024 * 1024, 100 * 1024 * 1024))
            )) if resource is not None else None
        )
        return result.stdout.decode('utf-8')
    except subprocess.TimeoutExpired:
        raise Exception("Python execution timed out")
    except subprocess.CalledProcessError as e:
        error_msg = e.stderr.decode('utf-8') if e.stderr else str(e)
        raise Exception(error_msg)

# --- Django views ---

@csrf_exempt
def compile_cpp_view(request):
    return handle_compile_view(request, lang='cpp')

@csrf_exempt
def compile_java_view(request):
    return handle_compile_view(request, lang='java')

@csrf_exempt
def compile_python_view(request):
    return handle_compile_view(request, lang='python')

def handle_compile_view(request, lang):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            code = data['code']
            user_input = data.get('user_input', '')
            with tempfile.TemporaryDirectory() as temp_dir:
                output = compile_code_with_timeout(lang, code, user_input, temp_dir)
            return JsonResponse({'output': output})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    else:
        return JsonResponse({'error': 'POST method required'}, status=405)
