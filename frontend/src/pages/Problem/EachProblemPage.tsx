import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  problemService,
  type Problem,
  type Topic,
} from "@/services/problemService";
import { useAppSelector } from "@/redux/hook";
import CodeEditor from "./CodeEditor";
import SubmissionHistory from "./SubmissionHistory";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export default function EachProblemPage() {
  const { slug } = useParams<{ slug: string }>();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = useAppSelector((state) => state.auth.user?.accessToken);
  const isAuthenticated = !!token;
  const username = useAppSelector((state) => state.auth.user?.username);

  useEffect(() => {
    const fetchProblem = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        const response = await problemService.getProblemBySlug(slug);
        setProblem(response);
        setError(null);
      } catch (err) {
        setError("Failed to fetch problem details");
        console.error("Error fetching problem:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [slug, token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  if (error || !problem) {
    return (
      <div className="flex justify-center items-center h-64">
        <Alert variant="destructive" className="w-auto">
          <AlertDescription>
            Error: {error || "Problem not found"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const formatDifficulty = (difficulty: string) => {
    if (difficulty === "veryeasy") return "Very Easy";
    if (difficulty === "veryhard") return "Very Hard";
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  return (
    <div className="h-full p-4">
      <ResizablePanelGroup
        direction="horizontal"
        className="min-h-[calc(100vh-8rem)] rounded-lg border"
      >
        <ResizablePanel defaultSize={50} minSize={30}>
          <ScrollArea className="h-full p-4">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    {problem.title}
                  </h1>
                  <div className="flex items-center gap-2 mt-2">
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
                    <span className="text-sm text-muted-foreground">
                      Time Limit: {problem.time_limit}ms
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Memory Limit: {problem.memory_limit}MB
                    </span>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Author: {problem.author}
                </div>
              </div>

              {problem.topics.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {problem.topics.map((topic, index) => (
                    <Badge key={index} variant="secondary">
                      {typeof topic === "string" ? topic : topic.name}
                    </Badge>
                  ))}
                </div>
              )}

              <Separator />

              <Tabs defaultValue="description" className="w-full">
                <TabsList>
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="examples">Examples</TabsTrigger>
                  <TabsTrigger value="constraints">Constraints</TabsTrigger>
                </TabsList>
                <TabsContent
                  value="description"
                  className="prose max-w-none pt-4"
                >
                  <div
                    dangerouslySetInnerHTML={{ __html: problem.description }}
                  />
                </TabsContent>
                <TabsContent value="examples" className="pt-4">
                  {/* Add your examples content here */}
                  <p>Examples will be shown here</p>
                </TabsContent>
                <TabsContent value="constraints" className="pt-4">
                  {/* Add your constraints content here */}
                  <p>Constraints will be shown here</p>
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={50} minSize={30}>
          <Tabs defaultValue="editor" className="h-full flex flex-col">
            <TabsList className="px-4 pt-2">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="submissions">Submissions</TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="flex-1 p-4 overflow-auto">
              {slug && isAuthenticated ? (
                <CodeEditor problemSlug={slug} />
              ) : (
                <Card className="h-full flex items-center justify-center">
                  <CardContent className="text-center p-6">
                    <Alert>
                      <AlertDescription>
                        Please sign in to submit your solution.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="submissions" className="flex-1 overflow-auto">
              {slug && isAuthenticated ? (
                <SubmissionHistory problemSlug={slug} username={username} />
              ) : (
                <Card className="h-full flex items-center justify-center">
                  <CardContent className="text-center p-6">
                    <Alert>
                      <AlertDescription>
                        Please sign in to view your submissions.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
