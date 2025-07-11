from google import genai
from typing import Dict, Any
import time
import json



class AIAnalysisService:
    def __init__(self):
        self.client = genai.Client(api_key="AIzaSyDTP7T88Xw9rPJWW2gSeTsV8vWnXCCaoDk")

    def analyze_complexity(self, code: str, language: str) -> Dict[str, Any]:
        """
        Analyze the time and space complexity of the given code.
        """
        prompt = f"""
        Analyze the following {language} code and provide:
        1. Time complexity in Big O notation with a brief explanation.
        2. Space complexity in Big O notation with a brief explanation.
        3. Optimization suggestions if applicable.

        Code:
        ```{language}
        {code}
        ```

        Format response as JSON with keys: time_complexity, space_complexity, explanation, optimization 
        """
        
        return self._get_ai_response(prompt)

    
    def debug_code(self, code: str, language: str, error_message: str = None) -> Dict[str, Any]:
        """Debug the given code and identify syntax/logical errors"""

        prompt = f"""
        Debug the following {language} code and identify:
        1. Syntax errors and their fixes.
        2. Logical errors and their fixes.
        3. Potential runtime errors.
        4. Suggested fixes.

        Code:
        ```{language}
        {code}
        ```

        """
        if error_message:
            prompt += f"\nError Message: {error_message}\n"

        prompt += "\nFormat response as JSON with keys: syntax_errors, logical_errors, runtime_issues, suggestions"

        return self.client.generate_text(
            model="gemini-2.0-flash",
            prompt=prompt,
            max_output_tokens=500,
            temperature=0.5
        ).text
    
    def explain_problem(self, problem_statement: str) -> Dict[str, Any]:
        """
        Provide a detailed explanation of the problem statement and the solution code.
        """
        prompt = f"""
        Explain the following problem statement and provide:
        1. Problem summary in simple terms.
        2. Key insights and approaches.
        3. Algorithm suggestions with pseudocode.
        4. Example walkthrough 

        Format response as JSON with keys: problem_summary, approach, algorithms, example
        """

        return self._get_ai_response(prompt)
    

    def provide_hint(self, problem_statement: str, user_code:str, language:str) -> Dict[str, Any]:
        """
        Provide a hint for the given problem statement and user code.
        """
        prompt = f"""
        Based on the problem and user's current code, provide helpful hints:
        1. Waht they are doing right.
        2. What they might be missing.
        3. Next steps to consider.
        4. Common pitfalls to avoid.

        Problem Statement:
        {problem_statement}

        User Code:
        ```{language}
        {user_code}
        ```

        Format response as JSON with keys: positive_feedback, missing_elements, next_steps, pitfalls
        """

        return self._get_ai_response(prompt)

    def _get_ai_response(self, prompt: str) -> Dict[str, Any]:
        """Helper method to get AI response from Gemini API."""
        try:
            start_time = time.time()

            response = self.client.chat.completions.create(
                model="gemini-2.0-flash",
                messages=[
                    {"role": "system", "content": "You are an expert programming tutor and code analyzer. Always respond with valid JSON."},
                    {"role": "user", "content": prompt}],
                max_output_tokens=1000,
                temperature=0.5
            )
            processing_time = time.time() - start_time
            result = json.loads(response.choices[0].message.content)
            result['processing_time'] = processing_time

            return result
        except Exception as e:
            return {
                "error": str(e),
                "processing_time": None
            }
