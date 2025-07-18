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
import { useAppSelector } from "./redux/hook";

export default function App() {
  const { user } = useAppSelector((state) => state.auth);
  const username = user?.username || "User";
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
          <Route path="/create-problem" element={<AuthorProtectedRoute><ProblemCreate /></AuthorProtectedRoute>} />
          <Route path="/problems/:slug/edit-problem" element={<AuthorProtectedRoute><ProblemEdit /></AuthorProtectedRoute>} />
          <Route path="/submissions/:submissionId" element={<ProtectedRoute><SubmittedSolutionView /></ProtectedRoute>} />
          <Route path="/dashboard/:username" element={<DashBoard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
