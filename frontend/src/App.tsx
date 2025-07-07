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
          <Route path="/create-problem" element={<ProblemCreate />} />
          <Route path="/problems/:slug/edit-problem" element={<ProblemEdit />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}