import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Shield, Activity, Video, AlertTriangle, Phone, LogOut } from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { href: "/", label: "Dashboard", icon: Activity },
    { href: "/monitoring", label: "Live Feed", icon: Video },
    { href: "/alerts", label: "Threat Log", icon: AlertTriangle },
    { href: "/contact", label: "Dispatch", icon: Phone },
  ];

  return (
    <div className="w-64 h-screen bg-card border-r border-border flex flex-col sticky top-0">
      <div className="p-6 border-b border-border flex items-center gap-3">
        <div className="relative">
          <Shield className="w-8 h-8 text-primary" />
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-wider text-foreground uppercase leading-tight">Vanguard</h1>
          <p className="text-xs font-mono text-muted-foreground">SEC-NET v2.4</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg font-mono text-sm transition-all duration-200
                ${isActive 
                  ? "bg-primary/10 text-primary border border-primary/20 glow-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }
              `}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "animate-pulse" : ""}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-mono text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          Terminate Session
        </button>
      </div>
    </div>
  );
}
