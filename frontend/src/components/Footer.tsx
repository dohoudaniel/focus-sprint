import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="container flex flex-col items-center gap-4 py-8 md:flex-row md:justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-primary overflow-hidden">
            <img src="/logo.png" alt="FocusSprint" className="h-full w-full object-cover" />
          </div>
          <span className="font-display text-sm font-semibold text-foreground">FocusSprint</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
          <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          <span className="hidden md:inline text-border">|</span>
          <p className="text-xs">
            Built with <span className="text-primary mx-0.5">💙</span> by{" "}
            <a 
              href="https://dohoudanielfavour.me" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-primary transition-colors font-semibold"
            >
              A Beautiful Mind
            </a>
          </p>
        </nav>
        <div className="flex flex-col items-center md:items-end">
          <p className="text-xs text-muted-foreground opacity-70">© {new Date().getFullYear()} FocusSprint. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
