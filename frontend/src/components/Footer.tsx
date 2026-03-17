import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="container flex flex-col items-center gap-4 py-8 md:flex-row md:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="hsl(var(--primary-foreground))" />
            </svg>
          </div>
          <span className="font-display text-sm font-semibold text-foreground">FocusSprint</span>
        </div>
        <nav className="flex gap-6 text-sm text-muted-foreground">
          <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
          <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
        </nav>
        <p className="text-xs text-muted-foreground">© 2026 FocusSprint. All rights reserved.</p>
      </div>
    </footer>
  );
}
