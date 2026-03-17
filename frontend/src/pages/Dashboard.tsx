import { Timer, Flame, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import TimerCard from "@/components/TimerCard";
import StatCard from "@/components/StatCard";
import { mockStats } from "@/lib/mock-data";

export default function DashboardPage() {
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
            <StatCard label="Focus Today" value={mockStats.totalFocusToday} suffix="min" icon={Timer} />
            <StatCard label="Sessions Today" value={mockStats.sessionsToday} icon={Clock} />
            <StatCard label="Current Streak" value={mockStats.streak} suffix="days" icon={Flame} />
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
