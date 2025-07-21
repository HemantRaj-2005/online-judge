import { useState, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { githubDark } from "@uiw/codemirror-theme-github";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { python } from "@codemirror/lang-python";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

// Default code templates per language
const DEFAULT_CODE = {
  cpp: `#include <iostream>
using namespace std;

int main() {
    // Your code here
    return 0;
}
`,
  java: `public class Main {
    public static void main(String[] args) {
        // Your code here
    }
}
`,
  python: `# Your code here
print("Hello, World!")
`,
};

// LocalStorage key for saving code (includes language in key)
function getStorageKey(language: string) {
  return `compiler-code-${language}`;
}

function getLanguageExtension(language: string) {
  if (language === "cpp") return cpp();
  if (language === "java") return java();
  if (language === "python") return python();
  return python();
}

function getTheme(theme: string) {
  if (theme === "dracula") return dracula;
  return githubDark;
}

const FONT_SIZES = [12, 14, 16, 18, 20];

interface BasicCompilerProps {
  defaultLanguage: "cpp" | "java" | "python";
  backendBaseUrl: string;
}

function compareOutput(userOutput: string, expectedOutput: string) {
  // Trim trailing spaces and compare as lines
  const trim = (s: string) =>
    s
      .replace(/[ \t]+$/gm, "")
      .replace(/\r\n/g, "\n")
      .trim(); // normalize windows/unix & trailing whitespace
  return trim(userOutput) === trim(expectedOutput);
}

export const BasicCompiler = ({
  defaultLanguage,
  backendBaseUrl,
}: BasicCompilerProps) => {
  const [theme, setTheme] = useState("githubDark");
  const [fontSize, setFontSize] = useState(14);
  const [code, setCode] = useState(() => {
    const savedCode = localStorage.getItem(getStorageKey(defaultLanguage));
    return savedCode ?? DEFAULT_CODE[defaultLanguage];
  });

  const [input, setInput] = useState("");
  const [expectedOutput, setExpectedOutput] = useState("");
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load saved code from localStorage when defaultLanguage changes
  useEffect(() => {
    const savedCode = localStorage.getItem(getStorageKey(defaultLanguage));
    setCode(savedCode ?? DEFAULT_CODE[defaultLanguage]);
  }, [defaultLanguage]);

  // Save code to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(getStorageKey(defaultLanguage), code);
  }, [code, defaultLanguage]);

  async function handleRun() {
    setLoading(true);
    setOutput(null);
    setError(null);
    try {
      const url = `${backendBaseUrl}/${defaultLanguage}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          user_input: input,
        }),
      });
      const data = await res.json();
      if (res.ok) setOutput(data.output);
      else setError(data.error || "Compilation failed");
    } catch (e: any) {
      setError("Network or server error");
    } finally {
      setLoading(false);
    }
  }

  // For side-by-side output comparison
  function renderComparison() {
    if (!output || !expectedOutput) return null;
    const accepted = compareOutput(output, expectedOutput);

    return (
      <Alert
        variant={accepted ? "success" : "error"}
        className="mt-4 p-5 rounded-lg"
      >
        <div className="flex items-center gap-2 mb-4">
          {accepted ? (
            <>
              <CheckCircle2 className="text-green-600 w-6 h-6" />
              <span className="text-green-700 font-semibold text-xl">
                Accepted
              </span>
            </>
          ) : (
            <>
              <XCircle className="text-red-600 w-6 h-6" />
              <span className="text-red-700 font-semibold text-xl">
                Wrong Answer
              </span>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-8">
          <div>
            <div className="font-semibold text-xs mb-2 uppercase text-gray-600">
              Your Output
            </div>
            <Textarea
              value={output.replace(
                "YOUR OUTPUT\nACcepted",
                "YOUR OUTPUT\nAccepted"
              )}
              readOnly
              className="bg-gray-100"
            />
          </div>
          <div>
            <div className="font-semibold text-xs mb-2 uppercase text-gray-600">
              Expected Output
            </div>
            <Textarea value={expectedOutput} readOnly className="bg-gray-100" />
          </div>
        </div>
      </Alert>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-gray-100 to-amber-100 dark:from-black dark:to-gray-900">
      {/* Background gradient blobs */}
      <div className="absolute -top-20 left-0 w-60 h-60 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-r from-red-400/20 to-amber-200/30 rounded-full filter blur-3xl" />
      </div>
      <div className="absolute bottom-0 right-0 w-72 h-72 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-r from-amber-500/30 to-pink-400/20 rounded-full filter blur-3xl" />
      </div>

      <div className="container mx-auto p-4 h-full flex flex-col">
        {/* Header */}
        <CardHeader className="p-0 mb-4">
          <div className="flex justify-between flex-wrap items-center gap-4">
            <div
              className="inline-flex items-center px-4 py-2 rounded-full
              bg-red-500/10 dark:bg-red-700/20 text-red-700 dark:text-red-200
              text-sm font-semibold shadow-md animate-pulse select-none"
            >
              तपस्Code
            </div>
            <CardTitle
              className="text-3xl font-extrabold tracking-tight
              bg-gradient-to-r from-red-600 to-amber-500 dark:from-red-400 dark:to-amber-300
              bg-clip-text text-transparent"
            >
              {defaultLanguage === "cpp" && "C++ Editor"}
              {defaultLanguage === "java" && "Java Editor"}
              {defaultLanguage === "python" && "Python Editor"}
            </CardTitle>

            <div className="flex gap-4 flex-wrap">
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="githubDark">GitHub Dark</SelectItem>
                  <SelectItem value="dracula">Dracula</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={String(fontSize)}
                onValueChange={(v) => setFontSize(Number(v))}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_SIZES.map((fs) => (
                    <SelectItem key={fs} value={String(fs)}>
                      {fs}px
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
          {/* Editor Column */}
          <Card className="h-full overflow-hidden border-2 border-amber-400 dark:border-red-600 shadow-lg">
            <ScrollArea className="h-full w-full">
              <CodeMirror
                value={code}
                height="100%"
                extensions={[getLanguageExtension(defaultLanguage)]}
                theme={getTheme(theme)}
                onChange={setCode}
                style={{ fontSize: `${fontSize}px`, background: "transparent" }}
                basicSetup={{
                  lineNumbers: true,
                  highlightActiveLine: true,
                  highlightSelectionMatches: true,
                  autocompletion: true,
                }}
              />
            </ScrollArea>
          </Card>

          {/* Input/Output Column */}

          <div className="flex flex-col gap-4 pr-4 overflow-auto">
            {/* Input Section */}
            <Card className="border-2 border-amber-400/50 dark:border-red-600/50">
              <CardContent className="p-4">
                <div className="mb-2 font-medium">
                  Standard Input{" "}
                  <span className="ml-1 text-xs text-gray-400">(optional)</span>
                </div>
                <Textarea
                  className="w-full border-2 border-amber-400/50 rounded-xl px-3 py-2 font-mono bg-white/70 dark:bg-black/60
                    focus:border-red-400 focus:ring-amber-300 transition"
                  rows={4}
                  placeholder="Enter input for the program..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </CardContent>
            </Card>

            {/* Expected Output Section */}
            <Card className="border-2 border-amber-400/50 dark:border-red-600/50">
              <CardContent className="p-4">
                <div className="mb-2 font-medium">
                  Expected Output{" "}
                  <span className="ml-1 text-xs text-gray-400">
                    (for comparison, optional)
                  </span>
                </div>
                <Textarea
                  className="w-full border-2 border-amber-400/50 rounded-xl px-3 py-2 font-mono bg-white/70 dark:bg-black/60
                    focus:border-red-400 focus:ring-amber-300 transition"
                  rows={4}
                  placeholder="Paste expected output from the problem statement..."
                  value={expectedOutput}
                  onChange={(e) => setExpectedOutput(e.target.value)}
                />
              </CardContent>
            </Card>

            {/* Run Button */}
            <Button
              onClick={handleRun}
              disabled={loading}
              className="px-8 py-3 text-lg font-bold
                  bg-gradient-to-r from-red-600 to-amber-400 hover:from-red-500 hover:to-amber-500
                  text-white rounded-xl shadow-xl transition-transform duration-150
                  hover:scale-105 focus:ring-2 focus:ring-amber-500/80"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5 mr-2" />
                  Running...
                </>
              ) : (
                "Run"
              )}
            </Button>

            {/* Output Section */}
            {output !== null && (
              <Card className="border-2 border-amber-400/50 dark:border-red-600/50">
                <CardContent className="p-4">
                  <div className="mb-2 font-medium">Output</div>
                  <pre className="font-mono text-sm p-2 rounded bg-gray-50 border border-amber-300 dark:bg-amber-900/30 dark:border-amber-700 overflow-auto">
                    {output}
                  </pre>
                </CardContent>
              </Card>
            )}

            {/* Comparison Section */}
            {renderComparison()}

            {/* Error Section */}
            {error && (
              <Card className="border-2 border-red-400/50 dark:border-red-600/50">
                <CardContent className="p-4">
                  <div className="mb-2 font-medium text-red-600 dark:text-red-400">
                    Error
                  </div>
                  <pre className="font-mono text-sm whitespace-pre-wrap text-red-700 dark:text-red-300">
                    {error}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicCompiler;
