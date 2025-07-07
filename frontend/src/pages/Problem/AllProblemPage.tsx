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

export default function AllProblemPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAppSelector((state) => state.auth);
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
  }, [user?.accessToken]);

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
      <div className="rounded-md border overflow-x-auto w-full">
        <Table className="min-w-[70rem] text-sm">
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[4rem]">ID</TableHead>
              <TableHead className="w-[20rem]">Title</TableHead>
              <TableHead className="w-[12rem]">Difficulty</TableHead>
              <TableHead className="w-[20rem]">Topics</TableHead>
              <TableHead className="w-[18rem]">Author</TableHead>
              {user?.isAuthor ? (
                <TableHead className="w-[12rem]">Actions</TableHead>
              ) : null}
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
                >
                  <TableCell
                    className="font-medium"
                    onClick={() => navigate(`/problems/${problem.slug}`)}
                  >
                    {problem.id}
                  </TableCell>
                  <TableCell
                    className="font-medium"
                    onClick={() => navigate(`/problems/${problem.slug}`)}
                  >
                    {problem.title}
                  </TableCell>
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
                  {user?.isAuthor ? (
                    <TableCell className="w-[12rem]">
                      <Button
                        variant="link"
                        onClick={() =>
                          navigate(`/problems/${problem.slug}/edit-problem`)
                        }
                      >
                        Edit
                      </Button>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
