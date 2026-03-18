import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Sparkles, Target, Zap } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-28 border-b border-border/20">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="container relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold text-primary shadow-sm tracking-widest uppercase">
                  <Sparkles size={14} />
                  <span>The Vision</span>
                </div>
                
                <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-foreground leading-[0.9]">
                  Beyond a <br />
                  <span className="text-primary italic">Timer.</span>
                </h1>
                
                <div className="space-y-6 text-lg text-muted-foreground font-medium leading-relaxed max-w-lg">
                  <p>
                    FocusSprint was born from a simple observation: <span className="text-foreground">Productivity is not about doing more; it's about doing one thing with absolute intentionality.</span>
                  </p>
                  <p>
                    We built a precision workspace designed for the high-performance remote workforce. By combining minimalist design with deep-work research, we've created a companion that doesn't just track time — it helps you reclaim it.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-4">
                   <div className="p-4 rounded-2xl bg-card border border-border/40 space-y-2">
                      <Target className="text-primary" size={20} />
                      <h4 className="font-bold text-sm">Our Mission</h4>
                      <p className="text-xs text-muted-foreground font-medium">Empower 100k+ builders to reach peak potential through depth.</p>
                   </div>
                   <div className="p-4 rounded-2xl bg-card border border-border/40 space-y-2">
                      <Zap className="text-primary" size={20} />
                      <h4 className="font-bold text-sm">Our Belief</h4>
                      <p className="text-xs text-muted-foreground font-medium">Flow state is the ultimate competitive advantage.</p>
                   </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="relative"
              >
                <div className="absolute -inset-4 bg-primary/10 rounded-[3rem] blur-3xl opacity-50" />
                <div className="relative rounded-[2.5rem] overflow-hidden border-4 border-card shadow-2xl">
                  <img 
                    src="/about-hero.png" 
                    alt="FocusSprint Precision Dashboard" 
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Core Values / Stats */}
        <section className="py-24 bg-muted/10">
           <div className="container text-center max-w-3xl mx-auto space-y-6">
              <h2 className="text-2xl font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">The Sprint Philosophy</h2>
              <p className="text-2xl md:text-3xl font-bold leading-tight text-foreground">
                "Intensity of focus is the only way to squeeze the juice out of every hour."
              </p>
           </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
