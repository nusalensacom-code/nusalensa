import React from 'react';
import type { Metadata } from 'next';
import { siteConfig } from '@/lib/siteConfig';
import { Breadcrumbs } from '@/components/ui/Breadcrumb';

export const metadata: Metadata = {
  title: `Terms of Service | ${siteConfig.name}`,
  description: `Terms and conditions governing the use of NusaLensa's website, hardware database, device comparison tools, and editorial content.`,
  alternates: {
    canonical: `${siteConfig.url}/terms`,
  },
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <Breadcrumbs items={[{ name: 'Terms of Service', url: '/terms' }]} />

      <article className="my-8">
        <div className="border-b border-slate-200 pb-6 mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
            User Agreement
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
            NusaLensa Terms of Service
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Last updated: October 2026
          </p>
        </div>

        <div className="space-y-6 text-slate-700 leading-relaxed text-base">
          <p>
            Welcome to <strong>{siteConfig.name}</strong> ({siteConfig.url}). By accessing or using our website, device databases, comparison tools, and publications, you agree to comply with and be bound by these Terms of Service.
          </p>

          <h2 className="text-xl font-bold text-slate-900 pt-4">1. Intellectual Property Rights</h2>
          <p>
            All original text, benchmarking data formats, comparisons, graphic charts, and software code on NusaLensa are protected by international copyright laws. Short quotes and factual references are permitted for non-commercial educational purposes, provided an active attribution link to the original NusaLensa source is maintained. Automated scraping or mass reproduction without express written consent is strictly prohibited.
          </p>

          <h2 className="text-xl font-bold text-slate-900 pt-4">2. Permitted Use of Device Database</h2>
          <p>
            The smartphone specification database and comparison tools are made available for personal, informational, and research use. While we strive for absolute accuracy, specifications may change as manufacturers publish firmware revisions or alter regional SKUs. Users should verify carrier compatibility before purchasing.
          </p>

          <h2 className="text-xl font-bold text-slate-900 pt-4">3. User Conduct</h2>
          <p>
            When utilizing interactive forms, search, or discussion sections, users agree not to post defamatory, obscene, infringing, or malicious content, nor attempt to compromise the integrity or security of our infrastructure.
          </p>

          <h2 className="text-xl font-bold text-slate-900 pt-4">4. Governing Law</h2>
          <p>
            These terms are governed by and construed in accordance with applicable international commercial standards. For inquiries regarding syndication or commercial data licensing, contact <a href="mailto:licensing@nusalensa.com" className="text-brand-600 underline">licensing@nusalensa.com</a>.
          </p>
        </div>
      </article>
    </div>
  );
}
