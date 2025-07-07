import { useAppSelector } from "@/redux/hook";
import { problemService } from "@/services/problemService";
import { topicService, type Topic } from "@/services/topicService";
import { useState, useEffect } from "react";

const difficulties = [
  { value: 'veryeasy', label: 'Very Easy' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
  { value: 'veryhard', label: 'Very Hard' },
];


export default function ProblemCreate() {
  const {user} = useAppSelector((state) => state.auth);
  const [form, setForm] = useState({
    title: "",
    description: "",
    difficulty: "easy",
    topics: [] as string[], // array of topic names
    time_limit: 1000,
    memory_limit: 256,
    slug: "",
    author: user?.username || "", // Automatically set author to current user's username
  });
  const [allTopics, setAllTopics] = useState<Topic[]>([]);

  useEffect(() => {
    topicService.getAllTopics(user?.accessToken || "").then(setAllTopics).catch(() => setAllTopics([]));
  }, [user?.accessToken]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTopicsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
    setForm(prev => ({ ...prev, topics: selected }));
  };

  const submitCreateProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        title: form.title,
        description: form.description,
        difficulty: form.difficulty,
        topic_names: form.topics,
        time_limit: Number(form.time_limit),
        memory_limit: Number(form.memory_limit),
      };
      await problemService.createProblem(payload, user?.accessToken || "");
      setSuccess("Problem created successfully!");
      setForm({
        title: "",
        description: "",
        difficulty: "easy",
        topics: [],
        time_limit: 1000,
        memory_limit: 256,
        slug: "",
        author: user?.username || "",
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create problem");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
     <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Create New Problem</h2>
      <form onSubmit={submitCreateProblem} className="space-y-4">
        <div>
          <label className="block font-medium">Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
            required
          />
        </div>
        <div>
          <label className="block font-medium">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
            rows={5}
            required
          />
        </div>
        <div>
          <label className="block font-medium">Difficulty</label>
          <select
            name="difficulty"
            value={form.difficulty}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          >
            {difficulties.map(d => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium">Topics</label>
          <select
            name="topics"
            multiple
            value={form.topics}
            onChange={handleTopicsChange}
            className="w-full border rounded px-2 py-1 h-32"
          >
            {allTopics.map(topic => (
              <option key={topic.id} value={topic.name}>{topic.name}</option>
            ))}
          </select>
          <div className="text-xs text-gray-500">Hold Ctrl (Windows) or Cmd (Mac) to select multiple topics.</div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block font-medium">Time Limit (ms)</label>
            <input
              type="number"
              name="time_limit"
              value={form.time_limit}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
              min={100}
              required
            />
          </div>
          <div className="flex-1">
            <label className="block font-medium">Memory Limit (MB)</label>
            <input
              type="number"
              name="memory_limit"
              value={form.memory_limit}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
              min={16}
              required
            />
          </div>
          <div className="flex-1">
            <label className="block font-medium">Create Slug</label>
            <input
              type="string"
              name="slug"
              value={form.slug}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
              required
            />
          </div>
        </div>
        {error && <div className="text-red-600">{error}</div>}
        {success && <div className="text-green-600">{success}</div>}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Problem'}
        </button>
      </form>
    </div>
  );
}
