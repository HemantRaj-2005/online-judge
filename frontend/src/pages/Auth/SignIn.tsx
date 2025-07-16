import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";
import { useAppDispatch } from "@/redux/hook";
import { setUser } from "@/redux/user/authSlice";
import { authService } from "@/services/auth";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SignIn() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

 const handleLogin = async () => {
  if (!formData.email.trim()) {
    toast.error("Validation Error", { description: "Email is required" });
    return;
  }
  if (!formData.password.trim()) {
    toast.error("Validation Error", { description: "Password is required" });
    return;
  }

  setLoading(true);
  try {
    const res = await authService.login(formData);

    localStorage.setItem('authToken', res.access_token);
    localStorage.setItem('refresh_token', res.refresh_token);
    
    // Save to redux
    dispatch(
      setUser({
        username: res.username,
        email: res.email,
        isVerified: res.is_verified,
        isAuthor: res.is_author,
        accessToken: res.access_token,
      })
    );

    if (!res.is_verified) {
      toast.warning("Email not verified", {
        description: "Redirecting to verification page...",
      });
      navigate("/resend-verification", { state: { email: res.email } });
    } else {
      toast.success("Login successful", { description: "Welcome back!" });
      navigate("/");
    }
  } catch (err: any) {
    // Handle unverified user case
    if (err.isVerified === false) {
      toast.warning("Email not verified", {
        description: "Redirecting to verification page...",
      });
      navigate("/resend-verification", { state: { email: err.email } });
      return;
    }
    
    // Handle other errors
    toast.error("Login Failed", {
      description: err.message || "Invalid credentials",
    });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription className="text-center">
            <Link to="/sign-up">
              Don't have an account?{" "}
              <Button variant="link" className="hover:cursor-pointer">
                Sign Up
              </Button>
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleLogin} disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </CardFooter>
      </Card>
      <Toaster />
    </div>
  );
}
