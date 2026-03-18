import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { loadSettings } from "@/pages/Settings";

interface FocusScoreProps {
  focusMinutes: number;
  completedSessions: number;
  streak: number;
}

/**
 * Calculates a daily focus score 0–100.
 * 60%: goal completion, 20%: sessions completed (max 4), 20%: streak
 */
function calculateScore(focusMin: number, sessions: number, streak: number, goalMin: number): number {
  const goalScore = Math.min(60, (focusMin / goalMin) * 60);
  const sessionScore = Math.min(20, (sessions / 4) * 20);
  const streakScore = Math.min(20, (Math.min(streak, 7) / 7) * 20);
  return Math.round(goalScore + sessionScore + streakScore);
}

function getGrade(score: number): { grade: string; color: string; description: string } {
  if (score >= 90) return { grade: "S", color: "text-primary", description: "Peak Performance" };
  if (score >= 75) return { grade: "A", color: "text-emerald-400", description: "Strong Output" };
  if (score >= 55) return { grade: "B", color: "text-blue-400", description: "On Track" };
  if (score >= 35) return { grade: "C", color: "text-amber-400", description: "Building Momentum" };
  return { grade: "D", color: "text-muted-foreground", description: "Just Starting" };
}

export default function FocusScore({ focusMinutes, completedSessions, streak }: FocusScoreProps) {
  const settings = loadSettings();
  
  if (!settings.showFocusScore) return null;

  const score = calculateScore(focusMinutes, completedSessions, streak, settings.dailyGoalMinutes);
  const { grade, color, description } = getGrade(score);
  const circumference = 2 * Math.PI * 28;
  const offset = circumference * (1 - score / 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border border-border/40 bg-card/60 p-5 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-black text-sm text-foreground">Focus Score</h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Today</p>
        </div>
        <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${color} border-current/20 bg-current/5`}>
          {description}
        </div>
      </div>

      <div className="flex items-center gap-5">
        {/* Circular score */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
            <circle cx="36" cy="36" r="28" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/30" />
            <motion.circle
              cx="36" cy="36" r="28"
              fill="none"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              stroke="currentColor"
              className={color}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className={`text-lg font-black ${color}`}
            >
              {score}
            </motion.span>
          </div>
        </div>

        {/* Grade + breakdown */}
        <div className="flex-1 space-y-1">
          <div className="flex items-end gap-1">
            <span className={`text-5xl font-black leading-none ${color}`}>{grade}</span>
            <span className="text-xs text-muted-foreground mb-1 font-medium">/ 100</span>
          </div>
          <div className="space-y-1 mt-2">
            {[
              { label: "Goal", val: `${Math.min(100, Math.round((focusMinutes / settings.dailyGoalMinutes) * 100))}%` },
              { label: "Sessions", val: `${completedSessions}` },
              { label: "Streak", val: `${streak}d` },
            ].map(({ label, val }) => (
              <div key={label} className="flex justify-between text-[10px] font-bold">
                <span className="text-muted-foreground">{label}</span>
                <span className="text-foreground">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Zap size={12} className="text-primary shrink-0" />
        <p className="text-[10px] text-muted-foreground font-medium leading-tight">
          Score resets at midnight. Keep sprinting to push it higher.
        </p>
      </div>
    </motion.div>
  );
}
