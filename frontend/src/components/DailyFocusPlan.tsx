import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Clock, TrendingUp, CheckCircle2, Brain } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Sprint {
  time: string;
  duration: number;
  task: string;
  priority: "high" | "medium" | "low";
}

interface DailyPlan {
  greeting: string;
  status: "on_track" | "behind" | "great_day" | "rest_recommended";
  sprints: Sprint[];
  tip: string;
  daily_word: string;
  focus_today_min: number;
  sessions_today: number;
}

const priorityStyle = {
  high: "text-primary border-primary/30 bg-primary/10",
  medium: "text-amber-400 border-amber-400/30 bg-amber-400/10",
  low: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
};

const statusConfig = {
  on_track: { label: "On Track", color: "text-emerald-400", icon: CheckCircle2 },
  behind: { label: "Behind Schedule", color: "text-amber-400", icon: Clock },
  great_day: { label: "Crushing It", color: "text-primary", icon: Zap },
  rest_recommended: { label: "Rest Recommended", color: "text-muted-foreground", icon: TrendingUp },
};

// Premium animated AI thinking spinner
function AIThinkingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-5">
      {/* Pulsing brain orb */}
      <div className="relative flex items-center justify-center">
        {/* Outer glow rings */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-primary/20"
            animate={{
              scale: [1, 1.8, 1],
              opacity: [0.4, 0, 0.4],
            }}
            transition={{
              duration: 2,
              delay: i * 0.6,
              repeat: Infinity,
              ease: "easeOut",
            }}
            style={{ width: 56 + i * 20, height: 56 + i * 20 }}
          />
        ))}
        {/* Core icon */}
        <motion.div
          className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/30"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Brain size={26} className="text-primary" />
        </motion.div>
      </div>

      {/* Typing dots */}
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-primary/60"
            animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* Status text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center space-y-1"
      >
        <p className="text-xs font-black uppercase tracking-widest text-primary">Generating Plan</p>
        <p className="text-[10px] text-muted-foreground font-medium">Analysing your session patterns…</p>
      </motion.div>

      {/* Scanning bar */}
      <div className="w-40 h-0.5 bg-muted/40 rounded-full overflow-hidden">
        <motion.div
          className="h-full w-1/3 bg-primary/70 rounded-full"
          animate={{ x: ["-100%", "300%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}

export default function DailyFocusPlan() {
  const { isAuthenticated } = useAuth();

  const { data: plan, isLoading } = useQuery<DailyPlan>({
    queryKey: ["ai-daily-plan"],
    queryFn: () => apiFetch("/api/ai/daily-plan"),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 15,
  });

  const StatusIcon = plan ? (statusConfig[plan.status]?.icon ?? Zap) : Zap;
  const statusCfg = plan ? (statusConfig[plan.status] ?? statusConfig.on_track) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl border border-border/40 bg-card/60 p-5 backdrop-blur-sm space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
          <Zap size={16} className="text-primary" />
        </div>
        <div>
          <h3 className="font-black text-sm text-foreground">Daily Plan</h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">AI Generated</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AIThinkingSpinner />
          </motion.div>
        ) : plan ? (
          <motion.div
            key="plan"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Daily Word */}
            <div className="text-center py-3 border-y border-border/30">
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-0.5">Today's Word</p>
              <motion.p
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="text-3xl font-black text-primary tracking-tight"
              >
                {plan.daily_word}
              </motion.p>
            </div>

            {/* Status */}
            {statusCfg && (
              <div className={`flex items-center gap-2 text-xs font-bold ${statusCfg.color}`}>
                <StatusIcon size={14} />
                {statusCfg.label}
                <span className="text-muted-foreground font-normal ml-auto">
                  {plan.focus_today_min}m today
                </span>
              </div>
            )}

            {/* Greeting */}
            <div className="text-sm text-foreground font-semibold leading-snug">
              <ReactMarkdown components={{ p: ({node, ...props}) => <span {...props} /> }}>
                {plan.greeting}
              </ReactMarkdown>
            </div>

            {/* Sprint List */}
            {plan.sprints?.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Suggested Sprints</p>
                {plan.sprints.map((sprint, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.07 }}
                    className={`flex items-start gap-3 p-3 rounded-xl border ${priorityStyle[sprint.priority]}`}
                  >
                    <span className="text-xs font-black font-mono opacity-70 mt-0.5 shrink-0">{sprint.time}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground leading-tight truncate">{sprint.task}</p>
                      <p className="text-[10px] opacity-60 font-medium">{sprint.duration}min sprint</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Tip */}
            <div className="bg-muted/40 rounded-xl p-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Coach Tip</p>
              <div className="text-xs text-foreground font-medium leading-relaxed">
                <ReactMarkdown components={{ p: ({node, ...props}) => <span {...props} /> }}>
                  {plan.tip}
                </ReactMarkdown>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6 text-center text-muted-foreground text-xs">
            Complete your first session to get your personalised daily plan.
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
