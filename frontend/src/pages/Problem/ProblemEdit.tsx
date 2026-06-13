import { useAppSelector } from "@/redux/hook";
import { problemService, type TestCase } from "@/services/problemService";
import { topicService, type Topic } from "@/services/topicService";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Copy, Sparkles, Check, Loader2, Plus, Trash2, Edit } from "lucide-react";
import { motion } from "framer-motion";

const difficulties = [
  { value: 'veryeasy', label: 'Very Easy' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
  { value: 'veryhard', label: 'Very Hard' },
];

export default function ProblemEdit() {
  const { user } = useAppSelector((state) => state.auth);
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    difficulty: "easy",
    topics: [] as string[],
    time_limit: 1000,
    memory_limit: 256,
    slug: ""
  });
  const [allTopics, setAllTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const [generatedCases, setGeneratedCases] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [tcLoading, setTcLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null);
  const [modalForm, setModalForm] = useState({
    input_text: "",
    output_text: "",
    is_sample: false,
    is_hidden: false,
    explanation: ""
  });
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    if (!slug || !user?.accessToken) return;
    setTcLoading(true);
    problemService.getTestCases(slug, user.accessToken)
      .then(setTestCases)
      .catch(err => {
        console.error("Failed to load test cases:", err);
        toast.error("Failed to load test cases.");
      })
      .finally(() => setTcLoading(false));
  }, [slug, user?.accessToken]);

  const handleOpenAddModal = () => {
    setEditingTestCase(null);
    setModalForm({
      input_text: "",
      output_text: "",
      is_sample: false,
      is_hidden: false,
      explanation: ""
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tc: TestCase) => {
    setEditingTestCase(tc);
    setModalForm({
      input_text: tc.input_text,
      output_text: tc.output_text,
      is_sample: tc.is_sample,
      is_hidden: tc.is_hidden,
      explanation: tc.explanation || ""
    });
    setIsModalOpen(true);
  };

  const handleSaveTestCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug || !user?.accessToken) return;
    if (!modalForm.input_text.trim() || !modalForm.output_text.trim()) {
      toast.error("Input and Output are required.");
      return;
    }

    setModalLoading(true);
    try {
      if (editingTestCase) {
        const updated = await problemService.updateTestCase(editingTestCase.id, modalForm, user.accessToken);
        setTestCases(prev => prev.map(t => t.id === editingTestCase.id ? updated : t));
        toast.success("Test case updated successfully!");
      } else {
        const created = await problemService.createTestCase(slug, modalForm, user.accessToken);
        setTestCases(prev => [...prev, created]);
        toast.success("Test case added successfully!");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save testcase");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteTestCase = async (id: number) => {
    if (!user?.accessToken) return;
    if (!confirm("Are you sure you want to delete this testcase?")) return;

    try {
      await problemService.deleteTestCase(id, user.accessToken);
      setTestCases(prev => prev.filter(t => t.id !== id));
      toast.success("Test case deleted successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete testcase");
    }
  };

  const handleImportTestCase = async (input: string, output: string, explanation: string, isSample = false) => {
    if (!slug || !user?.accessToken) {
      toast.error("You must be signed in to import test cases.");
      return;
    }

    try {
      const created = await problemService.createTestCase(slug, {
        input_text: input,
        output_text: output,
        is_sample: isSample,
        is_hidden: false,
        explanation: explanation
      }, user.accessToken);
      setTestCases(prev => [...prev, created]);
      toast.success("Imported case successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to import testcase");
    }
  };

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

  useEffect(() => {
    if (!slug) return;
    problemService.getProblemBySlug(slug, user?.accessToken || "")
      .then(problem => {
        setForm({
          title: problem.title,
          description: problem.description,
          difficulty: problem.difficulty,
          topics: (problem.topics || []).map(t => typeof t === "string" ? t : t.name),
          time_limit: problem.time_limit,
          memory_limit: problem.memory_limit,
          slug: problem.slug,
        });
      })
      .catch(() => toast.error("Failed to load problem details"));
  }, [slug, user?.accessToken]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const submitEditProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title: form.title,
        description: form.description,
        difficulty: form.difficulty,
        topic_names: form.topics,
        time_limit: Number(form.time_limit),
        memory_limit: Number(form.memory_limit),
      };
      await problemService.updateProblem(form.slug, payload, user?.accessToken || "");
      toast.success("Problem updated successfully!");
      navigate(`/problems/${form.slug}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update problem");
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
                Edit Problem
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Modify your problem details, limits, tags, and generate updated AI testcases.
              </p>
            </div>
          </div>

          <Tabs defaultValue="config" className="w-full">
            <TabsList className="bg-secondary/40 rounded-xl p-1 h-auto w-full max-w-md border border-border mb-8">
              <TabsTrigger value="config" className="flex-1 rounded-lg text-sm px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">1. Configuration</TabsTrigger>
              <TabsTrigger value="testcases" className="flex-1 rounded-lg text-sm px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">2. Test Cases Workspace</TabsTrigger>
            </TabsList>

            <TabsContent value="config">
              <form onSubmit={submitEditProblem} className="space-y-8">
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

                  {/* Right Column - Limits */}
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

                    <div className="glass-strong p-5 rounded-2xl border border-border">
                      <div className="font-semibold text-sm mb-3 text-foreground">Problem Information</div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between border-b border-border/40 pb-2">
                          <span className="text-muted-foreground">Slug:</span>
                          <span className="font-semibold text-foreground">{form.slug}</span>
                        </div>
                        <div className="flex justify-between pt-1">
                          <span className="text-muted-foreground">Last Updated:</span>
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

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
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
                        Updating...
                      </>
                    ) : (
                      "Update Problem"
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="testcases" className="space-y-8">
              <div className="glass-strong p-6 rounded-2xl border border-border space-y-6">
                <div className="flex justify-between items-center border-b border-border/40 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Active Test Cases</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Verify correctness of solutions against the test cases defined below.
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={handleOpenAddModal}
                    className="btn-gradient text-white rounded-xl h-9 px-4 text-xs font-semibold flex items-center gap-1.5 hover:scale-[1.02] cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    Add Test Case
                  </Button>
                </div>

                {tcLoading ? (
                  <div className="flex justify-center items-center py-12 text-sm text-muted-foreground gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    Loading test cases...
                  </div>
                ) : testCases.length === 0 ? (
                  <div className="text-center py-12 text-xs text-muted-foreground border border-dashed border-border rounded-2xl p-6 bg-secondary/10">
                    No test cases defined yet. Click "Add Test Case" or use the AI Generator below to get started.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-border">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-secondary/35 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                          <th className="p-4">Name / ID</th>
                          <th className="p-4">Type</th>
                          <th className="p-4">Input Preview</th>
                          <th className="p-4">Output Preview</th>
                          <th className="p-4">Explanation</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/45 text-xs text-foreground">
                        {testCases.map((tc) => (
                          <tr key={tc.id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="p-4 font-mono text-[10px] text-muted-foreground">
                              {tc.name.split('_tc_')[1] || tc.name}
                            </td>
                            <td className="p-4 space-y-1">
                              {tc.is_sample && (
                                <span className="inline-block px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold rounded-md uppercase tracking-wide">
                                  Sample
                                </span>
                              )}
                              {tc.is_hidden && (
                                <span className="inline-block px-1.5 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-bold rounded-md uppercase tracking-wide">
                                  Hidden
                                </span>
                              )}
                              {!tc.is_sample && !tc.is_hidden && (
                                <span className="inline-block px-1.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-bold rounded-md uppercase tracking-wide">
                                  Standard
                                </span>
                              )}
                            </td>
                            <td className="p-4">
                              <pre className="bg-secondary/25 border border-border/40 px-2 py-1.5 rounded-lg text-[10px] font-mono max-w-[150px] truncate">
                                {tc.input_text}
                              </pre>
                            </td>
                            <td className="p-4">
                              <pre className="bg-secondary/25 border border-border/40 px-2 py-1.5 rounded-lg text-[10px] font-mono max-w-[150px] truncate">
                                {tc.output_text}
                              </pre>
                            </td>
                            <td className="p-4 max-w-[180px] truncate text-muted-foreground">
                              {tc.explanation || "-"}
                            </td>
                            <td className="p-4 text-right space-x-1.5">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleOpenEditModal(tc)}
                                className="h-7 w-7 rounded-lg hover:bg-secondary text-primary"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDeleteTestCase(tc.id)}
                                className="h-7 w-7 rounded-lg hover:bg-secondary text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
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
                                  <div className="flex justify-between items-start gap-2">
                                    {c.explanation && (
                                      <div className="text-[11px] text-muted-foreground italic bg-secondary/10 px-2.5 py-1.5 rounded-lg border border-border/50 flex-1">
                                        Why: {c.explanation}
                                      </div>
                                    )}
                                    <Button
                                      type="button"
                                      size="sm"
                                      onClick={() => handleImportTestCase(c.input, c.output, c.explanation || "", category === "sample")}
                                      className="h-7 rounded-lg text-[10px] btn-gradient text-white flex items-center gap-1 hover:scale-[1.02] ml-auto shrink-0"
                                    >
                                      <Plus className="h-3 w-3" />
                                      Import
                                    </Button>
                                  </div>
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
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Dialog Modal for Add/Edit TestCase */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg glass-strong rounded-2xl border border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground font-bold">
              <Plus className="h-5 w-5 text-primary" />
              {editingTestCase ? "Edit Test Case" : "Add Test Case"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Provide the input, output, and configuration details for this test case.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveTestCase} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Input Text</Label>
              <Textarea
                value={modalForm.input_text}
                onChange={(e) => setModalForm(prev => ({ ...prev, input_text: e.target.value }))}
                placeholder="Standard input to supply to program..."
                className="font-mono text-xs bg-secondary/20 border-border rounded-xl h-24 focus:ring-primary/20"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Expected Output</Label>
              <Textarea
                value={modalForm.output_text}
                onChange={(e) => setModalForm(prev => ({ ...prev, output_text: e.target.value }))}
                placeholder="Expected output from correct solutions..."
                className="font-mono text-xs bg-secondary/20 border-border rounded-xl h-24 focus:ring-primary/20"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4 bg-secondary/15 p-3 rounded-xl border border-border">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="modal-is-sample"
                  checked={modalForm.is_sample}
                  onCheckedChange={(checked) => setModalForm(prev => ({ ...prev, is_sample: !!checked }))}
                  className="border-border rounded-md animate-none"
                />
                <Label htmlFor="modal-is-sample" className="text-xs font-semibold text-foreground cursor-pointer select-none">
                  Is Sample Case
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="modal-is-hidden"
                  checked={modalForm.is_hidden}
                  onCheckedChange={(checked) => setModalForm(prev => ({ ...prev, is_hidden: !!checked }))}
                  className="border-border rounded-md animate-none"
                />
                <Label htmlFor="modal-is-hidden" className="text-xs font-semibold text-foreground cursor-pointer select-none">
                  Is Hidden Case
                </Label>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Explanation / Notes (Optional)</Label>
              <Textarea
                value={modalForm.explanation}
                onChange={(e) => setModalForm(prev => ({ ...prev, explanation: e.target.value }))}
                placeholder="Add why this case is important or explain its properties..."
                className="text-xs bg-secondary/20 border-border rounded-xl h-16 focus:ring-primary/20 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border/40">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl h-10 px-4 hover:bg-secondary text-xs border-border"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={modalLoading}
                className="btn-gradient text-white rounded-xl h-10 px-5 font-semibold text-xs transition-all hover:scale-[1.02]"
              >
                {modalLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-1.5 h-3.5 w-3.5" />
                    Saving...
                  </>
                ) : (
                  "Save Test Case"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}