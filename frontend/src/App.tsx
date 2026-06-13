import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import SignUp from "./pages/Auth/SignUp";
import AuthLayout from "./layout/AuthLayout";
import AppLayout from "./layout/AppLayout";
import SignIn from "./pages/Auth/SignIn";
import AllProblemPage from "./pages/Problem/AllProblemPage";
import EachProblemPage from "./pages/Problem/EachProblemPage";
import ProblemCreate from "./pages/Problem/ProblemCreate";
import ProblemEdit from "./pages/Problem/ProblemEdit";
import SubmittedSolutionView from "./pages/Problem/SubmittedSolutionView";
import AuthorProtectedRoute from "./components/AuthorProtectedRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import DashBoard from "./pages/DashBoard/DashBoard";
import NotFound from "./pages/NotFound/NotFound";
import CppCompilerPage from "./pages/Compilers/CppCompiler";
import JavaCompilerPage from "./pages/Compilers/JavaCompiler";
import PythonCompilerPage from "./pages/Compilers/PythonCompiler";
import ProblemLayout from "./layout/ProblemLayout";
import { useSilentRefresh } from "./hooks/useSilentRefresh";
import CodeAnalyzer from "./pages/CodeAnalyzer/CodeAnalyzer";

export default function App() {
  useSilentRefresh();
  return (
    <BrowserRouter>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          <Route element={<ProblemLayout />}>
            <Route path="/problems/:slug" element={<EachProblemPage />} />
            <Route
              path="/create-problem"
              element={
                <AuthorProtectedRoute>
                  <ProblemCreate />
                </AuthorProtectedRoute>
              }
            />
            <Route
              path="/problems/:slug/edit-problem"
              element={
                <AuthorProtectedRoute>
                  <ProblemEdit />
                </AuthorProtectedRoute>
              }
            />
            <Route
              path="/submissions/:submissionId"
              element={
                <ProtectedRoute>
                  <SubmittedSolutionView />
                </ProtectedRoute>
              }
            />
            <Route path="/compilers/cpp" element={<CppCompilerPage />} />
            <Route path="/compilers/java" element={<JavaCompilerPage />} />
            <Route path="/compilers/python" element={<PythonCompilerPage />} />
          </Route>

          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />

            <Route path="/problems" element={<AllProblemPage />} />
            <Route path="/dashboard/:username" element={<DashBoard />} />
            <Route path="/code-analyzer" element={<CodeAnalyzer />} />

          </Route>
        </Routes>
    </BrowserRouter>
  );
}

// change for re deployment
