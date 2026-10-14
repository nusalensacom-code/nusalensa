import React from 'react';
import type { Metadata } from 'next';
import { siteConfig } from '@/lib/siteConfig';
import { Breadcrumbs } from '@/components/ui/Breadcrumb';
import { ShieldCheck, Target, Smartphone, Award, Cpu, Globe2, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: `About NusaLensa — Independent Global Tech & Smartphone Database | ${siteConfig.name}`,
  description: `Learn about NusaLensa, an independent global consumer technology publication and smartphone database delivering verified specifications, rigorous hardware benchmarks, and in-depth buying guides.`,
  alternates: {
    canonical: `${siteConfig.url}/about`,
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <Breadcrumbs items={[{ name: 'About Us', url: '/about' }]} />

      <article className="my-8">
        <div className="border-b border-slate-200 pb-6 mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
            About NusaLensa
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mt-1">
            Independent Global Technology Intelligence
          </h1>
          <p className="text-base sm:text-lg text-slate-600 mt-3 leading-relaxed">
            NusaLensa is an independent international technology publication and mobile hardware database dedicated to delivering verified smartphone specifications, evidence-based reviews, and market insights to consumers worldwide.
          </p>
        </div>

        <div className="space-y-10 text-slate-700 leading-relaxed text-base sm:text-lg">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Our Mission & Identity</h2>
            <p>
              Founded with the objective of bringing transparency and rigorous testing to consumer electronics, <strong>NusaLensa</strong> serves readers across the United States, United Kingdom, Canada, Australia, Europe, and global tech hubs. In an era saturated with sponsored marketing and unverified rumors, we champion technical accuracy, clear editorial independence, and data-driven evaluation.
            </p>
            <p className="mt-4">
              We specialize in deep-dive mobile hardware coverage: from silicon architecture (Apple A-series, Qualcomm Snapdragon, MediaTek Dimensity, Google Tensor) and camera optics to display ergonomics, battery longevity, and cross-platform operating systems (Android, iOS, iPadOS).
            </p>
          </section>

          {/* Pillars Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-8">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <Smartphone className="w-8 h-8 text-brand-600 mb-3" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">Global Hardware DB</h3>
              <p className="text-sm text-slate-600">
                Verified technical specifications across international models, supported cellular bands, memory variants, and launch vs. retail pricing in USD, GBP, EUR, AUD, and CAD.
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <Cpu className="w-8 h-8 text-emerald-600 mb-3" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">Empirical Testing</h3>
              <p className="text-sm text-slate-600">
                Objective lab benchmarks, standardized camera evaluations, thermal throttling tests, and real-world battery endurance assessments without manufacturer interference.
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <Globe2 className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">Worldwide Perspective</h3>
              <p className="text-sm text-slate-600">
                Uncompromising focus on regional availability, carrier compatibility, and international pricing nuances rather than single-market assumptions.
              </p>
            </div>
          </section>

          <section className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
              <Target className="w-6 h-6 mr-2 text-brand-600" />
              What We Cover
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-base text-slate-700">
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                <span>Comprehensive smartphone specifications & regional variants</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                <span>Side-by-side device comparisons & spec diffing</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                <span>In-depth hardware reviews & long-term evaluations</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                <span>Independent buyer guides & value recommendations</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                <span>Android, iOS, iPadOS ecosystem & software updates</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                <span>AI silicon, neural engines & emerging technology</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                <span>Tablets, foldables, wearables & personal computing</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                <span>Mobile privacy, security standards & connectivity</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3 flex items-center">
              <ShieldCheck className="w-6 h-6 mr-2 text-brand-600" />
              Editorial Integrity & Transparency
            </h2>
            <p>
              NusaLensa maintains strict editorial independence. Our journalists and hardware analysts operate under a code of ethics that prohibits paid reviews, sponsor influence over editorial verdicts, or preferential scoring. When review units are provided by manufacturers, we disclose the arrangement clearly, and devices are returned following testing unless purchased independently.
            </p>
            <p className="mt-3">
              To learn more about our journalistic standards, see our <a href="/editorial-policy" className="text-brand-600 hover:underline font-semibold">Editorial Policy</a>, <a href="/corrections-policy" className="text-brand-600 hover:underline font-semibold">Corrections Policy</a>, and <a href="/advertising-disclosure" className="text-brand-600 hover:underline font-semibold">Advertising Disclosure</a>.
            </p>
          </section>

          <section className="border-t border-slate-200 pt-6">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Publishing Information & Contact</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              <strong>Publication:</strong> NusaLensa ({siteConfig.url})<br />
              <strong>Publisher:</strong> {siteConfig.publisher.name}<br />
              <strong>Editorial Headquarters:</strong> {siteConfig.publisher.address}<br />
              <strong>Newsroom Inquiries:</strong> {siteConfig.publisher.email}<br />
              <strong>Press & Review Units:</strong> press@nusalensa.com
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
