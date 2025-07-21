import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";
import { authService } from "@/services/auth";
import { motion, useScroll, useTransform } from "framer-motion";
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
  Home,
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
  const { scrollY } = useScroll();
  const parallaxY1 = useTransform(scrollY, [0, 500], [0, -50]);
  const parallaxY2 = useTransform(scrollY, [0, 500], [0, 50]);

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
    // Basic validation
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
      const response = await authService.register(formData);
      toast.success("Registration Successful", {
        description: response.message || "Check your email for verification.",
      });
      setTimeout(() => navigate("/sign-in"), 2000);
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
        className="w-full max-w-lg z-10"
      >
        <Card className="shadow-xl border-0 dark:border dark:border-gray-700 bg-white/90 dark:bg-gray-950 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-500 dark:from-green-400 dark:to-blue-300 bg-clip-text text-transparent">
                Join Our Community
              </CardTitle>
            </motion.div>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Create your account to start your coding journey
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
                  Or register with email
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    name="username"
                    placeholder="coder123"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="pl-10"
                    onKeyDown={handleKeyDown}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    onKeyDown={handleKeyDown}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10"
                    onKeyDown={handleKeyDown}
                    required
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

              <div className="space-y-2">
                <Label htmlFor="institution">Institution (Optional)</Label>
                <div className="relative">
                  <School className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="institution"
                    name="institution"
                    placeholder="Your school or organization"
                    value={formData.institution}
                    onChange={handleInputChange}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio (Optional)</Label>
                <div className="relative">
                  <PenLine className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Textarea
                    id="bio"
                    name="bio"
                    placeholder="Tell us about yourself..."
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="pl-10"
                    rows={4}
                  />
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              className="w-full gap-2"
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
                  Sign Up <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>

            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link to="/sign-in">
                <Button
                  variant="link"
                  className="p-0 h-auto text-green-600 dark:text-green-400"
                >
                  Sign in instead
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
