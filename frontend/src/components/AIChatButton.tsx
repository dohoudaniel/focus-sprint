import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Bot, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

export default function AIChatButton() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Don't show if not logged in or if already on the chat page
  if (!isAuthenticated || location.pathname === "/chat") return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Link to="/chat">
        <motion.div
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="group relative"
        >
          {/* Outer Glow */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary/50 to-primary/20 blur-lg opacity-40 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Background */}
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/40 ring-1 ring-white/10">
            <MessageCircle size={28} className="group-hover:hidden transition-all" />
            <Bot size={28} className="hidden group-hover:block transition-all animate-in zoom-in-50" />
            
            {/* Small badge/dots */}
            <div className="absolute top-0 right-0 h-4 w-4 bg-emerald-400 rounded-full border-2 border-background flex items-center justify-center -translate-y-1 translate-x-1">
               <Sparkles size={8} className="text-white fill-white" />
            </div>
          </div>

          {/* Label Tooltip */}
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileHover={{ opacity: 1, x: 0 }}
              className="absolute right-full mr-4 top-1/2 -translate-y-1/2 hidden md:flex items-center"
            >
              <div className="bg-card/80 backdrop-blur-md border border-border/40 px-4 py-2 rounded-2xl shadow-xl whitespace-nowrap">
                <p className="text-xs font-black text-foreground uppercase tracking-[0.15em]">Chat with Coach</p>
                <div className="absolute top-1/2 -translate-y-1/2 -right-1.5 h-3 w-3 rotate-45 border-r border-t border-border/40 bg-card/80" />
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </Link>
    </div>
  );
}
