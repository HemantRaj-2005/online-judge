import { motion } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { RocketIcon, ConstructionIcon, HomeIcon } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen py-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-black dark:to-gray-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-0 w-80 h-80 bg-gradient-to-r from-red-500/20 to-amber-500/20 dark:from-red-700/20 dark:to-amber-700/20 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2"
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
          className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 dark:from-purple-700/20 dark:to-pink-700/20 rounded-full filter blur-3xl translate-x-1/2 translate-y-1/2"
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center px-6 py-3 text-lg font-medium rounded-full bg-red-500/20 dark:bg-red-700/20 text-red-600 dark:text-red-400 shadow-md">
            <ConstructionIcon className="w-5 h-5 mr-2" />
            Under Construction
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-6xl md:text-8xl font-extrabold mb-6 tracking-tight"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-amber-500 dark:from-red-400 dark:to-amber-300">
            404
          </span>
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-3xl md:text-5xl font-bold mb-6"
        >
          <TypeAnimation
            sequence={[
              "Page Not Found",
              1500,
              "Coming Soon!",
              1500,
              "Under Development",
              1500,
            ]}
            wrapper="span"
            speed={40}
            repeat={Infinity}
            className="text-gray-800 dark:text-gray-200"
          />
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10"
        >
          The page you're looking for doesn't exist or is currently being built. Our team is working hard to bring you new features!
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            size="lg"
            className="px-8 py-6 text-lg font-semibold bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-700 hover:to-amber-600 text-white rounded-xl shadow-lg transform transition-transform hover:scale-105 group"
            onClick={() => navigate("/")}
          >
            <HomeIcon className="w-5 h-5 mr-2" />
            Return Home
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="px-8 py-6 text-lg font-semibold border-2 border-red-500 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-600/10 rounded-xl transform transition-transform hover:scale-105 group"
            onClick={() => navigate("/problems")}
          >
            <RocketIcon className="w-5 h-5 mr-2" />
            Explore Problems
          </Button>
        </motion.div>

        {/* Floating elements */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-12 w-8 h-8 rounded-full bg-amber-500/40 dark:bg-amber-700/40 blur-sm hidden md:block"
        />
        <motion.div
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
          className="absolute bottom-1/3 right-20 w-10 h-10 rounded-full bg-pink-500/40 dark:bg-pink-700/40 blur-sm hidden md:block"
        />
      </div>

      {/* Custom CSS */}
      <style>{`
        .text-gradient {
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }
      `}</style>
    </section>
  );
}