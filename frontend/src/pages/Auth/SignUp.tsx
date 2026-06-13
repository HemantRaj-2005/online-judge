import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";
import { useAppDispatch } from "@/redux/hook";
import { setUser } from "@/redux/user/authSlice";
import { authService } from "@/services/auth";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  School,
  PenLine,
  Loader2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

export default function SignUp() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    institution: "",
    bio: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSignUp();
    }
  };

  const handleSignUp = async () => {
    if (!formData.username.trim()) {
      toast.error("Validation Error", { description: "Username is required" });
      return;
    }
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
      const res = await authService.register(formData);
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
      toast.success("Registration Successful", {
        description: "Welcome! You have been logged in.",
      });
      setTimeout(() => navigate("/"), 1500);
    } catch (err: any) {
      let errorText = "Failed to register. Try again.";

      if (err.message && typeof err.message === "object") {
        errorText = Object.entries(err.message)
          .map(
            ([field, messages]) =>
              `${field}: ${(messages as string[]).join(", ")}`
          )
          .join("\n");
      } else if (typeof err.message === "string") {
        errorText = err.message;
      }

      toast.error("Registration Failed", {
        description: errorText,
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClasses =
    "pl-10 h-10 rounded-xl bg-white/[0.02] border-white/[0.08] focus:border-primary/40 focus:ring-primary/20";

  return (
    <section className="relative min-h-screen flex overflow-hidden">
      {/* Left — Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-950" />
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-1/3 left-1/4 w-56 h-56 bg-cyan-500/15 rounded-full blur-[80px] animate-float-delayed" />

        <div className="relative z-10 max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-10">
            <img src="/logo.svg" alt="Logo" className="h-9 w-9 rounded-lg" />
            <span className="text-xl font-bold gradient-text">तपस्Code</span>
          </Link>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Start your path to
            <br />
            coding excellence.
          </h1>
          <p className="text-white/50 text-base leading-relaxed">
            Join thousands of developers mastering algorithms, data structures,
            and competitive programming on our platform.
          </p>

          {/* Stats */}
          <div className="mt-10 flex gap-8">
            {[
              { value: "500+", label: "Problems" },
              { value: "10K+", label: "Users" },
              { value: "95%", label: "Satisfaction" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-xs text-white/40 mt-0.5">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="mb-6 gap-1.5 text-muted-foreground hover:text-foreground -ml-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Home
          </Button>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              Create account
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Sign up to begin your coding journey.
            </p>
          </div>

          {/* OAuth */}
          <div className="grid grid-cols-2 gap-3 mb-5">
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

          <div className="relative mb-5">
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
          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-sm">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <Input
                  id="username"
                  name="username"
                  placeholder="coder123"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={inputClasses}
                  onKeyDown={handleKeyDown}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={inputClasses}
                  onKeyDown={handleKeyDown}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`${inputClasses} pr-10`}
                  onKeyDown={handleKeyDown}
                  required
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

            <div className="space-y-1.5">
              <Label htmlFor="institution" className="text-sm">
                Institution{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <div className="relative">
                <School className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <Input
                  id="institution"
                  name="institution"
                  placeholder="Your school or org"
                  value={formData.institution}
                  onChange={handleInputChange}
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio" className="text-sm">
                Bio{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <div className="relative">
                <PenLine className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/50" />
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Tell us about yourself..."
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="pl-10 rounded-xl bg-white/[0.02] border-white/[0.08] focus:border-primary/40 focus:ring-primary/20"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <Button
            className="w-full mt-5 h-10 rounded-xl btn-gradient text-white font-medium gap-2"
            onClick={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Create Account <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </Button>

          <p className="text-sm text-center text-muted-foreground mt-5">
            Already have an account?{" "}
            <Link
              to="/sign-in"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>

      <Toaster position="top-center" richColors />
    </section>
  );
}
