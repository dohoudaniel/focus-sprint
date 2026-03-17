import { Timer, Clock, Flame, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import StatCard from "@/components/StatCard";
import SparklineChart from "@/components/SparklineChart";
import AnimatedSection from "@/components/AnimatedSection";
import { mockStats, weeklyData } from "@/lib/mock-data";

export default function InsightsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="container flex-1 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-8">Insights</h1>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard label="Weekly Total" value={mockStats.weeklyTotal} suffix="min" icon={Timer} />
          <StatCard label="Avg Session" value={mockStats.avgSessionLength} suffix="min" icon={Clock} />
          <StatCard label="Current Streak" value={mockStats.streak} suffix="days" icon={Flame} />
          <StatCard label="Sessions Today" value={mockStats.sessionsToday} icon={TrendingUp} />
        </div>

        <AnimatedSection>
          <div className="rounded-card border border-border/50 bg-card p-6 shadow-card">
            <h2 className="text-lg font-semibold text-foreground mb-4">This Week</h2>
            <SparklineChart data={weeklyData} />
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
