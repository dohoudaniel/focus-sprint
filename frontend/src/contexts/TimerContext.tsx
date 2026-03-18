import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { loadSettings } from '@/pages/Settings';

interface TimerContextType {
  preset: number;
  remaining: number;
  totalSeconds: number;
  running: boolean;
  completed: boolean;
  startTime: string | null;
  note: string;
  setNote: (note: string) => void;
  start: () => void;
  pause: () => void;
  stop: () => void;
  selectPreset: (mins: number) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

function playChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // Zen Bowl Sound Profile: Layered harmonics
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.05); // Attack
    masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.0); // Long Decay

    // Harmonic frequencies for a resonant bowl sound (Hz)
    const harmonics = [440, 659.25, 880, 1318.5]; // A4, E5, A5, E6
    
    harmonics.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      // Higher harmonics are quieter
      const volume = 0.5 / (index + 1);
      oscGain.gain.setValueAtTime(volume, ctx.currentTime);
      
      osc.connect(oscGain);
      oscGain.connect(masterGain);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 3.5);
    });

    // Close context after playback
    setTimeout(() => {
      if (ctx.state !== "closed") ctx.close();
    }, 4000);
  } catch { /* Audio not available */ }
}

function sendNotification(preset: number) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("🎯 Sprint Complete!", {
      body: `Excellent work — ${preset} minutes logged. Take a break.`,
      icon: "/logo.png",
    });
  }
}

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const settings = loadSettings();
  const [preset, setPreset] = useState<number>(settings.defaultPreset);
  const [totalSeconds, setTotalSeconds] = useState(settings.defaultPreset * 60);
  const [remaining, setRemaining] = useState(settings.defaultPreset * 60);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [note, setNote] = useState("");
  const [startTime, setStartTime] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const queryClient = useQueryClient();

  const selectPreset = useCallback((mins: number) => {
    if (running) return;
    setPreset(mins);
    setTotalSeconds(mins * 60);
    setRemaining(mins * 60);
    setCompleted(false);
  }, [running]);

  const start = useCallback(() => {
    const isRestart = remaining <= 0 || completed;
    
    if (isRestart) {
      setRemaining(totalSeconds);
    }
    
    setRunning(true);
    setCompleted(false);
    
    setStartTime(prev => {
      if (isRestart || !prev) {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
      }
      return prev;
    });
  }, [remaining, completed, totalSeconds]);

  const pause = useCallback(() => setRunning(false), []);

  const logSession = useCallback(async (isCompleted: boolean = true) => {
    if (!startTime) return;
    
    try {
      const now = new Date();
      const endTime = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
      const date = now.toISOString().split("T")[0];
      
      // Calculate actual minutes spent if cancelled, otherwise use preset
      const actualMinutes = isCompleted ? preset : Math.max(1, Math.round((totalSeconds - remaining) / 60));

      await apiFetch("/api/sessions", {
        method: "POST",
        body: JSON.stringify({
          duration: actualMinutes,
          startTime: startTime,
          endTime: endTime,
          date: date,
          note: note,
          status: isCompleted ? "completed" : "cancelled",
        }),
      });

      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["ai-daily-plan"] });
      queryClient.invalidateQueries({ queryKey: ["ai-coach"] });
      
      if (isCompleted) {
        toast.success(`${preset}min sprint logged ✓`);
      } else {
        toast.info("Session cancelled and logged.");
      }
    } catch (error: any) {
      toast.error("Failed to log session");
    }
  }, [preset, startTime, note, queryClient, totalSeconds, remaining]);

  const stop = useCallback(() => {
    // Log as cancelled if they worked for more than 10 seconds
    const elapsed = totalSeconds - remaining;
    if (running && elapsed > 10) {
      logSession(false);
    }
    
    setRunning(false);
    setRemaining(totalSeconds);
    setCompleted(false);
    setStartTime(null);
  }, [totalSeconds, remaining, running, logSession]);

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => r - 1);
      }, 1000);
    } else if (remaining <= 0 && running) {
      setRunning(false);
      setCompleted(true);
      const s = loadSettings();
      if (s.notificationSound) playChime();
      if (s.notificationsEnabled) sendNotification(preset);
      logSession(true);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, remaining, preset, logSession]);

  return (
    <TimerContext.Provider value={{
      preset, remaining, totalSeconds, running, completed, startTime, note,
      setNote, start, pause, stop, selectPreset
    }}>
      {children}
    </TimerContext.Provider>
  );
}

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (context === undefined) throw new Error('useTimer must be used within a TimerProvider');
  return context;
};
