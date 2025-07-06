import CodeMirror from "@uiw/react-codemirror";
import { githubLight, githubDark } from "@uiw/codemirror-theme-github";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { monokai } from "@uiw/codemirror-theme-monokai";
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
import { Loader2, Maximize, Minimize, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useAppSelector } from "@/redux/hook";
import { submissionService } from "@/services/submissionService";

const STORAGE_KEYS = {
  theme: "code_editor_theme",
  language: "code_editor_language",
  fontSize: "code_editor_fontSize",
  lineNumbers: "code_editor_lineNumbers",
  code: "code_editor_code",
};

function saveEditorSettings({
  theme,
  language,
  fontSize,
  lineNumbers,
  code,
}: {
  theme: string;
  language: string;
  fontSize: number;
  lineNumbers: boolean;
  code: string;
}) {
  localStorage.setItem(STORAGE_KEYS.theme, theme);
  localStorage.setItem(STORAGE_KEYS.language, language);
  localStorage.setItem(STORAGE_KEYS.fontSize, fontSize.toString());
  localStorage.setItem(STORAGE_KEYS.lineNumbers, lineNumbers ? "1" : "0");
  localStorage.setItem(STORAGE_KEYS.code, code);
}

function loadEditorSettings() {
  return {
    theme: localStorage.getItem(STORAGE_KEYS.theme) ?? "githubDark",
    language: localStorage.getItem(STORAGE_KEYS.language) ?? "python",
    fontSize: parseInt(localStorage.getItem(STORAGE_KEYS.fontSize) || "14"),
    lineNumbers: localStorage.getItem(STORAGE_KEYS.lineNumbers) === "1",
    code:
      localStorage.getItem(STORAGE_KEYS.code) ?? getLanguageTemplate("python"),
  };
}

const THEMES = [
  { name: "GitHub Dark", value: "githubDark", extension: githubDark },
  { name: "GitHub Light", value: "githubLight", extension: githubLight },
  { name: "Dracula", value: "dracula", extension: dracula },
  { name: "Monokai", value: "monokai", extension: monokai },
];

const LANGUAGES = [
  { label: "Python", value: "python", extension: python },
  { label: "JavaScript", value: "javascript", extension: javascript },
  { label: "Java", value: "java", extension: java },
  { label: "C++", value: "cpp", extension: cpp },
];

interface CodeEditorProps {
  problemSlug: string;
}

export default function CodeEditor({ problemSlug }: CodeEditorProps) {
  const username = useAppSelector((state) => state.auth.user?.username);
  const saved = loadEditorSettings();

  const [theme, setTheme] = useState(
    THEMES.find((t) => t.value === saved.theme)?.extension || githubDark
  );
  const [language, setLanguage] = useState(saved.language);
  const [fontSize, setFontSize] = useState(saved.fontSize);
  const [lineNumbers, setLineNumbers] = useState(saved.lineNumbers);
  const [code, setCode] = useState(saved.code);

  const [submitting, setSubmitting] = useState(false);
  const [submissionId, setSubmissionId] = useState<number | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState("");

  useEffect(() => {
    const themeValue =
      THEMES.find((t) => t.extension === theme)?.value ?? "githubDark";
    saveEditorSettings({
      theme: themeValue,
      language,
      fontSize,
      lineNumbers,
      code,
    });
  }, [theme, language, fontSize, lineNumbers, code]);

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
      setTerminalOutput("$ Submitting...");

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
      toast.error("Submission failed :", err || "");
      setTerminalOutput("$ Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!submissionId || !username) return;

    const interval = setInterval(async () => {
      const response = await submissionService.getSubmissionStatus(
        submissionId,
        username
      );
      const { status, output } = response as {
        status: string;
        output?: string;
      };

      setSubmissionStatus(status);
      if (output) setTerminalOutput((prev) => `${prev}\n${output}`);

      if (status !== "pending" && status !== "running") {
        clearInterval(interval);
        if (status === "accepted") {
          toast.success("Accepted!");
        } else {
          toast.warning(`Result: ${formatStatus(status)}`);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [submissionId]);

  const getExtensions = () => {
    const langExt = LANGUAGES.find((l) => l.value === language)?.extension();
    return [theme, langExt].filter(Boolean); // Use theme directly
  };

  return (
    <Card className={isFullscreen ? "fixed inset-0 z-50 h-screen" : "w-full"}>
      <CardHeader className="flex justify-between items-center">
        <CardTitle className="flex items-center gap-3">
          Code Editor
          <Badge>{language}</Badge>
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen((v) => !v)}
          >
            {isFullscreen ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
            )}
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 space-y-4">
              <div>
                <Label>Theme</Label>
                <Select
                  value={THEMES.find((t) => t.extension === theme)?.value}
                  onValueChange={(v) => {
                    const newTheme = THEMES.find(
                      (t) => t.value === v
                    )!.extension;
                    setTheme(newTheme);
                    saveEditorSettings({
                      theme: v,
                      language,
                      fontSize,
                      lineNumbers,
                      code,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {THEMES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.name}
                      </SelectItem>
                    ))}
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
        <div className="flex gap-4">
          <Select
            value={language}
            onValueChange={(lang) => {
              const newCode = getLanguageTemplate(lang);
              setLanguage(lang);
              setCode(newCode);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((l) => (
                <SelectItem key={l.value} value={l.value}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Submit"
            )}
          </Button>
        </div>

        <div className="border rounded-md overflow-hidden">
          <CodeMirror
            value={code}
            height="500px"
            extensions={getExtensions()}
            onChange={(value) => setCode(value)}
            theme={theme} // Explicitly pass the theme prop
            style={{ fontSize: `${fontSize}px` }} // Ensure fontSize is applied correctly
            basicSetup={{
              lineNumbers,
              highlightActiveLine: true,
              highlightSelectionMatches: true,
            }}
          />
        </div>

        {submissionStatus && (
          <Alert variant={getStatusVariant(submissionStatus)}>
            <AlertDescription>
              Status: {formatStatus(submissionStatus)}
            </AlertDescription>
          </Alert>
        )}

        {terminalOutput && (
          <div className="bg-black text-green-400 p-3 font-mono text-sm overflow-auto h-32 border rounded">
            <pre>{terminalOutput}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helpers
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
  // For statuses not explicitly handled, use "default"
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
