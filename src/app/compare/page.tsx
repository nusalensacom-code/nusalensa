import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { siteConfig } from '@/lib/siteConfig';
import { Breadcrumbs } from '@/components/ui/Breadcrumb';
import { SafeImage as Image } from '@/components/ui/SafeImage';
import { Scale, ArrowRight, Smartphone, Zap, Sparkles, CheckCircle2 } from 'lucide-react';
import { CompareSelector } from '@/components/compare/CompareSelector';

interface ComparePageProps {
  searchParams?: {
    deviceA?: string;
    deviceB?: string;
  };
}

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Smartphone & Tablet Comparison Tool | ${siteConfig.name}`,
    description: `Compare smartphone specifications side-by-side. Compare display specs, camera sensor sizes, chip performance, battery life, and international prices on NusaLensa.`,
    alternates: {
      canonical: `${siteConfig.url}/compare`,
    },
    openGraph: {
      title: `Smartphone & Tablet Comparison Tool | ${siteConfig.name}`,
      description: `Side-by-side technical hardware comparisons with multi-market pricing on NusaLensa.`,
      url: `${siteConfig.url}/compare`,
    },
  };
}

export default async function CompareHubPage({ searchParams }: ComparePageProps) {
  // Fetch all devices for comparison selectors
  const devices = await prisma.device.findMany({
    orderBy: { releasedDate: 'desc' },
    include: { brand: true },
  });

  const deviceASlug = searchParams?.deviceA;
  const deviceBSlug = searchParams?.deviceB;

  // Curated popular flagship matchups
  const popularMatchups = [
    {
      slugA: 'iphone-16-pro-max',
      slugB: 'samsung-galaxy-s25-ultra',
      title: 'Apple iPhone 16 Pro Max vs. Samsung Galaxy S25 Ultra',
      subtitle: 'The ultimate flagship battle: A18 Pro vs Snapdragon 8 Elite',
    },
    {
      slugA: 'google-pixel-9-pro',
      slugB: 'oneplus-13',
      title: 'Google Pixel 9 Pro vs. OnePlus 13',
      subtitle: 'Computational AI photography vs 100W powerhouse',
    },
    {
      slugA: 'iphone-16-pro-max',
      slugB: 'google-pixel-9-pro',
      title: 'Apple iPhone 16 Pro Max vs. Google Pixel 9 Pro',
      subtitle: 'iOS 18 Intelligence vs Android 15 Gemini integration',
    },
    {
      slugA: 'samsung-galaxy-s25-ultra',
      slugB: 'oneplus-13',
      title: 'Samsung Galaxy S25 Ultra vs. OnePlus 13',
      subtitle: 'Snapdragon 8 Elite flagship clash: Quad-camera vs Hasselblad',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <Breadcrumbs items={[{ name: 'Compare', url: '/compare' }]} />

      {/* Header Banner */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-brand-950 text-white rounded-3xl p-6 sm:p-10 my-6 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-wider mb-3 text-brand-300">
            <Scale className="w-3.5 h-3.5" />
            <span>SIDE-BY-SIDE SPECIFICATION COMPARISON</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Compare Phones & Tablets Side-by-Side
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-3 leading-relaxed">
            Select two smartphones or tablets to analyze technical differences across display nits, camera sensors, benchmark speeds, battery life, and launch pricing.
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-300">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-brand-400 flex-shrink-0" />
            <span>Direct Spec Diffing</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-brand-400 flex-shrink-0" />
            <span>Camera Sensor Breakdown</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-brand-400 flex-shrink-0" />
            <span>Multi-Market MSRP Comparison</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-brand-400 flex-shrink-0" />
            <span>Pros & Cons Analysis</span>
          </div>
        </div>
      </section>

      {/* Interactive Matchup Selector */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 my-8 shadow-sm">
        <h2 className="text-xl font-black text-slate-900 mb-6 pb-3 border-b border-slate-200 flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-brand-600" />
          Choose Any Two Devices to Compare
        </h2>

        <CompareSelector
          devices={devices}
          defaultSlugA={deviceASlug}
          defaultSlugB={deviceBSlug}
        />
      </section>

      {/* Popular Flagship Matchups */}
      <section className="my-10">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-6 pb-3 border-b-2 border-slate-900">
          Popular Flagship Comparisons
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {popularMatchups.map((match, idx) => (
            <Link
              key={idx}
              href={`/compare/${match.slugA}-vs-${match.slugB}`}
              className="p-6 bg-white border border-slate-200 hover:border-brand-500 rounded-2xl shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] uppercase font-extrabold text-brand-600 tracking-wider block mb-1">
                  FEATURED COMPARISON
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                  {match.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {match.subtitle}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-brand-600">
                <span>View Full Spec Diff</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

