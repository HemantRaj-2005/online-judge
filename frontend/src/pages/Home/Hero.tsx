import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";

const stats = [
  { value: "500+", label: "Problems" },
  { value: "10K+", label: "Users" },
  { value: "50+", label: "Topics" },
  { value: "3", label: "Languages" },
];

const codeSnippet = `function solve(arr, target) {
  const map = new Map();
  for (let i = 0; i < arr.length; i++) {
    const comp = target - arr[i];
    if (map.has(comp)) {
      return [map.get(comp), i];
    }
    map.set(arr[i], i);
  }
  return [-1, -1];
}`;

export default function Hero() {
  const [isMounted, setIsMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Grid dot pattern */}
      <div className="absolute inset-0 grid-pattern opacity-60" />

      {/* Gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-indigo-500/[0.12] rounded-full blur-[120px] animate-float" />
        <div className="absolute top-1/3 -right-32 w-[400px] h-[400px] bg-purple-500/[0.10] rounded-full blur-[100px] animate-float-delayed" />
        <div className="absolute -bottom-32 left-1/3 w-[350px] h-[350px] bg-cyan-500/[0.08] rounded-full blur-[100px] animate-float-slow" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Text Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isMounted ? "visible" : "hidden"}
            className="max-w-2xl"
          >
            {/* Badge */}
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-full bg-primary/[0.1] text-primary border border-primary/[0.15]">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Open Source Online Judge
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              className="mt-6 text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.1]"
            >
              <span className="gradient-text-hero">
                Master the{" "}
              </span>
              <br />
              <span className="gradient-text-hero">Art of </span>
              <TypeAnimation
                sequence={[
                  "Code",
                  2000,
                  "Algorithms",
                  2000,
                  "Problem Solving",
                  2000,
                ]}
                wrapper="span"
                speed={40}
                repeat={Infinity}
                className="gradient-text"
              />
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="mt-5 text-lg text-muted-foreground max-w-lg leading-relaxed"
            >
              Solve challenging problems, sharpen your skills with instant
              feedback, and track your progress — all in one premium platform.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={itemVariants} className="mt-8 flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={() => navigate("/problems")}
                className="btn-gradient text-white rounded-xl px-7 h-12 text-sm font-semibold gap-2"
              >
                Start Solving
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/problems")}
                className="rounded-xl px-7 h-12 text-sm font-semibold border-white/[0.1] hover:bg-white/[0.04] gap-2"
              >
                <Play className="w-4 h-4" />
                Explore Problems
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={itemVariants}
              className="mt-12 flex flex-wrap gap-8"
            >
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — Floating Code Card */}
          <motion.div
            initial={{ opacity: 0, x: 40, rotateY: -8 }}
            animate={
              isMounted
                ? { opacity: 1, x: 0, rotateY: 0 }
                : {}
            }
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="hidden lg:block"
          >
            <div className="relative">
              {/* Glow behind card */}
              <div className="absolute -inset-4 bg-gradient-to-br from-indigo-500/[0.15] via-purple-500/[0.10] to-cyan-500/[0.15] rounded-3xl blur-2xl" />

              {/* Code card */}
              <div className="relative glass rounded-2xl p-5 glow-border">
                {/* Window chrome */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                  <div className="w-3 h-3 rounded-full bg-green-400/60" />
                  <span className="ml-2 text-xs text-muted-foreground font-mono">
                    two_sum.js
                  </span>
                </div>

                {/* Code */}
                <pre className="text-[13px] leading-relaxed font-mono text-muted-foreground overflow-x-auto">
                  <code>
                    {codeSnippet.split("\n").map((line, i) => (
                      <div key={i} className="flex">
                        <span className="select-none w-8 text-right pr-4 text-white/[0.15] text-xs leading-relaxed">
                          {i + 1}
                        </span>
                        <span className="text-foreground/70">{line}</span>
                      </div>
                    ))}
                  </code>
                </pre>

                {/* Status bar */}
                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-emerald-400 font-medium">
                      Accepted
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Runtime: 4ms · Memory: 42MB
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}