import { useQuery } from "@tanstack/react-query";
import { Timer, Flame, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import TimerCard from "@/components/TimerCard";
import StatCard from "@/components/StatCard";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Navigate } from "react-router-dom";

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
  const sessionsToday = sessions.filter((s: any) => s.date === today && s.status === "completed");
  const totalFocusToday = sessionsToday.reduce((acc: number, s: any) => acc + s.duration, 0);

  // Simple streak calculation (mocked for now, but could be derived from sessions)
  const streak = 0; 

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="container flex-1 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Timer */}
          <div className="flex flex-col items-center justify-center rounded-card border border-border/50 bg-card p-8 shadow-card">
            <TimerCard />
          </div>

          {/* Stats sidebar */}
          <div className="flex flex-col gap-4">
            <StatCard label="Focus Today" value={totalFocusToday} suffix="min" icon={Timer} />
            <StatCard label="Sessions Today" value={sessionsToday.length} icon={Clock} />
            <StatCard label="Current Streak" value={streak} suffix="days" icon={Flame} />
            <div className="rounded-card border border-border/50 bg-muted/50 p-4 text-center text-sm text-muted-foreground">
              <p>Press <kbd className="rounded bg-secondary px-1.5 py-0.5 text-xs font-medium text-foreground">Space</kbd> to start/pause</p>
              <p className="mt-1">Press <kbd className="rounded bg-secondary px-1.5 py-0.5 text-xs font-medium text-foreground">Esc</kbd> to stop</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
