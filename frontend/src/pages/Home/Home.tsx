import Hero from "./Hero";
import Testimonials from "./Testimonials";
import Working from "./Working";
import Footer from "./Footer";

export default function Home() {
  return (
    <div className="relative">
      <Hero />
      <Working />
      <Testimonials />
      <Footer />
    </div>
  );
}
