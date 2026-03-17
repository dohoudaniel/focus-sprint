export interface AdminUser {
  id: string;
  email: string;
  name: string;
  signupDate: string;
  lastActive: string;
  totalSessions: number;
  totalMinutes: number;
  status: "active" | "inactive" | "banned";
}

export interface DailySignup {
  date: string;
  count: number;
}

export interface HourlyUsage {
  hour: string;
  sessions: number;
}

export interface HealthMetric {
  name: string;
  value: string;
  status: "healthy" | "warning" | "critical";
  detail: string;
}

export interface AdminOverview {
  totalUsers: number;
  activeUsersToday: number;
  newSignupsThisWeek: number;
  totalSessionsToday: number;
  avgSessionDuration: number;
  peakHour: string;
  errorRate: string;
  uptime: string;
}

export const mockAdminUsers: AdminUser[] = [
  { id: "u1", email: "alice@example.com", name: "Alice Chen", signupDate: "2026-01-15", lastActive: "2026-03-17", totalSessions: 142, totalMinutes: 4260, status: "active" },
  { id: "u2", email: "bob@example.com", name: "Bob Martinez", signupDate: "2026-02-03", lastActive: "2026-03-17", totalSessions: 89, totalMinutes: 2670, status: "active" },
  { id: "u3", email: "carol@example.com", name: "Carol Davis", signupDate: "2026-02-20", lastActive: "2026-03-16", totalSessions: 56, totalMinutes: 1400, status: "active" },
  { id: "u4", email: "dave@example.com", name: "Dave Wilson", signupDate: "2026-01-28", lastActive: "2026-03-10", totalSessions: 23, totalMinutes: 575, status: "inactive" },
  { id: "u5", email: "eve@example.com", name: "Eve Johnson", signupDate: "2026-03-01", lastActive: "2026-03-17", totalSessions: 31, totalMinutes: 930, status: "active" },
  { id: "u6", email: "frank@example.com", name: "Frank Lee", signupDate: "2026-03-05", lastActive: "2026-03-15", totalSessions: 12, totalMinutes: 300, status: "active" },
  { id: "u7", email: "grace@example.com", name: "Grace Kim", signupDate: "2026-02-14", lastActive: "2026-02-28", totalSessions: 8, totalMinutes: 200, status: "inactive" },
  { id: "u8", email: "hank@example.com", name: "Hank Brown", signupDate: "2026-01-10", lastActive: "2026-03-17", totalSessions: 210, totalMinutes: 6300, status: "active" },
  { id: "u9", email: "iris@example.com", name: "Iris Patel", signupDate: "2026-03-12", lastActive: "2026-03-17", totalSessions: 7, totalMinutes: 175, status: "active" },
  { id: "u10", email: "spam@bad.com", name: "Spam Bot", signupDate: "2026-03-14", lastActive: "2026-03-14", totalSessions: 0, totalMinutes: 0, status: "banned" },
];

export const mockDailySignups: DailySignup[] = [
  { date: "Mar 11", count: 3 },
  { date: "Mar 12", count: 5 },
  { date: "Mar 13", count: 2 },
  { date: "Mar 14", count: 8 },
  { date: "Mar 15", count: 4 },
  { date: "Mar 16", count: 6 },
  { date: "Mar 17", count: 9 },
];

export const mockHourlyUsage: HourlyUsage[] = [
  { hour: "6am", sessions: 4 },
  { hour: "7am", sessions: 12 },
  { hour: "8am", sessions: 28 },
  { hour: "9am", sessions: 45 },
  { hour: "10am", sessions: 52 },
  { hour: "11am", sessions: 38 },
  { hour: "12pm", sessions: 15 },
  { hour: "1pm", sessions: 22 },
  { hour: "2pm", sessions: 48 },
  { hour: "3pm", sessions: 41 },
  { hour: "4pm", sessions: 30 },
  { hour: "5pm", sessions: 18 },
  { hour: "6pm", sessions: 8 },
];

export const mockHealthMetrics: HealthMetric[] = [
  { name: "API Response Time", value: "42ms", status: "healthy", detail: "p95 over last hour" },
  { name: "Error Rate", value: "0.12%", status: "healthy", detail: "5xx errors in last 24h" },
  { name: "Uptime", value: "99.98%", status: "healthy", detail: "Last 30 days" },
  { name: "Database Connections", value: "18/100", status: "healthy", detail: "Active pooled connections" },
  { name: "Memory Usage", value: "72%", status: "warning", detail: "Server memory utilization" },
  { name: "CDN Cache Hit Rate", value: "94.2%", status: "healthy", detail: "Last 24h cache performance" },
  { name: "Auth Service", value: "Operational", status: "healthy", detail: "All endpoints responding" },
  { name: "Queue Depth", value: "3", status: "healthy", detail: "Background jobs pending" },
];

export const mockAdminOverview: AdminOverview = {
  totalUsers: 1247,
  activeUsersToday: 312,
  newSignupsThisWeek: 37,
  totalSessionsToday: 856,
  avgSessionDuration: 31,
  peakHour: "10:00 AM",
  errorRate: "0.12%",
  uptime: "99.98%",
};
