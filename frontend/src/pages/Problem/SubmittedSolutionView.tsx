import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppSelector } from "@/redux/hook";
import { problemService} from "@/services/problemService";
import {
  submissionService,
  type Submission,
} from "@/services/submissionService";
import { aiService } from "@/services/aiServices";

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";


export default function SubmittedSolutionView() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [problemSlug, setProblemSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const { user } = useAppSelector((state) => state.auth);

  const username = user?.username || "Guest";
  const accessToken = user?.accessToken || "";

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        setLoading(true);
        if (submissionId !== undefined) {
          const data = await submissionService.getSubmissionById(
            Number(submissionId)
          ) as Submission;
          setSubmission(data as Submission);

          // Fetch problem slug using problem id
          if (data && data.problem) {
            const allProblems = await problemService.getAllProblems();
            const prob = allProblems.find((p) => p.id === Number(data.problem));
            if (prob) setProblemSlug(prob.slug);

            // Fetch AI analysis
            setAiLoading(true);
            setAiError(null);
            try {
              if (accessToken) {
                const analysis = await aiService.analyzeSubmission(
                  Number(data.problem),
                  data.id,
                  accessToken
                );
                setAiAnalysis(analysis);
              } else {
                setAiError("You must be logged in to use AI analysis.");
              }
            } catch (err: any) {
              setAiError(err.message || "Failed to fetch AI analysis");
            } finally {
              setAiLoading(false);
            }
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
            {submission?.problem_title ? (
              <div className="flex items-center gap-4">
                <span>{submission.problem_title}</span>
                {problemSlug && (
                  <Link to={`/problems/${problemSlug}`}>
                    <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                      Go to Problem
                    </button>
                  </Link>
                )}
              </div>
            ) : (
              "Submitted Solution"
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-2">
            <div>  </div>
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

          {/* AI Analysis Section */}
          <div className="mt-6">
            <h3 className="font-semibold mb-2">AI Complexity Analysis</h3>
            {aiLoading && <Skeleton className="h-24 w-full" />}
            {aiError && (
              <Alert variant="destructive" className="mt-2">
                <AlertDescription>{aiError}</AlertDescription>
              </Alert>
            )}
            {aiAnalysis && !aiError && (
              <div className="space-y-2">
                {aiAnalysis.time_complexity && (
                  <div><b>Time Complexity:</b> {aiAnalysis.time_complexity}</div>
                )}
                {aiAnalysis.space_complexity && (
                  <div><b>Space Complexity:</b> {aiAnalysis.space_complexity}</div>
                )}
                {aiAnalysis.explanation && (
                  <div><b>Explanation:</b> {aiAnalysis.explanation}</div>
                )}
                {aiAnalysis.optimization && (
                  <div><b>Optimization Suggestions:</b> {aiAnalysis.optimization}</div>
                )}
              </div>
            )}
          </div>
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
