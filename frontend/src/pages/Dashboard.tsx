import { useQuery } from "@tanstack/react-query";
import { Timer, Flame, Clock, Calendar, ChevronRight, Brain } from "lucide-react";
import Navbar from "@/components/Navbar";
import TimerCard from "@/components/TimerCard";
import StatCard from "@/components/StatCard";
import SessionRow from "@/components/SessionRow";
import DailyFocusPlan from "@/components/DailyFocusPlan";
import FocusScore from "@/components/FocusScore";
import AIRecommendations from "@/components/AIRecommendations";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Navigate, Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => apiFetch("/api/sessions"),
    enabled: isAuthenticated,
  });

  if (authLoading) return null;
  if (!isAuthenticated) return <Navigate to="/auth/login" />;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const today = new Date().toISOString().split("T")[0];
  const completedSessions = sessions.filter((s: any) => s.status === "completed");
  const sessionsToday = completedSessions.filter((s: any) => s.date === today);
  const totalFocusToday = sessionsToday.reduce((acc: number, s: any) => acc + s.duration, 0);

  // Real streak calculation
  const calculateStreak = (sessions: any[]) => {
    if (sessions.length === 0) return 0;
    
    const dates = [...new Set(sessions.map((s: any) => s.date))].sort().reverse();
    let streak = 0;
    let curr = new Date();
    curr.setHours(0, 0, 0, 0);

    for (let i = 0; i < dates.length; i++) {
      const sessionDate = new Date(dates[i]);
      sessionDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((curr.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0 || diffDays === 1) {
        streak++;
        curr = sessionDate;
      } else if (diffDays > 1) {
        break;
      }
    }
    return streak;
  };

  const streak = calculateStreak(completedSessions);
  const recentSessions = completedSessions.slice(0, 3);

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/10">
      <Navbar />
      <main className="container flex-1 py-10 max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">

          {/* ── Main Column: Timer + AI Daily Plan ── */}
          <div className="space-y-8 min-w-0">
            {/* Header Greeting */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="px-1"
            >
              <h1 className="text-3xl font-black tracking-tight text-foreground">
                {getGreeting()}, {user?.name?.split(' ')[0] || 'Warrior'}
              </h1>
              <p className="text-muted-foreground font-medium mt-1">
                Let's make some progress on your goals today.
              </p>
            </motion.div>

            {/* Timer */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center rounded-3xl border border-border/40 bg-card/50 p-10 shadow-sm backdrop-blur-sm"
            >
              <TimerCard />
            </motion.div>

            {/* AI Daily Plan */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <DailyFocusPlan />
            </motion.div>

            {/* Recent Sessions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4 rounded-3xl border border-border/40 bg-card/30 p-6 shadow-sm backdrop-blur-sm"
            >
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                  <Calendar size={15} className="text-primary" />
                  Recent Sessions
                </h3>
                <Link
                  to="/history"
                  className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-0.5"
                >
                  All <ChevronRight size={12} />
                </Link>
              </div>

              {sessionsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-2xl" />
                  ))}
                </div>
              ) : recentSessions.length > 0 ? (
                <div className="space-y-2">
                  {recentSessions.map((s: any, i: number) => (
                    <div key={s.id} className="group relative overflow-hidden rounded-2xl border border-border/40 bg-background/50 hover:bg-background transition-all hover:border-primary/20">
                        <SessionRow session={s} index={i} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center rounded-2xl border border-dashed border-border/30 bg-muted/5">
                  <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                    No sessions yet
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* ── Sidebar ── */}
          <aside className="space-y-4 min-w-0">

            {/* AI Recommendations */}
            <AIRecommendations />

            {/* Performance label */}
            <h2 className="text-lg font-bold text-foreground px-1">Performance</h2>

            {/* Stat Cards */}
            {sessionsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full rounded-2xl" />
                <Skeleton className="h-24 w-full rounded-2xl" />
                <Skeleton className="h-24 w-full rounded-2xl" />
              </div>
            ) : (
              <>
                <StatCard label="Focus Today" value={totalFocusToday} suffix="min" icon={Timer} />
                <StatCard label="Sessions Completed" value={sessionsToday.length} icon={Clock} />
                <StatCard label="Current Streak" value={streak} suffix="days" icon={Flame} />
              </>
            )}

            {/* Focus Score */}
            <FocusScore
              focusMinutes={totalFocusToday}
              completedSessions={sessionsToday.length}
              streak={streak}
            />

            {/* Daily Goal Bar */}
            <div className="rounded-2xl border border-border/40 bg-primary/5 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-primary">Daily Goal</span>
                <span className="text-muted-foreground">{totalFocusToday}m / 150m</span>
              </div>
              <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (totalFocusToday / 150) * 100)}%` }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
              <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                {Math.min(100, Math.round((totalFocusToday / 150) * 100))}% of your daily deep-work target.
              </p>
            </div>

            {/* Keyboard hints */}
            <div className="rounded-2xl border border-border/40 bg-muted/30 p-4 text-center text-[11px] text-muted-foreground font-display">
              <p>Press <kbd className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-black text-foreground border border-border/50">Space</kbd> to toggle</p>
              <p className="mt-1">Press <kbd className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-black text-foreground border border-border/50">Esc</kbd> to end</p>
            </div>

          </aside>
        </div>
      </main>
    </div>
  );
}
