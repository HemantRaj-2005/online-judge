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