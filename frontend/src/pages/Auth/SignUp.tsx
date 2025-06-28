import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";
import { authService } from "@/services/auth";

export default function SignUp() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    institution: "",
    bio: "",
  });

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignUp = async () => {
    setLoading(true);
    try {
      const response = await authService.register(formData);
      toast.success("Registration Successful", {
        description: response.message || "Check your email for verification.",
      });
      setTimeout(() => navigate("/sign-in"), 2000);
    } catch (err: any) {
      let errorText = "Failed to register. Try again.";

      // Check for structured error messages from backend
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
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            Create Your Account to Get Started
          </CardTitle>

          <CardDescription className="text-center">
            <Link to="/sign-in">
              Already have an account?{" "}
              <Button variant="link" className="hover:cursor-pointer">
                Sign In
              </Button>
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              value={formData.username}
              placeholder="Enter your username"
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="institution">Institution</Label>
            <Input
              id="institution"
              name="institution"
              placeholder="Enter your institute(optional)"
              value={formData.institution}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              placeholder="Enter your bio(optional)"
              value={formData.bio}
              onChange={handleInputChange}
              rows={4}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleSignUp} disabled={loading}>
            {loading ? "Signing up..." : "Sign Up"}
          </Button>
        </CardFooter>
      </Card>
      <Toaster />
    </div>
  );
}
