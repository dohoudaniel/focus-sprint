import { useState } from "react";
import { Download } from "lucide-react";
import Navbar from "@/components/Navbar";
import SessionRow from "@/components/SessionRow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Navigate } from "react-router-dom";

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

  const filtered = sessions.filter((s: any) =>
    (s.note || "").toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    const header = "Date,Start,End,Duration,Note,Status\n";
    const rows = sessions.map((s: any) => `${s.date},${s.startTime},${s.endTime},${s.duration},${s.note},${s.status}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "focussprint-sessions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="container flex-1 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-foreground">Session History</h1>
              <p className="text-sm text-muted-foreground">{sessions.length} sessions logged total</p>
            </div>
            <div className="flex gap-3">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by note..."
                className="rounded-button max-w-xs"
                aria-label="Filter sessions"
              />
              <Button onClick={exportCSV} variant="outline" className="rounded-button gap-2">
                <Download size={16} /> CSV
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {sessionsLoading ? (
               <p className="py-12 text-center text-muted-foreground">Loading sessions...</p>
            ) : filtered.length === 0 ? (
              <p className="py-12 text-center text-muted-foreground">No sessions match your filter.</p>
            ) : (
              filtered.map((s: any, i: number) => <SessionRow key={s.id} session={s} index={i} />)
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
