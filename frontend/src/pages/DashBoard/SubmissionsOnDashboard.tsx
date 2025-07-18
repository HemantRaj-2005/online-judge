import { useState, useEffect } from 'react';
import { submissionService, type Submission } from '@/services/submissionService';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useNavigate } from 'react-router-dom';

interface SubmissionsOnDashboardProps {
  username?: string;
  limit?: number; // Optional limit to show only recent submissions
}

export default function SubmissionsOnDashboard({ username, limit }: SubmissionsOnDashboardProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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
        // This endpoint would need to be created in your backend
        // It should return all submissions for the user with problem titles
        const response = await submissionService.getUserSubmissions(username);
        // Apply limit if provided
        const limitedSubmissions = limit ? response.slice(0, limit) : response;
        setSubmissions(limitedSubmissions);
        setError(null);
      } catch (err) {
        setError('Failed to fetch submission history');
        console.error('Error fetching submissions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [username, limit]);

  if (loading) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-8">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (submissions.length === 0) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No submissions yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>{limit ? 'Recent Submissions' : 'Submission History'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Problem</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Memory</TableHead>
              <TableHead>Submitted At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((submission) => (
              <TableRow 
                key={submission.id} 
                onClick={() => navigate(`/submissions/${submission.id}`)} 
                className="cursor-pointer hover:bg-muted"
              >
                <TableCell className="font-medium">{submission.id}</TableCell>
                <TableCell>
                  {submission.problem_title || submission.problem}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(submission.status)}>
                    {formatStatus(submission.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {formatLanguage(submission.language)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {submission.time_taken ? `${submission.time_taken} ms` : 'N/A'}
                </TableCell>
                <TableCell>
                  {submission.memory_used ? `${submission.memory_used} MB` : 'N/A'}
                </TableCell>
                <TableCell>
                  {new Date(submission.submitted_at).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
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

// Helper function to get badge variant based on status
function getStatusVariant(status: string) {
  switch (status) {
    case 'accepted':
      return 'success';
    case 'wrong_answer':
    case 'compilation_error':
    case 'runtime_error':
      return 'destructive';
    case 'time_limit_exceeded':
    case 'memory_limit_exceeded':
      return 'warning';
    case 'pending':
    case 'running':
      return 'secondary';
    default:
      return 'outline';
  }
}