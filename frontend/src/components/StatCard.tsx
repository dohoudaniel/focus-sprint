import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  suffix?: string;
}

export default function StatCard({ label, value, icon: Icon, suffix }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-card border border-border/50 bg-card p-5 shadow-card transition-shadow hover:shadow-card-hover"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-button bg-primary/10">
          <Icon size={20} className="text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold tabular-nums text-foreground">
            {value}{suffix && <span className="text-base font-normal text-muted-foreground ml-0.5">{suffix}</span>}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
