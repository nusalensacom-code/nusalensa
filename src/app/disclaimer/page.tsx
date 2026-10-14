import React from 'react';
import type { Metadata } from 'next';
import { siteConfig } from '@/lib/siteConfig';
import { Breadcrumbs } from '@/components/ui/Breadcrumb';
import { ShieldAlert } from 'lucide-react';

export const metadata: Metadata = {
  title: `Disclaimer & Technical Notice | ${siteConfig.name}`,
  description: `Legal and technical disclaimer regarding device specifications, laboratory benchmark results, pricing variations, and external links on NusaLensa.`,
  alternates: {
    canonical: `${siteConfig.url}/disclaimer`,
  },
};

export default function DisclaimerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <Breadcrumbs items={[{ name: 'Disclaimer', url: '/disclaimer' }]} />

      <article className="my-8">
        <div className="border-b border-slate-200 pb-6 mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
            Legal & Technical Notice
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
            NusaLensa Disclaimer
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Last updated: October 2026
          </p>
        </div>

        <div className="p-5 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl my-6 flex items-start space-x-3 text-amber-900 text-sm">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            All content published on <strong>{siteConfig.name}</strong> is provided in good faith for general technology information, education, and purchasing research.
          </p>
        </div>

        <div className="space-y-6 text-slate-700 leading-relaxed text-base">
          <h2 className="text-xl font-bold text-slate-900">1. Device Specifications & Pricing Disclaimers</h2>
          <p>
            While our hardware editorial desk strives for 100% accuracy, smartphone specifications, dimensions, cellular network band support, and regional variants can vary by country, carrier, and firmware release. Retail prices fluctuate continuously across international vendors. Always verify exact network compatibility and seller terms before completing a purchase.
          </p>

          <h2 className="text-xl font-bold text-slate-900">2. Benchmark & Battery Life Variance</h2>
          <p>
            Benchmark results (Geekbench, 3DMark, AnTuTu, etc.) and battery endurance metrics reported in our reviews reflect controlled laboratory testing on specific review units. Real-world consumer battery life and processing speed may vary based on ambient temperature, cellular signal strength, background apps, display brightness settings, and individual usage patterns.
          </p>

          <h2 className="text-xl font-bold text-slate-900">3. Third-Party Links & Outbound Sites</h2>
          <p>
            NusaLensa contains links to third-party merchant and manufacturer websites for informational and purchasing convenience. We do not control, endorse, or accept responsibility for the availability, content, or privacy policies of third-party platforms.
          </p>
        </div>
      </article>
    </div>
  );
}
