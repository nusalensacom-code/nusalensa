import React from 'react';
import type { Metadata } from 'next';
import { siteConfig } from '@/lib/siteConfig';
import { Breadcrumbs } from '@/components/ui/Breadcrumb';
import { RefreshCw, CheckCircle2, Mail, ShieldAlert, History } from 'lucide-react';

export const metadata: Metadata = {
  title: `Corrections & Verification Policy | ${siteConfig.name}`,
  description: `NusaLensa's transparent corrections policy, editorial errata guidelines, and procedures for submitting spec updates and factual corrections.`,
  alternates: {
    canonical: `${siteConfig.url}/corrections-policy`,
  },
};

export default function CorrectionsPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <Breadcrumbs items={[{ name: 'Corrections Policy', url: '/corrections-policy' }]} />

      <article className="my-8">
        <div className="border-b border-slate-200 pb-6 mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
            Accountability Standards
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
            NusaLensa Corrections Policy
          </h1>
          <p className="text-base sm:text-lg text-slate-600 mt-2 leading-relaxed">
            We are committed to swift, transparent corrections whenever hardware specifications, benchmarks, pricing, or reporting contain errors.
          </p>
        </div>

        <div className="space-y-10 text-slate-700 leading-relaxed text-base sm:text-lg">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3 flex items-center">
              <RefreshCw className="w-6 h-6 mr-2 text-brand-600" />
              1. Commitment to Rapid & Transparent Correction
            </h2>
            <p>
              When an error of fact, technical specification (such as battery capacity, sensor dimensions, carrier band support), benchmark score, or quote is identified, our editorial staff acts quickly:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600 mt-3">
              <li><strong>Verification:</strong> Our senior editors cross-check the claim against primary manufacturer documentation or independent lab logs.</li>
              <li><strong>Direct Correction:</strong> The inaccurate text or specification entry is corrected promptly in the live database or article body.</li>
              <li><strong>Transparent Errata Note:</strong> For substantive changes, an Editor&apos;s Note is affixed to the article detailing what was corrected, why, and the timestamp of the update. Minor typographical fixes that do not alter factual meaning are corrected silently.</li>
            </ul>
          </section>

          <section className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-3 flex items-center">
              <Mail className="w-6 h-6 mr-2 text-brand-600" />
              2. How to Submit a Correction Request
            </h2>
            <p className="mb-4">
              Readers, manufacturers, and researchers are encouraged to report factual or specification discrepancies directly to our corrections desk:
            </p>
            <div className="bg-white p-5 rounded-xl border border-slate-200 text-sm space-y-3">
              <p><strong>Email:</strong> <a href="mailto:corrections@nusalensa.com" className="text-brand-600 underline font-semibold">corrections@nusalensa.com</a></p>
              <p><strong>Subject Line:</strong> [Correction Request] [Device Name or Article Title]</p>
              <div>
                <strong>Please include in your report:</strong>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-600">
                  <li>Direct URL of the article or device specification page.</li>
                  <li>Exact quote, data field, or benchmark metric in dispute.</li>
                  <li>Link to primary documentation (manufacturer spec sheet, regulatory filing, FCC ID, or whitepaper).</li>
                  <li>Your name and contact details (or organizational affiliation if submitting on behalf of a brand).</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3 flex items-center">
              <History className="w-6 h-6 mr-2 text-indigo-600" />
              3. Device Specification Updates
            </h2>
            <p>
              Smartphones frequently receive software updates that change features, fix camera algorithms, or enable carrier bands over time. We date-stamp all specification audits with a <code>lastVerified</code> indicator. When post-launch software updates materially alter benchmark performance or feature availability, we update the review and provide an update log.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3 flex items-center">
              <ShieldAlert className="w-6 h-6 mr-2 text-slate-800" />
              4. Unpublishing & Retraction Policy
            </h2>
            <p>
              NusaLensa maintains a strict public record. We do not unpublish or delete articles simply upon request. In the rare event that an article falls fatally short of our standards, a formal retraction is issued, and the article is annotated with a comprehensive explanation from the Editor-in-Chief.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}

