import { useState } from "react";
import { GoogleGenAI } from "@google/genai";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  CodeIcon,
  Loader2,
  Sparkles,
  Gauge,
  Star,
} from "lucide-react";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

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
  const [result, setResult] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const analyzeCode = async () => {
    setLoading(true);
    setResult(null);
    setExpandedSection(null);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          `Analyze this code thoroughly and return ONLY pure JSON with this structure:
          {
            "language": "...",
            "timeComplexity": "...",
            "spaceComplexity": "...",
            "syntaxErrors": "...",
            "codeQuality": {
              "maintainability": "...",
              "readability": "...",
              "style": "..."
            },
            "optimizations": ["...", "..."]
          }

          Code:
          ${code}`,
        ],
      });

      const raw = response.text.trim();
      const cleaned = raw
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const parsed: Analysis = JSON.parse(cleaned);
      setResult(parsed);
    } catch (err) {
      console.error(err);
      setResult({
        language: "-",
        timeComplexity: "-",
        spaceComplexity: "-",
        syntaxErrors: "❌ Error analyzing code",
        codeQuality: {
          maintainability: "-",
          readability: "-",
          style: "-",
        },
        optimizations: []
      });
    }

    setLoading(false);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <section className="relative min-h-screen py-12 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-black dark:to-gray-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-0 w-80 h-80 bg-gradient-to-r from-blue-500/20 to-emerald-500/20 dark:from-blue-700/20 dark:to-emerald-700/20 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2"
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
          className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 dark:from-purple-700/20 dark:to-indigo-700/20 rounded-full filter blur-3xl translate-x-1/2 translate-y-1/2"
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

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-xl p-8"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50">
              <CodeIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-emerald-500 dark:from-blue-400 dark:to-emerald-300">
              Advanced Code Analyzer
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here..."
              className="h-64 font-mono text-base"
            />

            <Button
              onClick={analyzeCode}
              disabled={loading}
              size="lg"
              className="px-8 py-6 text-lg font-semibold bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 text-white rounded-xl shadow-lg transform transition-transform hover:scale-105 group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                  Analyze Code
                </>
              )}
            </Button>

            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 mt-6"
              >
                {/* Basic Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Language
                    </p>
                    <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      {result.language}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Time Complexity
                    </p>
                    <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                      {result.timeComplexity}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Space Complexity
                    </p>
                    <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                      {result.spaceComplexity}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Syntax Errors
                    </p>
                    <p
                      className={`text-lg font-semibold ${
                        result.syntaxErrors.includes("❌")
                          ? "text-red-600 dark:text-red-400"
                          : "text-gray-800 dark:text-gray-200"
                      }`}
                    >
                      {result.syntaxErrors || "None detected"}
                    </p>
                  </div>
                </div>

                {/* Expandable Sections */}
                <div className="space-y-4">
                  {/* Code Quality */}
                  <motion.div
                    className="rounded-lg overflow-hidden shadow-sm"
                    whileHover={{ scale: 1.01 }}
                  >
                    <button
                      onClick={() => toggleSection("quality")}
                      className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/50 dark:to-emerald-900/50"
                    >
                      <div className="flex items-center gap-3">
                        <Star className="w-5 h-5 text-yellow-500" />
                        <h3 className="text-lg font-semibold">Code Quality</h3>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 transition-transform ${
                          expandedSection === "quality" ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {expandedSection === "quality" && (
                      <div className="p-4 bg-white dark:bg-gray-800 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="p-3 rounded-md bg-gray-50 dark:bg-gray-700">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Maintainability
                            </p>
                            <p className="font-medium">
                              {result.codeQuality.maintainability}
                            </p>
                          </div>
                          <div className="p-3 rounded-md bg-gray-50 dark:bg-gray-700">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Readability
                            </p>
                            <p className="font-medium">
                              {result.codeQuality.readability}
                            </p>
                          </div>
                          <div className="p-3 rounded-md bg-gray-50 dark:bg-gray-700">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Style
                            </p>
                            <p className="font-medium">
                              {result.codeQuality.style}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>

                  {/* Optimizations */}
                  <motion.div
                    className="rounded-lg overflow-hidden shadow-sm"
                    whileHover={{ scale: 1.01 }}
                  >
                    <button
                      onClick={() => toggleSection("optimizations")}
                      className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/50 dark:to-teal-900/50"
                    >
                      <div className="flex items-center gap-3">
                        <Gauge className="w-5 h-5 text-green-500" />
                        <h3 className="text-lg font-semibold">
                          Optimization Suggestions
                        </h3>
                        {result.optimizations.length > 0 && (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200">
                            {result.optimizations.length}
                          </span>
                        )}
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 transition-transform ${
                          expandedSection === "optimizations"
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>
                    {expandedSection === "optimizations" && (
                      <div className="p-4 bg-white dark:bg-gray-800 space-y-3">
                        {result.optimizations.length > 0 ? (
                          <ul className="space-y-2">
                            {result.optimizations.map((opt, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <span className="text-green-500">•</span>
                                <span>{opt}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500 dark:text-gray-400">
                            No optimization suggestions
                          </p>
                        )}
                      </div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        {/* Floating elements */}
        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-10 w-8 h-8 rounded-full bg-emerald-500/40 dark:bg-emerald-700/40 blur-sm hidden md:block"
        />
        <motion.div
          animate={{
            y: [0, 15, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.7,
          }}
          className="absolute bottom-1/4 right-12 w-10 h-10 rounded-full bg-indigo-500/40 dark:bg-indigo-700/40 blur-sm hidden md:block"
        />
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
