import { Link } from "wouter";
import { Heart, ArrowLeft, Shield, Lock, Eye, Trash2, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
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
          <span className="text-slate-600 font-medium">Privacy Policy</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
          <p className="text-slate-500 text-sm">Last updated: February 24, 2026</p>
        </div>

        {/* HIPAA Notice */}
        <Card className="border-blue-200 bg-blue-50 mb-8">
          <CardContent className="pt-4 pb-4">
            <div className="flex gap-3">
              <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900 text-sm">Important Notice Regarding Health Information</p>
                <p className="text-blue-800 text-sm mt-1">
                  TherapyCareNow is a <strong>mental health resource and referral platform</strong>, not a covered healthcare entity under HIPAA. We do not store, transmit, or process Protected Health Information (PHI) as defined by HIPAA. Any information you share with our AI assistant is used solely to provide general wellness guidance and is not stored in identifiable form. We strongly encourage you to share sensitive health information only with licensed healthcare providers.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8 text-slate-700">

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Eye className="w-5 h-5 text-teal-600" /> 1. Information We Collect
            </h2>
            <p className="mb-3">We collect only the minimum information necessary to provide our services:</p>
            <div className="space-y-2 pl-4 border-l-2 border-teal-200">
              <p><strong>Account information:</strong> Name and email address when you create an account. Passwords are stored as one-way cryptographic hashes (bcrypt) and cannot be recovered or read by our staff.</p>
              <p><strong>Usage data:</strong> Anonymized triage session outcomes (risk level only — no session text is stored), page views, and feature usage. No personally identifiable information is included in analytics.</p>
              <p><strong>Provider directory interactions:</strong> Search filters (state, specialty, insurance) used to find therapists. These are not linked to your identity.</p>
              <p><strong>AI assistant interactions:</strong> Messages sent to the AI assistant are processed in real time and are <strong>not stored</strong> after the session ends. No conversation history is retained on our servers.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Lock className="w-5 h-5 text-teal-600" /> 2. How We Protect Your Information
            </h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>All data is transmitted over HTTPS/TLS encryption.</li>
              <li>Passwords are hashed using bcrypt with a cost factor of 12 — they are never stored in plain text.</li>
              <li>Session tokens are signed JWTs stored in HttpOnly cookies, inaccessible to JavaScript.</li>
              <li>Our servers apply rate limiting to prevent brute-force attacks on authentication endpoints.</li>
              <li>Server logs are automatically scrubbed of email addresses, phone numbers, and other PII before storage.</li>
              <li>Database access is restricted to application-level credentials; no direct public database access is permitted.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">3. How We Use Your Information</h2>
            <p className="mb-3">We use your information only to:</p>
            <ul className="space-y-1 list-disc pl-5">
              <li>Authenticate your account and maintain your session.</li>
              <li>Provide personalized resource recommendations based on your state.</li>
              <li>Improve the accuracy and safety of our triage and AI tools (using only anonymized, aggregated data).</li>
              <li>Send critical safety notifications if you have opted in (e.g., crisis resource updates for your state).</li>
            </ul>
            <p className="mt-3">We <strong>never</strong> sell, rent, or share your personal information with third parties for marketing purposes.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">4. Clinician Data</h2>
            <p className="mb-3">Licensed clinicians who use the Clinician Portal are subject to additional data handling practices:</p>
            <ul className="space-y-1 list-disc pl-5">
              <li>NPI numbers are verified against the public NPPES registry and stored to confirm licensure.</li>
              <li>Session notes and client records entered by clinicians are stored encrypted at rest.</li>
              <li>Clinicians are solely responsible for obtaining appropriate patient consent before entering client information into the platform.</li>
              <li>Client data entered by clinicians is isolated per clinician account and not accessible to other users.</li>
              <li>AI-generated clinical notes are clearly labeled as AI-assisted and require clinician review and approval before use.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-teal-600" /> 5. Your Rights
            </h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="space-y-1 list-disc pl-5">
              <li><strong>Access</strong> the personal information we hold about you.</li>
              <li><strong>Correct</strong> inaccurate information in your account.</li>
              <li><strong>Delete</strong> your account and all associated data at any time from the Settings page.</li>
              <li><strong>Export</strong> your account data in a portable format upon request.</li>
              <li><strong>Opt out</strong> of non-essential communications at any time.</li>
            </ul>
            <p className="mt-3">To exercise any of these rights, contact us at <a href="mailto:privacy@therapycarenow.com" className="text-teal-600 underline">privacy@therapycarenow.com</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Cookies</h2>
            <p>We use a single session cookie (<code className="bg-slate-100 px-1 rounded text-sm">tcn_session</code>) to maintain your login state. This cookie is:</p>
            <ul className="space-y-1 list-disc pl-5 mt-2">
              <li>HttpOnly — cannot be accessed by JavaScript</li>
              <li>Secure — only transmitted over HTTPS</li>
              <li>SameSite=Lax — protected against cross-site request forgery</li>
              <li>Automatically expires after 1 year or when you sign out</li>
            </ul>
            <p className="mt-3">We do not use tracking cookies, advertising cookies, or third-party analytics cookies.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Third-Party Services</h2>
            <p className="mb-2">We use the following third-party services, each with their own privacy policies:</p>
            <ul className="space-y-1 list-disc pl-5">
              <li><strong>NPPES NPI Registry</strong> (CMS/HHS) — public provider lookup, no personal data sent</li>
              <li><strong>Stripe</strong> — payment processing for clinician subscriptions (subject to Stripe's Privacy Policy)</li>
            </ul>
            <p className="mt-3">We do not use Google Analytics, Facebook Pixel, or any advertising networks.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">8. Children's Privacy</h2>
            <p>TherapyCareNow is not intended for use by individuals under the age of 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us immediately.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">9. Changes to This Policy</h2>
            <p>We may update this Privacy Policy periodically. We will notify registered users of material changes via email and will update the "Last updated" date at the top of this page. Continued use of the platform after changes constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Mail className="w-5 h-5 text-teal-600" /> 10. Contact Us
            </h2>
            <p>For privacy-related questions, data requests, or concerns, contact:</p>
            <div className="mt-3 p-4 bg-white border border-slate-200 rounded-lg">
              <p className="font-semibold text-slate-900">TherapyCareNow Privacy Team</p>
              <p className="text-slate-600">Email: <a href="mailto:privacy@therapycarenow.com" className="text-teal-600 underline">privacy@therapycarenow.com</a></p>
              <p className="text-slate-600">Website: <a href="https://www.therapycarenow.com" className="text-teal-600 underline">www.therapycarenow.com</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
