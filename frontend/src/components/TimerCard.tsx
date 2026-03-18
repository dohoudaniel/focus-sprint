import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Square, Check, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { loadSettings } from "@/pages/Settings";

const PRESETS = [25, 50, 90] as const;

function playChime() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);
  } catch {
    // Audio not available
  }
}

function sendNotification(preset: number) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("🎯 Sprint Complete!", {
      body: `Excellent work — ${preset} minutes of focused output logged. Take a well-deserved break.`,
      icon: "/logo.png",
    });
  }
}

export default function TimerCard() {
  const settings = loadSettings();
  const [preset, setPreset] = useState<number>(settings.defaultPreset);
  const [totalSeconds, setTotalSeconds] = useState(settings.defaultPreset * 60);
  const [remaining, setRemaining] = useState(settings.defaultPreset * 60);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [note, setNote] = useState("");
  const [startTime, setStartTime] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const announceRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

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
    setStartTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }));
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
      const endTime = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
      const date = now.toISOString().split("T")[0];

      await apiFetch("/api/sessions", {
        method: "POST",
        body: JSON.stringify({
          duration: preset,
          startTime: startTime,
          endTime: endTime,
          date: date,
          note: note,
          status: "completed",
        }),
      });

      // Invalidate session queries so UI refreshes
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["ai-daily-plan"] });

      toast.success(`${preset}min sprint logged ✓`, {
        description: note ? `"${note}"` : undefined,
      });
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

      // Notifications  
      const s = loadSettings();
      if (s.notificationSound) playChime();
      if (s.notificationsEnabled) sendNotification(preset);

      logSession();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, remaining, preset, isAuthenticated]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // Space: start/pause
      if (e.code === "Space") {
        e.preventDefault();
        running ? pause() : start();
      }
      // Escape: stop
      if (e.code === "Escape" && (running || completed)) stop();
      // Number keys 1,2,3: switch preset
      if (e.code === "Digit1") selectPreset(25);
      if (e.code === "Digit2") selectPreset(50);
      if (e.code === "Digit3") selectPreset(90);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [running, start, completed]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const progress = 1 - remaining / totalSeconds;
  const circumference = 2 * Math.PI * 120;
  const offset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Aria live region */}
      <div ref={announceRef} aria-live="polite" className="sr-only" />

      {/* Preset chips */}
      <div className="flex gap-2">
        {PRESETS.map((p, i) => (
          <button
            key={p}
            onClick={() => selectPreset(p)}
            disabled={running}
            title={`Press ${i + 1} to switch`}
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
          <circle cx="140" cy="140" r="120" fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
          <motion.circle
            cx="140" cy="140" r="120"
            fill="none"
            stroke={completed ? "hsl(var(--primary))" : running ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.5)"}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </svg>

        <div className="absolute flex flex-col items-center">
          <AnimatePresence mode="wait">
            {completed ? (
              <motion.div
                key="check"
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Check size={64} className="text-primary" />
              </motion.div>
            ) : (
              <motion.span
                key="timer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-6xl font-bold tabular-nums text-foreground font-body"
              >
                {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Status label under time */}
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            {completed ? "Session complete ✓" : running ? "Focus mode active" : "Ready to sprint"}
          </p>
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
              <Play size={18} /> {completed ? "Sprint Again" : "Start Sprint"}
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
      <div className="w-full max-w-sm">
        <Input
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 120))}
          placeholder="What are you focusing on?"
          className="rounded-button text-center text-sm"
          aria-label="Session note"
          maxLength={120}
          disabled={running}
        />
        <div className="flex justify-between items-center mt-1 px-1">
          <p className="text-[10px] text-muted-foreground">Describe your focus task</p>
          <p className="text-[10px] text-muted-foreground">{note.length}/120</p>
        </div>
      </div>

      {/* Notifications status hint */}
      {!loadSettings().notificationsEnabled && (
        <button
          onClick={async () => {
            if ("Notification" in window) {
              const perm = await Notification.requestPermission();
              if (perm === "granted") {
                const s = loadSettings();
                s.notificationsEnabled = true;
                localStorage.setItem("focussprint_settings", JSON.stringify(s));
                toast.success("Notifications enabled for session end alerts.");
              }
            }
          }}
          className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-primary transition-colors font-medium"
        >
          <Bell size={11} />
          Enable session-end notifications
        </button>
      )}
    </div>
  );
}
