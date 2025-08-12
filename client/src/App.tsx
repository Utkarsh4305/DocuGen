import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import FuturisticUpload from "@/components/futuristic-upload";
import AnalysisDashboard from "@/components/analysis-dashboard";
import ConversionSelector from "@/components/conversion-selector";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/upload" component={FuturisticUpload} />
      <Route path="/analysis/:projectId" component={AnalysisDashboard} />
      <Route path="/conversion/:projectId" component={ConversionSelector} />
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
