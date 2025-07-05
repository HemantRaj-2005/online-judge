import { useState, useEffect } from 'react';
import { submissionService } from '@/services/submissionService';
import { useAppSelector } from '@/redux/hook';

interface CodeEditorProps {
  problemSlug: string;
}

export default function CodeEditor({ problemSlug }: CodeEditorProps) {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [submitting, setSubmitting] = useState(false);
  const [submissionId, setSubmissionId] = useState<number | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const username = useAppSelector((state) => state.auth.user?.username);

  // Set initial template when language changes
  useEffect(() => {
    if (!code || code === getLanguageTemplate('python') || code === getLanguageTemplate('java') || code === getLanguageTemplate('cpp')) {
      setCode(getLanguageTemplate(language));
    }
  }, [language]);

  // Handle code submission
  const handleSubmit = async () => {
    if (!code.trim()) {
      setError('Please enter some code');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSubmissionStatus('submitting');
      
      const response = await submissionService.submitCode(
        problemSlug,
        code,
        language,
        username || ""
      );
      
      // Type assertion for response
      const { id, status } = response as { id: number; status: string };
      setSubmissionId(id);
      setSubmissionStatus(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit code');
      console.error('Error submitting code:', err);
      setSubmissionStatus(null);
    } finally {
      setSubmitting(false);
    }
  };

  // Poll for submission status updates
  useEffect(() => {
    if (!submissionId) return;
  
    const intervalId = setInterval(async () => {
      try {
        const response = await submissionService.getSubmissionStatus(submissionId, username);
        const { status } = response as { status: string };
        setSubmissionStatus(status);
        if (status !== 'pending' && status !== 'running') {
          clearInterval(intervalId);
        }
      } catch (err) {
        if (err instanceof Error && err.message.includes('401')) {
          setError('Please log in to check submission status.');
        } else {
          setError('Error checking submission status: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }
        console.error('Error checking submission status:', err);
        clearInterval(intervalId);
      }
    }, 2000);
  
    return () => clearInterval(intervalId);
  }, [submissionId, username]);

  return (
    <div className="mt-8 border rounded-lg p-4 bg-white shadow">
      <h2 className="text-xl font-semibold mb-4">Code Editor</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Language
        </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={submitting}
        >
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Code
        </label>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-64 p-4 font-mono text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Write your code here..."
          disabled={submitting}
        />
      </div>
      
      <div className="flex justify-between items-center">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
        
        {error && (
          <div className="text-red-500">{error}</div>
        )}
      </div>
      
      {submissionStatus && (
        <div className="mt-4 p-3 border rounded-md">
          <h3 className="font-medium">Submission Status:</h3>
          <div className={`mt-1 ${getStatusColor(submissionStatus)}`}>
            {formatStatus(submissionStatus)}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to format status for display
function formatStatus(status: string): string {
  switch (status) {
    case 'submitting':
      return 'Submitting...';
    case 'pending':
      return 'Pending...';
    case 'running':
      return 'Running...';
    case 'accepted':
      return 'Accepted';
    case 'wrong_answer':
      return 'Wrong Answer';
    case 'compilation_error':
      return 'Compilation Error';
    case 'runtime_error':
      return 'Runtime Error';
    case 'time_limit_exceeded':
      return 'Time Limit Exceeded';
    case 'memory_limit_exceeded':
      return 'Memory Limit Exceeded';
    default:
      return status
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
  }
}

// Helper function to get color based on status
function getStatusColor(status: string): string {
  switch (status) {
    case 'submitting':
    case 'pending':
    case 'running':
      return 'text-blue-600';
    case 'accepted':
      return 'text-green-600';
    case 'wrong_answer':
    case 'compilation_error':
    case 'runtime_error':
      return 'text-red-600';
    case 'time_limit_exceeded':
    case 'memory_limit_exceeded':
      return 'text-orange-600';
    default:
      return 'text-gray-600';
  }
}

// Helper function to provide language templates
function getLanguageTemplate(language: string): string {
  switch (language) {
    case 'python':
      return `def solution():
    # Your code here
    pass

# Example usage
if __name__ == "__main__":
    solution()`;
    
    case 'java':
      return `public class Solution {
    public static void main(String[] args) {
        // Your code here
    }
}`;
    
    case 'cpp':
      return `#include <iostream>

using namespace std;

int main() {
    // Your code here
    return 0;
}`;
    
    default:
      return '';
  }
}