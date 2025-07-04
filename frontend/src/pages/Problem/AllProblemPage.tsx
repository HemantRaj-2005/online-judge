import { useAppSelector } from "@/redux/hook";
import { problemService, type Problem, type Topic } from "@/services/problemService";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


export default function AllProblemPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = useAppSelector((state) => state.auth.user?.accessToken);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        const response = await problemService.getAllProblems();
        setProblems(response);
        setError(null);
      } catch (err) {
        setError("Failed to fetch problems");
        console.error("Error fetching problems:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, [token]);

  // Helper function to get topic name regardless of type
  const getTopicName = (topic: string | Topic): string => {
    return typeof topic === 'string' ? topic : topic.name;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-red-500 text-center text-2xl font-bold">
        Error: {error}
      </div>
    );
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Problems</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left">ID</th>
              <th className="py-3 px-4 text-left">Title</th>
              <th className="py-3 px-4 text-left">Difficulty</th>
              <th className="py-3 px-4 text-left">Topics</th>
              <th className="py-3 px-4 text-left">Author</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {problems.map((problem) => (
              <tr
                key={problem.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() =>
                  navigate(`/problems/${problem.slug}`)
                }
              >
                <td className="py-3 px-4">{problem.id}</td>
                <td className="py-3 px-4 font-medium">{problem.title}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      (problem.difficulty === "easy" || problem.difficulty === "veryeasy")
                        ? "bg-green-100 text-green-800"
                        : problem.difficulty === "medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {problem.difficulty}
                  </span>
                </td>
                <td className="py-3 px-4">{problem.topics.map(topic => getTopicName(topic)).join(", ")}</td>
                <td className="py-3 px-4">{problem.author}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {problems.length === 0 && (
        <div className="text-center py-8 text-gray-500">No problems found</div>
      )}
    </div>
  );
}
