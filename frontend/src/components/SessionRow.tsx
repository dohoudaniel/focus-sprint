import { motion } from "framer-motion";
import { Clock, CheckCircle2, XCircle } from "lucide-react";
import type { Session } from "@/lib/mock-data";

export default function SessionRow({ session, index }: { session: Session; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="flex items-center gap-4 rounded-card border border-border/50 bg-card p-4 shadow-card transition-shadow hover:shadow-card-hover"
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
        session.status === "completed" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
      }`}>
        {session.status === "completed" ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{session.note}</p>
        <p className="text-sm text-muted-foreground">{session.date} · {session.startTime} – {session.endTime}</p>
      </div>
      <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
        <Clock size={14} />
        <span className="tabular-nums">{session.duration}m</span>
      </div>
    </motion.div>
  );
}
