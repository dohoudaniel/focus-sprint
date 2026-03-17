import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Square, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

const PRESETS = [25, 50, 90];

export default function TimerCard() {
  const [preset, setPreset] = useState(25);
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [note, setNote] = useState("");
  const [startTime, setStartTime] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const announceRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();

  const announce = (msg: string) => {
    if (announceRef.current) announceRef.current.textContent = msg;
  };

  const selectPreset = (mins: number) => {
    if (running) return;
    setPreset(mins);
    setTotalSeconds(mins * 60);
    setRemaining(mins * 60);
    setCompleted(false);
  };

  const start = useCallback(() => {
    setRunning(true);
    setCompleted(false);
    const now = new Date();
    setStartTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    announce(`Session started — ${preset} minutes`);
  }, [preset]);

  const pause = () => {
    setRunning(false);
    announce("Session paused");
  };

  const stop = () => {
    setRunning(false);
    setRemaining(totalSeconds);
    setCompleted(false);
    setStartTime(null);
    announce("Session stopped");
  };

  const logSession = async () => {
    if (!isAuthenticated) return;
    
    try {
      const now = new Date();
      const endTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      const date = now.toISOString().split('T')[0];
      
      await apiFetch("/api/sessions", {
        method: "POST",
        body: JSON.stringify({
          duration: preset,
          startTime: startTime,
          endTime: endTime,
          date: date,
          note: note,
          status: "completed"
        }),
      });
      toast.success("Session logged successfully!");
    } catch (error: any) {
      toast.error("Failed to log session: " + error.message);
    }
  };

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => r - 1);
      }, 1000);
    } else if (remaining <= 0 && running) {
      setRunning(false);
      setCompleted(true);
      announce(`Session completed — ${preset} minutes logged`);
      logSession();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, remaining, preset, isAuthenticated]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        running ? pause() : start();
      }
      if (e.code === "Escape" && running) stop();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [running, start]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const progress = 1 - remaining / totalSeconds;
  const circumference = 2 * Math.PI * 120;
  const offset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Aria live region */}
      <div ref={announceRef} aria-live="polite" className="sr-only" />

      {/* Preset chips */}
      <div className="flex gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => selectPreset(p)}
            disabled={running}
            className={`rounded-button px-4 py-1.5 text-sm font-medium transition-all ${
              preset === p
                ? "bg-primary text-primary-foreground shadow-card"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            } disabled:opacity-50`}
          >
            {p}m
          </button>
        ))}
      </div>

      {/* Timer ring */}
      <div className="relative flex items-center justify-center">
        <svg width="280" height="280" viewBox="0 0 280 280" className="-rotate-90">
          <circle
            cx="140" cy="140" r="120"
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth="8"
          />
          <motion.circle
            cx="140" cy="140" r="120"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          {completed ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Check size={64} className="text-primary" />
            </motion.div>
          ) : (
            <span className="text-6xl font-bold tabular-nums text-foreground font-body">
              {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {!running ? (
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              onClick={start}
              size="lg"
              className="rounded-button bg-primary text-primary-foreground shadow-card hover:brightness-95 gap-2 px-8"
            >
              <Play size={18} /> {completed ? "Restart" : "Start"}
            </Button>
          </motion.div>
        ) : (
          <>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button onClick={pause} size="lg" variant="outline" className="rounded-button gap-2 px-6">
                <Pause size={18} /> Pause
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button onClick={stop} size="lg" variant="outline" className="rounded-button gap-2 px-6 text-destructive border-destructive/30">
                <Square size={18} /> Stop
              </Button>
            </motion.div>
          </>
        )}
      </div>

      {/* Note input */}
      <div className="w-full max-w-xs">
        <Input
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 120))}
          placeholder="What are you focusing on?"
          className="rounded-button text-center text-sm"
          aria-label="Session note"
          maxLength={120}
        />
        <p className="mt-1 text-center text-xs text-muted-foreground">{note.length}/120</p>
      </div>
    </div>
  );
}
