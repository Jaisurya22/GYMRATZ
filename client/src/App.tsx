import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import TrackerPage from "@/pages/tracker-page";
import NutritionPage from "@/pages/nutrition-page";
import ProfilePage from "@/pages/profile-page";

function Router() {
    return (
        <Switch>
            <Route path="/auth" component={AuthPage} />
            <ProtectedRoute path="/" component={Dashboard} />
            <ProtectedRoute path="/tracker" component={TrackerPage} />
            <ProtectedRoute path="/nutrition" component={NutritionPage} />
            <ProtectedRoute path="/profile" component={ProfilePage} />
            <Route component={NotFound} />
        </Switch>
    );
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <Router />
                <Toaster />
            </AuthProvider>
        </QueryClientProvider>
    );
}

export default App;
