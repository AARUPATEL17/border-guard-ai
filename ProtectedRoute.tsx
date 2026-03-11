import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { ShieldAlert } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-primary">
        <ShieldAlert className="w-16 h-16 animate-pulse mb-4" />
        <p className="font-mono text-lg tracking-widest animate-pulse">AUTHENTICATING...</p>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
