import { motion } from "framer-motion";
import { Clock, CheckCircle2, XCircle, ChevronRight, MessageSquare } from "lucide-react";

export default function SessionRow({ session, index }: { session: any; index: number }) {
  const isCompleted = session.status === "completed";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: "easeOut" }}
      className="group flex items-center gap-4 rounded-2xl border border-border/40 bg-card p-5 shadow-sm transition-all hover:shadow-card-hover hover:border-primary/20 hover:-translate-y-0.5 relative overflow-hidden"
    >
      {/* Visual left indicator */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all ${isCompleted ? "bg-primary group-hover:w-1.5" : "bg-destructive group-hover:w-1.5"}`} />

      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all ${
        isCompleted ? "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground" : "bg-destructive/10 text-destructive group-hover:bg-destructive group-hover:text-destructive-foreground"
      }`}>
        {isCompleted ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
      </div>

      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="font-bold text-foreground truncate text-base group-hover:text-primary transition-colors">
            {session.note || "Unfocused session"}
          </p>
          {session.note && <MessageSquare size={12} className="text-muted-foreground opacity-40" />}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
          <span className="tabular-nums">{session.date}</span>
          <span className="opacity-30">•</span>
          <span className="tabular-nums">{session.startTime} – {session.endTime}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground tabular-nums bg-muted/30 px-3 py-1.5 rounded-lg border border-border/20 group-hover:bg-primary/5 group-hover:border-primary/20 transition-all">
          <Clock size={14} className="text-primary/70" />
          <span>{session.duration}m</span>
        </div>
        <ChevronRight size={18} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
      </div>
    </motion.div>
  );
}
