import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Loader2, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";

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

const FONT_SIZES = [12, 14, 16, 18, 20];

interface BasicCompilerProps {
  defaultLanguage: "cpp" | "java" | "python";
  backendBaseUrl: string;
}

function compareOutput(userOutput: string, expectedOutput: string) {
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
      <div
        className={`p-5 rounded-2xl border ${
          accepted
            ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
            : "bg-red-500/5 border-red-500/20 text-red-400"
        }`}
      >
        <div className="flex items-center gap-2 mb-4">
          {accepted ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-lg">Accepted</span>
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5 text-red-400" />
              <span className="font-bold text-lg">Wrong Answer</span>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="font-semibold text-[10px] mb-1.5 uppercase tracking-wider text-muted-foreground">
              Your Output
            </div>
            <Textarea
              value={output.replace(
                "YOUR OUTPUT\nACcepted",
                "YOUR OUTPUT\nAccepted"
              )}
              readOnly
              className="w-full border border-border rounded-xl px-3.5 py-2.5 font-mono text-xs bg-secondary/20 resize-none h-32"
            />
          </div>
          <div>
            <div className="font-semibold text-[10px] mb-1.5 uppercase tracking-wider text-muted-foreground">
              Expected Output
            </div>
            <Textarea
              value={expectedOutput}
              readOnly
              className="w-full border border-border rounded-xl px-3.5 py-2.5 font-mono text-xs bg-secondary/20 resize-none h-32"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background grid-pattern">
      {/* Background gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 left-0 w-80 h-80 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full filter blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-accent/10 to-primary/10 rounded-full filter blur-3xl"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
      </div>

      <div className="container mx-auto p-4 md:p-6 h-full flex flex-col max-w-7xl relative z-10">
        {/* Header */}
        <div className="mb-6 flex justify-between flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold shadow-md">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              तपस्Code
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight gradient-text-hero">
              {defaultLanguage === "cpp" && "C++ Compiler"}
              {defaultLanguage === "java" && "Java Compiler"}
              {defaultLanguage === "python" && "Python Compiler"}
            </h1>
          </div>

          <div className="flex gap-3 flex-wrap">
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-[130px] bg-secondary/40 border-border rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-strong border-border rounded-xl">
                <SelectItem className="cursor-pointer rounded-lg" value="githubDark">GitHub Dark</SelectItem>
                <SelectItem className="cursor-pointer rounded-lg" value="dracula">Dracula</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={String(fontSize)}
              onValueChange={(v) => setFontSize(Number(v))}
            >
              <SelectTrigger className="w-[100px] bg-secondary/40 border-border rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-strong border-border rounded-xl">
                {FONT_SIZES.map((fs) => (
                  <SelectItem key={fs} value={String(fs)} className="cursor-pointer rounded-lg">
                    {fs}px
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden min-h-0">
          {/* Editor Column */}
          <div className="glass h-full overflow-hidden border border-border shadow-2xl rounded-2xl flex flex-col">
            <div className="px-4 py-2.5 bg-secondary/20 border-b border-border flex items-center justify-between text-xs text-muted-foreground font-mono">
              <span>main.{defaultLanguage === 'cpp' ? 'cpp' : defaultLanguage === 'java' ? 'java' : 'py'}</span>
            </div>
            <div className="flex-1 overflow-hidden rounded-b-2xl">
              <Editor
                value={code}
                height="100%"
                language={defaultLanguage === "cpp" ? "cpp" : defaultLanguage === "java" ? "java" : "python"}
                theme={theme === "githubLight" ? "vs" : "vs-dark"}
                onChange={(val) => setCode(val ?? "")}
                loading={
                  <div className="flex items-center justify-center h-full bg-zinc-950/20 text-muted-foreground gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span>Initializing Monaco Editor...</span>
                  </div>
                }
                options={{
                  fontSize: fontSize,
                  minimap: { enabled: false },
                  automaticLayout: true,
                }}
              />
            </div>
          </div>

          {/* Right Column (Inputs & Outputs) */}
          <div className="flex flex-col gap-6 overflow-y-auto pr-2">
            {/* Input Section */}
            <div className="glass-strong p-5 rounded-2xl border border-border">
              <div className="mb-2 text-sm font-semibold text-muted-foreground">Input</div>
              <Textarea
                className="w-full border border-border rounded-xl px-3.5 py-2.5 font-mono text-xs bg-secondary/20 focus:ring-primary/20 focus:border-primary/50 transition resize-none"
                rows={3}
                placeholder="Enter program input here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>

            {/* Expected Output Section */}
            <div className="glass-strong p-5 rounded-2xl border border-border">
              <div className="mb-2 text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                Expected Output
                <span className="text-xs text-muted-foreground/50 font-normal">(for comparison, optional)</span>
              </div>
              <Textarea
                className="w-full border border-border rounded-xl px-3.5 py-2.5 font-mono text-xs bg-secondary/20 focus:ring-primary/20 focus:border-primary/50 transition resize-none"
                rows={4}
                placeholder="Paste expected output from the problem statement..."
                value={expectedOutput}
                onChange={(e) => setExpectedOutput(e.target.value)}
              />
            </div>

            {/* Run Button */}
            <Button
              onClick={handleRun}
              disabled={loading}
              className="btn-gradient text-white rounded-xl h-12 text-base font-bold shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer inline-flex items-center justify-center gap-2 w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" />
                  Running Program...
                </>
              ) : (
                "Run Code"
              )}
            </Button>

            {/* Output Section */}
            {output !== null && (
              <div className="glass-strong p-5 rounded-2xl border border-border">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Output</div>
                <pre className="font-mono text-sm p-4 rounded-xl bg-secondary/25 border border-border overflow-auto">
                  {output}
                </pre>
              </div>
            )}

            {/* Comparison Section */}
            {renderComparison()}

            {/* Error Section */}
            {error && (
              <div className="glass-strong p-5 rounded-2xl border border-red-500/20 text-red-400 bg-red-500/5">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider">Error</div>
                <pre className="font-mono text-xs whitespace-pre-wrap leading-relaxed">
                  {error}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicCompiler;
