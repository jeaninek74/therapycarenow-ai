/**
 * ConsentBanner — shown on first visit.
 * Covers: cookie consent, HIPAA notice, and platform disclaimer.
 * Stored in localStorage so it only appears once.
 */
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const CONSENT_KEY = "tcn_consent_v1";

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) setVisible(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ accepted: true, ts: Date.now() }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 text-white shadow-2xl border-t border-slate-700">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Shield className="w-5 h-5 text-teal-400 shrink-0 mt-0.5 sm:mt-0" />
          <div className="flex-1 text-sm text-slate-300 leading-relaxed">
            <span className="font-semibold text-white">Important Notice: </span>
            TherapyCareNow is an <strong className="text-white">informational and referral platform only</strong> — not a licensed healthcare provider. Our AI assistant is a general wellness tool and is <strong className="text-white">not a substitute for professional mental health care</strong>. In an emergency, call <strong className="text-white">911</strong> or <strong className="text-white">988</strong>. We use a single session cookie for login. By continuing, you agree to our{" "}
            <Link href="/terms" className="text-teal-400 underline hover:text-teal-300">Terms of Service</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-teal-400 underline hover:text-teal-300">Privacy Policy</Link>.
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              className="bg-teal-600 hover:bg-teal-500 text-white text-xs px-4"
              onClick={handleAccept}
            >
              I Understand
            </Button>
            <button
              onClick={handleAccept}
              className="text-slate-400 hover:text-white p-1 rounded"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
