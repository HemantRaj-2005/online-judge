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
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/sign-in" element={<SignIn />} />
        </Route>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/resend-verification" element={<ResendVerification />} />
          <Route path="/problems" element={<AllProblemPage />} />
          <Route path="/problems/:slug" element={<EachProblemPage />} />
          <AuthorProtectedRoute>
            <Route path="/create-problem" element={<ProblemCreate />} />
            <Route
              path="/problems/:slug/edit-problem"
              element={<ProblemEdit />}
            />
          </AuthorProtectedRoute>
          <ProtectedRoute>
            <Route
              path="/submissions/:submissionId"
              element={<SubmittedSolutionView />}
            />
          </ProtectedRoute>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
