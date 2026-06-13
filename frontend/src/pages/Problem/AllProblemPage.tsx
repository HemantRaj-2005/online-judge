import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAppSelector } from "@/redux/hook";
import {
  problemService,
  type Problem,
  type Topic,
} from "@/services/problemService";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function AllProblemPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [filtered, setFiltered] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState<string | null>(null);
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        const response = await problemService.getAllProblems();
        setProblems(response);
        setFiltered(response);
        setError(null);
      } catch (err) {
        setError("Failed to fetch problems");
        console.error("Error fetching problems:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, [user?.accessToken]);

  useEffect(() => {
    let result = problems;
    if (search) {
      result = result.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (diffFilter) {
      result = result.filter((p) => p.difficulty === diffFilter);
    }
    setFiltered(result);
  }, [search, diffFilter, problems]);

  const getTopicName = (topic: string | Topic): string => {
    return typeof topic === "string" ? topic : topic.name;
  };

  const formatDifficulty = (difficulty: string) => {
    if (difficulty === "veryeasy") return "Very Easy";
    if (difficulty === "veryhard") return "Very Hard";
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  const getDifficultyClasses = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
      case "veryeasy":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "medium":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "hard":
      case "veryhard":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-white/[0.04] text-muted-foreground";
    }
  };

  const difficulties = ["easy", "medium", "hard"];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-destructive font-medium">{error}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="container mx-auto px-4 py-8 max-w-6xl"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Problem<span className="gradient-text">set</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Browse and solve coding challenges across all difficulty levels.
        </p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
          <Input
            placeholder="Search problems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 rounded-xl bg-white/[0.02] border-white/[0.08] focus:border-primary/40"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground hidden sm:block" />
          {difficulties.map((d) => (
            <button
              key={d}
              onClick={() => setDiffFilter(diffFilter === d ? null : d)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                diffFilter === d
                  ? getDifficultyClasses(d)
                  : "border-white/[0.06] text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
              )}
            >
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
          {diffFilter && (
            <button
              onClick={() => setDiffFilter(null)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden glow-border">
        <Table>
          <TableHeader>
            <TableRow className="border-white/[0.04] hover:bg-transparent">
              <TableHead className="text-xs font-medium text-muted-foreground w-16">
                #
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">
                Title
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground w-28">
                Difficulty
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">
                Topics
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground w-32">
                Author
              </TableHead>
              {user?.isAuthor && (
                <TableHead className="text-xs font-medium text-muted-foreground w-20">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={user?.isAuthor ? 6 : 5}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  No problems found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((problem) => (
                <TableRow
                  key={problem.id}
                  className="cursor-pointer border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                >
                  <TableCell
                    className="font-mono text-xs text-muted-foreground"
                    onClick={() => navigate(`/problems/${problem.slug}`)}
                  >
                    {problem.id}
                  </TableCell>
                  <TableCell
                    className="font-medium text-sm text-foreground hover:text-primary transition-colors"
                    onClick={() => navigate(`/problems/${problem.slug}`)}
                  >
                    {problem.title}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border",
                        getDifficultyClasses(problem.difficulty)
                      )}
                    >
                      {formatDifficulty(problem.difficulty)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {problem.topics.slice(0, 3).map((topic, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-[10px] border-white/[0.08] text-muted-foreground rounded-md"
                        >
                          {getTopicName(topic)}
                        </Badge>
                      ))}
                      {problem.topics.length > 3 && (
                        <span className="text-[10px] text-muted-foreground/50">
                          +{problem.topics.length - 3}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {problem.author}
                  </TableCell>
                  {user?.isAuthor && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-primary hover:text-primary/80"
                        onClick={() =>
                          navigate(`/problems/${problem.slug}/edit-problem`)
                        }
                      >
                        Edit
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Result count */}
      <p className="text-xs text-muted-foreground/50 mt-4 text-center">
        Showing {filtered.length} of {problems.length} problems
      </p>
    </motion.div>
  );
}
