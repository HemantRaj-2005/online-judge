import google.generativeai as genai
from typing import Dict, Any
import time
import json



class AIAnalysisService:
    def __init__(self):
        genai.configure(api_key= "AIzaSyDTP7T88Xw9rPJWW2gSeTsV8vWnXCCaoDk")
        self.model = genai.GenerativeModel("models/gemini-2.0-flash")

    def analyze_complexity(self, code: str, language: str, problem_statement: str) -> Dict[str, Any]:
        """
        Analyze the time and space complexity of the given code.
        """
        prompt = f"""
        Analyze the following {language}, problem statement and code and provide:
        1. Time complexity in Big O notation with a brief explanation.
        2. Space complexity in Big O notation with a brief explanation.
        3. Optimization suggestions if applicable.
        4. If errors available then, provide errors and ways to fix it

        Code:
        ```{problem_statement}
        {language}
        {code}
        ```

        Format response as JSON with keys: time_complexity, space_complexity, explanation, optimization 
        """
        response = self.model.generate_content(prompt)
        output = response.text
        print(output)
        return output

    
    
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
        
        Problem Statement:
        ```{problem_statement}```
        
        Format response as JSON with keys: problem_summary, approach, algorithms, example
        """

        response = self.model.generate_content(prompt)
        output = response.text
        print(output)
        return output
    

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

        response = self.model.generate_content(prompt)
        output = response.text
        print(output)
        return output

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
