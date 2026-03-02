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
import ClinicianLogin from "./pages/clinician/ClinicianLogin";
import ClinicianDashboard from "./pages/clinician/ClinicianDashboard";
import ClientRoster from "./pages/clinician/ClientRoster";
import ClientDetail from "./pages/clinician/ClientDetail";
import NoteCreator from "./pages/clinician/NoteCreator";
import PracticeAnalytics from "./pages/clinician/PracticeAnalytics";
import RiskPanel from "./pages/clinician/RiskPanel";
import AdaptiveIntake from "./pages/clinician/AdaptiveIntake";
import ClinicianCompliance from "./pages/clinician/ClinicianCompliance";
import ClinicianRevenue from "./pages/clinician/ClinicianRevenue";
import ClinicianSubscription from "./pages/clinician/ClinicianSubscription";
import TherapistDirectory from "./pages/TherapistDirectory";
import Login from "./pages/Login";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ConsentBanner from "./components/ConsentBanner";

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
      {/* Clinician Portal */}
      <Route path="/clinician/login" component={ClinicianLogin} />
      <Route path="/clinician/dashboard" component={ClinicianDashboard} />
      <Route path="/clinician/clients" component={ClientRoster} />
      <Route path="/clinician/clients/:id" component={ClientDetail} />
      <Route path="/clinician/notes/new" component={NoteCreator} />
      <Route path="/clinician/analytics" component={PracticeAnalytics} />
      <Route path="/clinician/risk" component={RiskPanel} />
      <Route path="/clinician/intake/:clientId" component={AdaptiveIntake} />
      <Route path="/clinician/compliance" component={ClinicianCompliance} />
      <Route path="/clinician/revenue" component={ClinicianRevenue} />
      <Route path="/clinician/subscribe" component={ClinicianSubscription} />
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
