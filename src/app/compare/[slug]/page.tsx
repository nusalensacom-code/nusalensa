import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { siteConfig } from '@/lib/siteConfig';
import { SafeImage as Image } from '@/components/ui/SafeImage';
import { Breadcrumbs } from '@/components/ui/Breadcrumb';
import {
  Scale,
  Smartphone,
  Cpu,
  Camera,
  Battery,
  Star,
  CheckCircle2,
  XCircle,
  Zap,
  ArrowRight,
  ShieldCheck,
  DollarSign,
  Radio,
  Layers,
} from 'lucide-react';

interface CompareDetailPageProps {
  params: {
    slug: string;
  };
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: CompareDetailPageProps): Promise<Metadata> {
  const parts = params.slug.split('-vs-');
  if (parts.length !== 2) {
    return { title: `Device Comparison | ${siteConfig.name}` };
  }

  const [slugA, slugB] = parts;
  const [deviceA, deviceB] = await Promise.all([
    prisma.device.findUnique({ where: { slug: slugA }, include: { brand: true } }),
    prisma.device.findUnique({ where: { slug: slugB }, include: { brand: true } }),
  ]);

  if (!deviceA || !deviceB) {
    notFound();
  }

  const title = `${deviceA.name} vs. ${deviceB.name} — Full Specs & Price Comparison | ${siteConfig.name}`;
  const description = `Compare ${deviceA.name} vs. ${deviceB.name} specifications, camera sensors, benchmark speeds, battery life, and launch prices in USD, GBP, EUR, AUD, CAD.`;
  const canonicalUrl = `${siteConfig.url}/compare/${deviceA.slug}-vs-${deviceB.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
    },
  };
}

export default async function CompareDetailPage({ params }: CompareDetailPageProps) {
  const parts = params.slug.split('-vs-');
  if (parts.length !== 2) {
    notFound();
  }

  const [slugA, slugB] = parts;
  const [deviceA, deviceB] = await Promise.all([
    prisma.device.findUnique({ where: { slug: slugA }, include: { brand: true } }),
    prisma.device.findUnique({ where: { slug: slugB }, include: { brand: true } }),
  ]);

  if (!deviceA || !deviceB) {
    notFound();
  }

  // Parse JSON prices & pros/cons safely
  const parseJson = (str: string | null | undefined, fallback: any = {}) => {
    if (!str) return fallback;
    try {
      return JSON.parse(str);
    } catch {
      return fallback;
    }
  };

  const launchPricesA = parseJson(deviceA.launchPrices, {});
  const launchPricesB = parseJson(deviceB.launchPrices, {});
  const prosA: string[] = parseJson(deviceA.pros, []);
  const consA: string[] = parseJson(deviceA.cons, []);
  const prosB: string[] = parseJson(deviceB.pros, []);
  const consB: string[] = parseJson(deviceB.cons, []);

  const currencies = [
    { code: 'USD', symbol: '$' },
    { code: 'GBP', symbol: '£' },
    { code: 'EUR', symbol: '€' },
    { code: 'AUD', symbol: 'A$' },
    { code: 'CAD', symbol: 'C$' },
  ];

  const breadcrumbs = [
    { name: 'Compare', url: '/compare' },
    {
      name: `${deviceA.name} vs ${deviceB.name}`,
      url: `/compare/${deviceA.slug}-vs-${deviceB.slug}`,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <Breadcrumbs items={breadcrumbs} />

      {/* Comparison Hero Header */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 my-6 shadow-sm">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Scale className="w-3.5 h-3.5" />
            <span>HEAD-TO-HEAD SPECIFICATION DIFF</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {deviceA.name} <span className="text-brand-600">vs.</span> {deviceB.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Side-by-side technical breakdown, camera capabilities, battery endurance, and international market pricing.
          </p>
        </div>

        {/* Dual Device Spotlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          {/* Device A */}
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center text-center">
            <span className="text-xs font-extrabold uppercase text-brand-600 tracking-wider mb-2">
              {deviceA.brand.name}
            </span>
            <div className="relative w-44 h-56 my-2 flex items-center justify-center">
              {deviceA.featuredImage ? (
                <Image
                  src={deviceA.featuredImage}
                  alt={deviceA.name}
                  fill
                  priority
                  sizes="176px"
                  className="object-contain drop-shadow-md"
                />
              ) : (
                <Smartphone className="w-20 h-20 text-slate-300" />
              )}
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-2">{deviceA.name}</h2>
            <div className="mt-2 flex items-center space-x-2">
              <span className="text-base font-extrabold text-slate-900">
                {launchPricesA.USD || launchPricesA.GBP || 'Price varies by market'}
              </span>
              {deviceA.rating && (
                <span className="px-2 py-0.5 bg-amber-500 text-white text-xs font-bold rounded flex items-center">
                  <Star className="w-3 h-3 fill-white mr-1" />
                  {deviceA.rating.toFixed(1)}
                </span>
              )}
            </div>
            <Link
              href={`/phones/${deviceA.brand.slug}/${deviceA.slug}`}
              className="mt-4 inline-flex items-center text-xs font-bold text-brand-600 hover:text-brand-700"
            >
              View Full Spec Sheet &rarr;
            </Link>
          </div>

          {/* VS Center Indicator for Desktop */}
          <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-slate-900 text-white font-black text-xs items-center justify-center shadow-lg z-10">
            VS
          </div>

          {/* Device B */}
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center text-center">
            <span className="text-xs font-extrabold uppercase text-brand-600 tracking-wider mb-2">
              {deviceB.brand.name}
            </span>
            <div className="relative w-44 h-56 my-2 flex items-center justify-center">
              {deviceB.featuredImage ? (
                <Image
                  src={deviceB.featuredImage}
                  alt={deviceB.name}
                  fill
                  priority
                  sizes="176px"
                  className="object-contain drop-shadow-md"
                />
              ) : (
                <Smartphone className="w-20 h-20 text-slate-300" />
              )}
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-2">{deviceB.name}</h2>
            <div className="mt-2 flex items-center space-x-2">
              <span className="text-base font-extrabold text-slate-900">
                {launchPricesB.USD || launchPricesB.GBP || 'Price varies by market'}
              </span>
              {deviceB.rating && (
                <span className="px-2 py-0.5 bg-amber-500 text-white text-xs font-bold rounded flex items-center">
                  <Star className="w-3 h-3 fill-white mr-1" />
                  {deviceB.rating.toFixed(1)}
                </span>
              )}
            </div>
            <Link
              href={`/phones/${deviceB.brand.slug}/${deviceB.slug}`}
              className="mt-4 inline-flex items-center text-xs font-bold text-brand-600 hover:text-brand-700"
            >
              View Full Spec Sheet &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Side-by-Side Comparison Tables */}
      <section className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm my-8">
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900 flex items-center">
            <Layers className="w-5 h-5 mr-2 text-brand-600" />
            Detailed Hardware Spec Comparison
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Side-by-side audit
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4 w-1/4">Specification Category</th>
                <th className="py-3 px-4 w-3/8 text-brand-700">{deviceA.name}</th>
                <th className="py-3 px-4 w-3/8 text-brand-700">{deviceB.name}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Display */}
              <tr className="bg-slate-50 font-bold text-slate-900">
                <td colSpan={3} className="py-2.5 px-4 text-xs uppercase tracking-wider text-slate-500">
                  Display & Screen
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-slate-500 font-medium">Screen Size</td>
                <td className="py-3 px-4 font-bold text-slate-900">{deviceA.displaySize || '—'}</td>
                <td className="py-3 px-4 font-bold text-slate-900">{deviceB.displaySize || '—'}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-slate-500 font-medium">Panel Type</td>
                <td className="py-3 px-4 text-slate-800">{deviceA.displayType || '—'}</td>
                <td className="py-3 px-4 text-slate-800">{deviceB.displayType || '—'}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-slate-500 font-medium">Resolution</td>
                <td className="py-3 px-4 text-slate-800">{deviceA.displayResolution || '—'}</td>
                <td className="py-3 px-4 text-slate-800">{deviceB.displayResolution || '—'}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-slate-500 font-medium">Protection</td>
                <td className="py-3 px-4 text-slate-800">{deviceA.displayProtection || '—'}</td>
                <td className="py-3 px-4 text-slate-800">{deviceB.displayProtection || '—'}</td>
              </tr>

              {/* Silicon */}
              <tr className="bg-slate-50 font-bold text-slate-900">
                <td colSpan={3} className="py-2.5 px-4 text-xs uppercase tracking-wider text-slate-500">
                  Platform & Performance
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-slate-500 font-medium">Chipset (SoC)</td>
                <td className="py-3 px-4 font-black text-slate-900">{deviceA.chipset || '—'}</td>
                <td className="py-3 px-4 font-black text-slate-900">{deviceB.chipset || '—'}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-slate-500 font-medium">Operating System</td>
                <td className="py-3 px-4 text-slate-800">{deviceA.os || '—'}</td>
                <td className="py-3 px-4 text-slate-800">{deviceB.os || '—'}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-slate-500 font-medium">RAM & Storage</td>
                <td className="py-3 px-4 text-slate-800">{deviceA.ramStorage || '—'}</td>
                <td className="py-3 px-4 text-slate-800">{deviceB.ramStorage || '—'}</td>
              </tr>

              {/* Cameras */}
              <tr className="bg-slate-50 font-bold text-slate-900">
                <td colSpan={3} className="py-2.5 px-4 text-xs uppercase tracking-wider text-slate-500">
                  Camera Systems
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-slate-500 font-medium">Main Camera Setup</td>
                <td className="py-3 px-4 text-slate-800 font-semibold">{deviceA.mainCamera || '—'}</td>
                <td className="py-3 px-4 text-slate-800 font-semibold">{deviceB.mainCamera || '—'}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-slate-500 font-medium">Selfie Camera</td>
                <td className="py-3 px-4 text-slate-800">{deviceA.selfieCamera || '—'}</td>
                <td className="py-3 px-4 text-slate-800">{deviceB.selfieCamera || '—'}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-slate-500 font-medium">Camera Optics & Video</td>
                <td className="py-3 px-4 text-slate-800">{deviceA.cameraFeatures || '—'}</td>
                <td className="py-3 px-4 text-slate-800">{deviceB.cameraFeatures || '—'}</td>
              </tr>

              {/* Battery & Charging */}
              <tr className="bg-slate-50 font-bold text-slate-900">
                <td colSpan={3} className="py-2.5 px-4 text-xs uppercase tracking-wider text-slate-500">
                  Battery & Endurance
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-slate-500 font-medium">Capacity</td>
                <td className="py-3 px-4 font-bold text-slate-900">{deviceA.batteryCapacity || '—'}</td>
                <td className="py-3 px-4 font-bold text-slate-900">{deviceB.batteryCapacity || '—'}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-slate-500 font-medium">Charging Speeds</td>
                <td className="py-3 px-4 text-slate-800">{deviceA.charging || '—'}</td>
                <td className="py-3 px-4 text-slate-800">{deviceB.charging || '—'}</td>
              </tr>

              {/* Body */}
              <tr className="bg-slate-50 font-bold text-slate-900">
                <td colSpan={3} className="py-2.5 px-4 text-xs uppercase tracking-wider text-slate-500">
                  Dimensions & Build
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-slate-500 font-medium">Dimensions</td>
                <td className="py-3 px-4 text-slate-800">{deviceA.dimensions || '—'}</td>
                <td className="py-3 px-4 text-slate-800">{deviceB.dimensions || '—'}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-slate-500 font-medium">Weight</td>
                <td className="py-3 px-4 text-slate-800">{deviceA.weight || '—'}</td>
                <td className="py-3 px-4 text-slate-800">{deviceB.weight || '—'}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-slate-500 font-medium">Materials & Frame</td>
                <td className="py-3 px-4 text-slate-800">{deviceA.buildMaterials || '—'}</td>
                <td className="py-3 px-4 text-slate-800">{deviceB.buildMaterials || '—'}</td>
              </tr>

              {/* Pricing comparison */}
              <tr className="bg-slate-50 font-bold text-slate-900">
                <td colSpan={3} className="py-2.5 px-4 text-xs uppercase tracking-wider text-slate-500">
                  Launch Price by Currency
                </td>
              </tr>
              {currencies.map((curr) => (
                <tr key={curr.code}>
                  <td className="py-3 px-4 text-slate-500 font-medium">
                    {curr.code} Launch MSRP
                  </td>
                  <td className="py-3 px-4 font-extrabold text-slate-900">
                    {launchPricesA[curr.code] || 'Price varies by market'}
                  </td>
                  <td className="py-3 px-4 font-extrabold text-slate-900">
                    {launchPricesB[curr.code] || 'Price varies by market'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Side-by-Side Pros & Cons */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
        {/* Device A Pros & Cons */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h4 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 mb-4">
            {deviceA.name} Strengths & Weaknesses
          </h4>

          {prosA.length > 0 && (
            <div className="mb-4">
              <span className="text-xs font-bold uppercase text-emerald-700 block mb-2">Advantages</span>
              <ul className="space-y-1 text-xs text-slate-700">
                {prosA.map((p, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {consA.length > 0 && (
            <div>
              <span className="text-xs font-bold uppercase text-red-600 block mb-2">Disadvantages</span>
              <ul className="space-y-1 text-xs text-slate-700">
                {consA.map((c, i) => (
                  <li key={i} className="flex items-start">
                    <XCircle className="w-3.5 h-3.5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Device B Pros & Cons */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h4 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 mb-4">
            {deviceB.name} Strengths & Weaknesses
          </h4>

          {prosB.length > 0 && (
            <div className="mb-4">
              <span className="text-xs font-bold uppercase text-emerald-700 block mb-2">Advantages</span>
              <ul className="space-y-1 text-xs text-slate-700">
                {prosB.map((p, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {consB.length > 0 && (
            <div>
              <span className="text-xs font-bold uppercase text-red-600 block mb-2">Disadvantages</span>
              <ul className="space-y-1 text-xs text-slate-700">
                {consB.map((c, i) => (
                  <li key={i} className="flex items-start">
                    <XCircle className="w-3.5 h-3.5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

