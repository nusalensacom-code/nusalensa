import React from 'react';
import type { Metadata } from 'next';
import { siteConfig } from '@/lib/siteConfig';
import { Breadcrumbs } from '@/components/ui/Breadcrumb';

export const metadata: Metadata = {
  title: `Privacy Policy | ${siteConfig.name}`,
  description: `NusaLensa's global privacy policy regarding personal data protection, cookies, analytics, and user rights under GDPR, CCPA, and international regulations.`,
  alternates: {
    canonical: `${siteConfig.url}/privacy-policy`,
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <Breadcrumbs items={[{ name: 'Privacy Policy', url: '/privacy-policy' }]} />

      <article className="my-8">
        <div className="border-b border-slate-200 pb-6 mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
            Data Protection & Rights
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
            NusaLensa Privacy Policy
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Last updated: October 2026
          </p>
        </div>

        <div className="space-y-6 text-slate-700 leading-relaxed text-base">
          <p>
            At <strong>{siteConfig.name}</strong> ({siteConfig.url}), protecting visitor privacy is of paramount importance. This Privacy Policy details the types of personal data we collect, how it is processed, and your privacy rights under global regulations, including the European Union General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA/CPRA).
          </p>

          <h2 className="text-xl font-bold text-slate-900 pt-4">1. Information We Collect</h2>
          <ul className="list-disc pl-6 space-y-2 text-slate-600">
            <li><strong>Information You Provide Voluntarily:</strong> Name and email address when you subscribe to our newsletter briefing, submit a hardware tip, or contact our newsroom.</li>
            <li><strong>Automated Device & Usage Information:</strong> Browser type, operating system, IP address (anonymized where required), referring URLs, pages viewed, and visit timestamps to monitor site stability and performance.</li>
            <li><strong>Cookies & Local Storage:</strong> Technical cookies used to store user interface preferences (such as comparison drawer selections) and support aggregated analytics.</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900 pt-4">2. How We Use Your Information</h2>
          <p>
            We process collected information solely to:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-slate-600">
            <li>Deliver our technology news, device specifications, and comparison services.</li>
            <li>Send our requested email newsletters (you may unsubscribe at any time via the one-click unsubscribe link).</li>
            <li>Analyze technical performance and safeguard our website against abusive traffic, scraping, or cyber threats.</li>
            <li>NusaLensa <strong>never sells or rents</strong> personal reader information to third-party data brokers.</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900 pt-4">3. Third-Party Analytics & Advertising</h2>
          <p>
            We may partner with vetted third-party analytics and ad network providers (such as Google Analytics and Google AdSense) that use cookies and similar technologies to measure audience engagement and serve relevant programmatic ads. Users can opt out of personalized advertising by visiting Google Ad Settings or the Digital Advertising Alliance consumer choice portal.
          </p>

          <h2 className="text-xl font-bold text-slate-900 pt-4">4. Your Data Rights</h2>
          <p>
            Depending on your jurisdiction (such as the EU, UK, or California), you have the right to request access to, rectification of, or deletion of your personal data held by NusaLensa. To exercise these rights, please contact our data officer at <a href="mailto:privacy@nusalensa.com" className="text-brand-600 underline">privacy@nusalensa.com</a>.
          </p>

          <h2 className="text-xl font-bold text-slate-900 pt-4">5. Security</h2>
          <p>
            We employ industry-standard transport layer security (HTTPS/TLS) encryption, secure access controls, and strict server hygiene to protect personal information against unauthorized disclosure or alteration.
          </p>
        </div>
      </article>
    </div>
  );
}
