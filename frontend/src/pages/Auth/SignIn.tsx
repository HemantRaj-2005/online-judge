import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";
import { useAppDispatch } from "@/redux/hook";
import { setUser } from "@/redux/user/authSlice";
import { authService } from "@/services/auth";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  Loader2,
  ArrowRight,
  Home
} from "lucide-react";

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
  const { scrollY } = useScroll();
  const parallaxY1 = useTransform(scrollY, [0, 500], [0, -50]);
  const parallaxY2 = useTransform(scrollY, [0, 500], [0, 50]);

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
      if (err.isVerified === false) {
        toast.warning("Email not verified", {
          description: "Redirecting to verification page...",
        });
        navigate("/resend-verification", { state: { email: err.email } });
        return;
      }
      
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
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-black dark:to-gray-900 overflow-hidden p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-0 w-80 h-80 bg-gradient-to-r from-green-500/30 to-blue-500/30 dark:from-green-700/30 dark:to-blue-700/30 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2"
          style={{ y: parallaxY1 }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-purple-500/30 to-cyan-500/30 dark:from-purple-700/30 dark:to-cyan-700/30 rounded-full filter blur-3xl translate-x-1/2 translate-y-1/2"
          style={{ y: parallaxY2 }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <Card className="shadow-xl border-0 dark:border dark:border-gray-700 bg-white/90 dark:bg-gray-950 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-500 dark:from-green-400 dark:to-blue-300 bg-clip-text text-transparent">
                Welcome Back
              </CardTitle>
            </motion.div>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Sign in to continue your coding journey
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => toast.info("Coming soon!")}
              >
                GitHub
              </Button>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => toast.info("Coming soon!")}
              >
                Google
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or with email
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10"
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password">
                    <Button variant="link" size="sm" className="px-0 text-sm text-gray-600 dark:text-gray-400">
                      Forgot password?
                    </Button>
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10"
                    onKeyDown={handleKeyDown}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button 
              className="w-full gap-2" 
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
                  Sign In <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>

            <div className="text-sm text-center text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/sign-up">
                <Button variant="link" className="p-0 h-auto text-green-600 dark:text-green-400">
                  Sign up now
                </Button>
              </Link>
            </div>

            <Button 
              variant="ghost" 
              className="mt-4 gap-2" 
              onClick={() => navigate("/")}
            >
              <Home className="h-4 w-4" />
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Floating elements */}
      <motion.div
        style={{ y: parallaxY1 }}
        animate={{
          y: [0, -20, 0],
          rotate: [0, 10, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/4 left-12 w-8 h-8 rounded-full bg-green-500/40 dark:bg-green-700/40 blur-sm hidden md:block"
      />
      <motion.div
        style={{ y: parallaxY2 }}
        animate={{
          y: [0, 20, 0],
          rotate: [0, -10, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.7,
        }}
        className="absolute bottom-1/3 right-20 w-10 h-10 rounded-full bg-cyan-500/40 dark:bg-cyan-700/40 blur-sm hidden md:block"
      />

      <Toaster position="top-center" richColors />
    </section>
  );
}