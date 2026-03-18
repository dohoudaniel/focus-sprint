import { motion } from "framer-motion";
import { Users, Activity, Clock, TrendingUp, Zap, Shield, Timer, BarChart3 } from "lucide-react";
import StatCard from "@/components/StatCard";
import SparklineChart from "@/components/SparklineChart";
import AnimatedSection from "@/components/AnimatedSection";
import { mockAdminOverview, mockDailySignups, mockHourlyUsage } from "@/lib/admin-mock-data";

export default function AdminOverviewPage() {
  const o = mockAdminOverview;

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor your application at a glance</p>
      </motion.div>

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={o.totalUsers.toLocaleString()} icon={Users} />
        <StatCard label="Active Today" value={o.activeUsersToday} icon={TrendingUp} />
        <StatCard label="New This Week" value={o.newSignupsThisWeek} icon={Zap} />
        <StatCard label="Sessions Today" value={o.totalSessionsToday} icon={Activity} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Avg Session" value={o.avgSessionDuration} suffix="min" icon={Timer} />
        <StatCard label="Peak Hour" value={o.peakHour} icon={Clock} />
        <StatCard label="Error Rate" value={o.errorRate} icon={BarChart3} />
        <StatCard label="Uptime" value={o.uptime} icon={Shield} />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AnimatedSection>
          <div className="rounded-card border border-border/50 bg-card p-6 shadow-card">
            <h2 className="text-lg font-semibold text-foreground mb-4">Daily Signups (Last 7 Days)</h2>
            <SparklineChart data={mockDailySignups.map((d) => ({ day: d.date, minutes: d.count }))} />
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <div className="rounded-card border border-border/50 bg-card p-6 shadow-card">
            <h2 className="text-lg font-semibold text-foreground mb-4">Hourly Usage Pattern</h2>
            <SparklineChart data={mockHourlyUsage.map((d) => ({ day: d.hour, minutes: d.sessions }))} />
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
