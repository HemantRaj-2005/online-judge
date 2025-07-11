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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import DOMPurify from "dompurify";
import rehypeHighlight from "rehype-highlight";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import ReactMarkdown from "react-markdown";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark.css";
import { aiService } from "@/services/aiServices";
import { Button } from "@/components/ui/button";

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
      setAiResponse(""); // Reset previous response
  
      const response = await aiService.explainProblem(problem.id, token);
      console.log("AI explainProblem response:", response);
  
      // Format the response as a Markdown string
      const formatResponseAsMarkdown = (response: any): string => {
        let markdown = "";
  
        // Problem Summary
        if (response.problem_summary) {
          markdown += `## Problem Summary\n${response.problem_summary}\n\n`;
        }
  
        // Approach
        if (response.approach) {
          markdown += `## Approach\n${response.approach}\n\n`;
        }
  
        // Algorithms
        if (Array.isArray(response.algorithms) && response.algorithms.length > 0) {
          markdown += `## Algorithm\n`;
          response.algorithms.forEach((algo: any, index: number) => {
            markdown += `### ${algo.name}\n\`\`\`\n${algo.pseudocode}\n\`\`\`\n`;
          });
          markdown += "\n";
        }
  
        // Example
        if (response.example) {
          markdown += `## Example\n`;
          if (response.example.explanation) {
            markdown += `${response.example.explanation}\n\n`;
          }
          if (response.example.input) {
            markdown += `**Input**\n\`\`\`\n${response.example.input}\n\`\`\`\n`;
          }
          if (response.example.output) {
            markdown += `**Output**\n\`\`\`\n${response.example.output}\n\`\`\`\n`;
          }
        }
  
        return markdown.trim();
      };
  
      const formattedResponse = formatResponseAsMarkdown(response);
      if (formattedResponse) {
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

  const renderMarkdown = (content: string) => {
    const sanitized = DOMPurify.sanitize(content);
    return (
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
        components={{
          code({ node, className, children, ...props }) {
            const { inline } = props as { inline?: boolean };
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <div className="bg-gray-900 rounded-md p-4 my-2 overflow-x-auto">
                <code className={className} {...props}>
                  {children}
                </code>
              </div>
            ) : (
              <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">
                {children}
              </code>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">{children}</table>
              </div>
            );
          },
        }}
      >
        {sanitized}
      </ReactMarkdown>
    );
  };

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
                  <TabsTrigger value="ai-help">AI Help</TabsTrigger>
                </TabsList>
                <TabsContent
                  value="description"
                  className="markdown max-w-none pt-4 space-y-4"
                >
                  {renderMarkdown(problem.description)}
                </TabsContent>
                <TabsContent
                  value="ai-help"
                  className="markdown max-w-none pt-4 space-y-4"
                >
                  <div className="flex gap-2 mb-2">
                    <Button
                      variant={aiTab === "explanation" ? "default" : "outline"}
                      onClick={handleExplainProblem}
                      disabled={isAiLoading}
                    >
                      Explain Problem
                    </Button>
                  </div>
                  {isAiLoading && (
                    <div className="text-muted-foreground">
                      Loading AI response...
                    </div>
                  )}
                  {aiError && (
                    <Alert variant="destructive">
                      <AlertDescription>{aiError}</AlertDescription>
                    </Alert>
                  )}
                  {aiTab === "explanation" &&
                    aiResponse &&
                    !isAiLoading &&
                    !aiError && (
                      <div className="prose max-w-none">
                        {renderMarkdown(aiResponse)}
                      </div>
                    )}
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
                <CodeEditor problemSlug={slug} problemId={problem.id} />
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
