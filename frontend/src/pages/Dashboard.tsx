import { useQuery } from "@tanstack/react-query";
import { Timer, Flame, Clock, Calendar, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import TimerCard from "@/components/TimerCard";
import StatCard from "@/components/StatCard";
import SessionRow from "@/components/SessionRow";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Navigate, Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => apiFetch("/api/sessions"),
    enabled: isAuthenticated,
  });

  if (authLoading) return null;
  if (!isAuthenticated) return <Navigate to="/auth/login" />;

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
          {/* Main Content */}
          <div className="space-y-10">
            {/* Timer Section */}
            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="flex flex-col items-center justify-center rounded-3xl border border-border/40 bg-card/50 p-10 shadow-sm backdrop-blur-sm"
            >
              <TimerCard />
            </motion.div>

            {/* Recent History Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Calendar size={20} className="text-primary" />
                  Recent Sessions
                </h2>
                <Link to="/history" className="text-sm font-medium text-primary hover:underline flex items-center gap-0.5">
                  View full history <ChevronRight size={14} />
                </Link>
              </div>
              
              <div className="grid gap-3">
                {sessionsLoading ? (
                  [1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)
                ) : recentSessions.length > 0 ? (
                  recentSessions.map((s: any, i: number) => (
                    <SessionRow key={s.id} session={s} index={i} />
                  ))
                ) : (
                  <div className="py-12 text-center rounded-2xl border border-dashed border-border/60 bg-muted/20">
                    <p className="text-muted-foreground text-sm">Your focus journey starts here. Complete your first session!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Stats */}
          <aside className="space-y-4">
            <h2 className="text-lg font-bold text-foreground px-1 mb-2">Performance</h2>
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
            
            <div className="rounded-2xl border border-border/40 bg-primary/5 p-6 space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2 text-primary">
                Quick Tips
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Take a 5-minute break after every 25-minute session to maximize long-term retention and focus.
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1">
                   <span>Daily Goal</span>
                   <span>{Math.min(100, Math.round((totalFocusToday / 150) * 100))}%</span>
                </div>
                <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (totalFocusToday / 150) * 100)}%` }}
                    className="h-full bg-primary" 
                  />
                </div>
              </div>
            </div>
            
            <div className="rounded-2xl border border-border/40 bg-muted/30 p-4 text-center text-[11px] text-muted-foreground">
              <p>Press <kbd className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-bold text-foreground">Space</kbd> to toggle</p>
              <p className="mt-1">Press <kbd className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-bold text-foreground">Esc</kbd> to end</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
