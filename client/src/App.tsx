/**
 * App — Digital Ring-Binder
 * Design: Tactile Realism Brutalist Skeuomorphism
 *
 * Routes:
 *   /        → LandingPage (Leather Journal auth cover)
 *   /binder  → Home (The Ring-Binder SPA)
 *   /404     → NotFound
 */

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { BinderProvider } from "./contexts/BinderContext";
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={LandingPage} />
      <Route path={"/binder"} component={Home} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <BinderProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </BinderProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
