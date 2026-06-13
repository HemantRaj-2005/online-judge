from google import genai
from typing import Dict, Any
import json

import os
from dotenv import load_dotenv

load_dotenv()

class AIAnalysisService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not configured on the server. Please add it to your server configuration/environment variables.")
        self.client = genai.Client(api_key=api_key)
        self.model_name = "gemini-3-flash-preview"

    def _clean_and_parse_response(self, output: str) -> Dict[str, Any]:
        """Helper method to clean and parse AI response."""
        # Remove markdown code blocks if present
        if output.startswith('```json'):
            output = output[7:]
        elif output.startswith('```'):
            output = output[3:]
        if output.endswith('```'):
            output = output[:-3]
            
        try:
            return json.loads(output.strip())
        except json.JSONDecodeError:
            return {
                "error": "Failed to parse AI response",
                "raw_response": output
            }

    def analyze_complexity(self, code: str, language: str, problem_statement: str) -> Dict[str, Any]:
        """Analyze the time and space complexity of the given code."""
        prompt = f"""
        Analyze the following {language} code and problem statement:
        
        Problem:
        {problem_statement}
        
        Code:
        {code}

        Provide response as pure JSON with these keys:
        - time_complexity: Big O notation with explanation
        - space_complexity: Big O notation with explanation
        - explanation: Detailed analysis
        - optimization: Suggestions for improvement
        - errors: List of errors if any (empty list if none)
        
        Respond with only the JSON object, no markdown or additional text.
        """
        try:
            response = self.client.models.generate_content(model=self.model_name, contents=prompt)
            output = self._clean_and_parse_response(response.text)
            return output
        except Exception as e:
            return {
                "time_complexity": "N/A",
                "space_complexity": "N/A",
                "explanation": "Complexity analysis failed. Please verify your AI API key and connection.",
                "optimization": "N/A",
                "errors": [str(e)]
            }

    def explain_problem(self, problem_statement: str) -> Dict[str, Any]:
        """Provide a detailed explanation of the problem statement."""
        prompt = f"""
        Explain this programming problem:
        {problem_statement}

        Provide response as pure JSON with these keys:
        - problem_summary: Simple explanation
        - approach: Key insights and strategies
        - algorithms: Suggested algorithms with pseudocode
        - example: Walkthrough with sample input/output
        
        Respond with only the JSON object, no markdown or additional text.
        """
        try:
            response = self.client.models.generate_content(model=self.model_name, contents=prompt)
            output = self._clean_and_parse_response(response.text)
            return output
        except Exception as e:
            return {
                "problem_summary": "Failed to generate AI explanation. Please check your API key and connection.",
                "approach": "Check configuration.",
                "algorithms": [],
                "example": None,
                "error": str(e)
            }

    def provide_hint(self, problem_statement: str, user_code: str, language: str) -> Dict[str, Any]:
        """Provide hints for the given problem and user code."""
        prompt = f"""
        Provide progressive hints for this programming problem and user's draft code.
        
        Problem Description:
        {problem_statement}
        
        User's Draft Code (Language: {language}):
        {user_code}

        Return a JSON object matching this structure EXACTLY. Never reveal the complete solution or full code.
        
        Expected JSON format:
        {{
          "hint": "Observation or main hint to guide the user towards the solution.",
          "approach": [
            "Step 1 approach insight",
            "Step 2 approach insight"
          ],
          "derivation": [
            {{
              "step": 1,
              "content": "Explanation of the first step of derivation."
            }},
            {{
              "step": 2,
              "content": "Explanation of the second step of derivation."
            }}
          ],
          "complexity": {{
            "time": "Expected Time Complexity (e.g. O(n))",
            "space": "Expected Space Complexity (e.g. O(n))"
          }}
        }}
        
        Respond with ONLY the raw JSON object, no markdown block formatting, no ```json formatting, and no additional text.
        """
        try:
            response = self.client.models.generate_content(model=self.model_name, contents=prompt)
            output = self._clean_and_parse_response(response.text)
            return output
        except Exception as e:
            return {
                "hint": "Could not retrieve progressive hints. Please check server settings.",
                "approach": ["Verify API key configured on the server."],
                "derivation": [],
                "complexity": {
                    "time": "N/A",
                    "space": "N/A"
                },
                "error": str(e)
            }

    def generate_error_report(self, raw_logs: str, language: str, is_compile: bool) -> Dict[str, Any]:
        """Analyze compiler or runtime logs and return a user-friendly structured error report."""
        error_type = "Compilation Error" if is_compile else "Runtime Error"
        prompt = f"""
        Analyze this {error_type} message from code execution on an online judge:
        Language: {language}
        Raw Logs:
        {raw_logs}

        Provide a structured response in raw JSON format with the following keys:
        - type: The error type ("Compilation Error" or "Runtime Error")
        - language: "{language}" (or specific sub-variant if compilation error)
        - message: A clean, human-readable summary of what the error means
        - line: The line number where the error occurred (as an integer, or null if not found)
        - suggestion: An actionable, helpful tip or checklist to fix this specific issue

        Respond with ONLY the raw JSON object, no markdown or additional text.
        """
        try:
            response = self.client.models.generate_content(model=self.model_name, contents=prompt)
            return self._clean_and_parse_response(response.text)
        except Exception as e:
            return {
                "type": error_type,
                "language": language,
                "message": raw_logs,
                "line": None,
                "suggestion": "Review your code syntax and logic."
            }

    def generate_test_cases(self, title: str, description: str) -> Dict[str, Any]:
        """Generate test cases for a given problem statement using Gemini."""
        prompt = f"""
        Generate test cases for this programming problem:
        Title: {title}
        Description:
        {description}
 
        Provide a structured response in raw JSON format with the following keys EXACTLY:
        - sample: list of objects with "input" (string), "output" (string), "explanation" (string)
        - edge: list of objects with "input" (string), "output" (string), "explanation" (string)
        - corner: list of objects with "input" (string), "output" (string), "explanation" (string)
        - stress: list of objects with "input" (string), "output" (string), "explanation" (string)
        - random: list of objects with "input" (string), "output" (string), "explanation" (string)
 
        For each category, generate 1 to 3 relevant test cases.
        Respond with ONLY the raw JSON object, no markdown or additional text.
        """
        try:
            response = self.client.models.generate_content(model=self.model_name, contents=prompt)
            return self._clean_and_parse_response(response.text)
        except Exception as e:
            return {
                "sample": [],
                "edge": [],
                "corner": [],
                "stress": [],
                "random": [],
                "error": str(e)
            }

    def analyze_code(self, code: str, language: str) -> Dict[str, Any]:
        """Analyze the given code and return structural code quality, complexity and optimizations suggestions."""
        prompt = f"""
        Analyze this code thoroughly and return ONLY pure JSON with this structure:
        {{
          "language": "{language}",
          "timeComplexity": "Big O notation (e.g., O(N) or O(N log N)) with brief explanation",
          "spaceComplexity": "Big O notation with brief explanation",
          "syntaxErrors": "Detailed explanation of any syntax errors, or 'None detected' if there are no syntax errors",
          "codeQuality": {{
            "maintainability": "Rate it (e.g., Good/Moderate/Poor) and explain why",
            "readability": "Rate it and explain why",
            "style": "Comment on code style / structure compliance"
          }},
          "optimizations": [
            "Optimization suggestion 1",
            "Optimization suggestion 2"
          ]
        }}

        Code:
        {code}
        """
        try:
            response = self.client.models.generate_content(model=self.model_name, contents=prompt)
            return self._clean_and_parse_response(response.text)
        except Exception as e:
            return {
                "language": language,
                "timeComplexity": "N/A",
                "spaceComplexity": "N/A",
                "syntaxErrors": f"Error during analysis: {str(e)}",
                "codeQuality": {
                    "maintainability": "N/A",
                    "readability": "N/A",
                    "style": "N/A"
                },
                "optimizations": []
            }