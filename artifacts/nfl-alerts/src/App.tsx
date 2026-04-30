import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Home from "@/pages/home";
import Teams from "@/pages/teams";
import TeamDetail from "@/pages/team-detail";
import AlertDetail from "@/pages/alert-detail";
import Breaking from "@/pages/breaking";
import Preferences from "@/pages/preferences";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/teams" component={Teams} />
      <Route path="/teams/:teamId" component={TeamDetail} />
      <Route path="/alerts/:alertId" component={AlertDetail} />
      <Route path="/breaking" component={Breaking} />
      <Route path="/preferences" component={Preferences} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
