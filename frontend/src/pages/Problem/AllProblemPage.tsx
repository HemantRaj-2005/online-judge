import {
  Table,
  TableBody,
  TableCaption,
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

export default function AllProblemPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = useAppSelector((state) => state.auth.user?.accessToken);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        const response = await problemService.getAllProblems();
        setProblems(response);
        setError(null);
      } catch (err) {
        setError("Failed to fetch problems");
        console.error("Error fetching problems:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, [token]);

  const getTopicName = (topic: string | Topic): string => {
    return typeof topic === "string" ? topic : topic.name;
  };

  const formatDifficulty = (difficulty: string) => {
    if (difficulty === "veryeasy") return "Very Easy";
    if (difficulty === "veryhard") return "Very Hard";
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-red-500 text-center text-2xl font-bold p-8">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Problems</h1>
      </div>

      {/* ✅ Desktop Table View */}
      <div className="rounded-md border overflow-x-auto w-full hidden md:block">
        <Table className="min-w-[700px] text-sm">
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead className="w-[200px]">Title</TableHead>
              <TableHead className="w-[120px]">Difficulty</TableHead>
              <TableHead>Topics</TableHead>
              <TableHead className="w-[180px]">Author</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {problems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No problems found
                </TableCell>
              </TableRow>
            ) : (
              problems.map((problem) => (
                <TableRow
                  key={problem.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/problems/${problem.slug}`)}
                >
                  <TableCell className="font-medium">{problem.id}</TableCell>
                  <TableCell className="font-medium">{problem.title}</TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        problem.difficulty === "easy" ||
                          problem.difficulty === "veryeasy"
                          ? "bg-green-100 text-green-800 hover:bg-green-100/80 border-green-200"
                          : problem.difficulty === "medium"
                          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80 border-yellow-200"
                          : "bg-red-100 text-red-800 hover:bg-red-100/80 border-red-200"
                      )}
                    >
                      {formatDifficulty(problem.difficulty)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {problem.topics.map((topic, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-muted-foreground"
                        >
                          {getTopicName(topic)}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {problem.author}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ✅ Mobile Card View */}
      <div className="md:hidden flex flex-col gap-4">
        {problems.length === 0 ? (
          <div className="text-center text-muted-foreground">
            No problems found
          </div>
        ) : (
          problems.map((problem) => (
            <div
              key={problem.id}
              onClick={() => navigate(`/problems/${problem.slug}`)}
              className="border rounded-lg p-4 shadow-sm hover:bg-muted/50 transition cursor-pointer"
            >
              <div className="text-lg font-semibold">{problem.title}</div>
              <div className="mt-1">
                <Badge
                  className={cn(
                    problem.difficulty === "easy" ||
                      problem.difficulty === "veryeasy"
                      ? "bg-green-100 text-green-800 hover:bg-green-100/80 border-green-200"
                      : problem.difficulty === "medium"
                      ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80 border-yellow-200"
                      : "bg-red-100 text-red-800 hover:bg-red-100/80 border-red-200"
                  )}
                >
                  {formatDifficulty(problem.difficulty)}
                </Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {problem.topics.map((topic, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="text-muted-foreground"
                  >
                    {getTopicName(topic)}
                  </Badge>
                ))}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Author: {problem.author}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
