import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import Discord from "@/pages/Discord";
import VipCommunity from "@/pages/VipCommunity";
import VipMember from "@/pages/VipMember";
import AnalyticalReports from "@/pages/AnalyticalReports";
import Checkout from "@/pages/Checkout";
import TermsOfService from "@/pages/TermsOfService";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import OAuthSetup from "@/pages/OAuthSetup";
import CrossEnvironmentDemo from "@/pages/CrossEnvironmentDemo";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/discord" component={Discord} />
      <Route path="/vip" component={VipCommunity} />
      <Route path="/vip-community" component={VipCommunity} />
      <Route path="/vip-member" component={VipMember} />
      <Route path="/reports" component={AnalyticalReports} />
      <Route path="/checkout/:reportId" component={Checkout} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/oauth-setup" component={OAuthSetup} />
      <Route path="/cross-env-demo" component={CrossEnvironmentDemo} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col">
          <Navigation />
          <main className="flex-1">
            <Router />
          </main>
          <Footer />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
