import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/app");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm rounded-card border border-border/50 bg-card p-8 shadow-card"
      >
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-button bg-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="hsl(var(--primary-foreground))" /></svg>
          </div>
          <span className="font-display text-xl font-bold text-foreground">FocusSprint</span>
        </Link>

        <h1 className="text-center text-2xl font-bold text-foreground">Create your account</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">Start tracking your focus sessions today</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1 rounded-button" required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-1 rounded-button" required minLength={8} />
          </div>
          <Button type="submit" className="w-full rounded-button bg-primary text-primary-foreground shadow-card hover:brightness-95">
            Start Focusing — Free
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/auth/login" className="font-medium text-primary hover:underline">Log in</Link>
        </p>
      </motion.div>
    </div>
  );
}
