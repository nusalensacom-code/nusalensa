import React from 'react';
import type { Metadata } from 'next';
import { siteConfig } from '@/lib/siteConfig';
import { Breadcrumbs } from '@/components/ui/Breadcrumb';
import { ShieldCheck, CheckCircle2, AlertTriangle, Cpu, Sparkles, Scale } from 'lucide-react';

export const metadata: Metadata = {
  title: `Editorial Policy & Testing Standards | ${siteConfig.name}`,
  description: `NusaLensa's editorial standards for factual verification, independent smartphone benchmarking, AI assistance transparency, and commercial independence.`,
  alternates: {
    canonical: `${siteConfig.url}/editorial-policy`,
  },
};

export default function EditorialPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <Breadcrumbs items={[{ name: 'Editorial Policy', url: '/editorial-policy' }]} />

      <article className="my-8">
        <div className="border-b border-slate-200 pb-6 mb-8">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>GLOBAL EDITORIAL CODE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            NusaLensa Editorial Policy & Standards
          </h1>
          <p className="text-base sm:text-lg text-slate-600 mt-2 leading-relaxed">
            These standards govern every writer, hardware analyst, and editor at NusaLensa. Our readers rely on our specifications, reviews, and market coverage to make informed purchasing decisions.
          </p>
        </div>

        <div className="space-y-10 text-slate-700 leading-relaxed text-base sm:text-lg">
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3 flex items-center">
              <CheckCircle2 className="w-6 h-6 mr-2 text-brand-600 flex-shrink-0" />
              1. Factual Verification & Technical Accuracy
            </h2>
            <p className="mb-3">
              Accuracy is the cornerstone of technical journalism. We follow strict verification protocols:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li><strong>Primary Sources:</strong> Device specifications, network band support, and release timelines are cross-referenced directly against official manufacturer whitepapers, FCC/regulatory filings, and carrier documentations.</li>
              <li><strong>Multi-Market Pricing Nuances:</strong> We distinguish official launch prices (MSRP) from fluctuating retail street prices, clearly annotating regional currencies (USD, GBP, EUR, AUD, CAD) rather than relying on automated conversions that mislead buyers.</li>
              <li><strong>Unverified Information:</strong> When verified data is pending, we use neutral, transparent labels such as <em>&quot;Not available&quot;</em> or <em>&quot;Price varies by market&quot;</em> rather than speculative estimates.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-3 flex items-center">
              <Cpu className="w-6 h-6 mr-2 text-indigo-600 flex-shrink-0" />
              2. Independent Hardware Testing & Review Methodology
            </h2>
            <p className="mb-3">
              Our hardware evaluations are conducted independently under repeatable testing environments:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li><strong>Standardized Benchmarks:</strong> Geekbench, 3DMark, and custom workflow scripts are run repeatedly under controlled temperatures to detect thermal throttling and sustained performance degradation.</li>
              <li><strong>Real-World Battery Testing:</strong> Endurance metrics reflect standardized web-browsing, 4K video playback, and cellular mixed-use tests calibrated to fixed display nits.</li>
              <li><strong>No Paid Editorial Reviews:</strong> NusaLensa never accepts compensation for product reviews or score guarantees. Commercial teams have zero influence over review verdicts.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-2 text-amber-600 flex-shrink-0" />
              3. Anti-Sensationalism & Headline Integrity
            </h2>
            <p className="mb-3">
              We strictly forbid deceptive clickbait or exaggerated claims:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-white rounded-xl border border-red-200">
                <span className="text-xs font-bold uppercase text-red-600 block mb-1">Forbidden:</span>
                <p className="text-sm text-slate-700">
                  Headlines concealing critical context, framing uncorroborated leaks as confirmed specs, or exploiting fear and emotional hyperbole.
                </p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-emerald-200">
                <span className="text-xs font-bold uppercase text-emerald-600 block mb-1">Our Standard:</span>
                <p className="text-sm text-slate-700">
                  Accurate, descriptive headlines that inform the reader immediately and reflect the exact scope of the evidence presented.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3 flex items-center">
              <Sparkles className="w-6 h-6 mr-2 text-brand-600 flex-shrink-0" />
              4. AI Assistance & Human Editorial Responsibility
            </h2>
            <p className="mb-3">
              We leverage machine intelligence strictly as an editorial productivity tool—never as a substitute for human journalism:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li><strong>Human-in-the-Loop Mandate:</strong> No article, specification update, or review is ever published automatically. Every draft must undergo human editorial review, fact-checking, and final approval.</li>
              <li><strong>AI Scope:</strong> AI tools assist with taxonomy categorization, initial press release intake summaries, topic outlines, and verification checklists.</li>
              <li><strong>Original Value:</strong> NusaLensa does not syndicate machine-rewritten third-party content. All published analysis must provide substantive original insight, context, or testing.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-3 flex items-center">
              <Scale className="w-6 h-6 mr-2 text-blue-600 flex-shrink-0" />
              5. Content Classification & Transparency
            </h2>
            <p className="mb-3">
              We clearly label all content to maintain trust with our audience:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li><strong>News:</strong> Verifiable factual reports regarding official releases, industry movements, and security updates.</li>
              <li><strong>Rumors & Leaks:</strong> Supply chain reports and unconfirmed leaks are explicitly flagged with confidence ratings and source lineage.</li>
              <li><strong>Analysis & Opinion:</strong> Analytical commentary and editorial columns reflect author perspective backed by documented market data.</li>
              <li><strong>Affiliate Links:</strong> Any shopping links that generate affiliate commissions are accompanied by clear disclosure notices.</li>
            </ul>
          </section>
        </div>
      </article>
    </div>
  );
}
