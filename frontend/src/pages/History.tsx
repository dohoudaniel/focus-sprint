import { useState, useMemo } from "react";
import { Download, Search, Filter, History, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import SessionRow from "@/components/SessionRow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function HistoryPage() {
  const [search, setSearch] = useState("");
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => apiFetch("/api/sessions"),
    enabled: isAuthenticated,
  });

  if (authLoading) return null;
  if (!isAuthenticated) return <Navigate to="/auth/login" />;

  const filtered = useMemo(() => {
    return sessions.filter((s: any) =>
      (s.note || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.date || "").includes(search)
    );
  }, [sessions, search]);

  const exportCSV = () => {
    const header = "Date,Start,End,Duration (min),Note,Status\n";
    const rows = sessions.map((s: any) => `${s.date},${s.startTime},${s.endTime},${s.duration},${s.note || ""},${s.status}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `focussprint-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background/50">
      <Navbar />
      <main className="container flex-1 py-10 max-w-5xl">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1.5">
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <History className="text-primary h-8 w-8" />
                Session History
              </h1>
              <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
                <Calendar size={14} className="opacity-70" />
                You've completed {sessions.filter((s: any) => s.status === "completed").length} sessions total
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative group flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by note or date..."
                  className="rounded-xl pl-10 h-10 border-border/40 bg-card transition-all focus:ring-primary/20 focus:border-primary/40"
                  aria-label="Filter sessions"
                />
              </div>
              <Button 
                onClick={exportCSV} 
                variant="outline" 
                className="rounded-xl gap-2 h-10 border-border/40 hover:bg-card px-4 font-semibold"
                disabled={sessions.length === 0}
              >
                <Download size={16} /> Export CSV
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {sessionsLoading ? (
               <div className="space-y-3">
                 {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
               </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filtered.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-24 text-center rounded-3xl border-2 border-dashed border-border/40 bg-muted/10 space-y-2"
                  >
                    <div className="flex justify-center mb-4">
                      <Search size={48} className="text-muted-foreground/30" />
                    </div>
                    <p className="text-lg font-bold text-foreground opacity-80">No results found</p>
                    <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
                  </motion.div>
                ) : (
                  <div className="grid gap-3">
                    {filtered.map((s: any, i: number) => (
                      <SessionRow key={s.id} session={s} index={i} />
                    ))}
                  </div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
