import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AssessmentFlow from "@/pages/AssessmentFlow";
import LearnMore from "@/pages/LearnMore";
import MeditationLibrary from "@/pages/MeditationLibrary";
import VideoLibrary from "@/pages/VideoLibrary";
import AdminLogin from "@/pages/AdminLogin";
import AdminEmailGenerator from "@/pages/AdminEmailGenerator";
import NotFound from "@/pages/not-found";
import { useIframeMessaging } from "@/hooks/useIframeMessaging";

function Router() {
  // Initialize iframe messaging
  useIframeMessaging();

  return (
    <Switch>
      <Route path="/" component={AssessmentFlow} />
      <Route path="/learn-more" component={LearnMore} />
      <Route path="/meditations" component={MeditationLibrary} />
      <Route path="/videos" component={VideoLibrary} />
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/email-generator" component={AdminEmailGenerator} />
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