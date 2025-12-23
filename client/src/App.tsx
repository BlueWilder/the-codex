import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Home from "@/pages/Home";
import Scripts from "@/pages/Scripts";
import ScriptBuilder from "@/pages/ScriptBuilder";
import Reference from "@/pages/Reference";
import GameSetup from "@/pages/GameSetup";
import GameTracker from "@/pages/GameTracker";
import NotFound from "@/pages/NotFound";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/scripts" component={Scripts} />
      <Route path="/script-builder" component={ScriptBuilder} />
      <Route path="/reference" component={Reference} />
      <Route path="/game-setup" component={GameSetup} />
      <Route path="/game-tracker" component={GameTracker} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
