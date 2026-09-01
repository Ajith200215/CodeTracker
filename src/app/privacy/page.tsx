import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, Lock } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F6F7FF] dark:bg-[#09090b] text-[#1E1F2B] dark:text-white py-20 px-4 lg:px-12">
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm font-bold text-[#6C5CE7] hover:text-[#5A4AD1] mb-10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        
        <div className="bg-white dark:bg-gray-900 rounded-[36px] p-8 md:p-12 border border-[#8B8CF6]/20 dark:border-gray-800 shadow-xl shadow-[#8B8CF6]/5">
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100 dark:border-gray-800">
            <div className="w-16 h-16 rounded-2xl bg-[#6C5CE7] flex items-center justify-center text-white shadow-lg shadow-[#6C5CE7]/30">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="font-serif-display text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
              <p className="text-sm font-semibold text-[#6A6C88] dark:text-gray-400 mt-1">Last updated: September 2026</p>
            </div>
          </div>
          
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-lg font-medium text-[#5A5C75] dark:text-gray-300 mb-8 leading-relaxed">
              At CodeTracker, we take your privacy seriously. This Privacy Policy explains how we collect, 
              use, disclose, and safeguard your information when you use our educational analytics and proctoring platform.
            </p>

            <div className="space-y-8">
              <section>
                <h3 className="flex items-center gap-2 text-xl font-bold text-[#1E1F2B] dark:text-white mb-3">
                  <Lock className="w-5 h-5 text-[#8B8CF6]" />
                  1. Information We Collect
                </h3>
                <p className="text-sm text-[#5A5C75] dark:text-gray-400 leading-relaxed mb-3">
                  We collect information that you voluntarily provide to us when you register on the platform, including:
                </p>
                <ul className="list-disc pl-5 text-sm text-[#5A5C75] dark:text-gray-400 space-y-1">
                  <li>Personal identifiers (name, college email address, student ID)</li>
                  <li>Academic information (courses enrolled, department, batch)</li>
                  <li>Linked coding platform accounts (LeetCode, Codeforces, CodeChef)</li>
                  <li>Proctoring data during live assessments (webcam snapshots, active tab status)</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-[#1E1F2B] dark:text-white mb-3">2. How We Use Your Information</h3>
                <p className="text-sm text-[#5A5C75] dark:text-gray-400 leading-relaxed mb-3">
                  The information we collect is used strictly for educational and analytical purposes to:
                </p>
                <ul className="list-disc pl-5 text-sm text-[#5A5C75] dark:text-gray-400 space-y-1">
                  <li>Aggregate your coding statistics across platforms into a single dashboard.</li>
                  <li>Allow your university instructors to monitor your academic progress and assign grades.</li>
                  <li>Ensure academic integrity during proctored remote examinations.</li>
                  <li>Improve the CodeTracker platform features and user experience.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-[#1E1F2B] dark:text-white mb-3">3. Data Security & Sharing</h3>
                <p className="text-sm text-[#5A5C75] dark:text-gray-400 leading-relaxed">
                  We implement industry-standard security measures to protect your personal information. 
                  Your data is <strong>never</strong> sold to third parties. Access to your proctoring data and 
                  detailed analytics is strictly limited to authorized faculty members at your registered institution.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-[#1E1F2B] dark:text-white mb-3">4. Contact Us</h3>
                <p className="text-sm text-[#5A5C75] dark:text-gray-400 leading-relaxed">
                  If you have questions or comments about this Privacy Policy, please contact your university's 
                  IT administrator or email the CodeTracker support team at <strong>privacy@codetracker.edu</strong>.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
