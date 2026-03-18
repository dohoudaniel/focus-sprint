import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Home, Zap, Clock, AlertCircle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: Path not found:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-6 overflow-hidden relative selection:bg-primary/20">
      
      {/* Background patterns for a light, clean look */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none z-0">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <pattern id="dot-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="currentColor" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#dot-grid)" />
        </svg>
      </div>

      {/* Primary Color Glows */}
      <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Brand Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-12 right-12 flex items-center gap-3 z-20"
      >
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 overflow-hidden">
            <img src="/logo.png" alt="FocusSprint" className="h-full w-full object-cover" />
          </div>
          <span className="text-2xl font-black tracking-tighter font-display">FocusSprint</span>
        </Link>
      </motion.div>

      <div className="relative z-10 max-w-6xl w-full grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
        
        {/* Left Side: Illustration */}
        <motion.div
           initial={{ opacity: 0, scale: 0.9, y: 20 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           transition={{ duration: 0.8, ease: "easeOut" }}
           className="relative"
        >
          <div className="absolute -inset-10 bg-primary/10 rounded-[4rem] blur-[80px] opacity-40 group-hover:opacity-60 transition-opacity" />
          <div className="relative rounded-[3rem] overflow-hidden border border-border shadow-[0_20px_50px_rgba(0,0,0,0.05)] bg-white p-3">
            <img 
              src="/404-light.png" 
              alt="Time Displaced" 
              className="w-full h-auto rounded-[2.5rem] brightness-[1.02]"
            />
            {/* Minimalist Data Badge */}
            <div className="absolute bottom-8 right-8 flex items-center gap-3 bg-white/90 backdrop-blur-md border border-border px-5 py-2.5 rounded-2xl shadow-xl">
               <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
               <span className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">Sync Interrupt</span>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Content */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="space-y-12 text-center lg:text-left"
        >
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
               <ShieldAlert size={14} />
               Path Refused
            </div>
            
            <h1 className="text-6xl lg:text-[7rem] font-black tracking-tighter leading-[0.85] uppercase text-foreground">
              Focus <br />
              <span className="text-primary italic">Diverted.</span>
            </h1>
            
            <div className="space-y-4 max-w-md mx-auto lg:mx-0">
              <p className="text-muted-foreground text-lg font-medium leading-relaxed">
                The session path you were following has been interrupted. This destination appears to be outside your intended focus zone.
              </p>
              
              {/* Path Display */}
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                 <div className="h-px w-8 bg-border" />
                 <span className="text-xs font-mono font-bold text-muted-foreground/60 p-1.5 rounded bg-muted/50 border border-border/40">
                   ERR_PATH: {location.pathname}
                 </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <Button 
               asChild
               size="lg" 
               className="rounded-2xl bg-primary text-primary-foreground font-black px-12 h-16 text-base shadow-xl shadow-primary/20 hover:scale-[1.03] active:scale-95 transition-all"
            >
              <Link to="/app">
                Resume Workflow
                <Zap size={20} className="ml-3" fill="currentColor" />
              </Link>
            </Button>
            
            <Button 
               variant="outline"
               size="lg" 
               onClick={() => navigate(-1)}
               className="rounded-2xl border-2 border-border bg-white text-foreground hover:bg-muted px-10 h-16 font-bold transition-all shadow-sm"
            >
               <ArrowLeft size={18} className="mr-3" />
               Revert Path
            </Button>
          </div>

          <div className="pt-4">
            <Link to="/" className="group flex items-center justify-center lg:justify-start gap-5 text-[10px] font-black text-muted-foreground/40 hover:text-primary transition-all uppercase tracking-[0.4em]">
              <div className="h-px w-10 bg-border group-hover:w-16 group-hover:bg-primary transition-all" />
              <span>Base Navigation</span>
              <Home size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Subtle UI Footer Info */}
      <div className="absolute bottom-12 left-12 right-12 flex items-center justify-between opacity-30 text-muted-foreground hidden md:flex">
         <div className="flex items-center gap-4">
            <div className="text-[10px] font-black uppercase tracking-widest font-mono">Status: Error 404</div>
            <div className="h-px w-12 bg-border" />
            <div className="text-[10px] font-black uppercase tracking-widest font-mono">Lat: N/A</div>
         </div>
         <div className="flex items-center gap-3">
            <Clock size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest font-mono">{new Date().toLocaleTimeString()}</span>
         </div>
      </div>
    </div>
  );
};

export default NotFound;
