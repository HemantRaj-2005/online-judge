import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import SignUp from "./pages/Auth/SignUp";
import AuthLayout from "./layout/AuthLayout";
import AppLayout from "./layout/AppLayout";
import SignIn from "./pages/Auth/SignIn";
import ResendVerification from "./pages/Auth/ResendVerification";
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

        </Route>
      </Routes>
    </BrowserRouter>
  );
}
