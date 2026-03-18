import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Square, Check, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTimer } from "@/contexts/TimerContext";
import { loadSettings } from "@/pages/Settings";

const PRESETS = [25, 50, 90] as const;

export default function TimerCard() {
  const {
    preset, remaining, totalSeconds, running, completed, note,
    setNote, start, pause, stop, selectPreset
  } = useTimer();

  const [customInput, setCustomInput] = useState<number | string>(
    PRESETS.includes(preset as any) ? "" : preset
  );
  
  const announceRef = useRef<HTMLDivElement>(null);
  const isPreset = PRESETS.includes(preset as any);

  const announce = (msg: string) => {
    if (announceRef.current) announceRef.current.textContent = msg;
  };

  const handleSelectPreset = (mins: number) => {
    selectPreset(mins);
    if (!PRESETS.includes(mins as any)) {
      setCustomInput(mins);
    } else {
      setCustomInput("");
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === "Space") {
        e.preventDefault();
        running ? pause() : start();
      }
      if (e.code === "Escape" && (running || completed)) stop();
      if (e.code === "Digit1") handleSelectPreset(25);
      if (e.code === "Digit2") handleSelectPreset(50);
      if (e.code === "Digit3") handleSelectPreset(90);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [running, start, completed, pause, stop]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const progress = 1 - remaining / totalSeconds;
  const circumference = 2 * Math.PI * 120;
  const offset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div ref={announceRef} aria-live="polite" className="sr-only" />

      {/* Preset chips */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {PRESETS.map((p, i) => (
          <button
            key={p}
            onClick={() => handleSelectPreset(p)}
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
        
        {/* Custom Input */}
        <div className="flex items-center gap-2 pl-2 border-l border-border/60">
          <div className="relative">
            <input
              type="number"
              min={1}
              max={1440}
              value={customInput}
              onChange={(e) => {
                const val = e.target.value;
                setCustomInput(val);
                const num = parseInt(val);
                if (!isNaN(num) && num > 0 && num <= 1440) {
                  selectPreset(num);
                }
              }}
              placeholder="Min"
              disabled={running}
              className={`w-16 h-8 rounded-xl px-2 text-center text-xs font-bold transition-all border outline-none ${
                !isPreset && preset > 0
                  ? "bg-primary/5 border-primary/40 text-primary ring-2 ring-primary/10"
                  : "bg-secondary border-transparent text-secondary-foreground hover:border-border"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            />
          </div>
          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Custom</span>
        </div>
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

      {!loadSettings().notificationsEnabled && (
        <button
          onClick={async () => {
            if ("Notification" in window) {
              const perm = await Notification.requestPermission();
              if (perm === "granted") {
                const s = loadSettings();
                s.notificationsEnabled = true;
                localStorage.setItem("focussprint_settings", JSON.stringify(s));
                toast.success("Notifications enabled.");
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
