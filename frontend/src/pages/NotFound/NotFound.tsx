import { motion } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { RocketIcon, ConstructionIcon, HomeIcon } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen py-24 bg-background grid-pattern overflow-hidden flex items-center justify-center">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-0 w-80 h-80 bg-gradient-to-r from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2"
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
          className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-accent/10 to-primary/10 dark:from-accent/20 dark:to-primary/20 rounded-full filter blur-3xl translate-x-1/2 translate-y-1/2"
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

      <div className="container mx-auto px-4 text-center relative z-10 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass rounded-3xl border border-border p-8 md:p-14 shadow-2xl flex flex-col items-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-6"
          >
            <div className="inline-flex items-center px-4 py-1.5 text-xs font-semibold rounded-full bg-primary/10 border border-primary/20 text-primary shadow-sm">
              <ConstructionIcon className="w-3.5 h-3.5 mr-2" />
              Under Development
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-7xl md:text-9xl font-extrabold mb-4 tracking-tighter"
          >
            <span className="gradient-text-hero">
              404
            </span>
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-2xl md:text-4xl font-bold mb-4"
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
              className="text-foreground"
            />
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-sm md:text-base text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed"
          >
            The page you're looking for doesn't exist or is currently being built. Our team is working hard to bring you new features!
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 justify-center w-full sm:w-auto"
          >
            <Button
              onClick={() => navigate("/")}
              className="btn-gradient text-white rounded-xl h-11 px-8 font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer inline-flex items-center justify-center gap-2 group w-full sm:w-auto"
            >
              <HomeIcon className="w-4 h-4" />
              Return Home
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/problems")}
              className="rounded-xl h-11 px-8 font-semibold hover:bg-secondary border-border cursor-pointer inline-flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
            >
              <RocketIcon className="w-4 h-4 text-primary" />
              Explore Problems
            </Button>
          </motion.div>
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
          className="absolute top-1/4 left-6 w-8 h-8 rounded-full bg-primary/20 blur-sm hidden md:block"
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
          className="absolute bottom-1/3 right-12 w-10 h-10 rounded-full bg-accent/20 blur-sm hidden md:block"
        />
      </div>
    </section>
  );
}