import { useState } from "react";
import { toast, Toaster } from "sonner";
import { authService } from "@/services/auth";
import { useAppSelector } from "@/redux/hook";
import { motion, useScroll, useTransform } from "framer-motion";
import { Mail, Loader2, ArrowRight, CheckCircle } from "lucide-react";

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

export default function ResendVerification() {
  const { user } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { scrollY } = useScroll();
  const parallaxY1 = useTransform(scrollY, [0, 500], [0, -50]);
  const parallaxY2 = useTransform(scrollY, [0, 500], [0, 50]);

  const handleResend = async () => {
    if (!email) {
      toast.warning("Validation Error", {
        description: "Please enter your email address",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await authService.resendVerification(email);
      toast.success("Verification Sent", {
        description:
          (res as { message: string }).message ||
          "Check your email inbox for the verification link.",
      });
      setSuccess(true);
    } catch (err: unknown) {
      toast.error("Resend Failed", {
        description:
          err instanceof Error
            ? err.message
            : "Unable to resend verification email. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleResend();
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
                {success ? "Check Your Email" : "Verify Your Account"}
              </CardTitle>
            </motion.div>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              {success
                ? "We've sent a verification link to your email address"
                : "Complete your registration by verifying your email"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {success ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-8">
                <CheckCircle className="h-16 w-16 text-green-500 animate-bounce" />
                <p className="text-center text-gray-600 dark:text-gray-400">
                  If you don't see the email, then wait for 10-15 minutes and please check your spam folder.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      onKeyDown={handleKeyDown}
                      disabled
                      required
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enter the email address you used to register your account.
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            {!success ? (
              <Button
                className="w-full gap-2"
                onClick={handleResend}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Resend Verification <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                className="w-full gap-2"
                onClick={handleResend}
                disabled={loading}
                variant="outline"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Resending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    Resend Email
                  </>
                )}
              </Button>
            )}
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
