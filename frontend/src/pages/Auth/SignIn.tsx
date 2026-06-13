import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";
import { useAppDispatch } from "@/redux/hook";
import { setUser } from "@/redux/user/authSlice";
import { authService } from "@/services/auth";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function SignIn() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
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

      localStorage.setItem("authToken", res.access_token);
      localStorage.setItem("refresh_token", res.refresh_token);

      dispatch(
        setUser({
          username: res.username,
          email: res.email,
          isVerified: res.is_verified,
          isAuthor: res.is_author,
          accessToken: res.access_token,
        })
      );

      toast.success("Login successful", { description: "Welcome back!" });
      navigate("/");
    } catch (err: any) {
      toast.error("Login Failed", {
        description: err.message || "Invalid credentials",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <section className="relative min-h-screen flex overflow-hidden">
      {/* Left — Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        {/* Animated gradient mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950" />
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/15 rounded-full blur-[80px] animate-float-delayed" />

        <div className="relative z-10 max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-10">
            <img src="/logo.svg" alt="Logo" className="h-9 w-9 rounded-lg" />
            <span className="text-xl font-bold gradient-text">तपस्Code</span>
          </Link>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Welcome back to
            <br />
            your coding journey.
          </h1>
          <p className="text-white/50 text-base leading-relaxed">
            Sign in to access your problems, track progress, and continue
            building your competitive programming skills.
          </p>

          {/* Floating code snippet */}
          <div className="mt-10 glass rounded-xl p-4 max-w-sm">
            <div className="flex items-center gap-1.5 mb-3">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400/50" />
            </div>
            <pre className="text-xs font-mono text-white/40 leading-relaxed">
{`> tapascode login
✓ Authenticated successfully
✓ Welcome back, coder!
✓ Ready to solve problems.`}
            </pre>
          </div>
        </div>
      </div>

      {/* Right — Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          {/* Back to home */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="mb-6 gap-1.5 text-muted-foreground hover:text-foreground -ml-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Home
          </Button>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Sign in</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Enter your credentials to access your account.
            </p>
          </div>

          {/* OAuth */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button
              variant="outline"
              className="h-10 rounded-xl text-sm border-white/[0.08] hover:bg-white/[0.04]"
              onClick={() => toast.info("Coming soon!")}
            >
              GitHub
            </Button>
            <Button
              variant="outline"
              className="h-10 rounded-xl text-sm border-white/[0.08] hover:bg-white/[0.04]"
              onClick={() => toast.info("Coming soon!")}
            >
              Google
            </Button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground">
                or
              </span>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <Input
                  id="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 h-10 rounded-xl bg-white/[0.02] border-white/[0.08] focus:border-primary/40 focus:ring-primary/20"
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-sm">
                  Password
                </Label>
                <Link to="/forgot-password">
                  <Button
                    variant="link"
                    size="sm"
                    className="px-0 text-xs text-muted-foreground h-auto"
                  >
                    Forgot password?
                  </Button>
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10 h-10 rounded-xl bg-white/[0.02] border-white/[0.08] focus:border-primary/40 focus:ring-primary/20"
                  onKeyDown={handleKeyDown}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 rounded-lg"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Submit */}
          <Button
            className="w-full mt-6 h-10 rounded-xl btn-gradient text-white font-medium gap-2"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </Button>

          {/* Footer */}
          <p className="text-sm text-center text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link
              to="/sign-up"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>

      <Toaster position="top-center" richColors />
    </section>
  );
}