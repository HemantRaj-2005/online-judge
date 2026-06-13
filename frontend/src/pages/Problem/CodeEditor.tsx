import CodeMirror from "@uiw/react-codemirror";
import { githubLight, githubDark } from "@uiw/codemirror-theme-github";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { javascript } from "@codemirror/lang-javascript";
import { cpp } from "@codemirror/lang-cpp";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/dialog";
import { Loader2, Maximize, Minimize, Settings, Send, Sparkles } from "lucide-react";
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

  useEffect(() => {
    // Read problemDescription to prevent TS6133 unused variable error
    if (problemDescription) {
      // noop
    }
  }, [problemDescription]);

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
  interface AIHintResponse {
    hint: string;
    approach: string[];
    derivation: { step: number; content: string }[];
    complexity: { time: string; space: string };
  }

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<AIHintResponse | null>(null);
  const [activeHintLevel, setActiveHintLevel] = useState<number>(1);
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
      ) as any;
      console.log("Raw AI Response:", response);

      const normalizedResponse: AIHintResponse = {
        hint: response.hint || "Try checking your code logic.",
        approach: Array.isArray(response.approach) ? response.approach : [],
        derivation: Array.isArray(response.derivation) ? response.derivation : [],
        complexity: response.complexity || { time: "N/A", space: "N/A" }
      };
      setAiResponse(normalizedResponse);
      setActiveHintLevel(1);
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

  const hintLevels = [
    { level: 1, label: "Observation" },
    { level: 2, label: "Approach" },
    { level: 3, label: "Derivation" },
    { level: 4, label: "Complexity" },
  ];

  return (
    <div
      className={
        isFullscreen
          ? "fixed inset-0 z-50 bg-background flex flex-col"
          : "w-full flex flex-col glass rounded-2xl overflow-hidden glow-border"
      }
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-foreground">Editor</span>
          <Badge variant="outline" className="text-[10px] font-mono border-white/[0.08] rounded-md">
            {language.toUpperCase()}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen((v) => !v)}
            className="h-8 w-8 rounded-lg hover:bg-white/[0.06]"
          >
            {isFullscreen ? (
              <Minimize className="h-3.5 w-3.5" />
            ) : (
              <Maximize className="h-3.5 w-3.5" />
            )}
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-white/[0.06]"
              >
                <Settings className="h-3.5 w-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 space-y-4 glass-strong rounded-xl border-white/[0.08]">
              <div>
                <Label className="text-xs">Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="mt-1.5 h-9 rounded-lg bg-white/[0.02] border-white/[0.08]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-strong rounded-xl border-white/[0.08]">
                    <SelectItem value="githubDark">GitHub Dark</SelectItem>
                    <SelectItem value="githubLight">GitHub Light</SelectItem>
                    <SelectItem value="dracula">Dracula</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Font Size: {fontSize}px</Label>
                <Slider
                  value={[fontSize]}
                  onValueChange={([v]) => setFontSize(v)}
                  min={10}
                  max={24}
                  className="mt-2"
                />
              </div>
              <div className="flex justify-between items-center">
                <Label className="text-xs">Line Numbers</Label>
                <Switch
                  checked={lineNumbers}
                  onCheckedChange={setLineNumbers}
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06]">
        <Select
          value={language}
          onValueChange={(lang) => {
            setLanguage(lang);
            setCode(getLanguageTemplate(lang));
          }}
        >
          <SelectTrigger className="w-32 h-8 text-xs rounded-lg bg-white/[0.02] border-white/[0.08]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="glass-strong rounded-xl border-white/[0.08]">
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="java">Java</SelectItem>
            <SelectItem value="cpp">C++</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex-1" />

        <Button
          onClick={handleGetHint}
          disabled={aiLoading || submitting}
          variant="outline"
          size="sm"
          className="h-8 rounded-lg text-xs border-white/[0.08] hover:bg-white/[0.04] gap-1.5"
        >
          {aiLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          )}
          AI Hint
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={submitting}
          size="sm"
          className="h-8 rounded-lg text-xs btn-gradient text-white gap-1.5"
        >
          {submitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              Submit
            </>
          )}
        </Button>
      </div>

      {/* Code Editor */}
      <div className="flex-1 min-h-0">
        <CodeMirror
          value={code}
          height={isFullscreen ? "calc(100vh - 180px)" : "400px"}
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
        <div className="px-4 py-3 border-t border-white/[0.06]">
          <SubmissionStatusBar
            status={submissionStatus}
            submissionId={submissionId}
          />
        </div>
      )}

      {/* AI Hint Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl glass-strong rounded-2xl border-white/[0.08]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              AI Hints
            </DialogTitle>
            <DialogDescription>
              Progressive hints to guide your problem-solving approach.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {aiLoading && (
              <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Analyzing your code...</span>
              </div>
            )}
            {aiError && (
              <Alert variant="destructive" className="rounded-xl">
                <AlertDescription>{aiError}</AlertDescription>
              </Alert>
            )}
            {aiResponse && (
              <div className="space-y-4">
                {/* Level Tabs */}
                <div className="flex rounded-xl bg-white/[0.03] p-1 gap-1">
                  {hintLevels.map(({ level, label }) => (
                    <button
                      key={level}
                      className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                        activeHintLevel === level
                          ? "bg-primary/[0.15] text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      onClick={() => setActiveHintLevel(level)}
                    >
                      <span className="block">L{level}</span>
                      <span className="block text-[10px] opacity-60 mt-0.5">
                        {label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Content */}
                <div className="space-y-3 min-h-[120px]">
                  {activeHintLevel >= 1 && (
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <h4 className="text-sm font-semibold text-foreground mb-2">
                        Observation
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {aiResponse.hint}
                      </p>
                    </div>
                  )}
                  {activeHintLevel >= 2 && (
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <h4 className="text-sm font-semibold text-foreground mb-2">
                        Strategic Approach
                      </h4>
                      {aiResponse.approach?.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                          {aiResponse.approach.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No approach details provided.
                        </p>
                      )}
                    </div>
                  )}
                  {activeHintLevel >= 3 && (
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <h4 className="text-sm font-semibold text-foreground mb-2">
                        Step-by-Step
                      </h4>
                      {aiResponse.derivation?.length > 0 ? (
                        <div className="space-y-2">
                          {aiResponse.derivation.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2 text-sm"
                            >
                              <span className="font-mono text-xs text-primary min-w-[40px]">
                                {String(item.step || idx + 1).padStart(2, "0")}
                              </span>
                              <span className="text-muted-foreground flex-1">
                                {item.content}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No derivation steps provided.
                        </p>
                      )}
                    </div>
                  )}
                  {activeHintLevel >= 4 && (
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <h4 className="text-sm font-semibold text-foreground mb-2">
                        Complexity Analysis
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                          <span className="text-[10px] text-muted-foreground block">
                            Time
                          </span>
                          <span className="font-mono font-bold text-primary text-sm">
                            {aiResponse.complexity?.time || "O(?)"}
                          </span>
                        </div>
                        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                          <span className="text-[10px] text-muted-foreground block">
                            Space
                          </span>
                          <span className="font-mono font-bold text-primary text-sm">
                            {aiResponse.complexity?.space || "O(?)"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-[10px] text-muted-foreground/50 italic border-t border-white/[0.06] pt-3">
                  AI-generated hints may be inaccurate. Always verify before using.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Submission status bar component
function SubmissionStatusBar({
  status,
  submissionId,
}: {
  status: string;
  submissionId: number | null;
}) {
  const config = getStatusConfig(status);
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${config.bg}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      <span className={`font-medium ${config.text}`}>
        {formatStatus(status)}
      </span>
      {submissionId && (
        <span className="text-xs text-muted-foreground ml-auto">
          #{submissionId}
        </span>
      )}
    </div>
  );
}

function getStatusConfig(status: string) {
  switch (status) {
    case "accepted":
      return {
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        dot: "bg-emerald-400",
      };
    case "wrong_answer":
      return {
        bg: "bg-red-500/10",
        text: "text-red-400",
        dot: "bg-red-400",
      };
    case "time_limit_exceeded":
      return {
        bg: "bg-amber-500/10",
        text: "text-amber-400",
        dot: "bg-amber-400",
      };
    case "pending":
    case "running":
    case "submitting":
      return {
        bg: "bg-blue-500/10",
        text: "text-blue-400",
        dot: "bg-blue-400 animate-pulse",
      };
    default:
      return {
        bg: "bg-rose-500/10",
        text: "text-rose-400",
        dot: "bg-rose-400",
      };
  }
}

function formatStatus(status: string) {
  return status
    .split("_")
    .map((s) => s[0].toUpperCase() + s.slice(1))
    .join(" ");
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
