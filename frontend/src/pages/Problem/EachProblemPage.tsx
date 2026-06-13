import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { problemService, type Problem } from "@/services/problemService";
import { useAppSelector } from "@/redux/hook";
import CodeEditor from "./CodeEditor";
import SubmissionHistory from "./SubmissionHistory";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import ReactMarkdown from "react-markdown";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark.css";
import { aiService } from "@/services/aiServices";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Clock, HardDrive } from "lucide-react";

export default function EachProblemPage() {
  const { slug } = useParams<{ slug: string }>();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiTab, setAiTab] = useState<string>("explanation");
  const [aiResponse, setAiResponse] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const token = useAppSelector((state) => state.auth.user?.accessToken);
  const isAuthenticated = !!token;
  const username = useAppSelector((state) => state.auth.user?.username);

  const handleExplainProblem = async () => {
    if (!problem) return;
    try {
      setIsAiLoading(true);
      setAiError(null);
      setAiResponse("");

      const response = await aiService.explainProblem(problem.id, token);
      console.log("AI explainProblem response:", response);

      const formatResponseAsMarkdown = (data: any): string => {
        let markdown = "";

        if (data?.problem_summary) {
          markdown += `## Problem Summary\n${data.problem_summary}\n\n`;
        } else {
          markdown += `## Problem Summary\nNo summary provided.\n\n`;
        }

        if (data?.approach) {
          markdown += `## Approach\n${data.approach}\n\n`;
        } else {
          markdown += `## Approach\nNo approach provided.\n\n`;
        }

        if (Array.isArray(data?.algorithms) && data.algorithms.length > 0) {
          markdown += `## Algorithm\n`;
          data.algorithms.forEach((algo: any, index: number) => {
            const name = algo.algorithm_name || `Algorithm ${index + 1}`;
            const pseudocode = Array.isArray(algo.pseudocode)
              ? algo.pseudocode.join("\n")
              : algo.pseudocode || "No pseudocode provided";
            markdown += `### ${name}\n\`\`\`\n${pseudocode}\n\`\`\`\n`;
          });
          markdown += "\n";
        } else {
          markdown += `## Algorithm\nNo algorithm provided.\n\n`;
        }

        if (data?.example) {
          markdown += `## Example\n`;
          if (data.example.input) {
            markdown += `**Input**\n\`\`\`json\n${JSON.stringify(
              data.example.input,
              null,
              2
            )}\n\`\`\`\n`;
          }
          if (data.example.explanation) {
            markdown += `**Explanation**\n${data.example.explanation}\n\n`;
          }
          if (data.example.output) {
            markdown += `**Output**\n\`\`\`\n${data.example.output}\n\`\`\`\n`;
          }
        } else {
          markdown += `## Example\nNo example provided.\n`;
        }

        return markdown.trim();
      };

      const data = (response as any).data || response;
      console.log("Processed data:", JSON.stringify(data, null, 2));

      const formattedResponse = formatResponseAsMarkdown(data);
      if (
        formattedResponse &&
        formattedResponse !==
          "## Problem Summary\nNo summary provided.\n\n## Approach\nNo approach provided.\n\n## Algorithm\nNo algorithm provided.\n\n## Example\nNo example provided."
      ) {
        setAiResponse(formattedResponse);
      } else {
        setAiError("No valid explanation received from AI.");
      }
      setAiTab("explanation");
    } catch (err) {
      setAiError("Failed to get explanation");
      console.error("AI Error:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

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

  const formatDifficulty = (difficulty: string) => {
    const map: Record<string, string> = {
      veryeasy: "Very Easy",
      easy: "Easy",
      medium: "Medium",
      hard: "Hard",
      veryhard: "Very Hard",
    };
    return map[difficulty] || difficulty;
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="flex justify-center items-center h-64">
        <Alert variant="destructive" className="w-auto rounded-xl">
          <AlertDescription>
            {error || "Problem not found"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-full p-3">
      <ResizablePanelGroup
        direction="horizontal"
        className="min-h-[calc(100vh-6rem)] rounded-2xl border border-white/[0.06] overflow-hidden"
      >
        {/* Left Panel — Problem Description */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <ScrollArea className="h-full">
            <div className="p-5 space-y-5">
              {/* Problem Header */}
              <div>
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-xl font-bold text-foreground tracking-tight">
                    {problem.title}
                  </h1>
                  <span className="text-xs text-muted-foreground/60 shrink-0">
                    by {problem.author}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-3">
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border",
                      getDifficultyClasses(problem.difficulty)
                    )}
                  >
                    {formatDifficulty(problem.difficulty)}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {problem.time_limit}ms
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <HardDrive className="w-3 h-3" />
                    {problem.memory_limit}MB
                  </div>
                </div>
              </div>

              {/* Topics */}
              {problem.topics.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {problem.topics.map((topic, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-[10px] border-white/[0.08] text-muted-foreground rounded-md"
                    >
                      {typeof topic === "string" ? topic : topic.name}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Separator */}
              <div className="h-px bg-white/[0.06]" />

              {/* Tabs */}
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="bg-white/[0.03] rounded-xl p-1 h-auto">
                  <TabsTrigger
                    value="description"
                    className="rounded-lg text-xs data-[state=active]:bg-white/[0.06] data-[state=active]:text-foreground"
                  >
                    Description
                  </TabsTrigger>
                  <TabsTrigger
                    value="ai-help"
                    className="rounded-lg text-xs data-[state=active]:bg-white/[0.06] data-[state=active]:text-foreground gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    AI Help
                  </TabsTrigger>
                </TabsList>

                <TabsContent
                  value="description"
                  className="markdown max-w-none pt-4 space-y-4"
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {problem.description || "*No description available*"}
                  </ReactMarkdown>
                </TabsContent>

                <TabsContent
                  value="ai-help"
                  className="max-w-none pt-4 space-y-4"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExplainProblem}
                    disabled={isAiLoading}
                    className="rounded-lg text-xs border-white/[0.08] hover:bg-white/[0.04] gap-1.5"
                  >
                    {isAiLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                    )}
                    Explain Problem
                  </Button>

                  {isAiLoading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating explanation...
                    </div>
                  )}

                  {aiError && (
                    <Alert variant="destructive" className="rounded-xl">
                      <AlertDescription>{aiError}</AlertDescription>
                    </Alert>
                  )}

                  {aiTab === "explanation" &&
                    aiResponse &&
                    !isAiLoading &&
                    !aiError && (
                      <div className="markdown max-w-none space-y-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                        <ReactMarkdown
                          remarkPlugins={[remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                        >
                          {aiResponse || "*No AI response available*"}
                        </ReactMarkdown>
                      </div>
                    )}
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-white/[0.03] hover:bg-primary/20 transition-colors" />

        {/* Right Panel — Editor / Submissions */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <Tabs defaultValue="editor" className="h-full flex flex-col">
            <TabsList className="mx-3 mt-3 bg-white/[0.03] rounded-xl p-1 h-auto w-fit">
              <TabsTrigger
                value="editor"
                className="rounded-lg text-xs data-[state=active]:bg-white/[0.06] data-[state=active]:text-foreground"
              >
                Editor
              </TabsTrigger>
              <TabsTrigger
                value="submissions"
                className="rounded-lg text-xs data-[state=active]:bg-white/[0.06] data-[state=active]:text-foreground"
              >
                Submissions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="flex-1 p-3 overflow-auto">
              {slug && isAuthenticated ? (
                <CodeEditor
                  problemSlug={slug}
                  problemId={problem.id}
                  problemDescription={problem.description}
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="glass rounded-2xl p-6 text-center max-w-sm">
                    <p className="text-sm text-muted-foreground">
                      Please sign in to submit your solution.
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent
              value="submissions"
              className="flex-1 overflow-auto p-3"
            >
              {slug && isAuthenticated ? (
                <SubmissionHistory problemSlug={slug} username={username} />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="glass rounded-2xl p-6 text-center max-w-sm">
                    <p className="text-sm text-muted-foreground">
                      Please sign in to view your submissions.
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
