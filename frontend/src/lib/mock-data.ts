export interface Session {
  id: string;
  duration: number;
  startTime: string;
  endTime: string;
  date: string;
  note: string;
  status: "completed" | "cancelled";
}

export interface Stats {
  totalFocusToday: number;
  sessionsToday: number;
  streak: number;
  weeklyTotal: number;
  avgSessionLength: number;
}

export const mockSessions: Session[] = [
  { id: "1", duration: 25, startTime: "09:00", endTime: "09:25", date: "2026-03-17", note: "Deep work on UI components", status: "completed" },
  { id: "2", duration: 50, startTime: "10:00", endTime: "10:50", date: "2026-03-17", note: "Code review & refactor", status: "completed" },
  { id: "3", duration: 25, startTime: "14:00", endTime: "14:25", date: "2026-03-17", note: "API integration", status: "completed" },
  { id: "4", duration: 25, startTime: "09:30", endTime: "09:55", date: "2026-03-16", note: "Design system tokens", status: "completed" },
  { id: "5", duration: 50, startTime: "11:00", endTime: "11:50", date: "2026-03-16", note: "Dashboard layout", status: "completed" },
  { id: "6", duration: 25, startTime: "15:00", endTime: "15:25", date: "2026-03-16", note: "Bug fixes", status: "completed" },
  { id: "7", duration: 25, startTime: "10:00", endTime: "10:25", date: "2026-03-15", note: "Sprint planning", status: "completed" },
  { id: "8", duration: 50, startTime: "13:00", endTime: "13:50", date: "2026-03-15", note: "Feature development", status: "completed" },
  { id: "9", duration: 25, startTime: "08:00", endTime: "08:10", date: "2026-03-14", note: "Quick check-in", status: "cancelled" },
  { id: "10", duration: 25, startTime: "09:00", endTime: "09:25", date: "2026-03-14", note: "Documentation writing", status: "completed" },
];

export const mockStats: Stats = {
  totalFocusToday: 100,
  sessionsToday: 3,
  streak: 7,
  weeklyTotal: 425,
  avgSessionLength: 32,
};

export const weeklyData = [
  { day: "Mon", minutes: 75 },
  { day: "Tue", minutes: 100 },
  { day: "Wed", minutes: 50 },
  { day: "Thu", minutes: 125 },
  { day: "Fri", minutes: 75 },
  { day: "Sat", minutes: 0 },
  { day: "Sun", minutes: 0 },
];
