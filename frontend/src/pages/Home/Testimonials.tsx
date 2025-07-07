import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import React, { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Code } from "lucide-react"

interface Testimonial {
  name: string
  handle: string
  image: string
  quote: string
}

export default function Testimonials() {
  const testimonials: Testimonial[] = [
    {
      name: "Sarah Johnson",
      handle: "@sarahj",
      image: "/images/testimonials/sarah.jpg",
      quote: "This platform transformed my coding skills! I went from struggling with basic algorithms to solving medium-level problems in just 2 months.",
    },
    {
      name: "Mike Chen",
      handle: "@mikechen",
      image: "/images/testimonials/mike.jpg",
      quote: "The problem sets and editor are top-notch. My coding speed increased by 200% thanks to the real-time feedback and test cases.",
    },
    {
      name: "Emma Rodriguez",
      handle: "@emmarod",
      image: "/images/testimonials/emma.jpg",
      quote: "The competitive programming contests are addictive! I’ve improved my problem-solving skills and climbed the leaderboard.",
    },
    {
      name: "David Wilson",
      handle: "@davidw",
      image: "/images/testimonials/david.jpg",
      quote: "The detailed explanations and community discussions helped me master dynamic programming. I aced my last coding interview!",
    },
    {
      name: "Priya Patel",
      handle: "@priyap",
      image: "/images/testimonials/priya.jpg",
      quote: "As a beginner, the curated problem lists and hints made learning to code approachable. I’ve solved over 100 problems already!",
    },
    {
      name: "Liam Nguyen",
      handle: "@liamn",
      image: "/images/testimonials/liam.jpg",
      quote: "The ranking system motivated me to push my limits. I improved my algorithmic thinking and reached the top 10% in contests!",
    },
    {
      name: "Aisha Khan",
      handle: "@aishak",
      image: "/images/testimonials/aisha.jpg",
      quote: "The platform’s practice problems mirror real interview questions. It helped me land my dream job at a tech giant.",
    },
    {
      name: "Carlos Mendes",
      handle: "@carlosm",
      image: "/images/testimonials/carlos.jpg",
      quote: "The real-time performance analytics let me track my progress and focus on weak areas. My coding efficiency has skyrocketed!",
    },
  ]

  // Use ref and useInView for scroll-triggered animations
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section className="py-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-black dark:to-gray-900 overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="inline-block px-4 py-1.5 text-sm font-medium rounded-full bg-green-500/20 dark:bg-green-600/20 text-green-600 dark:text-green-300 animate-pulse"
          >
            Coder Success Stories
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-extrabold mt-4 bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-blue-400 dark:from-green-300 dark:to-blue-100 [text-shadow:_0_0_8px_rgba(255,255,255,0.3),_0_0_12px_rgba(34,197,94,0.2)] animate-[shine_4s_linear_infinite] bg-[length:200%_auto]">
            What Coders{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-cyan-500 dark:from-purple-300 dark:to-cyan-300">
              Say
            </span>
          </h2>
        </motion.div>

        <div className="px-8 md:px-12 lg:px-16" ref={ref}>
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-1">
              {testimonials.map((testimonial, index) => (
                <CarouselItem
                  key={index}
                  className="pl-4 md:basis-1/2 lg:basis-1/3"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                    className="group relative h-full"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-blue-500/20 dark:from-green-600/20 dark:to-blue-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative bg-gradient-to-br from-gray-100/50 to-gray-200/50 dark:from-gray-950/50 dark:to-black/50 p-8 rounded-2xl border border-gray-300 dark:border-gray-800 hover:border-green-500 dark:hover:border-green-500 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/10 dark:hover:shadow-green-500/10 h-full flex flex-col">
                      <Code className="w-8 h-8 text-green-500 dark:text-green-400 mb-6" />
                      <p className="text-lg text-gray-600 dark:text-gray-200 mb-6 flex-grow [text-shadow:_0_0_4px_rgba(255,255,255,0.2),_0_0_8px_rgba(34,197,94,0.1)] animate-[glow_3s_ease-in-out_infinite]">
                        "{testimonial.quote}"
                      </p>
                      <div className="flex items-center gap-4">
                        <motion.div
                          className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500/20 to-blue-500/20 dark:from-green-600/20 dark:to-blue-600/20 flex items-center justify-center"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-950" />
                        </motion.div>
                        <div>
                          <h4 className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-blue-400 dark:from-green-300 dark:to-blue-100 [text-shadow:_0_0_8px_rgba(255,255,255,0.3),_0_0_12px_rgba(34,197,94,0.2)] animate-[shine_4s_linear_infinite] bg-[length:200%_auto]">
                            {testimonial.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-200 [text-shadow:_0_0_4px_rgba(255,255,255,0.2),_0_0_8px_rgba(34,197,94,0.1)] animate-[glow_3s_ease-in-out_infinite]">
                            {testimonial.handle}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-4 bg-green-500/20 dark:bg-green-600/20 text-green-600 dark:text-green-300 hover:bg-green-500/30 dark:hover:bg-green-600/30" />
            <CarouselNext className="hidden md:flex -right-4 bg-green-500/20 dark:bg-green-600/20 text-green-600 dark:text-green-300 hover:bg-green-500/30 dark:hover:bg-green-600/30" />
          </Carousel>
        </div>
      </div>
      <style>{`
        @keyframes shine {
          0% {
            background-position: -200%;
          }
          100% {
            background-position: 200%;
          }
        }
        @keyframes glow {
          0%, 100% {
            text-shadow: 0 0 4px rgba(255, 255, 255, 0.2), 0 0 8px rgba(34, 197, 94, 0.1);
          }
          50% {
            text-shadow: 0 0 8px rgba(255, 255, 255, 0.4), 0 0 16px rgba(34, 197, 94, 0.3);
          }
        }
      `}</style>
    </section>
  )
}