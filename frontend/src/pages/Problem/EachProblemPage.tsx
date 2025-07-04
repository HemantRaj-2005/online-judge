import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { problemService, type Problem, type Topic } from "@/services/problemService";
import { useAppSelector } from "@/redux/hook";
import CodeEditor from "./CodeEditor";
import SubmissionHistory from "./SubmissionHistory";

export default function EachProblemPage() {
  const { slug } = useParams<{ slug: string }>();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = useAppSelector((state) => state.auth.user?.accessToken);
  const isAuthenticated = !!token;
  const username = useAppSelector((state) => state.auth.user?.username);

  useEffect(() => {
    const fetchProblem = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        const response = await problemService.getProblemBySlug(slug);
        setProblem(response);
        setError(null);
      } catch (err) {
        setError("Failed to fetch problem details");
        console.error("Error fetching problem:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProblem();
  }, [slug, token]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !problem) {
    return (
      <div className="text-red-500 text-center text-2xl font-bold">
        Error: {error || "Problem not found"}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">{problem.title}</h1>
          <span
            className={`px-3 py-1 rounded-full text-sm ${
              (problem.difficulty === "easy" || problem.difficulty === "veryeasy")
                ? "bg-green-100 text-green-800"
                : problem.difficulty === "medium"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {problem.difficulty}
          </span>
        </div>
        
        <div className="mb-6">
          <p className="text-sm text-gray-500">
            Time Limit: {problem.time_limit}ms | Memory Limit: {problem.memory_limit}MB
          </p>
          <p className="text-sm text-gray-500">
            Author: {problem.author} | Created: {new Date(problem.created_at).toLocaleDateString()}
          </p>
          {problem.topics.length > 0 && (
            <div className="mt-2">
              <span className="text-sm font-medium">Topics: </span>
              {problem.topics.map((topic, index) => (
                <span key={index} className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                  {typeof topic === 'string' ? topic : topic.name}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="prose max-w-none">
          <h2 className="text-xl font-semibold mb-2">Problem Description</h2>
          <div dangerouslySetInnerHTML={{ __html: problem.description }} />
        </div>
      </div>
      
      {/* Code Editor Component */}
      {slug && isAuthenticated ? (
        <div>
          <CodeEditor problemSlug={slug} />
          <SubmissionHistory problemSlug={slug} username={username} />
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-700">Please sign in to submit your solution.</p>
        </div>
      )}
    </div>
  );
}