import { useAppSelector } from "@/redux/hook";
import { problemService } from "@/services/problemService";
import { topicService, type Topic } from "@/services/topicService";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MDEditor from "@uiw/react-md-editor";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Copy, Sparkles, Check, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const difficulties = [
  { value: 'veryeasy', label: 'Very Easy' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
  { value: 'veryhard', label: 'Very Hard' },
];

export default function ProblemCreate() {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    difficulty: "easy",
    topics: [] as string[],
    time_limit: 1000,
    memory_limit: 256,
    slug: "",
    author: user?.username || "",
  });
  const [allTopics, setAllTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const [generatedCases, setGeneratedCases] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleGenerateTestCases = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and Description are required to generate test cases.");
      return;
    }
    setGenLoading(true);
    setGeneratedCases(null);
    try {
      const res = await problemService.generateTestCases(form.title, form.description, user?.accessToken);
      setGeneratedCases(res);
      toast.success("AI Test cases generated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate test cases");
    } finally {
      setGenLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    topicService.getAllTopics(user?.accessToken || "").then(setAllTopics).catch(() => setAllTopics([]));
  }, [user?.accessToken]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDifficultyChange = (value: string) => {
    setForm(prev => ({ ...prev, difficulty: value }));
  };

  const handleDescriptionChange = (value?: string) => {
    setForm(prev => ({ ...prev, description: value || "" }));
  };

  const handleTopicsChange = (topicName: string) => {
    setForm(prev => {
      const topics = prev.topics.includes(topicName)
        ? prev.topics.filter(t => t !== topicName)
        : [...prev.topics, topicName];
      return { ...prev, topics };
    });
  };

  const submitCreateProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        title: form.title,
        description: form.description,
        difficulty: form.difficulty,
        topic_names: form.topics,
        time_limit: Number(form.time_limit),
        memory_limit: Number(form.memory_limit),
      };
      if (form.slug && form.slug.trim() !== "") {
        payload.slug = form.slug.trim();
      }
      const newProblem = await problemService.createProblem(payload, user?.accessToken || "");
      toast.success("Problem created successfully! Redirecting to testcase manager...");
      navigate(`/problems/${newProblem.slug}/edit`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create problem");
    } finally {
      setLoading(false);
    }
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

      <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full glass rounded-3xl border border-border p-6 md:p-10 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight gradient-text-hero">
                Create New Problem
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Configure your task parameters, write description in markdown, and generate AI testcases.
              </p>
            </div>
          </div>

          <form onSubmit={submitCreateProblem} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column - Problem Metadata */}
              <div className="space-y-5">
                <div>
                  <Label htmlFor="title" className="text-sm font-semibold mb-2 block text-muted-foreground">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    className="bg-secondary/40 border-border rounded-xl h-10"
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold mb-2 block text-muted-foreground">Difficulty</Label>
                  <Select value={form.difficulty} onValueChange={handleDifficultyChange}>
                    <SelectTrigger className="w-full bg-secondary/40 border-border rounded-xl h-10">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent className="glass-strong border-border rounded-xl">
                      {difficulties.map(d => (
                        <SelectItem key={d.value} value={d.value} className="cursor-pointer rounded-lg">{d.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-semibold mb-2 block text-muted-foreground">Topics</Label>
                  <div className="flex flex-wrap gap-3 p-4 rounded-2xl bg-secondary/20 border border-border">
                    {allTopics.map(topic => (
                      <div key={topic.id} className="flex items-center space-x-2 bg-secondary/40 px-3 py-1.5 rounded-xl border border-border">
                        <Checkbox
                          id={`topic-${topic.id}`}
                          checked={form.topics.includes(topic.name)}
                          onCheckedChange={() => handleTopicsChange(topic.name)}
                          className="border-border rounded-md animate-none"
                        />
                        <Label htmlFor={`topic-${topic.id}`} className="font-medium text-xs text-foreground cursor-pointer select-none">
                          {topic.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Limits & Author */}
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="time_limit" className="text-sm font-semibold mb-2 block text-muted-foreground">Time Limit (ms)</Label>
                    <Input
                      id="time_limit"
                      name="time_limit"
                      type="number"
                      min={100}
                      value={form.time_limit}
                      onChange={handleChange}
                      required
                      className="bg-secondary/40 border-border rounded-xl h-10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="memory_limit" className="text-sm font-semibold mb-2 block text-muted-foreground">Memory Limit (MB)</Label>
                    <Input
                      id="memory_limit"
                      name="memory_limit"
                      type="number"
                      min={16}
                      value={form.memory_limit}
                      onChange={handleChange}
                      required
                      className="bg-secondary/40 border-border rounded-xl h-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="slug" className="text-sm font-semibold mb-2 block text-muted-foreground">Slug</Label>
                  <Input
                    id="slug"
                    name="slug"
                    value={form.slug}
                    onChange={handleChange}
                    className="bg-secondary/40 border-border rounded-xl h-10"
                  />
                </div>

                <div className="glass-strong p-5 rounded-2xl border border-border">
                  <div className="font-semibold text-sm mb-3 text-foreground">Author Information</div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-border/40 pb-2">
                      <span className="text-muted-foreground">Username:</span>
                      <span className="font-semibold text-foreground">{form.author}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-muted-foreground">Created At:</span>
                      <span className="font-semibold text-foreground">
                        {new Date().toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Editor */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-muted-foreground">Problem Description</Label>
              <Tabs defaultValue="write" className="mt-2 w-full">
                <TabsList className="bg-secondary/40 rounded-xl p-1 h-auto w-fit mb-3 border border-border">
                  <TabsTrigger value="write" className="rounded-lg text-xs px-4 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Write</TabsTrigger>
                  <TabsTrigger value="preview" className="rounded-lg text-xs px-4 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="write" className="rounded-2xl overflow-hidden border border-border bg-card">
                  <MDEditor
                    value={form.description}
                    onChange={handleDescriptionChange}
                    height={400}
                    preview="edit"
                    visibleDragbar={false}
                  />
                </TabsContent>
                <TabsContent value="preview" className="glass-strong rounded-2xl p-6 border border-border min-h-[400px]">
                  <div className="markdown prose dark:prose-invert max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {form.description || "*Enter description to see preview*"}
                    </ReactMarkdown>
                  </div>
                </TabsContent>
              </Tabs>
              <div className="text-xs text-muted-foreground mt-2">
                Supports Markdown with LaTeX math expressions (e.g., $E=mc^2$)
              </div>
            </div>

            {/* AI Test Case Generator */}
            <div className="glass-strong p-6 rounded-2xl border border-border space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-base font-bold flex items-center gap-2 text-foreground">
                    <Sparkles className="h-5 w-5 text-accent animate-pulse" />
                    AI Test Case Generator
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Automatically generate sample, edge, corner, stress, and randomized test cases for this problem statement.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleGenerateTestCases}
                  disabled={genLoading}
                  className="btn-gradient text-white rounded-xl h-10 px-5 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer inline-flex items-center gap-2 text-xs shrink-0 self-start sm:self-center"
                >
                  {genLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-white" />
                      Generate Test Cases
                    </>
                  )}
                </Button>
              </div>

              {generatedCases && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  {Object.entries(generatedCases).map(([category, cases]: [string, any]) => {
                    if (category === "error" || !Array.isArray(cases) || cases.length === 0) return null;
                    return (
                      <div key={category} className="glass rounded-2xl border border-border overflow-hidden shadow-sm">
                        <div className="p-4 bg-secondary/30 border-b border-border flex items-center justify-between">
                          <span className="text-sm font-bold capitalize text-foreground">{category} Cases</span>
                          <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                            {cases.length} Generated
                          </span>
                        </div>
                        <div className="p-4 space-y-4 max-h-[300px] overflow-y-auto">
                          {cases.map((c: any, index: number) => {
                            const caseId = `${category}-${index}`;
                            return (
                              <div key={index} className="space-y-2 border-b border-border/40 last:border-0 pb-3 last:pb-0">
                                {c.explanation && (
                                  <div className="text-[11px] text-muted-foreground italic bg-secondary/10 px-2.5 py-1.5 rounded-lg border border-border/50">
                                    Why: {c.explanation}
                                  </div>
                                )}
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                  <div className="space-y-1">
                                    <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider block">Input</span>
                                    <div className="relative group">
                                      <pre className="bg-secondary/35 border border-border/50 p-2.5 rounded-xl text-[11px] font-mono whitespace-pre-wrap select-all max-h-[80px] overflow-y-auto">
                                        {c.input}
                                      </pre>
                                      <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => copyToClipboard(c.input, `${caseId}-in`)}
                                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity rounded-md hover:bg-secondary"
                                      >
                                        {copiedId === `${caseId}-in` ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider block">Output</span>
                                    <div className="relative group">
                                      <pre className="bg-secondary/35 border border-border/50 p-2.5 rounded-xl text-[11px] font-mono whitespace-pre-wrap select-all max-h-[80px] overflow-y-auto">
                                        {c.output}
                                      </pre>
                                      <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => copyToClipboard(c.output, `${caseId}-out`)}
                                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity rounded-md hover:bg-secondary"
                                      >
                                        {copiedId === `${caseId}-out` ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
                className="rounded-xl h-10 px-5 hover:bg-secondary border-border"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="btn-gradient text-white rounded-xl h-10 px-6 font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Creating...
                  </>
                ) : (
                  "Create Problem"
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
}