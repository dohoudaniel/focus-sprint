import { useState, useMemo } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Check, X, ArrowRight, Zap, Target, BarChart, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  const passwordRequirements = useMemo(() => [
    { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
    { label: "Contains a number", test: (p: string) => /\d/.test(p) },
    { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
    { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  ], []);

  const strength = useMemo(() => {
    if (!password) return 0;
    const met = passwordRequirements.filter(req => req.test(password)).length;
    return (met / passwordRequirements.length) * 100;
  }, [password, passwordRequirements]);

  const isEmailValid = useMemo(() => {
    if (!email) return true;
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  }, [email]);

  const canSubmit = useMemo(() => {
    return name.length > 0 && isEmailValid && strength === 100 && !isSubmitting;
  }, [name, isEmailValid, strength, isSubmitting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, name }),
      });
      toast.success("Account created successfully! Please log in.");
      navigate("/auth/login");
    } catch (error: any) {
      toast.error(error.message || "Signup failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen overflow-hidden bg-background">
      {/* Left side - Illustration and Perks (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-[#020617] text-white">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity"
          style={{ backgroundImage: 'url("/auth-bg.png")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-80" />
        
        <Link to="/" className="relative z-10 flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 transition-transform group-hover:scale-110 overflow-hidden">
            <img src="/logo.png" alt="FocusSprint" className="h-full w-full object-cover" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">FocusSprint</span>
        </Link>

        <div className="relative z-10 max-w-lg mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-bold leading-tight mb-8"
          >
            Master your time, <br />
            <span className="text-primary italic">one sprint</span> at a time.
          </motion.h2>
          
          <div className="space-y-6">
            {[
              { icon: Target, title: "Intentional Focus", desc: "Scientific 25/50 timing patterns for deep work." },
              { icon: BarChart, title: "Measurable Progress", desc: "Visual data tracking for your concentration habits." },
              { icon: Clock, title: "Automated Logging", desc: "Every minute of your focus is saved and organized." }
            ].map((perk, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                className="flex items-start gap-4"
              >
                <div className="mt-1 h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                  <perk.icon size={18} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">{perk.title}</h4>
                  <p className="text-white/60 text-sm">{perk.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-sm text-white/40 font-medium">
          © {new Date().getFullYear()} FocusSprint. All rights reserved.
        </div>
      </div>

      {/* Right side - Signup Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 lg:px-20 py-12 relative">
        {/* Subtle mobile background blob */}
        <div className="lg:hidden absolute top-0 -left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="w-full max-w-sm space-y-8">
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8 group">
             <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:scale-110 overflow-hidden">
                <img src="/logo.png" alt="FocusSprint" className="h-full w-full object-cover" />
             </div>
             <span className="text-xl font-bold text-foreground">FocusSprint</span>
          </Link>

          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Create account</h1>
            <p className="text-muted-foreground">Welcome! Enter your details to start focusing.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Your Full Name" 
                className="rounded-xl h-12 bg-white/5 border-border/60 transition-all focus:ring-primary/20" 
                disabled={isSubmitting} 
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Your email address" 
                className={`rounded-xl h-12 bg-white/5 border-border/60 transition-all focus:ring-primary/20 ${!isEmailValid ? "border-destructive ring-destructive/10" : ""}`} 
                required 
                disabled={isSubmitting} 
              />
              {!isEmailValid && <p className="text-[11px] text-destructive font-semibold mt-1">Please enter a valid email address.</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Security Password</Label>
              <div className="relative group">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="At least 8 characters" 
                  className="pr-12 rounded-xl h-12 bg-white/5 border-border/60 transition-all focus:ring-primary/20" 
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
              
              <div className="space-y-2.5 pt-1">
                <Progress value={strength} className={`h-1.5 ${strength === 100 ? "bg-primary/20" : "bg-muted"}`} />
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {passwordRequirements.map((req, i) => {
                    const met = req.test(password);
                    return (
                      <div key={i} className={`flex items-center gap-1.5 py-1 px-2 rounded-md border transition-colors ${met ? "bg-primary/5 border-primary/20" : "bg-muted/30 border-transparent"}`}>
                        {met ? (
                          <Check size={12} className="text-primary" />
                        ) : (
                          <X size={12} className="text-muted-foreground/40" />
                        )}
                        <span className={`text-[10px] font-bold ${met ? "text-primary" : "text-muted-foreground/60"}`}>
                          {req.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="group relative w-full rounded-xl bg-primary text-primary-foreground h-12 text-base font-bold shadow-xl shadow-primary/20 hover:brightness-105 active:scale-95 transition-all overflow-hidden" 
              disabled={!canSubmit}
            >
              <div className="absolute inset-0 bg-white/10 group-hover:translate-x-full transition-transform duration-500 ease-out -translate-x-full" />
              <span className="relative flex items-center justify-center gap-2">
                {isSubmitting ? "Generating Workspace..." : "Start Your First Sprint"} 
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </form>

          <div className="text-center text-sm pt-4 border-t border-border/40">
            <span className="text-muted-foreground">Already mastering focus? </span>
            <Link to="/auth/login" className="font-bold text-primary hover:underline underline-offset-4 decoration-2">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
