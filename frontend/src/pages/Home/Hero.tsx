import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const { scrollY } = useScroll();
  const navigate = useNavigate();
  const parallaxY1 = useTransform(scrollY, [0, 500], [0, -50]);
  const parallaxY2 = useTransform(scrollY, [0, 500], [0, 50]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <section
      className="relative py-24 md:py-36 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-black dark:to-gray-900 overflow-hidden"
    >
      {/* Animated background elements with parallax */}
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

      <div className="container mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isMounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8"
        >
          <span className="inline-block px-4 py-2 text-base font-semibold rounded-full bg-green-500/20 dark:bg-green-700/20 text-green-600 dark:text-green-400 shadow-md animate-pulse">
            💻 Master Competitive Programming
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={isMounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-blue-400 dark:from-green-400 dark:to-blue-200 animate-shine">
            Code Your Way to
          </span>{" "}
          <TypeAnimation
            sequence={["Success", 1500, "Mastery", 1500, "Victory", 1500]}
            wrapper="span"
            speed={40}
            repeat={Infinity}
            className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-cyan-500 dark:from-purple-400 dark:to-cyan-400 animate-shine"
          />
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={isMounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-10 animate-glow"
        >
          Solve challenging problems, sharpen your coding skills, and compete with coders worldwide.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isMounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <Button
            size="lg"
            className="px-10 py-6 text-lg font-semibold bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white rounded-xl shadow-lg transform transition-transform hover:scale-105 relative overflow-hidden group"
            onClick={() => navigate("/problems")}
          >
            <span className="relative z-10 animate-shine-text">Start Coding Now</span>
            <span className="absolute inset-0 bg-gradient-to-r from-green-700 to-blue-600 dark:from-green-800 dark:to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="px-10 py-6 text-lg font-semibold border-2 border-green-500 dark:border-green-600 text-green-600 dark:text-green-400 hover:bg-green-500/10 dark:hover:bg-green-600/10 rounded-xl transform transition-transform hover:scale-105 relative group"
            onClick={() => window.location.href = "/how-it-works"}
          >
            <span className="relative z-10 animate-shine-text">Learn How It Works</span>
            <span className="absolute inset-0 border-2 border-transparent group-hover:border-green-500 dark:group-hover:border-green-600 rounded-xl transition-all duration-300" />
          </Button>
        </motion.div>

        {/* Enhanced floating elements with parallax */}
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
        .animate-shine-text {
          background: linear-gradient(90deg, #ffffff 0%, #22c55e 50%, #ffffff 100%);
          background-size: 200% auto;
          background-clip: text;
          color: transparent;
          animation: empty 3s linear infinite;
        }
        @keyframes glow {
          0%, 100% {
            text-shadow: 0 0 4px rgba(255, 255, 255, 0.2), 0 0 8px rgba(34, 197, 94, 0.1);
          }
          50% {
            text-shadow: 0 0 8px rgba(255, 255, 255, 0.4), 0 0 16px rgba(34, 197, 94 0.3);
          }
        }
        .animate-glow {
          animation: glow 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}