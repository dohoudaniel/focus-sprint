import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Target, BarChart, Clock, ShieldCheck, ChevronRight, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AnimatedSection = ({ children, delay = 0 }: any) => (
  <motion.section
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.5, delay }}
  >
    {children}
  </motion.section>
);

const FeatureCard = ({ icon: Icon, title, desc, delay, image }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.4 }}
    className="group relative flex flex-col h-[380px] overflow-hidden rounded-[2rem] border border-border/40 bg-card/60 transition-all hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/30 backdrop-blur-sm"
  >
    {/* Background Image Layer */}
    <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.img 
            whileHover={{ scale: 1.1 }}
            src={image} 
            alt={title} 
            className="w-full h-full object-cover opacity-40 group-hover:opacity-80 transition-all duration-700 saturate-[0.9] group-hover:saturate-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent opacity-100 group-hover:opacity-90 transition-opacity duration-700" />
    </div>

    {/* Content Layer */}
    <div className="relative z-10 flex flex-col h-full p-8 text-white">
        <div className="mb-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-md transition-all group-hover:bg-primary group-hover:scale-110 shadow-sm border border-white/10">
          <Icon size={24} />
        </div>
        <div className="mt-auto transform transition-transform duration-500 group-hover:-translate-y-1">
            <h3 className="mb-3 text-2xl font-black tracking-tight uppercase tracking-wider text-white drop-shadow-md">{title}</h3>
            <p className="text-sm font-semibold leading-relaxed text-white/70 group-hover:text-white transition-colors duration-500 line-clamp-3">{desc}</p>
        </div>
    </div>
  </motion.div>
);

function HeroTimerMock() {
  const circumference = 2 * Math.PI * 70;
  return (
    <div className="relative rounded-3xl border border-border/40 bg-card/60 p-8 shadow-2xl backdrop-blur-xl group hover:border-primary/20 transition-all duration-500 overflow-hidden">
      <div className="absolute -top-10 -right-10 h-32 w-32 bg-primary/5 blur-3xl rounded-full" />
      
      <svg width="180" height="180" viewBox="0 0 180 180" className="-rotate-90 relative z-10 mx-auto">
        <circle cx="90" cy="90" r="70" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/20" />
        <motion.circle
          cx="90" cy="90" r="70" fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: [circumference, circumference * 0.15] }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
        <span className="text-4xl font-black tabular-nums text-foreground tracking-tight">25:00</span>
        <div className="mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-[8px] tracking-widest uppercase">
           <Play size={8} fill="currentColor" /> Flow State
        </div>
      </div>
    </div>
  );
}

export default function IndexPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/20">
      <Navbar />

      <main className="flex-1">
        {/* Compact Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-24">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/2" />

          <div className="container relative z-10">
            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-xl mx-auto lg:mx-0 text-center lg:text-left space-y-6"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-[11px] font-bold text-primary shadow-sm tracking-wide uppercase">
                  <Sparkles size={12} />
                  <span>Productivity for high performers</span>
                </div>

                <h1 className="text-4xl font-black tracking-tight text-foreground md:text-5xl xl:text-6xl leading-[1.1]">
                  Master your <br />
                  <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent italic">Deep Focus.</span>
                </h1>

                <p className="text-base leading-relaxed text-muted-foreground font-medium max-w-lg lg:max-w-md">
                   Simple, intentional, and private. A minimalist workspace designed to help you reclaim your concentration.
                </p>

                <div className="flex flex-col items-center lg:items-start gap-3 sm:flex-row">
                  <Button asChild size="lg" className="rounded-xl bg-primary px-7 h-12 text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all w-full sm:w-auto">
                    <Link to={isAuthenticated ? "/app" : "/auth/signup"}>
                      {isAuthenticated ? "Enter Workspace" : "Get Started Now"}
                      <ArrowRight size={16} className="ml-2" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="rounded-xl px-7 h-12 border-border/60 hover:bg-card/40 transition-all font-bold text-sm w-full sm:w-auto">
                     Explore Features
                  </Button>
                </div>

                <div className="flex items-center justify-center lg:justify-start gap-4 text-[10px] font-bold text-muted-foreground uppercase opacity-50 tracking-[0.2em] pt-2">
                   <div className="flex items-center gap-1.5"><ShieldCheck size={14} /> 100% Private</div>
                   <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                   <div>No Tracking</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="relative hidden lg:block"
              >
                 <div className="relative group flex justify-center">
                    <img src="/hero.png" className="w-[110%] h-auto rounded-3xl shadow-2xl opacity-50 saturate-[0.8] grayscale-[0.3] group-hover:opacity-100 group-hover:saturate-100 group-hover:grayscale-0 transition-all duration-1000 ease-in-out transform group-hover:scale-[1.02]" alt="FocusSprint Dashboard Mockup" />
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-6 scale-90 group-hover:scale-100 transition-transform duration-700">
                       <HeroTimerMock />
                    </div>
                 </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Professional Feature Section */}
        <section id="features" className="py-20 bg-muted/10 border-y border-border/20">
          <div className="container overflow-hidden">
            <div className="mb-16 text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-3xl font-black text-foreground md:text-4xl tracking-tight uppercase tracking-widest">The Focus Stack</h2>
              <p className="text-muted-foreground font-semibold text-base">Minimalist tools grounded in deep-work research.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <FeatureCard
                icon={Target}
                title="Intentionality"
                desc="Choose your sprint mode and commit. Calibrated for optimal flow states."
                image="/timer-feature.png"
                delay={0.1}
              />
              <FeatureCard
                icon={BarChart}
                title="Performance"
                desc="Visual data that tracks your peak focus hours without the fluff."
                image="/analytics.png"
                delay={0.2}
              />
              <FeatureCard
                icon={ShieldCheck}
                title="Privacy"
                desc="Encrypted local-first architecture. Your focus data is yours alone."
                image="/auth-bg.png"
                delay={0.3}
              />
            </div>
          </div>
        </section>

        {/* Minimalist CTA */}
        <AnimatedSection>
          <div className="container py-20">
            <motion.div 
               className="rounded-3xl bg-[#020617] p-10 lg:p-16 text-center relative overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                <div className="inline-block p-3 rounded-xl bg-primary/15 border border-primary/20 text-primary">
                   <Zap size={24} fill="currentColor" />
                </div>
                <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight uppercase tracking-wider">Ready to Focus?</h2>
                <p className="text-white/50 text-base font-medium leading-relaxed italic">"Simplicity is the ultimate sophistication." — Reclaim your time with intentional sprints.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                   <Button asChild size="lg" className="rounded-xl bg-primary text-primary-foreground hover:brightness-110 font-bold px-8 h-12 text-sm shadow-lg">
                      <Link to="/auth/signup">Create Your Profile</Link>
                   </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </AnimatedSection>
      </main>

      <Footer />
    </div>
  );
}
