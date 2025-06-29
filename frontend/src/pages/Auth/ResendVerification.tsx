import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "sonner";
import { authService } from "@/services/auth";
import { useAppSelector } from "@/redux/hook";

export default function ResendVerification() {
  const { user } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    if (!email) {
      toast.warning("Please enter your email.");
      return;
    }

    setLoading(true);
    try {
      const res = await authService.resendVerification(email);
      toast.success("Verification Sent", {
        description: (res as { message: string }).message || "Check your email inbox.",
      });
    } catch (err: unknown) {
      toast.error("Resend Failed", {
        description: err instanceof Error ? err.message : "Unable to resend verification email.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Resend Verification Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{user?.email}</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              readOnly
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleResend} className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send Verification Email"}
          </Button>
        </CardFooter>
      </Card>
      <Toaster />
    </div>
  );
}
