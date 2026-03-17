import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Timer, BarChart3, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";

const features = [
  { icon: Timer, title: "Precision Timer", desc: "25, 50, or custom minute sessions with a beautiful circular progress ring." },
  { icon: BarChart3, title: "Track Progress", desc: "Visualize your focus habits with weekly charts and streak tracking." },
  { icon: Zap, title: "Stay Motivated", desc: "Build momentum with streaks and session logging that keeps you accountable." },
  { icon: Target, title: "Deep Focus", desc: "Minimal, distraction-free interface designed for one thing: deep work." },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-primary focus:text-primary-foreground focus:p-3">
        Skip to main content
      </a>
      <Navbar />

      <main id="main">
        {/* Hero */}
        <section className="container py-20 md:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            >
              <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl text-balance">
                Turn intention into{" "}
                <span className="text-primary">measurable focus.</span>
              </h1>
              <p className="mt-6 max-w-lg text-lg text-muted-foreground leading-relaxed">
                A high-performance timer for deep work. Track sessions, visualize progress, and build a lasting focus habit.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <div className="relative">
                  <span className="absolute inset-0 rounded-button bg-primary animate-pulse_ring pointer-events-none" />
                  <Button asChild size="lg" className="relative rounded-button bg-primary text-primary-foreground shadow-card hover:brightness-95 gap-2 px-8">
                    <Link to="/auth/signup">
                      Start Focusing — Free <ArrowRight size={16} />
                    </Link>
                  </Button>
                </div>
                <Button asChild size="lg" variant="outline" className="rounded-button gap-2 px-8">
                  <Link to="/app">See Demo</Link>
                </Button>
              </div>
            </motion.div>

            {/* Animated timer mock */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center"
            >
              <HeroTimerMock />
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-t border-border/50 bg-muted/30 py-20">
          <div className="container">
            <AnimatedSection className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">Everything you need to focus</h2>
              <p className="mt-4 text-muted-foreground max-w-md mx-auto">Simple tools, powerful habits. No clutter, no distractions.</p>
            </AnimatedSection>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f, i) => (
                <AnimatedSection key={f.title} delay={i * 0.1}>
                  <div className="rounded-card border border-border/50 bg-card p-6 shadow-card transition-all hover:shadow-card-hover hover:-translate-y-0.5">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-button bg-primary/10">
                      <f.icon size={24} className="text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <AnimatedSection className="container py-20 text-center">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">Ready to build your focus habit?</h2>
          <p className="mt-4 text-muted-foreground">Join thousands who track their deep work with FocusSprint.</p>
          <Button asChild size="lg" className="mt-8 rounded-button bg-primary text-primary-foreground shadow-card hover:brightness-95 gap-2 px-10">
            <Link to="/auth/signup">Get Started Free <ArrowRight size={16} /></Link>
          </Button>
        </AnimatedSection>
      </main>

      <Footer />
    </div>
  );
}

function HeroTimerMock() {
  const circumference = 2 * Math.PI * 90;
  return (
    <div className="relative rounded-card border border-border/50 bg-card p-8 shadow-card">
      <svg width="240" height="240" viewBox="0 0 240 240" className="-rotate-90">
        <circle cx="120" cy="120" r="90" fill="none" stroke="hsl(var(--secondary))" strokeWidth="6" />
        <motion.circle
          cx="120" cy="120" r="90" fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: [circumference, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-5xl font-bold tabular-nums text-foreground font-body">25:00</span>
      </div>
    </div>
  );
}
