import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Components & Pages
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Sidebar } from "@/components/Sidebar";
import { Login } from "@/pages/Login";
import { Dashboard } from "@/pages/Dashboard";
import { Monitoring } from "@/pages/Monitoring";
import { Alerts } from "@/pages/Alerts";
import { Contact } from "@/pages/Contact";

// Layout wrapper for protected pages that need the sidebar
function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      {/* Protected Routes */}
      <Route path="/">
        <ProtectedRoute>
          <AppLayout>
            <Dashboard />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/monitoring">
        <ProtectedRoute>
          <AppLayout>
            <Monitoring />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/alerts">
        <ProtectedRoute>
          <AppLayout>
            <Alerts />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/contact">
        <ProtectedRoute>
          <AppLayout>
            <Contact />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
