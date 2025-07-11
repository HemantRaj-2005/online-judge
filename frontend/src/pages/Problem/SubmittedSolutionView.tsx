import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppSelector } from "@/redux/hook";
import { problemService } from "@/services/problemService";
import {
  submissionService,
  type Submission,
} from "@/services/submissionService";

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";


export default function SubmittedSolutionView() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAppSelector((state) => state.auth);
  const [problem, setProblem] = useState<{ slug: string; title: string } | null>(null);

  const username = user?.username || "Guest";
  const accessToken = user?.accessToken || "";

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        setLoading(true);
        if (submissionId !== undefined) {
          const data = (await submissionService.getSubmissionById(
            Number(submissionId)
          )) as Submission;
          setSubmission(data);
          // Fetch problem details using the problem slug from submission
          if (data && data.problem) {
            const problemData = await problemService.getProblemBySlug(data.problem);
            setProblem({ slug: problemData.slug, title: problemData.title });
          }
        }
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
          <CardTitle>
            {problem ? (
              <div className="flex items-center gap-4">
                <span>{problem.title}</span>
                <Link to={`/problems/${problem.slug}`}>
                  <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Go to Problem
                  </button>
                </Link>
              </div>
            ) : (
              "Submitted Solution"
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge variant="outline">{formatLanguage(submission.language)}</Badge>
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

function getStatusVariant(
  status: string
): "destructive" | "secondary" | "outline" | "default" | null | undefined {
  switch (status) {
    case "accepted":
      return "default";
    case "wrong_answer":
    case "compilation_error":
    case "runtime_error":
    case "time_limit_exceeded":
    case "memory_limit_exceeded":
      return "destructive";
    case "pending":
    case "running":
      return "secondary";
    default:
      return "outline";
  }
}
