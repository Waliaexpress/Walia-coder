import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { initApi } from "@/lib/api";

import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard/index";
import Projects from "@/pages/dashboard/projects";
import Subscription from "@/pages/dashboard/subscription";
import Admin from "@/pages/dashboard/admin";

// Initialize API configuration
initApi();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Protected Dashboard Routes */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/dashboard/projects" component={Projects} />
      <Route path="/dashboard/subscription" component={Subscription} />
      <Route path="/dashboard/admin" component={Admin} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
