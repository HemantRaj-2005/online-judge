import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";

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
    return (
      <section className="relative min-h-screen py-12 bg-background grid-pattern flex items-center justify-center">
        <div className="w-full max-w-4xl px-4">
          <Skeleton className="h-[500px] w-full rounded-3xl bg-secondary/20 border border-border" />
        </div>
      </section>
    );
  }
  if (error) {
    return (
      <section className="relative min-h-screen py-12 bg-background grid-pattern flex items-center justify-center">
        <div className="w-full max-w-4xl px-4">
          <Alert variant="destructive" className="rounded-2xl border-red-500/30 bg-red-500/10 text-red-400">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </section>
    );
  }
  if (!submission) {
    return (
      <section className="relative min-h-screen py-12 bg-background grid-pattern flex items-center justify-center">
        <div className="text-muted-foreground text-sm font-semibold">No submission found</div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen py-12 bg-background grid-pattern overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-0 w-80 h-80 bg-gradient-to-r from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-accent/10 to-primary/10 dark:from-accent/20 dark:to-primary/20 rounded-full filter blur-3xl translate-x-1/2 translate-y-1/2"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
      </div>

      <div className="container mx-auto max-w-4xl px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full glass rounded-3xl border border-border p-6 md:p-10 shadow-2xl"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8 border-b border-border pb-6">
            <div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider block mb-1">
                Submission Details
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight gradient-text-hero">
                {submission.problem_title || "Submitted Solution"}
              </h1>
            </div>
            {problemSlug && (
              <Link to={`/problems/${problemSlug}`}>
                <Button className="btn-gradient text-white rounded-xl h-10 px-5 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  Go to Problem
                </Button>
              </Link>
            )}
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap gap-4 items-center mb-6 p-4 rounded-2xl bg-secondary/20 border border-border">
            <StatusBadge status={submission.status} />
            <Badge variant="outline" className="text-xs font-mono border-border rounded-lg bg-background/50 h-7 px-2.5">
              {formatLanguage(submission.language)}
            </Badge>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
              Time Taken: <strong className="text-foreground">{submission.time_taken ?? "N/A"}</strong>
            </span>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
              Memory: <strong className="text-foreground">{submission.memory_used ?? "N/A"}</strong>
            </span>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <span className="text-xs text-muted-foreground font-medium">
              {new Date(submission.submitted_at).toLocaleString()}
            </span>
          </div>

          {/* Code block container */}
          <div className="relative rounded-2xl border border-border overflow-hidden bg-card shadow-inner max-h-[500px] overflow-y-auto mb-8">
            <div className="px-4 py-2 bg-secondary/30 border-b border-border flex items-center justify-between text-xs text-muted-foreground font-mono">
              <span>source_code.{submission.language === 'cpp' ? 'cpp' : submission.language === 'java' ? 'java' : 'py'}</span>
            </div>
            <pre className="p-5 font-mono text-sm leading-relaxed whitespace-pre overflow-x-auto text-foreground bg-transparent">
              <code>{submission.code}</code>
            </pre>
          </div>

          {/* AI Analysis Section */}
          <div className="space-y-6 pt-6 border-t border-border">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent animate-pulse" />
                AI Submission Analysis
              </h3>
              <Button
                onClick={handleAnalyzeClick}
                disabled={aiLoading}
                className="btn-gradient text-white rounded-xl h-10 px-5 text-xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer inline-flex items-center gap-2"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-white" />
                    Analyze Code
                  </>
                )}
              </Button>
            </div>

            {aiError && (
              <Alert variant="destructive" className="rounded-xl border-red-500/30 bg-red-500/10 text-red-400">
                <AlertDescription className="text-xs">{aiError}</AlertDescription>
              </Alert>
            )}

            {aiLoading && (
              <div className="space-y-3 p-6 rounded-2xl border border-border bg-secondary/10">
                <Skeleton className="h-4 w-full bg-border/50 rounded-lg" />
                <Skeleton className="h-4 w-3/4 bg-border/50 rounded-lg" />
                <Skeleton className="h-4 w-1/2 bg-border/50 rounded-lg" />
              </div>
            )}

            {aiAnalysis && !aiLoading && (
              <div className="glass-strong p-6 rounded-2xl border border-border space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {aiAnalysis.time_complexity && (
                    <div className="p-4 rounded-xl bg-secondary/20 border border-border">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Time Complexity
                      </p>
                      <p className="text-sm font-bold text-cyan-400">
                        {aiAnalysis.time_complexity}
                      </p>
                    </div>
                  )}
                  {aiAnalysis.space_complexity && (
                    <div className="p-4 rounded-xl bg-secondary/20 border border-border">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Space Complexity
                      </p>
                      <p className="text-sm font-bold text-purple-400">
                        {aiAnalysis.space_complexity}
                      </p>
                    </div>
                  )}
                </div>

                {aiAnalysis.explanation && (
                  <div className="p-4 rounded-xl bg-secondary/15 border border-border/80">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Explanation</h4>
                    <p className="text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap">{aiAnalysis.explanation}</p>
                  </div>
                )}

                {aiAnalysis.optimization && (
                  <div className="p-4 rounded-xl bg-secondary/15 border border-border/80">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Optimization Suggestions</h4>
                    <p className="text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap">{aiAnalysis.optimization}</p>
                  </div>
                )}

                {aiAnalysis.feedback && (
                  <div className="p-4 rounded-xl bg-secondary/15 border border-border/80">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Feedback</h4>
                    <p className="text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap">{aiAnalysis.feedback}</p>
                  </div>
                )}

                {aiAnalysis.errors && (
                  <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-red-450">
                    <h4 className="text-xs font-semibold uppercase tracking-wider mb-2">Detected Bugs / Errors</h4>
                    <p className="text-xs leading-relaxed whitespace-pre-wrap">{aiAnalysis.errors}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = getStatusConfig(status);
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-transparent ${config.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {formatStatus(status)}
    </div>
  );
}

function getStatusConfig(status: string) {
  switch (status) {
    case "accepted":
      return {
        classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        dot: "bg-emerald-400",
      };
    case "wrong_answer":
      return {
        classes: "bg-red-500/10 text-red-400 border-red-500/20",
        dot: "bg-red-400",
      };
    case "time_limit_exceeded":
      return {
        classes: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        dot: "bg-amber-400",
      };
    case "compilation_error":
    case "runtime_error":
    case "memory_limit_exceeded":
      return {
        classes: "bg-rose-500/10 text-rose-400 border-rose-500/20",
        dot: "bg-rose-400",
      };
    case "pending":
    case "running":
      return {
        classes: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        dot: "bg-blue-400 animate-pulse",
      };
    default:
      return {
        classes: "bg-secondary/40 text-muted-foreground border-border",
        dot: "bg-muted-foreground",
      };
  }
}

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
      return language.toUpperCase();
  }
}