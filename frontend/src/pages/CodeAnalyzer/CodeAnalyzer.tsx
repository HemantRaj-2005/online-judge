import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CodeIcon, Loader2, Sparkles, Gauge, Star } from "lucide-react";
import { useAppSelector } from "@/redux/hook";
import { aiService } from "@/services/aiServices";
import { toast } from "sonner";

type Analysis = {
  language: string;
  timeComplexity: string;
  spaceComplexity: string;
  syntaxErrors: string;
  codeQuality: {
    maintainability: string;
    readability: string;
    style: string;
  };
  optimizations: string[];
};

export default function CodeAnalyzer() {
  const [code, setCode] = useState<string>("");
  const [language, setLanguage] = useState<string>("python");
  const [result, setResult] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const user = useAppSelector((state) => state.auth.user);

  const analyzeCode = async () => {
    if (!code.trim()) {
      toast.error("Please paste some code first");
      return;
    }

    setLoading(true);
    setResult(null);
    setExpandedSection(null);

    try {
      const response = await aiService.analyzeCode(code, language, user?.accessToken);
      
      const parsed: Analysis = (response as any).data || response;
      setResult(parsed);
      toast.success("Analysis complete!");
    } catch (err: any) {
      console.error(err);
      toast.error("Error analyzing code");
      setResult({
        language: language,
        timeComplexity: "-",
        spaceComplexity: "-",
        syntaxErrors: "❌ Error analyzing code",
        codeQuality: {
          maintainability: "-",
          readability: "-",
          style: "-",
        },
        optimizations: [],
      });
    }

    setLoading(false);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <section className="relative min-h-screen py-12 bg-background grid-pattern overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-0 w-80 h-80 bg-gradient-to-r from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-accent/10 to-primary/10 dark:from-accent/20 dark:to-primary/20 rounded-full filter blur-3xl translate-x-1/2 translate-y-1/2"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
      </div>

      <div className="container mx-auto max-w-5xl px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full glass rounded-3xl border border-border p-6 md:p-10 shadow-2xl"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20">
              <CodeIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight gradient-text-hero">
                AI Code Analyzer
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Evaluate computational complexity, style bugs, and code efficiency.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
              <div className="w-full md:w-64">
                <label className="text-sm font-semibold mb-2 block text-muted-foreground">
                  Select Language
                </label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-full bg-secondary/40 border-border rounded-xl">
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border-border rounded-xl">
                    <SelectItem className="cursor-pointer rounded-lg" value="python">Python</SelectItem>
                    <SelectItem className="cursor-pointer rounded-lg" value="cpp">C++</SelectItem>
                    <SelectItem className="cursor-pointer rounded-lg" value="java">Java</SelectItem>
                    <SelectItem className="cursor-pointer rounded-lg" value="javascript">JavaScript</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here to analyze complexity, style, and potential bug fixes..."
              className="h-80 font-mono text-sm bg-secondary/20 border-border rounded-xl focus:ring-primary/20 focus:border-primary/50"
            />

            <Button
              onClick={analyzeCode}
              disabled={loading}
              className="btn-gradient text-white font-semibold rounded-xl h-12 px-8 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer inline-flex items-center justify-center gap-2 group w-full md:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing Code...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
                  Analyze Code
                </>
              )}
            </Button>

            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 mt-10 pt-6 border-t border-border"
              >
                <h2 className="text-xl font-bold tracking-tight">Analysis Results</h2>
                
                {/* Basic Analysis */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="glass-strong p-5 rounded-2xl border border-border glow-border">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Language
                    </p>
                    <p className="text-lg font-bold text-primary capitalize">
                      {result.language}
                    </p>
                  </div>
                  <div className="glass-strong p-5 rounded-2xl border border-border glow-border">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Time Complexity
                    </p>
                    <p className="text-lg font-bold text-cyan-400">
                      {result.timeComplexity}
                    </p>
                  </div>
                  <div className="glass-strong p-5 rounded-2xl border border-border glow-border">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Space Complexity
                    </p>
                    <p className="text-lg font-bold text-purple-400">
                      {result.spaceComplexity}
                    </p>
                  </div>
                  <div className="glass-strong p-5 rounded-2xl border border-border glow-border">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Syntax Errors
                    </p>
                    <p
                      className={`text-lg font-bold ${
                        result.syntaxErrors && !result.syntaxErrors.toLowerCase().includes("none")
                          ? "text-red-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {result.syntaxErrors || "None detected"}
                    </p>
                  </div>
                </div>

                {/* Expandable Sections */}
                <div className="space-y-4">
                  {/* Code Quality */}
                  <div className="glass rounded-2xl border border-border overflow-hidden">
                    <button
                      onClick={() => toggleSection("quality")}
                      className="w-full flex items-center justify-between p-5 bg-secondary/30 hover:bg-secondary/50 text-foreground transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Star className="w-5 h-5 text-amber-400 fill-amber-400/20" />
                        <h3 className="text-base font-semibold">Code Quality</h3>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                          expandedSection === "quality" ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {expandedSection === "quality" && (
                      <div className="p-6 border-t border-border bg-card/30 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="p-4 rounded-xl bg-secondary/20 border border-border">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                              Maintainability
                            </p>
                            <p className="text-base font-semibold text-foreground">
                              {result.codeQuality.maintainability}
                            </p>
                          </div>
                          <div className="p-4 rounded-xl bg-secondary/20 border border-border">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                              Readability
                            </p>
                            <p className="text-base font-semibold text-foreground">
                              {result.codeQuality.readability}
                            </p>
                          </div>
                          <div className="p-4 rounded-xl bg-secondary/20 border border-border">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                              Style Consistency
                            </p>
                            <p className="text-base font-semibold text-foreground">
                              {result.codeQuality.style}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Optimizations */}
                  <div className="glass rounded-2xl border border-border overflow-hidden">
                    <button
                      onClick={() => toggleSection("optimizations")}
                      className="w-full flex items-center justify-between p-5 bg-secondary/30 hover:bg-secondary/50 text-foreground transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Gauge className="w-5 h-5 text-cyan-400" />
                        <h3 className="text-base font-semibold">
                          Optimization Suggestions
                        </h3>
                        {result.optimizations.length > 0 && (
                          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            {result.optimizations.length}
                          </span>
                        )}
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                          expandedSection === "optimizations"
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>
                    {expandedSection === "optimizations" && (
                      <div className="p-6 border-t border-border bg-card/30 space-y-3">
                        {result.optimizations.length > 0 ? (
                          <div className="space-y-3">
                            {result.optimizations.map((opt, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-3 p-4 rounded-xl bg-secondary/20 border border-border"
                              >
                                <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center text-xs font-mono font-bold">
                                  {index + 1}
                                </span>
                                <span className="text-sm leading-relaxed text-muted-foreground">{opt}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No optimization suggestions needed. Your code is already clean!
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
