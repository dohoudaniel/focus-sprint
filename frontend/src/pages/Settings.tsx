import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Bell, Target, Timer, Moon, Sun, Monitor, Check, Save, Keyboard, User } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";

// --- Settings Schema ---
export interface AppSettings {
  dailyGoalMinutes: number;
  defaultPreset: 25 | 50 | 90;
  customPresets: number[];
  notificationsEnabled: boolean;
  notificationSound: boolean;
  theme: "system" | "dark" | "light";
  breakDuration: number; // mins after each session
  autoStartBreak: boolean;
  showFocusScore: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  dailyGoalMinutes: 150,
  defaultPreset: 25,
  customPresets: [],
  notificationsEnabled: false,
  notificationSound: true,
  theme: "system",
  breakDuration: 5,
  autoStartBreak: false,
  showFocusScore: true,
};

export const SETTINGS_KEY = "focussprint_settings";

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: AppSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

// --- Section wrapper ---
function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-sm p-6 space-y-6"
    >
      <div className="flex items-center gap-3 pb-2 border-b border-border/30">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
          <Icon size={18} className="text-primary" />
        </div>
        <h2 className="font-black text-base text-foreground">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

// --- Toggle ---
function Toggle({ checked, onChange, label, sublabel }: { checked: boolean; onChange: (v: boolean) => void; label: string; sublabel?: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          checked ? "bg-primary" : "bg-muted"
        }`}
        role="switch"
        aria-checked={checked}
      >
        <motion.span
          layout
          animate={{ x: checked ? 20 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="inline-block h-5 w-5 rounded-full bg-white shadow"
        />
      </button>
    </div>
  );
}

// --- Number Stepper ---
function Stepper({ value, onChange, min, max, step = 5, suffix = "min" }: {
  value: number; onChange: (v: number) => void; min: number; max: number; step?: number; suffix?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(Math.max(min, value - step))}
        className="h-9 w-9 rounded-xl border border-border/60 bg-muted/40 flex items-center justify-center text-lg font-bold hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all"
      >
        −
      </button>
      <span className="min-w-[60px] text-center font-black text-foreground">{value} {suffix}</span>
      <button
        onClick={() => onChange(Math.min(max, value + step))}
        className="h-9 w-9 rounded-xl border border-border/60 bg-muted/40 flex items-center justify-center text-lg font-bold hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all"
      >
        +
      </button>
    </div>
  );
}

// --- Main Page ---
export default function SettingsPage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [settings, setSettings] = useState<AppSettings>(loadSettings());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  if (authLoading) return null;
  if (!isAuthenticated) return <Navigate to="/auth/login" />;

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    toast.success("Settings saved.");
    setTimeout(() => setSaved(false), 3000);
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      toast.error("Your browser doesn't support notifications.");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      update("notificationsEnabled", true);
      toast.success("Notifications enabled.");
      new Notification("FocusSprint", { body: "You'll be notified when sessions end. 🎯" });
    } else {
      toast.error("Notification permission denied.");
    }
  };

  const TIMER_PRESETS = [25, 50, 90] as const;
  const THEME_OPTIONS = [
    { value: "system", label: "System", icon: Monitor },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "light", label: "Light", icon: Sun },
  ] as const;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="container flex-1 py-10 max-w-3xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest mb-6">
            <Settings size={12} />
            Preferences
          </div>

          {/* User identity card */}
          <div className="flex items-center gap-4 p-5 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 border border-primary/20 shrink-0">
              {user?.name ? (
                <span className="text-xl font-black text-primary">
                  {user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                </span>
              ) : (
                <User size={24} className="text-primary" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-lg font-black text-foreground truncate">
                {user?.name || "Anonymous User"}
              </p>
              <p className="text-sm text-muted-foreground font-medium truncate">{user?.email}</p>
              <div className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Active Session</span>
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-black tracking-tight text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1 font-medium">
            Personalise FocusSprint to fit your focus workflow.
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Timer Presets */}
          <Section title="Timer" icon={Timer}>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Default Session Length</p>
                <p className="text-xs text-muted-foreground mb-3">The preset that loads when you open the dashboard.</p>
                <div className="flex gap-2 flex-wrap">
                  {TIMER_PRESETS.map((p) => (
                    <button
                      key={p}
                      onClick={() => update("defaultPreset", p)}
                      className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                        settings.defaultPreset === p
                          ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                          : "border-border/60 bg-muted/30 text-foreground hover:bg-primary/10 hover:border-primary/30"
                      }`}
                    >
                      {settings.defaultPreset === p && <Check size={14} />}
                      {p} min
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Break Duration</p>
                <p className="text-xs text-muted-foreground mb-3">Rest time suggested between sprints.</p>
                <Stepper value={settings.breakDuration} onChange={(v) => update("breakDuration", v)} min={1} max={30} step={1} />
              </div>

              <Toggle
                checked={settings.autoStartBreak}
                onChange={(v) => update("autoStartBreak", v)}
                label="Auto-start break timer"
                sublabel="Automatically begin a break countdown when a session ends."
              />
            </div>
          </Section>

          {/* Daily Goal */}
          <Section title="Goals" icon={Target}>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Daily Focus Goal</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Your target focus time per day. Cal Newport recommends 3–4 hours for knowledge work.
                </p>
                <Stepper
                  value={settings.dailyGoalMinutes}
                  onChange={(v) => update("dailyGoalMinutes", v)}
                  min={30}
                  max={480}
                  step={15}
                />
                <div className="mt-3 flex gap-2">
                  {[60, 120, 150, 240].map((goal) => (
                    <button
                      key={goal}
                      onClick={() => update("dailyGoalMinutes", goal)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold border transition-all ${
                        settings.dailyGoalMinutes === goal
                          ? "bg-primary/15 border-primary/30 text-primary"
                          : "border-border/40 text-muted-foreground hover:border-primary/20"
                      }`}
                    >
                      {goal === 60 ? "1h" : goal === 120 ? "2h" : goal === 150 ? "2.5h" : "4h"}
                    </button>
                  ))}
                </div>
              </div>

              <Toggle
                checked={settings.showFocusScore}
                onChange={(v) => update("showFocusScore", v)}
                label="Show Focus Score"
                sublabel="Display a daily performance score on your dashboard."
              />
            </div>
          </Section>

          {/* Notifications */}
          <Section title="Notifications" icon={Bell}>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-border/40 bg-muted/20">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Session End Alerts</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Get a browser notification when your sprint completes.
                    </p>
                  </div>
                  {settings.notificationsEnabled ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                      <Check size={12} />
                      Active
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={requestNotificationPermission}
                      className="rounded-xl text-xs border-primary/30 text-primary hover:bg-primary/10 shrink-0"
                    >
                      Enable
                    </Button>
                  )}
                </div>
              </div>

              <Toggle
                checked={settings.notificationSound}
                onChange={(v) => update("notificationSound", v)}
                label="Sound on completion"
                sublabel="Play a subtle chime when a session ends."
              />
            </div>
          </Section>

          {/* Appearance */}
          <Section title="Appearance" icon={Moon}>
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">Theme</p>
              <p className="text-xs text-muted-foreground mb-3">Choose your preferred colour scheme.</p>
              <div className="flex gap-2">
                {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => update("theme", value)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                      settings.theme === value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border/60 bg-muted/30 text-foreground hover:bg-primary/10"
                    }`}
                  >
                    <Icon size={15} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </Section>

          {/* Keyboard Shortcuts */}
          <Section title="Keyboard Shortcuts" icon={Keyboard}>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "Space", action: "Start / Pause timer" },
                { key: "Esc", action: "Stop session" },
                { key: "1 / 2 / 3", action: "Switch preset" },
              ].map(({ key, action }) => (
                <div key={key} className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/30">
                  <kbd className="px-2.5 py-1 rounded-lg bg-secondary text-foreground text-xs font-black border border-border/50 shrink-0">{key}</kbd>
                  <p className="text-xs text-muted-foreground font-medium">{action}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex justify-end gap-3"
        >
          <AnimatePresence>
            {saved && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-sm font-bold text-emerald-400"
              >
                <Check size={16} />
                Saved
              </motion.div>
            )}
          </AnimatePresence>
          <Button
            onClick={handleSave}
            className="rounded-xl gap-2 bg-primary text-primary-foreground px-8 font-bold shadow-lg shadow-primary/20 hover:brightness-95"
          >
            <Save size={16} />
            Save Settings
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
