import { Timer, Clock, Flame, TrendingUp, Brain, AlertTriangle, CheckCircle, Zap, Activity, BarChart3, Lightbulb, RefreshCw } from "lucide-react";
import Navbar from "@/components/Navbar";
import StatCard from "@/components/StatCard";
import AnimatedSection from "@/components/AnimatedSection";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";

// --- Type Definitions ---
interface CoachInsight {
  type: "warning" | "insight" | "win" | "action";
  text: string;
}

interface CoachData {
  insights: CoachInsight[];
  session_count: number;
  completion_rate: number;
}

interface BurnoutData {
  level: "low" | "moderate" | "high" | "unknown";
  score: number;
  signals: string[];
  message: string;
  recommendation: string;
  metrics?: {
    avg_duration_old: number;
    avg_duration_recent: number;
    avg_gap_days: number;
    avg_note_length: number;
  };
}

interface PeakHour {
  hour: number;
  label: string;
  session_count: number;
  avg_duration: number;
}

interface PeakDay {
  day: string;
  session_count: number;
  avg_duration: number;
}

interface ScheduleData {
  peak_hours: PeakHour[];
  peak_days: PeakDay[];
  heatmap: Record<string, Record<string, number>>;
  message: string;
}

// --- Insight Icon Map ---
const insightMeta: Record<string, { icon: any; color: string; bg: string }> = {
  warning: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
  insight: { icon: Brain, color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
  win: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
  action: { icon: Zap, color: "text-primary", bg: "bg-primary/10 border-primary/20" },
};

// --- Burnout Level Config ---
const burnoutConfig = {
  low: { color: "text-emerald-400", barColor: "bg-emerald-400", label: "Sustainable", ring: "ring-emerald-400/20", icon: CheckCircle },
  moderate: { color: "text-amber-400", barColor: "bg-amber-400", label: "Caution", ring: "ring-amber-400/20", icon: AlertTriangle },
  high: { color: "text-red-400", barColor: "bg-red-400", label: "Risk Detected", ring: "ring-red-400/20", icon: AlertTriangle },
  unknown: { color: "text-muted-foreground", barColor: "bg-muted", label: "Insufficient Data", ring: "ring-border", icon: Activity },
};

// --- Main Page ---
export default function InsightsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => apiFetch("/api/sessions"),
    enabled: isAuthenticated,
  });

  const { data: coachData, isLoading: coachLoading, refetch: refetchCoach } = useQuery<CoachData>({
    queryKey: ["ai-coach"],
    queryFn: () => apiFetch("/api/ai/coach"),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 30, // 30 min cache
  });

  const { data: burnoutData, isLoading: burnoutLoading } = useQuery<BurnoutData>({
    queryKey: ["ai-burnout"],
    queryFn: () => apiFetch("/api/ai/burnout"),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 60, // 1 hr cache
  });

  const { data: scheduleData, isLoading: scheduleLoading } = useQuery<ScheduleData>({
    queryKey: ["ai-schedule"],
    queryFn: () => apiFetch("/api/ai/schedule"),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 60,
  });

  if (authLoading) return null;
  if (!isAuthenticated) return <Navigate to="/auth/login" />;

  const completedSessions = sessions.filter((s: any) => s.status === "completed");
  const weeklyTotal = completedSessions.reduce((acc: number, s: any) => acc + s.duration, 0);
  const avgSessionLength = completedSessions.length > 0
    ? Math.round(weeklyTotal / completedSessions.length)
    : 0;
  const today = new Date().toISOString().split("T")[0];
  const sessionsToday = completedSessions.filter((s: any) => s.date === today).length;

  const burnout = burnoutData;
  const burnoutCfg = burnoutConfig[burnout?.level ?? "unknown"];
  const BurnoutIcon = burnoutCfg.icon;

  // Max sessions for bar chart normalization
  const maxPeakSessions = scheduleData?.peak_hours?.[0]?.session_count ?? 1;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="container flex-1 py-10 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
            <Brain size={12} />
            AI-Powered Analysis
          </div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">Insights</h1>
          <p className="text-muted-foreground mt-1 font-medium">Your performance, decoded by AI.</p>
        </motion.div>

        {/* Top Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          <StatCard label="Total Focus" value={weeklyTotal} suffix="min" icon={Timer} />
          <StatCard label="Avg Session" value={avgSessionLength} suffix="min" icon={Clock} />
          <StatCard label="Completion Rate" value={coachData?.completion_rate ?? 0} suffix="%" icon={TrendingUp} />
          <StatCard label="Sessions Today" value={sessionsToday} icon={Zap} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* ---- AI Focus Coach ---- */}
          <AnimatedSection delay={0}>
            <div className="rounded-3xl border border-border/40 bg-card/60 p-6 backdrop-blur-sm h-full">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                    <Brain size={20} className="text-primary" />
                    AI Focus Coach
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {coachData ? `Based on ${coachData.session_count} sessions` : "Analysing your patterns..."}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => refetchCoach()}
                  className="text-muted-foreground hover:text-primary rounded-xl"
                  disabled={coachLoading}
                >
                  <RefreshCw size={14} className={coachLoading ? "animate-spin" : ""} />
                </Button>
              </div>

              {coachLoading ? (
                <div className="space-y-3">
                  {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-14 w-full rounded-2xl" />)}
                </div>
              ) : coachData?.insights?.length ? (
                <div className="space-y-3">
                  <AnimatePresence>
                    {coachData.insights.map((insight, i) => {
                      const meta = insightMeta[insight.type] ?? insightMeta.insight;
                      const Icon = meta.icon;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className={`flex gap-3 p-4 rounded-2xl border ${meta.bg}`}
                        >
                          <Icon size={16} className={`${meta.color} shrink-0 mt-0.5`} />
                          <div className="text-sm font-medium text-foreground leading-relaxed prose-sm">
                            <ReactMarkdown components={{ p: ({node, ...props}) => <span {...props} /> }}>
                              {insight.text}
                            </ReactMarkdown>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  <Brain size={36} className="mx-auto mb-3 opacity-20" />
                  Complete more sessions for personalised AI coaching.
                </div>
              )}
            </div>
          </AnimatedSection>

          {/* ---- Burnout Detector ---- */}
          <AnimatedSection delay={0.05}>
            <div className="rounded-3xl border border-border/40 bg-card/60 p-6 backdrop-blur-sm h-full">
              <h2 className="text-lg font-black text-foreground flex items-center gap-2 mb-6">
                <Activity size={20} className="text-primary" />
                Burnout Detector
              </h2>

              {burnoutLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full rounded-2xl" />
                  <Skeleton className="h-16 w-full rounded-2xl" />
                  <Skeleton className="h-16 w-full rounded-2xl" />
                </div>
              ) : burnout ? (
                <div className="space-y-5">
                  {/* Score Ring */}
                  <div className={`flex items-center gap-5 p-5 rounded-2xl border ${burnoutCfg.ring} ring-1`}>
                    <div className="relative flex-shrink-0">
                      <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
                        <circle cx="36" cy="36" r="28" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/30" />
                        <circle
                          cx="36" cy="36" r="28"
                          fill="none"
                          strokeWidth="6"
                          strokeDasharray={`${2 * Math.PI * 28}`}
                          strokeDashoffset={`${2 * Math.PI * 28 * (1 - (burnout.score / 100))}`}
                          strokeLinecap="round"
                          className={burnout.level === "high" ? "text-red-400" : burnout.level === "moderate" ? "text-amber-400" : "text-emerald-400"}
                          stroke="currentColor"
                          style={{ transition: "stroke-dashoffset 1s ease" }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-lg font-black ${burnoutCfg.color}`}>{burnout.score}</span>
                      </div>
                    </div>
                    <div>
                      <div className={`text-xs font-black uppercase tracking-widest ${burnoutCfg.color} mb-1`}>
                        {burnoutCfg.label}
                      </div>
                      <div className="text-sm font-semibold text-foreground leading-snug">
                        <ReactMarkdown components={{ p: ({node, ...props}) => <span {...props} /> }}>
                          {burnout.message}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>

                  {/* Signals */}
                  {burnout.signals?.length > 0 && (
                    <div className="space-y-2">
                      {burnout.signals.map((sig, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 rounded-xl p-3">
                          <AlertTriangle size={12} className="text-amber-400 shrink-0 mt-0.5" />
                          {sig}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recommendation */}
                  <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Coach Recommendation</p>
                    <div className="text-sm text-foreground font-medium leading-relaxed">
                      <ReactMarkdown components={{ p: ({node, ...props}) => <span {...props} /> }}>
                        {burnout.recommendation}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {/* Metrics row */}
                  {burnout.metrics && (
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Avg Session (older)", val: `${burnout.metrics.avg_duration_old}m` },
                        { label: "Avg Session (recent)", val: `${burnout.metrics.avg_duration_recent}m` },
                        { label: "Avg Gap", val: `${burnout.metrics.avg_gap_days}d` },
                        { label: "Avg Note Length", val: `${burnout.metrics.avg_note_length} chars` },
                      ].map(({ label, val }) => (
                        <div key={label} className="bg-muted/30 rounded-xl p-3 text-center">
                          <p className="text-xs text-muted-foreground">{label}</p>
                          <p className="text-base font-black text-foreground">{val}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </AnimatedSection>

          {/* ---- Optimal Schedule ---- */}
          <AnimatedSection delay={0.1} className="lg:col-span-2">
            <div className="rounded-3xl border border-border/40 bg-card/60 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                    <BarChart3 size={20} className="text-primary" />
                    Optimal Schedule
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{scheduleData?.message ?? "Calculating your peak performance windows..."}</p>
                </div>
              </div>

              {scheduleLoading ? (
                <div className="grid grid-cols-2 gap-6">
                  <Skeleton className="h-48 w-full rounded-2xl" />
                  <Skeleton className="h-48 w-full rounded-2xl" />
                </div>
              ) : scheduleData?.peak_hours?.length ? (
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Peak Hours Chart */}
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Peak Hours</h3>
                    <div className="space-y-3">
                      {scheduleData.peak_hours.map((h, i) => (
                        <div key={h.hour} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-foreground">{h.label}</span>
                            <span className="text-muted-foreground">{h.session_count} session{h.session_count !== 1 ? 's' : ''} · {h.avg_duration}m avg</span>
                          </div>
                          <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(h.session_count / maxPeakSessions) * 100}%` }}
                              transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" }}
                              className={`h-full rounded-full ${i === 0 ? 'bg-primary' : 'bg-primary/50'}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Peak Days */}
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Best Days</h3>
                    <div className="space-y-3">
                      {scheduleData.peak_days.map((d, i) => (
                        <motion.div
                          key={d.day}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + i * 0.08 }}
                          className={`flex items-center justify-between p-4 rounded-2xl border ${i === 0 ? 'border-primary/30 bg-primary/10' : 'border-border/40 bg-muted/20'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-8 rounded-full ${i === 0 ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                            <div>
                              <p className="font-black text-sm text-foreground">{d.day}</p>
                              <p className="text-xs text-muted-foreground">{d.session_count} sessions</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-sm text-foreground">{d.avg_duration}m</p>
                            <p className="text-xs text-muted-foreground">avg duration</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center text-muted-foreground text-sm">
                  <BarChart3 size={36} className="mx-auto mb-3 opacity-20" />
                  Complete at least 5 sessions to reveal your peak performance windows.
                </div>
              )}
            </div>
          </AnimatedSection>

          {/* ---- Pro Tip ---- */}
          <AnimatedSection delay={0.15} className="lg:col-span-2">
            <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6 flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 shrink-0">
                <Lightbulb size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-black text-sm text-primary uppercase tracking-widest mb-1">Research-Backed Insight</h3>
                <p className="text-sm text-foreground font-medium leading-relaxed">
                  Cal Newport's research shows that <span className="text-primary">4 hours of deep work</span> per day is the maximum sustainable output for knowledge workers. 
                  Track your focus time and honour your cognitive limits — consistency beats intensity.
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </main>
    </div>
  );
}
