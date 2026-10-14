import React from 'react';
import type { Metadata } from 'next';
import { siteConfig } from '@/lib/siteConfig';
import { Breadcrumbs } from '@/components/ui/Breadcrumb';
import { ShieldCheck, DollarSign, Award, CheckCircle2, ShoppingBag } from 'lucide-react';

export const metadata: Metadata = {
  title: `Advertising & Affiliate Disclosure | ${siteConfig.name}`,
  description: `NusaLensa's advertising disclosure, commercial transparency policy, and affiliate commission standards in compliance with FTC guidelines.`,
  alternates: {
    canonical: `${siteConfig.url}/advertising-disclosure`,
  },
};

export default function AdvertisingDisclosurePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <Breadcrumbs items={[{ name: 'Advertising Disclosure', url: '/advertising-disclosure' }]} />

      <article className="my-8">
        <div className="border-b border-slate-200 pb-6 mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
            Commercial Transparency
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
            Advertising & Affiliate Disclosure
          </h1>
          <p className="text-base sm:text-lg text-slate-600 mt-2 leading-relaxed">
            NusaLensa believes in complete transparency regarding how we generate revenue, partner with retailers, and preserve editorial independence.
          </p>
        </div>

        <div className="space-y-10 text-slate-700 leading-relaxed text-base sm:text-lg">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3 flex items-center">
              <ShoppingBag className="w-6 h-6 mr-2 text-brand-600" />
              1. Affiliate Links & Retail Commissions
            </h2>
            <p>
              When you purchase a smartphone, tablet, accessory, or software subscription through links on NusaLensa, we may earn an affiliate commission from merchant partners (such as Amazon, Best Buy, Apple, Samsung, or mobile carriers).
            </p>
            <p className="mt-3">
              This compensation comes at no additional cost to you. Retailers pay us a small referral percentage from their marketing budgets. Importantly, affiliate links have <strong>zero impact</strong> on which products we choose to test, review, or recommend. If a flagship phone fails our camera or battery tests, we report those shortcomings candidly regardless of whether an affiliate link exists.
            </p>
          </section>

          <section className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-3 flex items-center">
              <DollarSign className="w-6 h-6 mr-2 text-emerald-600" />
              2. Display Advertising
            </h2>
            <p>
              We display third-party programmatic advertisements across NusaLensa to support our independent journalism and laboratory testing infrastructure.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600 mt-3">
              <li>Ad placements are clearly demarcated with &quot;Advertisement&quot; or &quot;Sponsored&quot; labels.</li>
              <li>Advertisers have no preview rights, approval authority, or influence over our articles, scores, or device comparisons.</li>
              <li>We do not accept deceptive native ads designed to masquerade as organic editorial content.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3 flex items-center">
              <Award className="w-6 h-6 mr-2 text-indigo-600" />
              3. Review Units & Manufacturer Relationships
            </h2>
            <p>
              Device manufacturers and PR agencies frequently provide review hardware on temporary loan to enable day-one coverage. We accept review samples solely under the following strict conditions:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600 mt-3">
              <li>We do not agree to embargo agreements that restrict truthful negative criticism.</li>
              <li>Manufacturers may not review, edit, or veto our copy prior to publication.</li>
              <li>We do not accept gifts, paid travel accommodations, or compensation in exchange for reviews.</li>
              <li>Loaner units are returned to the manufacturer upon completion of our testing cycles unless purchased directly by our newsroom.</li>
            </ul>
          </section>

          <section className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-3 flex items-center">
              <ShieldCheck className="w-6 h-6 mr-2 text-blue-600" />
              4. Compliance with Regulatory Standards
            </h2>
            <p>
              This disclosure is provided in compliance with the United States Federal Trade Commission (FTC) Guides Concerning the Use of Endorsements and Testimonials, the UK Advertising Standards Authority (ASA), and Australian consumer protection guidelines.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}

