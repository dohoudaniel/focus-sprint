import { Timer, Clock, Flame, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import StatCard from "@/components/StatCard";
// import SparklineChart from "@/components/SparklineChart"; // Temporarily disabled if causing issues with real data
import AnimatedSection from "@/components/AnimatedSection";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Navigate } from "react-router-dom";

export default function InsightsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => apiFetch("/api/sessions"),
    enabled: isAuthenticated,
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

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="container flex-1 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-8">Insights</h1>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard label="Total Focus" value={weeklyTotal} suffix="min" icon={Timer} />
          <StatCard label="Avg Session" value={avgSessionLength} suffix="min" icon={Clock} />
          <StatCard label="Current Streak" value={0} suffix="days" icon={Flame} />
          <StatCard label="Sessions Today" value={sessionsToday} icon={TrendingUp} />
        </div>

        <AnimatedSection>
          <div className="rounded-card border border-border/50 bg-card p-6 shadow-card">
            <h2 className="text-lg font-semibold text-foreground mb-4">Activity Overview</h2>
            <p className="text-sm text-muted-foreground italic">Chart visualization will be available once more data is collected.</p>
            {/* <SparklineChart data={weeklyData} /> */}
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.15} className="mt-6">
          <div className="rounded-card border border-border/50 bg-muted/30 p-6">
            <h3 className="font-semibold text-foreground mb-2">💡 Suggestion</h3>
            <p className="text-sm text-muted-foreground">Try a 50-minute deep focus session this week. Longer sessions build stronger focus stamina.</p>
          </div>
        </AnimatedSection>
      </main>
    </div>
  );
}
