import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, User, Settings, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navLinks = [
  { label: "Product", href: "/#features" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  
  const isApp = location.pathname.startsWith("/app") || 
                location.pathname.startsWith("/history") || 
                location.pathname.startsWith("/insights") ||
                location.pathname.startsWith("/chat");

  const initials = user?.name 
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
    : user?.email[0].toUpperCase() || "U";

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg"
    >
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-button bg-primary overflow-hidden">
            <img src="/logo.png" alt="FocusSprint" className="h-full w-full object-cover" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">FocusSprint</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {!isApp && navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          
          {isAuthenticated ? (
            <>
              {isApp && (
                <>
                  <Link to="/app" className={`text-sm font-medium transition-colors ${location.pathname === "/app" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>Dashboard</Link>
                  <Link to="/history" className={`text-sm font-medium transition-colors ${location.pathname === "/history" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>History</Link>
                  <Link to="/insights" className={`text-sm font-medium transition-colors ${location.pathname === "/insights" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>Insights</Link>
                  <Link to="/chat" className={`text-sm font-medium transition-colors ${location.pathname === "/chat" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>Coach</Link>
                </>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9 border border-border">
                      <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {!isApp && (
                    <DropdownMenuItem asChild>
                      <Link to="/app">Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/chat" className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" /> Focus Coach
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" /> Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/auth/login" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Log in</Link>
              <Button asChild size="sm" className="rounded-button bg-primary text-primary-foreground shadow-card hover:brightness-95">
                <Link to="/auth/signup">Get Started</Link>
              </Button>
            </>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-foreground p-2"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-border md:hidden bg-background"
          >
            <nav className="container flex flex-col gap-3 py-4">
              {isAuthenticated ? (
                <>
                  <Link to="/app" onClick={() => setMobileOpen(false)} className="py-2 text-sm font-medium text-foreground">Dashboard</Link>
                  <Link to="/history" onClick={() => setMobileOpen(false)} className="py-2 text-sm font-medium text-foreground">History</Link>
                  <Link to="/insights" onClick={() => setMobileOpen(false)} className="py-2 text-sm font-medium text-foreground">Insights</Link>
                  <Link to="/chat" onClick={() => setMobileOpen(false)} className="py-2 text-sm font-medium text-foreground">Focus Coach</Link>
                  <Link to="/settings" onClick={() => setMobileOpen(false)} className="py-2 text-sm font-medium text-foreground">Settings</Link>
                  <button onClick={() => { logout(); setMobileOpen(false); }} className="flex items-center py-2 text-sm font-medium text-destructive">
                    <LogOut className="mr-2 h-4 w-4" /> Log out
                  </button>
                </>
              ) : (
                <>
                  {navLinks.map((link) => (
                    <Link key={link.href} to={link.href} onClick={() => setMobileOpen(false)} className="py-2 text-sm font-medium text-foreground">{link.label}</Link>
                  ))}
                  <Link to="/auth/login" onClick={() => setMobileOpen(false)} className="py-2 text-sm font-medium text-foreground">Log in</Link>
                  <Button asChild className="rounded-button bg-primary text-primary-foreground">
                    <Link to="/auth/signup" onClick={() => setMobileOpen(false)}>Get Started</Link>
                  </Button>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
