import { useLocation } from "wouter";
import { Phone } from "lucide-react";

/**
 * Persistent Emergency FAB — visible on every screen except Crisis Mode.
 * Spec: "A 'Get Help Now' button must be visible on every screen."
 */
export default function EmergencyFAB() {
  const [location, navigate] = useLocation();

  // Hide on crisis mode page (it's already the full crisis screen)
  if (location === "/crisis") return null;

  return (
    <button
      onClick={() => navigate("/triage")}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-destructive text-destructive-foreground font-semibold rounded-full px-5 py-3 shadow-lg hover:opacity-90 active:scale-95 transition-all animate-crisis-pulse focus:outline-none focus:ring-4 focus:ring-destructive/30"
      aria-label="Get Help Now — Emergency Support"
    >
      <Phone className="w-4 h-4" />
      <span className="text-sm">Get Help Now</span>
    </button>
  );
}
