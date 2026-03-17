import { motion } from "framer-motion";
import { mockHealthMetrics } from "@/lib/admin-mock-data";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

const statusConfig = {
  healthy: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100" },
  warning: { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-100" },
  critical: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
};

export default function AdminHealthPage() {
  const allHealthy = mockHealthMetrics.every((m) => m.status === "healthy");

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">App Health</h1>
        <p className="text-sm text-muted-foreground mt-1">Infrastructure and performance monitoring</p>
      </motion.div>

      {/* Overall status banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`rounded-card p-6 border ${
          allHealthy
            ? "border-green-200 bg-green-50"
            : "border-amber-200 bg-amber-50"
        }`}
      >
        <div className="flex items-center gap-3">
          {allHealthy ? (
            <CheckCircle2 size={28} className="text-green-600" />
          ) : (
            <AlertTriangle size={28} className="text-amber-600" />
          )}
          <div>
            <p className="text-lg font-semibold text-foreground">
              {allHealthy ? "All Systems Operational" : "Some Systems Need Attention"}
            </p>
            <p className="text-sm text-muted-foreground">Last checked: just now</p>
          </div>
        </div>
      </motion.div>

      {/* Metrics grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mockHealthMetrics.map((metric, i) => {
          const config = statusConfig[metric.status];
          const Icon = config.icon;
          return (
            <motion.div
              key={metric.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-card border border-border/50 bg-card p-5 shadow-card"
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm font-medium text-muted-foreground">{metric.name}</p>
                <div className={`flex h-7 w-7 items-center justify-center rounded-full ${config.bg}`}>
                  <Icon size={14} className={config.color} />
                </div>
              </div>
              <p className="text-2xl font-bold tabular-nums text-foreground">{metric.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{metric.detail}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
