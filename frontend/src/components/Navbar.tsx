import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Product", href: "/#features" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isApp = location.pathname.startsWith("/app") || location.pathname.startsWith("/history") || location.pathname.startsWith("/insights");

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg"
    >
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-button bg-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-primary-foreground">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" />
            </svg>
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
          {isApp ? (
            <>
              <Link to="/app" className={`text-sm font-medium transition-colors ${location.pathname === "/app" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>Dashboard</Link>
              <Link to="/history" className={`text-sm font-medium transition-colors ${location.pathname === "/history" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>History</Link>
              <Link to="/insights" className={`text-sm font-medium transition-colors ${location.pathname === "/insights" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>Insights</Link>
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
              {isApp ? (
                <>
                  <Link to="/app" onClick={() => setMobileOpen(false)} className="py-2 text-sm font-medium text-foreground">Dashboard</Link>
                  <Link to="/history" onClick={() => setMobileOpen(false)} className="py-2 text-sm font-medium text-foreground">History</Link>
                  <Link to="/insights" onClick={() => setMobileOpen(false)} className="py-2 text-sm font-medium text-foreground">Insights</Link>
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
