import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Search, Code2, Zap } from "lucide-react";

interface Step {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  gradient: string;
}

const steps: Step[] = [
  {
    icon: Search,
    title: "Pick a Challenge",
    description:
      "Browse our curated collection of problems filtered by difficulty, topic, and tags. Find the perfect challenge for your skill level.",
    gradient: "from-indigo-500 to-blue-500",
  },
  {
    icon: Code2,
    title: "Write Your Solution",
    description:
      "Use our powerful in-browser editor with syntax highlighting, auto-completion, and multi-language support to craft your solution.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Zap,
    title: "Get Instant Feedback",
    description:
      "Submit your code and receive real-time results with detailed test case analysis, runtime metrics, and memory usage statistics.",
    gradient: "from-cyan-500 to-teal-500",
  },
];

export default function Working() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section className="py-24 relative overflow-hidden" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 grid-pattern opacity-40" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary/[0.04] rounded-full blur-[120px]" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-full bg-primary/[0.1] text-primary border border-primary/[0.15] mb-4">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Three Steps to{" "}
            <span className="gradient-text">Mastery</span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-md mx-auto">
            A streamlined workflow designed to maximize your learning and growth.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="max-w-2xl mx-auto relative">
          {/* Vertical line */}
          <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primary/20 via-primary/10 to-transparent" />

          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: index * 0.15,
                ease: "easeOut",
              }}
              className="relative flex gap-6 md:gap-8 mb-12 last:mb-0"
            >
              {/* Step indicator */}
              <div className="flex-shrink-0 relative z-10">
                <div
                  className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg`}
                  style={{
                    boxShadow: `0 8px 32px rgba(99, 102, 241, 0.15)`,
                  }}
                >
                  <step.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="glass rounded-2xl p-5 md:p-6 flex-1 glow-border">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-mono text-primary/60">
                    0{index + 1}
                  </span>
                  <h3 className="text-lg font-semibold text-foreground">
                    {step.title}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}