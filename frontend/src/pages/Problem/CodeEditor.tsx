import CodeMirror from "@uiw/react-codemirror";
import { githubLight, githubDark } from "@uiw/codemirror-theme-github";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { javascript } from "@codemirror/lang-javascript";
import { cpp } from "@codemirror/lang-cpp";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Maximize, Minimize, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useAppSelector } from "@/redux/hook";
import { submissionService } from "@/services/submissionService";
import { aiService } from "@/services/aiServices";

const STORAGE_KEYS = {
  theme: "code_editor_theme",
  language: "code_editor_language",
  fontSize: "code_editor_fontSize",
  lineNumbers: "code_editor_lineNumbers",
  code: (problemId: number) => `code_editor_code_${problemId}`,
};

interface CodeEditorProps {
  problemSlug: string;
  problemId: number;
  problemDescription: string;
}

export default function CodeEditor({
  problemSlug,
  problemId,
  problemDescription,
}: CodeEditorProps) {
  const username = useAppSelector((state) => state.auth.user?.username);
  const token = useAppSelector((state) => state.auth.user?.accessToken);

  // Load saved settings or use defaults
  const savedTheme = localStorage.getItem(STORAGE_KEYS.theme) ?? "githubDark";
  const savedLanguage = localStorage.getItem(STORAGE_KEYS.language) ?? "python";
  const savedFontSize = parseInt(
    localStorage.getItem(STORAGE_KEYS.fontSize) || "14"
  );
  const savedLineNumbers =
    localStorage.getItem(STORAGE_KEYS.lineNumbers) === "1";
  const savedCode =
    localStorage.getItem(STORAGE_KEYS.code(problemId)) ??
    getLanguageTemplate("python");

  // Editor state
  const [theme, setTheme] = useState(savedTheme);
  const [language, setLanguage] = useState(savedLanguage);
  const [fontSize, setFontSize] = useState(savedFontSize);
  const [lineNumbers, setLineNumbers] = useState(savedLineNumbers);
  const [code, setCode] = useState(savedCode);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submissionId, setSubmissionId] = useState<number | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);

  // AI state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<{
    positive_feedback?: string[];
    missing_elements?: string[];
    next_steps?: string[];
    pitfalls?: string[];
  } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Save settings when they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.theme, theme);
    localStorage.setItem(STORAGE_KEYS.language, language);
    localStorage.setItem(STORAGE_KEYS.fontSize, fontSize.toString());
    localStorage.setItem(STORAGE_KEYS.lineNumbers, lineNumbers ? "1" : "0");
    localStorage.setItem(STORAGE_KEYS.code(problemId), code);
  }, [theme, language, fontSize, lineNumbers, code, problemId]);

  const handleGetHint = async () => {
    if (!code.trim()) {
      toast.error("Please enter some code first");
      return;
    }

    setAiLoading(true);
    setAiError(null);
    setAiResponse(null);

    try {
      const response = await aiService.getHint(
        problemId,
        code,
        language,
        token
      );
      console.log("Raw AI Response:", response);

      // Normalize the response (ensure all fields are arrays)
      const normalizedResponse = {
        positive_feedback: Array.isArray(response.positive_feedback)
          ? response.positive_feedback
          : response.positive_feedback
          ? [response.positive_feedback]
          : [],
        missing_elements: Array.isArray(response.missing_elements)
          ? response.missing_elements
          : response.missing_elements
          ? [response.missing_elements]
          : [],
        next_steps: Array.isArray(response.next_steps)
          ? response.next_steps
          : response.next_steps
          ? [response.next_steps]
          : [],
        pitfalls: Array.isArray(response.pitfalls)
          ? response.pitfalls
          : response.pitfalls
          ? [response.pitfalls]
          : [],
      };

      console.log("Normalized AI Response:", normalizedResponse);
      setAiResponse(normalizedResponse);
      setIsDialogOpen(true);
    } catch (err) {
      setAiError("Failed to get hint. Please try again.");
      console.error("AI Error:", err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error("Please enter some code");
      return;
    }

    if (!username) {
      toast.error("Please sign in to submit your solution");
      return;
    }

    try {
      setSubmitting(true);
      setSubmissionStatus("submitting");

      const response = await submissionService.submitCode(
        problemSlug,
        code,
        language,
        username
      );
      const { id, status } = response as { id: number; status: string };
      setSubmissionId(id);
      setSubmissionStatus(status);
      toast.success("Submitted successfully");
    } catch (err) {
      toast.error("Submission failed");
      console.error("Submission error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Check submission status periodically
  useEffect(() => {
    if (!submissionId || !username) return;

    const interval = setInterval(async () => {
      try {
        const response = await submissionService.getSubmissionStatus(
          submissionId
        );
        const { status } = response as { status: string };
        setSubmissionStatus(status);

        if (status !== "pending" && status !== "running") {
          clearInterval(interval);
          if (status === "accepted") {
            toast.success("Accepted!");
          } else {
            toast.warning(`Result: ${formatStatus(status)}`);
          }
        }
      } catch (err) {
        console.error("Error checking submission status:", err);
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [submissionId, username]);

  const getThemeExtension = () => {
    switch (theme) {
      case "githubLight":
        return githubLight;
      case "githubDark":
        return githubDark;
      case "dracula":
        return dracula;
      default:
        return githubDark;
    }
  };

  const getLanguageExtension = () => {
    switch (language) {
      case "python":
        return python();
      case "javascript":
        return javascript();
      case "java":
        return java();
      case "cpp":
        return cpp();
      default:
        return python();
    }
  };

  return (
    <Card className={isFullscreen ? "fixed inset-0 z-50 h-screen" : "w-full"}>
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <CardTitle className="flex items-center gap-3">
          Code Editor
          <Badge>{language}</Badge>
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen((v) => !v)}
            className="shrink-0"
          >
            {isFullscreen ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
            )}
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <Settings className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 space-y-4">
              <div>
                <Label>Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="githubDark">GitHub Dark</SelectItem>
                    <SelectItem value="githubLight">GitHub Light</SelectItem>
                    <SelectItem value="dracula">Dracula</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Font Size: {fontSize}px</Label>
                <Slider
                  value={[fontSize]}
                  onValueChange={([v]) => setFontSize(v)}
                  min={10}
                  max={24}
                />
              </div>
              <div className="flex justify-between items-center">
                <Label>Line Numbers</Label>
                <Switch
                  checked={lineNumbers}
                  onCheckedChange={setLineNumbers}
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* AI Section */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleGetHint}
            disabled={aiLoading || submitting}
            variant="outline"
          >
            {aiLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Get AI Hint
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>AI Hints for Your Code</DialogTitle>
                <DialogDescription>
                  Review the AI-generated feedback to improve your code,
                  including positive aspects, missing elements, next steps, and
                  potential pitfalls.
                </DialogDescription>
              </DialogHeader>
              {/* // Replace the dialog content section with this fixed version: */}
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
                {aiLoading && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing your code...
                  </div>
                )}
                {aiError && (
                  <Alert variant="destructive">
                    <AlertDescription>{aiError}</AlertDescription>
                  </Alert>
                )}
                {aiResponse && (
                  <div className="space-y-4">
                    {aiResponse.positive_feedback.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-green-600 dark:text-green-400">
                          What's Good:
                        </h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          {aiResponse.positive_feedback.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {aiResponse.missing_elements.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-yellow-600 dark:text-yellow-400">
                          What's Missing:
                        </h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          {aiResponse.missing_elements.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {aiResponse.next_steps.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-blue-600 dark:text-blue-400">
                          Next Steps:
                        </h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          {aiResponse.next_steps.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {aiResponse.pitfalls.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-red-600 dark:text-red-400">
                          Watch Out For:
                        </h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          {aiResponse.pitfalls.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {!aiResponse.positive_feedback.length &&
                      !aiResponse.missing_elements.length &&
                      !aiResponse.next_steps.length &&
                      !aiResponse.pitfalls.length && (
                        <Alert variant="destructive">
                          <AlertDescription>
                            No feedback available from AI response.
                          </AlertDescription>
                        </Alert>
                      )}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Editor Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Select
            value={language}
            onValueChange={(lang) => {
              setLanguage(lang);
              setCode(getLanguageTemplate(lang));
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="java">Java</SelectItem>
              <SelectItem value="cpp">C++</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 sm:flex-none"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              "Submit Code"
            )}
          </Button>
        </div>

        {/* Code Editor */}
        <div className="border rounded-md overflow-hidden">
          <CodeMirror
            value={code}
            height="400px"
            extensions={[getThemeExtension(), getLanguageExtension()]}
            onChange={setCode}
            theme={getThemeExtension()}
            style={{ fontSize: `${fontSize}px` }}
            basicSetup={{
              lineNumbers,
              highlightActiveLine: true,
              highlightSelectionMatches: true,
              autocompletion: true,
            }}
          />
        </div>

        {/* Submission Status */}
        {submissionStatus && (
          <Alert variant={getStatusVariant(submissionStatus)}>
            <AlertDescription>
              <span className="font-medium">Status:</span>{" "}
              {formatStatus(submissionStatus)}
              {submissionId && (
                <span className="block text-sm mt-1">
                  Submission ID: {submissionId}
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

// Helper functions
function formatStatus(status: string) {
  return status
    .split("_")
    .map((s) => s[0].toUpperCase() + s.slice(1))
    .join(" ");
}

function getStatusVariant(status: string) {
  if (["accepted"].includes(status)) return "default";
  if (["compilation_error", "wrong_answer", "runtime_error"].includes(status))
    return "destructive";
  return "default";
}

function getLanguageTemplate(language: string): string {
  switch (language) {
    case "python":
      return `def solution():\n    # Your code here\n    pass`;
    case "javascript":
      return `function solution() {\n  // Your code here\n}`;
    case "java":
      return `public class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}`;
    case "cpp":
      return `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    // Your code here\n    return 0;\n}`;
    default:
      return "";
  }
}
