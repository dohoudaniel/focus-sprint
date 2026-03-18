import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Insights from "./pages/Insights";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import AIChat from "./pages/AIChat";
import AIChatButton from "./components/AIChatButton";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSessions from "./pages/admin/AdminSessions";
import AdminHealth from "./pages/admin/AdminHealth";
import { AuthProvider } from "./hooks/use-auth";
import { TimerProvider } from "./contexts/TimerContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <TimerProvider>
            <div className="relative">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/app" element={<Dashboard />} />
                <Route path="/chat" element={<AIChat />} />
                <Route path="/history" element={<History />} />
                <Route path="/insights" element={<Insights />} />
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/signup" element={<Signup />} />
                <Route path="/about" element={<About />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminOverview />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="sessions" element={<AdminSessions />} />
                  <Route path="health" element={<AdminHealth />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
              <AIChatButton />
            </div>
          </TimerProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
