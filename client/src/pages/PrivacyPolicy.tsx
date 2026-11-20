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
                  TherapyCareNow is a <strong>mental health resource and referral platform</strong>, not a covered healthcare entity under HIPAA. We do not store, transmit, or process Protected Health Information (PHI) as defined by HIPAA. Any information you share with our assistant is used solely to provide general wellness guidance and is not stored in identifiable form. We strongly encourage you to share sensitive health information only with licensed healthcare providers.
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
            <p className="mb-3">We do not store personal information about visitors:</p>
            <div className="space-y-2 pl-4 border-l-2 border-teal-200">
              <p><strong>No visitor accounts:</strong> TherapyCareNow is a search tool. Visitors do not create accounts, and we do not ask for your name, email, or health information.</p>
              <p><strong>Searches:</strong> The filters you choose (county, ZIP code, specialty, insurance, employer) are used only to run your search and are not saved.</p>
              <p><strong>Assistant interactions:</strong> Messages sent to the assistant are processed in real time and are <strong>not stored</strong> after the session ends. No conversation history is retained on our servers.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Lock className="w-5 h-5 text-teal-600" /> 2. How We Protect Your Information
            </h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>All data is transmitted over HTTPS/TLS encryption.</li>
              <li>Server logs are automatically scrubbed of email addresses, phone numbers, and other PII before storage.</li>
              <li>Database access is restricted to application-level credentials; no direct public database access is permitted.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">3. How We Use Your Information</h2>
            <p className="mb-3">There is no login and no account. What you type into a search (a ZIP code, insurance plan or employer name) is used only to run that search and is not saved.</p>
            <p className="mt-3">We <strong>never</strong> sell, rent, or share your personal information with third parties for marketing purposes.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-teal-600" /> 4. Your Rights
            </h2>
            <p className="mb-3">Because we have no accounts and do not save what you enter, we hold no personal information about you to access, correct, export or delete.</p>
            <p className="mt-3">If you have questions, contact us at <a href="mailto:privacy@therapycarenow.com" className="text-teal-600 underline">privacy@therapycarenow.com</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Cookies</h2>
            <p>TherapyCareNow has no login and sets no cookies for visitors. The only thing kept is a note in your own browser that you closed the notice banner, so it does not appear again. It never leaves your device.</p>
            <p className="mt-3">We do not use tracking cookies, advertising cookies, or third-party analytics cookies.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Third-Party Services</h2>
            <p className="mb-2">We use the following third-party services, each with their own privacy policies:</p>
            <ul className="space-y-1 list-disc pl-5">
              <li><strong>NPPES NPI Registry</strong> (CMS/HHS) — public provider lookup, no personal data sent</li>
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
