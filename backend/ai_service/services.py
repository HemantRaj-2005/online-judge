import google.generativeai as genai
from typing import Dict, Any
import json

class AIAnalysisService:
    def __init__(self):
        genai.configure(api_key="AIzaSyDTP7T88Xw9rPJWW2gSeTsV8vWnXCCaoDk")
        self.model = genai.GenerativeModel("models/gemini-2.0-flash")

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
        response = self.model.generate_content(prompt)
        output = self._clean_and_parse_response(response.text)
        print(output)
        return output

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
        response = self.model.generate_content(prompt)
        return self._clean_and_parse_response(response.text)

    def provide_hint(self, problem_statement: str, user_code: str, language: str) -> Dict[str, Any]:
        """Provide hints for the given problem and user code."""
        prompt = f"""
        Provide hints for this code:
        Language: {language}
        Problem: {problem_statement}
        Code: {user_code}

        Provide response as pure JSON with these keys:
        - positive_feedback: What's done correctly
        - missing_elements: What's missing
        - next_steps: Suggested deatiled next steps
        - pitfalls: Common mistakes to avoid
        
        Respond with only the JSON object, no markdown or additional text.
        """
        response = self.model.generate_content(prompt)
        output = self._clean_and_parse_response(response.text)
        print(output)
        return output