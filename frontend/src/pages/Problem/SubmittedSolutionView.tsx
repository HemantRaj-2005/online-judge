import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppSelector } from "@/redux/hook";
import {
  submissionService,
  type Submission,
} from "@/services/submissionService";

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function SubmittedSolutionView() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAppSelector((state) => state.auth);

  const username = user?.username || "guest"; // Fallback to 'guest' if user is not logged in

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        setLoading(true);
        const data = await submissionService.getSubmissionById(submissionId);
        setSubmission(data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch submission details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmission();
  }, [submissionId]);

  if (loading) {
    return <Skeleton className="h-96 w-full" />;
  }
  if (error) {
    return (
      <Alert variant="destructive" className="mt-4">
        {<AlertDescription>{error}</AlertDescription>}
      </Alert>
    );
  }
  if (!submission) {
    return <div>No submission found</div>;
  }

  return (
    <>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Submitted Solution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge variant="outline">{submission.language}</Badge>
            <Badge variant={getStatusVariant(submission.status)}>
              {formatStatus(submission.status)}
            </Badge>
            <span>Time: {submission.time_taken ?? "N/A"}</span>
            <span>Memory: {submission.memory_used ?? "N/A"}</span>
            <span>
              Submitted: {new Date(submission.submitted_at).toLocaleString()}
            </span>
          </div>
          <pre className="bg-muted p-4 rounded overflow-x-auto">
            <code>{submission.code}</code>
          </pre>
        </CardContent>
      </Card>
    </>
  );
}

// Helper function to format status for display
function formatStatus(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Helper function to format language for display
function formatLanguage(language: string): string {
  switch (language) {
    case "python":
      return "Python";
    case "java":
      return "Java";
    case "cpp":
      return "C++";
    default:
      return language;
  }
}

function getStatusVariant(status: string) {
  switch (status) {
    case "accepted":
      return "success";
    case "wrong_answer":
    case "compilation_error":
    case "runtime_error":
      return "destructive";
    case "time_limit_exceeded":
    case "memory_limit_exceeded":
      return "warning";
    case "pending":
    case "running":
      return "secondary";
    default:
      return "outline";
  }
}
