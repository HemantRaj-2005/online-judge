import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Star, Quote } from "lucide-react";

interface Testimonial {
  name: string;
  handle: string;
  quote: string;
  rating: number;
  color: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Sarah Johnson",
    handle: "@sarahj",
    quote:
      "This platform transformed my coding skills! I went from struggling with basic algorithms to solving medium-level problems in just 2 months.",
    rating: 5,
    color: "from-indigo-500 to-blue-500",
  },
  {
    name: "Mike Chen",
    handle: "@mikechen",
    quote:
      "The problem sets and editor are top-notch. My coding speed increased by 200% thanks to the real-time feedback and test cases.",
    rating: 5,
    color: "from-purple-500 to-pink-500",
  },
  {
    name: "Emma Rodriguez",
    handle: "@emmarod",
    quote:
      "The competitive programming contests are addictive! I've improved my problem-solving skills and climbed the leaderboard.",
    rating: 5,
    color: "from-cyan-500 to-teal-500",
  },
  {
    name: "David Wilson",
    handle: "@davidw",
    quote:
      "The detailed explanations and community discussions helped me master dynamic programming. I aced my last coding interview!",
    rating: 5,
    color: "from-amber-500 to-orange-500",
  },
  {
    name: "Priya Patel",
    handle: "@priyap",
    quote:
      "As a beginner, the curated problem lists and hints made learning to code approachable. I've solved over 100 problems already!",
    rating: 4,
    color: "from-rose-500 to-red-500",
  },
  {
    name: "Liam Nguyen",
    handle: "@liamn",
    quote:
      "The ranking system motivated me to push my limits. I improved my algorithmic thinking and reached the top 10% in contests!",
    rating: 5,
    color: "from-emerald-500 to-green-500",
  },
  {
    name: "Aisha Khan",
    handle: "@aishak",
    quote:
      "The platform's practice problems mirror real interview questions. It helped me land my dream job at a tech giant.",
    rating: 5,
    color: "from-violet-500 to-purple-500",
  },
  {
    name: "Carlos Mendes",
    handle: "@carlosm",
    quote:
      "The real-time performance analytics let me track my progress and focus on weak areas. My coding efficiency has skyrocketed!",
    rating: 4,
    color: "from-blue-500 to-indigo-500",
  },
];

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="flex-shrink-0 w-[340px] mx-3">
      <div className="glass rounded-2xl p-6 h-full glow-border transition-all duration-300 hover:translate-y-[-2px]">
        <Quote className="w-5 h-5 text-primary/40 mb-3" />
        <p className="text-sm text-foreground/70 leading-relaxed mb-5">
          "{testimonial.quote}"
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-full bg-gradient-to-br ${testimonial.color} flex items-center justify-center text-white text-xs font-bold`}
            >
              {testimonial.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">
                {testimonial.name}
              </h4>
              <p className="text-xs text-muted-foreground">
                {testimonial.handle}
              </p>
            </div>
          </div>
          <div className="flex gap-0.5">
            {Array.from({ length: testimonial.rating }).map((_, i) => (
              <Star
                key={i}
                className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section className="py-24 relative overflow-hidden" ref={ref}>
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/[0.04] rounded-full blur-[100px]" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-full bg-primary/[0.1] text-primary border border-primary/[0.15] mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Loved by{" "}
            <span className="gradient-text">Developers</span>{" "}
            Worldwide
          </h2>
          <p className="text-muted-foreground mt-3 max-w-md mx-auto">
            Join thousands of coders who have transformed their skills on our
            platform.
          </p>
        </motion.div>
      </div>

      {/* Marquee Row 1 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative"
      >
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />

        <div className="flex animate-marquee">
          {[...testimonials, ...testimonials].map((t, i) => (
            <TestimonialCard key={`${t.name}-${i}`} testimonial={t} />
          ))}
        </div>
      </motion.div>

      {/* Marquee Row 2 (reversed, offset) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="relative mt-4"
      >
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />

        <div
          className="flex"
          style={{
            animation: "marquee 35s linear infinite reverse",
          }}
        >
          {[...testimonials.slice(4), ...testimonials.slice(0, 4), ...testimonials.slice(4), ...testimonials.slice(0, 4)].map(
            (t, i) => (
              <TestimonialCard key={`rev-${t.name}-${i}`} testimonial={t} />
            )
          )}
        </div>
      </motion.div>
    </section>
  );
}