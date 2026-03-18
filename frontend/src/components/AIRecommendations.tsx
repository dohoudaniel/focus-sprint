import { useQuery } from "@tanstack/react-query";
import { BookOpen, ExternalLink, Sparkles, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface Recommendation {
  title: string;
  description: string;
  topic: string;
  url: string;
}

export default function AIRecommendations() {
  const { data: recommendations, isLoading, error } = useQuery<Recommendation[]>({
    queryKey: ["ai-recommendations"],
    queryFn: () => apiFetch("/api/ai/recommendations"),
    staleTime: 10 * 60 * 1000, // 10 minutes cache
  });

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-border/40 bg-card/40 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Deep Work Reads</span>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 w-full rounded-2xl bg-muted/20 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !recommendations) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-border/40 bg-card shadow-sm overflow-hidden"
    >
      <div className="p-5 border-b border-border/40 flex items-center justify-between bg-primary/5">
        <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-primary" />
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Deep Work Reads</h3>
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest text-primary/60 bg-primary/10 px-2 py-0.5 rounded-full">
            AI Curated
        </div>
      </div>
      
      <div className="p-3 space-y-2">
        {recommendations.map((rec, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => window.open(rec.url, '_blank')}
            className="group p-4 rounded-2xl hover:bg-primary/5 transition-all border border-transparent hover:border-primary/20 cursor-pointer"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                   <span className="text-[9px] font-black uppercase tracking-widest text-primary px-1.5 py-0.5 rounded bg-primary/10">
                      {rec.topic}
                   </span>
                </div>
                <h4 className="text-sm font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                  {rec.title}
                </h4>
                <div className="text-[11px] text-muted-foreground leading-relaxed font-medium break-words">
                  <ReactMarkdown>{rec.description}</ReactMarkdown>
                </div>
              </div>
              <div className="p-2 rounded-xl bg-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink size={14} className="text-muted-foreground" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="p-4 bg-muted/5 border-t border-border/40">
         <p className="text-[9px] font-bold text-muted-foreground text-center uppercase tracking-tighter">
            Recommendations update based on your focus habits
         </p>
      </div>
    </motion.div>
  );
}
