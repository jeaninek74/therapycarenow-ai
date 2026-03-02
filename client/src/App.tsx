import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import FindTherapist from "./pages/FindTherapist";
import ProviderProfile from "./pages/ProviderProfile";
import BenefitsWallet from "./pages/BenefitsWallet";
import FreeResources from "./pages/FreeResources";
import AIAssistant from "./pages/AIAssistant";
import Settings from "./pages/Settings";
import AdminDashboard from "./pages/AdminDashboard";
import AdminVerificationQueue from "./pages/AdminVerificationQueue";
import ComplianceMonitor from "./pages/admin/ComplianceMonitor";
import ProviderSubmission from "./pages/ProviderSubmission";
import TherapistDirectory from "./pages/TherapistDirectory";
import Login from "./pages/Login";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ConsentBanner from "./components/ConsentBanner";
import InteractiveDemo from "./pages/InteractiveDemo";
import PsychiatristsLanding from "./pages/PsychiatristsLanding";
import PsychologistsLanding from "./pages/PsychologistsLanding";
import TherapistsLanding from "./pages/TherapistsLanding";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/find-therapist" component={FindTherapist} />
      <Route path="/provider/:id" component={ProviderProfile} />
      <Route path="/benefits" component={BenefitsWallet} />
      <Route path="/free-resources" component={FreeResources} />
      <Route path="/ai-assistant" component={AIAssistant} />
      <Route path="/settings" component={Settings} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/verification" component={AdminVerificationQueue} />
      <Route path="/admin/compliance" component={ComplianceMonitor} />
      <Route path="/join-directory" component={ProviderSubmission} />
      <Route path="/directory" component={TherapistDirectory} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Login} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/demo" component={InteractiveDemo} />
      {/* Provider type landing pages */}
      <Route path="/psychiatrists" component={PsychiatristsLanding} />
      <Route path="/psychologists" component={PsychologistsLanding} />
      <Route path="/therapists" component={TherapistsLanding} />
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
          <ConsentBanner />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
