import { useState, useEffect } from 'react';
import { submissionService, type Submission } from '@/services/submissionService';
import { useAppSelector } from '@/redux/hook';

interface SubmissionHistoryProps {
  problemSlug: string;
  username?: string;
}

export default function SubmissionHistory({ problemSlug, username }: SubmissionHistoryProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        if (!username) {
          setSubmissions([]);
          setError('User not found');
          setLoading(false);
          return;
        }
        const response = await submissionService.getUserSubmissionsByUsername(problemSlug, username);
        setSubmissions(response);
        setError(null);
      } catch (err) {
        setError('Failed to fetch submission history');
        console.error('Error fetching submissions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [problemSlug, username]);

  if (loading) {
    return <div>Loading submission history...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (submissions.length === 0) {
    return <div className="text-gray-500">No submissions yet</div>;
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Your Submissions</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-2 px-4 border-b text-left">ID</th>
              <th className="py-2 px-4 border-b text-left">Status</th>
              <th className="py-2 px-4 border-b text-left">Language</th>
              <th className="py-2 px-4 border-b text-left">Time</th>
              <th className="py-2 px-4 border-b text-left">Memory</th>
              <th className="py-2 px-4 border-b text-left">Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission) => (
              <tr key={submission.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{submission.id}</td>
                <td className={`py-2 px-4 border-b ${getStatusColor(submission.status)}`}>
                  {formatStatus(submission.status)}
                </td>
                <td className="py-2 px-4 border-b">{formatLanguage(submission.language)}</td>
                <td className="py-2 px-4 border-b">
                  {submission.time_taken ? `${submission.time_taken} ms` : 'N/A'}
                </td>
                <td className="py-2 px-4 border-b">
                  {submission.memory_used ? `${submission.memory_used} MB` : 'N/A'}
                </td>
                <td className="py-2 px-4 border-b">
                  {new Date(submission.submitted_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Helper function to format status for display
function formatStatus(status: string): string {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Helper function to format language for display
function formatLanguage(language: string): string {
  switch (language) {
    case 'python':
      return 'Python';
    case 'java':
      return 'Java';
    case 'cpp':
      return 'C++';
    default:
      return language;
  }
}

// Helper function to get color based on status
function getStatusColor(status: string): string {
  switch (status) {
    case 'accepted':
      return 'text-green-600';
    case 'wrong_answer':
    case 'compilation_error':
    case 'runtime_error':
      return 'text-red-600';
    case 'time_limit_exceeded':
    case 'memory_limit_exceeded':
      return 'text-orange-600';
    case 'pending':
    case 'running':
      return 'text-blue-600';
    default:
      return 'text-gray-600';
  }
}