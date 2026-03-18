import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, ArrowRight, Zap, Target, BarChart, Clock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const isEmailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  const canSubmit = isEmailValid && password.length >= 8 && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      login(data.access_token, data.user);
    } catch (error: any) {
      toast.error(error.message || "Invalid credentials. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen overflow-hidden bg-background">
      {/* Left side - Illustration and Perks (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-[#020617] text-white overflow-hidden">
        {/* Animated Background Image */}
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0 bg-cover bg-center mix-blend-luminosity"
          style={{ backgroundImage: 'url("/auth-bg.png")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-[#020617]/40 opacity-90" />
        
        <Link to="/" className="relative z-10 flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 transition-transform group-hover:scale-110 overflow-hidden">
            <img src="/logo.png" alt="FocusSprint" className="h-full w-full object-cover" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">FocusSprint</span>
        </Link>

        <div className="relative z-10 max-w-lg mb-12">
          <motion.h2 
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="text-6xl font-bold leading-[1.1] mb-8"
          >
            Ready to <br />
            <span className="text-primary italic">lock in</span>?
          </motion.h2>
          
          <div className="grid gap-4">
            {[
              { icon: ShieldCheck, title: "Secure Sessions", desc: "Your productivity data is encrypted and private." },
              { icon: BarChart, title: "Growth Mindset", desc: "Turn focused hours into visual growth charts." },
              { icon: Clock, title: "Precision", desc: "Every micro-sprint is meticulously logged." }
            ].map((perk, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + (i * 0.1) }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
              >
                <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/20 shrink-0">
                  <perk.icon size={20} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-base leading-none mb-1.5">{perk.title}</h4>
                  <p className="text-white/50 text-xs font-medium">{perk.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-sm text-white/30 font-bold tracking-widest uppercase">
          <div className="h-px flex-1 bg-white/10" />
          Focus Flow
          <div className="h-px flex-1 bg-white/10" />
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 lg:px-20 py-12 relative bg-card">
        {/* Subtle mobile background blob */}
        <div className="lg:hidden absolute top-0 -left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="w-full max-w-sm space-y-10">
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8 group">
             <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:scale-110 overflow-hidden">
                <img src="/logo.png" alt="FocusSprint" className="h-full w-full object-cover" />
             </div>
             <span className="text-xl font-bold text-foreground">FocusSprint</span>
          </Link>

          <div className="space-y-3">
            <h1 className="text-5xl font-extrabold tracking-tight text-foreground">Welcome back</h1>
            <p className="text-muted-foreground font-medium">Continue your streak and stay productive.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="font-bold uppercase tracking-wider text-[10px] opacity-70">Email Access</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="you@example.com" 
                className="rounded-xl h-12 bg-white/5 border-border/60 transition-all focus:ring-primary/20 font-medium" 
                required 
                disabled={isSubmitting} 
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="font-bold uppercase tracking-wider text-[10px] opacity-70">Security Password</Label>
                <Link to="#" className="text-[10px] font-bold text-primary hover:underline transition-opacity opacity-70 tracking-widest uppercase">Lost Access?</Link>
              </div>
              <div className="relative group">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  className="pr-12 rounded-xl h-12 bg-white/5 border-border/60 transition-all focus:ring-primary/20 font-medium" 
                  required 
                  disabled={isSubmitting} 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="group relative w-full rounded-xl bg-primary text-primary-foreground h-12 text-base font-extrabold shadow-xl shadow-primary/20 hover:brightness-105 active:scale-95 transition-all overflow-hidden" 
              disabled={!canSubmit}
            >
              <div className="absolute inset-0 bg-white/10 group-hover:translate-x-full transition-transform duration-500 ease-out -translate-x-full" />
              <span className="relative flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" /> Authorizing...
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </Button>
          </form>

          <div className="text-center text-sm pt-6 border-t border-border/40">
            <span className="text-muted-foreground font-medium">New to FocusFlow? </span>
            <Link to="/auth/signup" className="font-extrabold text-primary hover:underline underline-offset-4 decoration-2">Create profile</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
