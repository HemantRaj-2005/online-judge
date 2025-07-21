import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import SignUp from "./pages/Auth/SignUp";
import AuthLayout from "./layout/AuthLayout";
import AppLayout from "./layout/AppLayout";
import SignIn from "./pages/Auth/SignIn";
import ResendVerification from "./pages/Auth/ResendVerification";
import AllProblemPage from "./pages/Problem/AllProblemPage";
import EachProblemPage from "./pages/Problem/EachProblemPage";
import ProblemCreate from "./pages/Problem/ProblemCreate";
import ProblemEdit from "./pages/Problem/ProblemEdit";
import SubmittedSolutionView from "./pages/Problem/SubmittedSolutionView";
import AuthorProtectedRoute from "./components/AuthorProtectedRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import DashBoard from "./pages/DashBoard/DashBoard";
import RedirectUnverified from "./components/RedirectUnverified";
import NotFound from "./pages/NotFound/NotFound";
import CppCompilerPage from "./pages/Compilers/cppCompiler";
import PythonCompilerPage from "./pages/Compilers/pythonCompiler";
import JavaCompilerPage from "./pages/Compilers/javaCompiler";

export default function App() {

  return (
    <BrowserRouter>
    <RedirectUnverified>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/resend-verification" element={<ResendVerification />} />
          <Route path="/problems" element={<AllProblemPage />} />
          <Route path="/problems/:slug" element={<EachProblemPage />} />
          <Route path="/create-problem" element={<AuthorProtectedRoute><ProblemCreate /></AuthorProtectedRoute>} />
          <Route path="/problems/:slug/edit-problem" element={<AuthorProtectedRoute><ProblemEdit /></AuthorProtectedRoute>} />
          <Route path="/submissions/:submissionId" element={<ProtectedRoute><SubmittedSolutionView /></ProtectedRoute>} />
          <Route path="/dashboard/:username" element={<DashBoard />} />
          <Route path="/compilers/cpp" element={<CppCompilerPage />} />
          <Route path="/compilers/java" element={<JavaCompilerPage />} />
          <Route path="/compilers/python" element={<PythonCompilerPage />} />
        </Route>
      </Routes>
    </RedirectUnverified>
    </BrowserRouter>
  );
}


// change for re deployment