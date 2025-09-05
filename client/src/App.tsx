import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import GrantCalls from "@/pages/grant-calls";
import Proposals from "@/pages/proposals";
import ProposalForm from "@/pages/proposal-form";
import Reviews from "@/pages/reviews";
import Awards from "@/pages/awards";
import CreateCall from "@/pages/create-call";
import GrantCallDetails from "@/pages/grant-call-details";
import ManageCall from "@/pages/manage-call";
import Settings from "@/pages/settings";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/grant-calls" component={GrantCalls} />
          <Route path="/grant-calls/new" component={CreateCall} />
          <Route path="/grant-calls/:id" component={GrantCallDetails} />
          <Route path="/grant-calls/:id/manage" component={ManageCall} />
          <Route path="/proposals" component={Proposals} />
          <Route path="/proposals/new" component={ProposalForm} />
          <Route path="/proposals/:id/edit" component={ProposalForm} />
          <Route path="/reviews" component={Reviews} />
          <Route path="/awards" component={Awards} />
          <Route path="/settings" component={Settings} />
        </>
      )}
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
