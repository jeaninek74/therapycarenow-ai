import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Triage from "./pages/Triage";
import CrisisMode from "./pages/CrisisMode";
import UrgentOptions from "./pages/UrgentOptions";
import RoutineOptions from "./pages/RoutineOptions";
import FindTherapist from "./pages/FindTherapist";
import ProviderProfile from "./pages/ProviderProfile";
import BenefitsWallet from "./pages/BenefitsWallet";
import FreeResources from "./pages/FreeResources";
import AIAssistant from "./pages/AIAssistant";
import Settings from "./pages/Settings";
import AdminDashboard from "./pages/AdminDashboard";
import EmergencyFAB from "./components/EmergencyFAB";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/triage" component={Triage} />
      <Route path="/crisis" component={CrisisMode} />
      <Route path="/urgent" component={UrgentOptions} />
      <Route path="/routine" component={RoutineOptions} />
      <Route path="/find-therapist" component={FindTherapist} />
      <Route path="/provider/:id" component={ProviderProfile} />
      <Route path="/benefits" component={BenefitsWallet} />
      <Route path="/free-resources" component={FreeResources} />
      <Route path="/ai-assistant" component={AIAssistant} />
      <Route path="/settings" component={Settings} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
          <EmergencyFAB />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
