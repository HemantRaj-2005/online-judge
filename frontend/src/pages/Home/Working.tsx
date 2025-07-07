import React from 'react'
import { motion, useInView } from "framer-motion"
import { Code, Trophy, Brain } from "lucide-react"

// Define TypeScript interface for process steps
interface ProcessStep {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  title: string
  description: string
}

export default function Working() {
  const steps: ProcessStep[] = [
    {
      icon: Code,
      title: "Problem Exploration",
      description: "Dive into a curated selection of coding challenges tailored to your skill level.",
    },
    {
      icon: Brain,
      title: "Skill Development",
      description: "Learn algorithms and data structures through guided solutions and hints.",
    },
    {
      icon: Trophy,
      title: "Competitive Excellence",
      description: "Compete in contests to test your skills and climb the global leaderboard.",
    },
  ]

  // Use ref and useInView for scroll-triggered animations
  const ref = React.useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section className="py-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-black dark:to-gray-900 overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-blue-400 dark:from-green-300 dark:to-blue-100 animate-shine">
            Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-cyan-500 dark:from-purple-300 dark:to-cyan-300">Proven</span> Process
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-200 mt-4 max-w-2xl mx-auto animate-glow">
            A structured approach to master coding and excel in competitive programming.
          </p>
        </motion.div>
        <div ref={ref} className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
              className="group relative p-8 rounded-2xl bg-gradient-to-br from-gray-100/50 to-gray-200/50 dark:from-gray-950/50 dark:to-black/50 border-2 border-gray-300 dark:border-gray-800 hover:border-green-500 dark:hover:border-green-500 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/10 dark:hover:shadow-green-500/10 flex flex-col h-full"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-blue-500/10 dark:from-green-600/10 dark:to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              <div className="relative z-10 flex flex-col">
                <motion.div
                  className="w-12 h-12 rounded-xl bg-green-500/20 dark:bg-green-600/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
                  whileHover={{ rotate: 10 }}
                >
                  <step.icon className="w-6 h-6 text-green-500 dark:text-green-400" />
                </motion.div>
                <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-blue-400 dark:from-green-300 dark:to-blue-100 animate-shine mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-200 animate-glow flex-grow">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Custom CSS for shiny text effect */}
      <style>{`
        @keyframes shine {
          0% {
            background-position: -200%;
          }
          100% {
            background-position: 200%;
          }
        }
        .animate-shine {
          background-size: 200% auto;
          animation: shine 4s linear infinite;
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.3), 0 0 12px rgba(34, 197, 94, 0.2);
        }
        @keyframes glow {
          0%, 100% {
            text-shadow: 0 0 4px rgba(255, 255, 255, 0.2), 0 0 8px rgba(34, 197, 94, 0.1);
          }
          50% {
            text-shadow: 0 0 8px rgba(255, 255, 255, 0.4), 0 0 16px rgba(34, 197, 94, 0.3);
          }
        }
        .animate-glow {
          animation: glow 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  )
}