import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Home, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: Path not found:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#020617] text-white p-6 overflow-hidden relative">
      {/* Dynamic Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none z-0">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M0 100 V0 H100" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="0" cy="0" r="1" fill="currentColor" />
            <circle cx="100" cy="100" r="1" fill="currentColor" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#circuit)" />
        </svg>
      </div>

      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Brand Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-12 flex items-center gap-3 z-20"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 overflow-hidden">
          <img src="/logo.png" alt="FocusSprint" className="h-full w-full object-cover" />
        </div>
        <span className="text-2xl font-black tracking-tighter uppercase font-display">FocusSprint</span>
      </motion.div>

      <div className="relative z-10 max-w-5xl w-full grid lg:grid-cols-2 gap-16 items-center">
        {/* Left Side: Illustration */}
        <motion.div
           initial={{ opacity: 0, scale: 0.9, x: -30 }}
           animate={{ opacity: 1, scale: 1, x: 0 }}
           transition={{ duration: 0.8, ease: "circOut" }}
           className="relative"
        >
          <div className="absolute -inset-6 bg-primary/20 rounded-[3.5rem] blur-3xl opacity-25 group-hover:opacity-40 transition-opacity" />
          <div className="relative rounded-[3rem] overflow-hidden border border-white/10 shadow-3xl bg-card/20 backdrop-blur-sm p-2">
            <img 
              src="/404-glitch.png" 
              alt="Broken Focus Timer" 
              className="w-full h-auto rounded-[2.5rem]"
            />
          </div>
        </motion.div>

        {/* Right Side: Text & Actions */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="space-y-10 text-center lg:text-left"
        >
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
               <span className="relative flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
               </span>
               Session Interrupted
            </div>
            <h1 className="text-7xl lg:text-8xl font-black tracking-tighter leading-[0.85] uppercase italic text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/20">
              Link <br />
              <span className="text-primary not-italic">Fragmented.</span>
            </h1>
            <p className="text-white/40 text-lg font-medium max-w-md mx-auto lg:mx-0 leading-relaxed">
              We couldn't synchronize your current focus intent with this path. The destination you're looking for was never initialized.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5 justify-center lg:justify-start">
            <Button 
               asChild
               size="lg" 
               className="rounded-2xl bg-primary text-primary-foreground font-black px-10 h-14 text-base shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Link to="/app">
                Resume Focus
                <Zap size={20} className="ml-2" fill="currentColor" />
              </Link>
            </Button>
            
            <Button 
               variant="ghost"
               size="lg" 
               onClick={() => navigate(-1)}
               className="rounded-2xl border border-white/10 bg-white/5 text-white hover:bg-white/10 px-10 h-14 font-bold transition-all"
            >
               <ArrowLeft size={18} className="mr-2" />
               Revert Path
            </Button>
          </div>

          <div className="pt-4">
            <Link to="/" className="group flex items-center justify-center lg:justify-start gap-4 text-[10px] font-black text-white/20 hover:text-white transition-all uppercase tracking-[0.4em]">
              <div className="h-px w-8 bg-white/10 group-hover:w-12 group-hover:bg-primary transition-all" />
              <span>Diagnostic Home</span>
              <Home size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Subtle Bottom System Info */}
      <div className="absolute bottom-12 left-12 flex items-center gap-6 opacity-20 hidden md:flex">
         <div className="text-[10px] font-bold uppercase tracking-widest vertical-text rotate-180">ERR_00_404</div>
         <div className="h-12 w-px bg-white/40" />
         <div className="text-[10px] font-bold uppercase tracking-widest space-y-1">
            <p>Lat: Locked</p>
            <p>Lng: Void</p>
         </div>
      </div>
    </div>
  );
};

export default NotFound;
