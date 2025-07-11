import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppSelector } from "@/redux/hook";
import { problemService } from "@/services/problemService";
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
  const [problemDescription, setProblemDescription] = useState<string | null>(null);
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
          const data = (await submissionService.getSubmissionById(
            Number(submissionId)
          )) as Submission;
          setSubmission(data as Submission);

          if (data && data.problem) {
            const allProblems = await problemService.getAllProblems();
            const prob = allProblems.find((p) => p.id === Number(data.problem));
            if (prob) {
              setProblemSlug(prob.slug);
              // Fetch problem description
              const problemDetails = await problemService.getProblemBySlug(prob.slug);
              setProblemDescription(problemDetails.description);
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

  const handleAnalyzeClick = async () => {
    if (!submission || !accessToken) {
      setAiError("You must be logged in to use AI analysis.");
      return;
    }

    try {
      setAiLoading(true);
      setAiError(null);
      setAiAnalysis(null);

      const analysis = await aiService.analyzeSubmission(
        Number(submission.problem),
        submission.id,
        accessToken,
        problemDescription || undefined
      );

      console.log("Raw AI Analysis Response:", analysis);

      // Handle response (assume it’s an object, not a string)
      const parsedAnalysis = typeof analysis === 'string' ? JSON.parse(analysis) : analysis;
      setAiAnalysis(parsedAnalysis);
    } catch (err: any) {
      setAiError(err.message || "Failed to fetch AI analysis");
      console.error("AI Analysis Error:", err);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return <Skeleton className="h-96 w-full" />;
  }
  if (error) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  if (!submission) {
    return <div>No submission found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>
            {submission?.problem_title ? (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <span>{submission.problem_title}</span>
                {problemSlug && (
                  <Link to={`/problems/${problemSlug}`}>
                    <Button variant="default">
                      Go to Problem
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              "Submitted Solution"
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            <Badge variant="outline">{formatLanguage(submission.language)}</Badge>
            <Badge variant={getStatusVariant(submission.status)}>
              {formatStatus(submission.status)}
            </Badge>
            <span className="text-sm">Time: {submission.time_taken ?? "N/A"}</span>
            <span className="text-sm">Memory: {submission.memory_used ?? "N/A"}</span>
            <span className="text-sm">
              Submitted: {new Date(submission.submitted_at).toLocaleString()}
            </span>
          </div>

          <div className="relative">
            <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
              <code>{submission.code}</code>
            </pre>
          </div>

          {/* AI Analysis Section */}
          <div className="mt-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">AI Analysis</h3>
              <Button
                onClick={handleAnalyzeClick}
                disabled={aiLoading}
                variant="outline"
              >
                {aiLoading ? "Analyzing..." : "Analyze Code"}
              </Button>
            </div>

            {aiError && (
              <Alert variant="destructive">
                <AlertDescription>{aiError}</AlertDescription>
              </Alert>
            )}

            {aiLoading && (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            )}

            {aiAnalysis && !aiLoading && (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md space-y-3">
                {aiAnalysis.time_complexity && (
                  <div>
                    <h4 className="font-medium">Time Complexity</h4>
                    <p className="text-sm">{aiAnalysis.time_complexity}</p>
                  </div>
                )}
                {aiAnalysis.space_complexity && (
                  <div>
                    <h4 className="font-medium">Space Complexity</h4>
                    <p className="text-sm">{aiAnalysis.space_complexity}</p>
                  </div>
                )}
                {aiAnalysis.explanation && (
                  <div>
                    <h4 className="font-medium">Explanation</h4>
                    <p className="text-sm whitespace-pre-wrap">{aiAnalysis.explanation}</p>
                  </div>
                )}
                {aiAnalysis.optimization && (
                  <div>
                    <h4 className="font-medium">Optimization Suggestions</h4>
                    <p className="text-sm whitespace-pre-wrap">{aiAnalysis.optimization}</p>
                  </div>
                )}
                {aiAnalysis.feedback && (
                  <div>
                    <h4 className="font-medium">Feedback</h4>
                    <p className="text-sm whitespace-pre-wrap">{aiAnalysis.feedback}</p>
                  </div>
                )}
                {aiAnalysis.errors && (
                  <div>
                    <h4 className="font-medium">Errors</h4>
                    <p className="text-sm whitespace-pre-wrap">{aiAnalysis.errors}</p>
                  </div>
                )}

                {/* Display raw JSON for debugging */}
                {process.env.NODE_ENV === 'development' && (
                  <details className="mt-4 text-xs">
                    <summary className="cursor-pointer">Raw Analysis</summary>
                    <pre className="bg-gray-100 dark:bg-gray-700 p-2 rounded mt-2 overflow-x-auto">
                      {JSON.stringify(aiAnalysis, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper functions remain the same
function formatStatus(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

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