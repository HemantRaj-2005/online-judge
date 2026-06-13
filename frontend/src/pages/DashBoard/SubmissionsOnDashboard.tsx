import { useState, useEffect } from "react";
import {
  submissionService,
  type Submission,
} from "@/services/submissionService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { FileCode2 } from "lucide-react";

interface SubmissionsOnDashboardProps {
  username?: string;
  limit?: number;
}

export default function SubmissionsOnDashboard({
  username,
  limit,
}: SubmissionsOnDashboardProps) {
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
          setError("User not found");
          setLoading(false);
          return;
        }
        const response = (await submissionService.getUserSubmissions(
          username
        )) as Submission[];
        const limitedSubmissions = limit
          ? response.slice(0, limit)
          : response;
        setSubmissions(limitedSubmissions);
        setError(null);
      } catch (err) {
        setError("Failed to fetch submission history");
        console.error("Error fetching submissions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [username, limit]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="rounded-xl">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-10">
        <FileCode2 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No submissions yet</p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Start solving problems to see your history here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl">
      <Table>
        <TableHeader>
          <TableRow className="border-white/[0.04] hover:bg-transparent">
            <TableHead className="text-xs font-medium text-muted-foreground">
              Problem
            </TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">
              Status
            </TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">
              Lang
            </TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">
              Time
            </TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">
              Memory
            </TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">
              Date
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((submission) => (
            <TableRow
              key={submission.id}
              onClick={() => navigate(`/submissions/${submission.id}`)}
              className="cursor-pointer border-white/[0.04] hover:bg-white/[0.02] transition-colors"
            >
              <TableCell className="font-medium text-sm">
                {submission.problem_title || submission.problem}
              </TableCell>
              <TableCell>
                <StatusBadge status={submission.status} />
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className="text-[10px] font-mono border-white/[0.08] rounded-md"
                >
                  {formatLanguage(submission.language)}
                </Badge>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {submission.time_taken
                  ? `${submission.time_taken}ms`
                  : "—"}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {submission.memory_used
                  ? `${submission.memory_used}MB`
                  : "—"}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {new Date(submission.submitted_at).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = getStatusConfig(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-md ${config.classes}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {formatStatus(status)}
    </span>
  );
}

function getStatusConfig(status: string) {
  switch (status) {
    case "accepted":
      return {
        classes: "bg-emerald-500/10 text-emerald-400",
        dot: "bg-emerald-400",
      };
    case "wrong_answer":
      return {
        classes: "bg-red-500/10 text-red-400",
        dot: "bg-red-400",
      };
    case "time_limit_exceeded":
      return {
        classes: "bg-amber-500/10 text-amber-400",
        dot: "bg-amber-400",
      };
    case "compilation_error":
    case "runtime_error":
    case "memory_limit_exceeded":
      return {
        classes: "bg-rose-500/10 text-rose-400",
        dot: "bg-rose-400",
      };
    case "pending":
    case "running":
      return {
        classes: "bg-blue-500/10 text-blue-400",
        dot: "bg-blue-400 animate-pulse",
      };
    default:
      return {
        classes: "bg-white/[0.04] text-muted-foreground",
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
      return "PY";
    case "java":
      return "JAVA";
    case "cpp":
      return "C++";
    default:
      return language.toUpperCase();
  }
}