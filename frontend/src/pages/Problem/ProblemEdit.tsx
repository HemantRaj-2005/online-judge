import { useAppSelector } from "@/redux/hook";
import { problemService } from "@/services/problemService";
import { topicService, type Topic } from "@/services/topicService";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MDEditor from "@uiw/react-md-editor";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Copy, Sparkles, Check, Loader2 } from "lucide-react";

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
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Edit Problem</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitEditProblem} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Problem Metadata */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label>Difficulty</Label>
                  <Select value={form.difficulty} onValueChange={handleDifficultyChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {difficulties.map(d => (
                        <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Topics</Label>
                  <div className="flex flex-wrap gap-2">
                    {allTopics.map(topic => (
                      <div key={topic.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`topic-${topic.id}`}
                          checked={form.topics.includes(topic.name)}
                          onCheckedChange={() => handleTopicsChange(topic.name)}
                        />
                        <Label htmlFor={`topic-${topic.id}`} className="font-normal">
                          {topic.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Limits */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="time_limit">Time Limit (ms)</Label>
                    <Input
                      id="time_limit"
                      name="time_limit"
                      type="number"
                      min={100}
                      value={form.time_limit}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="memory_limit">Memory Limit (MB)</Label>
                    <Input
                      id="memory_limit"
                      name="memory_limit"
                      type="number"
                      min={16}
                      value={form.memory_limit}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <Card>
                  <CardHeader className="p-4">
                    <div className="font-medium">Problem Information</div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Slug:</span>
                      <span className="text-sm font-medium">{form.slug}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Last Updated:</span>
                      <span className="text-sm font-medium">
                        {new Date().toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Description Editor */}
            <div>
              <Label>Problem Description</Label>
              <Tabs defaultValue="write" className="mt-2">
                <TabsList>
                  <TabsTrigger value="write">Write</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="write" className="border rounded-md overflow-hidden">
                  <MDEditor
                    value={form.description}
                    onChange={handleDescriptionChange}
                    height={400}
                    preview="edit"
                    visibleDragbar={false}
                  />
                </TabsContent>
                <TabsContent value="preview" className="border rounded-md p-4">
                  <div className="markdown">
                    <ReactMarkdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {form.description || "*Enter description to see preview*"}
                    </ReactMarkdown>
                  </div>
                </TabsContent>
              </Tabs>
              <div className="text-sm text-muted-foreground mt-2">
                Supports Markdown with LaTeX math expressions (e.g., $E=mc^2$)
              </div>
            </div>

            {/* AI Test Case Generator */}
            <div className="border rounded-md p-4 bg-gray-50/50 dark:bg-gray-900/50 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-lg font-semibold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-green-500 animate-pulse" />
                    AI Test Case Generator
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Automatically generate sample, edge, corner, stress, and randomized test cases for this problem statement.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerateTestCases}
                  disabled={genLoading}
                  className="gap-2 shrink-0 self-start sm:self-center"
                >
                  {genLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-green-500" />
                      Generate Test Cases
                    </>
                  )}
                </Button>
              </div>

              {generatedCases && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {Object.entries(generatedCases).map(([category, cases]: [string, any]) => {
                    if (category === "error" || !Array.isArray(cases) || cases.length === 0) return null;
                    return (
                      <Card key={category} className="shadow-sm border border-gray-200 dark:border-gray-800">
                        <CardHeader className="p-3 bg-gray-100/50 dark:bg-gray-950/50 border-b">
                          <CardTitle className="text-sm font-semibold capitalize flex items-center justify-between">
                            <span>{category} Cases</span>
                            <span className="text-xs bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                              {cases.length} Generated
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 space-y-3 max-h-[250px] overflow-y-auto">
                          {cases.map((c: any, index: number) => {
                            const caseId = `${category}-${index}`;
                            return (
                              <div key={index} className="space-y-2 border-b last:border-0 pb-2 last:pb-0">
                                {c.explanation && (
                                  <div className="text-xs text-muted-foreground italic">
                                    Why: {c.explanation}
                                  </div>
                                )}
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div className="space-y-1">
                                    <span className="text-muted-foreground font-medium block">Input:</span>
                                    <div className="relative group">
                                      <pre className="bg-gray-100 dark:bg-gray-950 p-2 rounded text-[11px] font-mono whitespace-pre-wrap select-all max-h-[80px] overflow-y-auto">
                                        {c.input}
                                      </pre>
                                      <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => copyToClipboard(c.input, `${caseId}-in`)}
                                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        {copiedId === `${caseId}-in` ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-muted-foreground font-medium block">Output:</span>
                                    <div className="relative group">
                                      <pre className="bg-gray-100 dark:bg-gray-950 p-2 rounded text-[11px] font-mono whitespace-pre-wrap select-all max-h-[80px] overflow-y-auto">
                                        {c.output}
                                      </pre>
                                      <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => copyToClipboard(c.output, `${caseId}-out`)}
                                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        {copiedId === `${caseId}-out` ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">↻</span>
                    Updating...
                  </>
                ) : (
                  "Update Problem"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}