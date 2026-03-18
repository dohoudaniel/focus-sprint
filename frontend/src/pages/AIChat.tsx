import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Trash2, ArrowLeft, Loader2, Sparkles, MessageSquare } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Navigate, Link } from "react-router-dom";
import { toast } from "sonner";

interface Message {
  role: "user" | "bot";
  content: string;
}

const QUICK_PROMPTS = [
  "Analyze my session performance.",
  "How can I stay focused longer?",
  "Should I take a break now?",
  "Suggest a focus plan for today.",
];

export default function AIChatPage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem("focussprint_chat");
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    localStorage.setItem("focussprint_chat", JSON.stringify(messages));
  }, [messages]);

  if (authLoading) return null;
  if (!isAuthenticated) return <Navigate to="/auth/login" />;

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isTyping) return;

    const newMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await apiFetch("/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          message: text,
          history: messages,
        }),
      });

      setMessages((prev) => [...prev, { role: "bot", content: res.reply }]);
    } catch (err: any) {
      toast.error("Coach unavailable: " + err.message);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem("focussprint_chat");
    toast.info("Conversation cleared.");
  };

  return (
    <div className="flex h-screen flex-col bg-background selection:bg-primary/20">
      <Navbar />
      
      <main className="container flex-1 max-w-4xl py-6 flex flex-col min-h-0 overflow-hidden">
        {/* Header Area */}
        <div className="flex items-center justify-between mb-6 px-1">
          <div className="flex items-center gap-3">
            <Link to="/app" className="p-2 hover:bg-muted rounded-xl transition-colors">
              <ArrowLeft size={18} className="text-muted-foreground" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
                Focus Coach <Sparkles size={18} className="text-primary fill-primary/20" />
              </h1>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Powered by AI</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={clearChat} className="rounded-xl text-muted-foreground hover:text-destructive gap-2">
            <Trash2 size={16} /> Clear History
          </Button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden relative border border-border/40 rounded-3xl bg-card/60 backdrop-blur-md shadow-2xl flex flex-col">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth custom-scrollbar">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-6">
                <div className="h-16 w-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center ring-4 ring-primary/5">
                  <Bot size={32} className="text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-foreground">Master your productivity.</h3>
                  <p className="text-sm text-balance text-muted-foreground font-medium leading-relaxed max-w-md">
                    I'm your tailored coach. I know your session history and I'm strictly here to help you focus. No distractions allowed.
                  </p>
                </div>
                
                {/* Seed prompts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg mt-4">
                  {QUICK_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => handleSend(p)}
                      className="text-xs text-left p-4 rounded-2xl border border-border/60 bg-muted/40 hover:bg-primary/10 hover:border-primary/40 transition-all font-bold group flex items-center gap-3"
                    >
                      <MessageSquare size={14} className="text-primary shrink-0 opacity-40 group-hover:opacity-100" />
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border ${
                      msg.role === "user" ? "bg-muted/40 border-border/40" : "bg-primary/15 border-primary/20"
                    }`}>
                      {msg.role === "user" ? <User size={14} className="text-muted-foreground" /> : <Bot size={14} className="text-primary" />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed font-medium ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 rounded-tr-none"
                        : "bg-muted/40 border border-border/40 text-foreground rounded-tl-none prose prose-invert prose-sm max-w-none"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/20 border border-border/30">
                    <Loader2 size={16} className="text-primary animate-spin" />
                    <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Thinking...</span>
                  </div>
                </motion.div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-muted/30 border-t border-border/40 backdrop-blur-xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your coach anything about focus..."
                className="flex-1 rounded-2xl border-border/60 bg-muted/40 focus:ring-primary/20 py-6 font-bold"
                disabled={isTyping}
              />
              <Button
                type="submit"
                disabled={isTyping || !input.trim()}
                className="rounded-2xl h-12 w-12 p-0 bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-110"
              >
                <Send size={20} />
              </Button>
            </form>
            <p className="text-[10px] text-center text-muted-foreground mt-3 font-medium uppercase tracking-widest opacity-60">
              The coach remembers your history for tailored advice.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
