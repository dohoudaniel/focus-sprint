import { useState } from "react";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SessionRow from "@/components/SessionRow";
import StatCard from "@/components/StatCard";
import { Timer, Clock, TrendingUp } from "lucide-react";
import { mockSessions } from "@/lib/mock-data";
import { mockAdminOverview } from "@/lib/admin-mock-data";

export default function AdminSessionsPage() {
  const [search, setSearch] = useState("");
  const filtered = mockSessions.filter((s) =>
    s.note.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Session Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform-wide session data and trends</p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Sessions Today" value={mockAdminOverview.totalSessionsToday} icon={Timer} />
        <StatCard label="Avg Duration" value={mockAdminOverview.avgSessionDuration} suffix="min" icon={Clock} />
        <StatCard label="Peak Hour" value={mockAdminOverview.peakHour} icon={TrendingUp} />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-foreground">Recent Sessions (All Users)</h2>
        <div className="flex gap-3">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by note..."
            className="rounded-button max-w-xs"
            aria-label="Filter sessions"
          />
          <Button variant="outline" className="rounded-button gap-2" onClick={() => {/* TODO: export */}}>
            <Download size={16} /> Export
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">No sessions match your filter.</p>
        ) : (
          filtered.map((s, i) => <SessionRow key={s.id} session={s} index={i} />)
        )}
      </div>
    </div>
  );
}
