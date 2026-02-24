import { Link } from "wouter";
import { Heart, ArrowLeft, AlertTriangle, Scale } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-teal-700 hover:text-teal-800">
            <Heart className="w-6 h-6 fill-teal-600 text-teal-600" />
            <span className="font-bold text-lg">TherapyCareNow</span>
          </Link>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600 font-medium">Terms of Service</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms of Service</h1>
          <p className="text-slate-500 text-sm">Last updated: February 24, 2026</p>
        </div>

        {/* Critical Disclaimer */}
        <Card className="border-amber-300 bg-amber-50 mb-8">
          <CardContent className="pt-4 pb-4">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900 text-sm">Not a Medical Service — Critical Disclaimer</p>
                <p className="text-amber-800 text-sm mt-1">
                  TherapyCareNow is an <strong>informational and referral platform only</strong>. It is not a licensed healthcare provider, does not provide medical advice, diagnosis, or treatment, and does not establish a patient-provider relationship. The AI assistant on this platform is a general wellness tool and is <strong>not a substitute for professional mental health care</strong>. If you are experiencing a mental health emergency, call <strong>911</strong> or the <strong>988 Suicide and Crisis Lifeline</strong> immediately.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8 text-slate-700">

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Scale className="w-5 h-5 text-teal-600" /> 1. Acceptance of Terms
            </h2>
            <p>By accessing or using TherapyCareNow ("the Platform"), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, do not use the Platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">2. Nature of the Service</h2>
            <p className="mb-3">TherapyCareNow provides:</p>
            <ul className="space-y-1 list-disc pl-5">
              <li>A searchable directory of licensed mental health providers (for informational purposes only)</li>
              <li>General mental health resources and crisis hotline information</li>
              <li>An AI-powered wellness assistant for general guidance (not clinical advice)</li>
              <li>A triage tool to help users identify appropriate levels of care (not a clinical assessment)</li>
              <li>A clinician portal for licensed providers to manage their practice (subject to separate clinician terms)</li>
            </ul>
            <p className="mt-3"><strong>The Platform does not provide medical advice, diagnosis, treatment, or therapy.</strong> Provider listings are for informational purposes and do not constitute endorsement or recommendation of any specific provider.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">3. Provider Directory Disclaimer</h2>
            <p className="mb-3">Regarding provider listings:</p>
            <ul className="space-y-1 list-disc pl-5">
              <li>Provider information is sourced from public databases (including the NPPES NPI Registry) and provider self-submissions.</li>
              <li>We make reasonable efforts to verify provider credentials, but <strong>we do not guarantee the accuracy, completeness, or current validity</strong> of any provider listing.</li>
              <li>Verified badges indicate that NPI verification was completed at the time of verification and do not guarantee current licensure status.</li>
              <li>Users are responsible for independently verifying a provider's credentials, licensure, and suitability before engaging their services.</li>
              <li>TherapyCareNow is not liable for any harm arising from a user's reliance on provider listings.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">4. AI Assistant Limitations</h2>
            <p className="mb-3">The AI assistant on this Platform:</p>
            <ul className="space-y-1 list-disc pl-5">
              <li>Is powered by large language model technology and may produce inaccurate or incomplete responses.</li>
              <li>Is <strong>not a licensed therapist, counselor, psychologist, or medical professional</strong>.</li>
              <li>Cannot diagnose mental health conditions or prescribe treatments.</li>
              <li>Should not be used as a substitute for professional mental health care.</li>
              <li>Is not monitored in real time by human staff.</li>
              <li>Is automatically disabled during crisis-level triage outcomes — users in crisis are directed to emergency resources only.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">5. User Responsibilities</h2>
            <p className="mb-3">By using the Platform, you agree to:</p>
            <ul className="space-y-1 list-disc pl-5">
              <li>Provide accurate information when creating an account.</li>
              <li>Use the Platform only for lawful purposes.</li>
              <li>Not attempt to circumvent security measures, rate limits, or access controls.</li>
              <li>Not use the Platform to harass, impersonate, or harm others.</li>
              <li>Seek immediate emergency assistance (911 or 988) in any life-threatening situation rather than relying on this Platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Clinician Terms</h2>
            <p>Licensed clinicians using the Clinician Portal additionally agree to:</p>
            <ul className="space-y-1 list-disc pl-5 mt-2">
              <li>Maintain a valid, active professional license in their jurisdiction.</li>
              <li>Obtain appropriate patient consent before entering client information into the Platform.</li>
              <li>Review and take clinical responsibility for all AI-generated notes before use in any clinical context.</li>
              <li>Comply with all applicable laws including HIPAA, state licensing regulations, and professional ethics codes.</li>
              <li>Not use the Platform as a sole basis for clinical decision-making.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, TherapyCareNow and its operators shall not be liable for any direct, indirect, incidental, special, or consequential damages arising from your use of the Platform, including but not limited to: reliance on provider listings, AI assistant responses, triage outcomes, or any interruption of service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">8. Governing Law</h2>
            <p>These Terms are governed by the laws of the United States. Any disputes arising from these Terms shall be resolved through binding arbitration in accordance with the American Arbitration Association rules.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">9. Contact</h2>
            <p>For questions about these Terms, contact: <a href="mailto:legal@therapycarenow.com" className="text-teal-600 underline">legal@therapycarenow.com</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
