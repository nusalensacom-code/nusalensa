import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { siteConfig } from '@/lib/siteConfig';
import { SafeImage as Image } from '@/components/ui/SafeImage';
import { Breadcrumbs } from '@/components/ui/Breadcrumb';
import { JsonLd } from '@/components/seo/JsonLd';
import { generateDeviceSchema, generateCanonicalUrl } from '@/lib/seo';
import { formatDateEnglish } from '@/lib/utils';
import {
  Smartphone,
  Cpu,
  Camera,
  Battery,
  ShieldCheck,
  Scale,
  Star,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Layers,
  Zap,
  Globe2,
  DollarSign,
  Radio,
  FileCheck,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { TopTenTrending } from '@/components/ui/TopTenTrending';
import { PopularComparisons } from '@/components/ui/PopularComparisons';
import { AdBanner } from '@/components/ui/AdBanner';

interface DevicePageProps {
  params: {
    brand: string;
    'device-slug': string;
  };
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: DevicePageProps): Promise<Metadata> {
  const deviceSlug = params['device-slug'];
  const brandSlug = params.brand;

  const device = await prisma.device.findFirst({
    where: {
      slug: deviceSlug,
      brand: { slug: brandSlug },
    },
    include: { brand: true },
  });

  if (!device) {
    notFound();
  }

  const title = `${device.name} Full Specifications, Price & Review | ${siteConfig.name}`;
  const description = `${device.name} specifications: ${device.displaySize} ${device.displayType}, ${device.chipset}, ${device.mainCamera}, ${device.batteryCapacity} battery. Official launch & retail prices across USD, GBP, EUR, AUD, CAD.`;
  const canonicalUrl = `${siteConfig.url}/phones/${device.brand.slug}/${device.slug}`;

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
      images: device.featuredImage ? [{ url: device.featuredImage, alt: device.name }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: device.featuredImage ? [device.featuredImage] : [],
    },
  };
}

export default async function SmartphoneDetailPage({ params }: DevicePageProps) {
  const deviceSlug = params['device-slug'];
  const brandSlug = params.brand;

  const device = await prisma.device.findFirst({
    where: {
      slug: deviceSlug,
      brand: { slug: brandSlug },
    },
    include: {
      brand: true,
    },
  });

  if (!device) {
    notFound();
  }

  // Parse JSON fields safely
  let launchPrices: Record<string, string> = {};
  if (device.launchPrices) {
    try {
      launchPrices = JSON.parse(device.launchPrices);
    } catch (e) {}
  }

  let retailPrices: Record<string, string> = {};
  if (device.retailPrices) {
    try {
      retailPrices = JSON.parse(device.retailPrices);
    } catch (e) {}
  }

  let pros: string[] = [];
  if (device.pros) {
    try {
      pros = JSON.parse(device.pros);
    } catch (e) {}
  }

  let cons: string[] = [];
  if (device.cons) {
    try {
      cons = JSON.parse(device.cons);
    } catch (e) {}
  }

  let sources: Array<{ title: string; url: string }> = [];
  if (device.sources) {
    try {
      sources = JSON.parse(device.sources);
    } catch (e) {}
  }

  let formattedRamStorage = '';
  if (device.ramStorage) {
    try {
      const parsed = JSON.parse(device.ramStorage);
      if (Array.isArray(parsed)) {
        formattedRamStorage = parsed.map((item: any) => `${item.ram} RAM / ${item.storage}`).join(' • ');
      } else {
        formattedRamStorage = device.ramStorage;
      }
    } catch (e) {
      formattedRamStorage = device.ramStorage;
    }
  }

  // Related devices for quick comparison
  const rivalDevices = await prisma.device.findMany({
    where: {
      id: { not: device.id },
      deviceType: { in: ['SMARTPHONE', 'PHONE'] },
    },
    take: 3,
    include: { brand: true },
    orderBy: { releasedDate: 'desc' },
  });

  // All devices for GSMArena Top 10 by Daily Hits
  const allDevices = await prisma.device.findMany({
    where: { deviceType: { in: ['SMARTPHONE', 'PHONE', 'TABLET'] } },
    orderBy: { views: 'desc' },
    take: 10,
    include: { brand: true },
  });

  // Breadcrumbs
  const breadcrumbs = [
    { name: 'Smartphones', url: '/phones' },
    { name: device.brand.name, url: `/phones?brand=${device.brand.slug}` },
    { name: device.name, url: `/phones/${device.brand.slug}/${device.slug}` },
  ];

  // Schema.org Product JSON-LD
  const productSchema = generateDeviceSchema(device);

  const currencyList = [
    { code: 'USD', name: 'United States Dollar', symbol: '$' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'EUR', name: 'Eurozone Euro', symbol: '€' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <JsonLd data={productSchema} />
      <Breadcrumbs items={breadcrumbs} />

      {/* Hero Overview Card */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 my-6 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Device Image & Badges */}
          <div className="lg:col-span-4 flex flex-col items-center">
            <div className="relative w-64 h-80 sm:w-72 sm:h-96 bg-gradient-to-b from-slate-50 to-slate-100 rounded-2xl p-6 flex items-center justify-center border border-slate-200 shadow-xs">
              {device.featuredImage ? (
                <Image
                  src={device.featuredImage}
                  alt={device.name}
                  fill
                  priority
                  sizes="(max-width: 768px) 256px, 300px"
                  className="object-contain p-4 drop-shadow-md"
                />
              ) : (
                <Smartphone className="w-24 h-24 text-slate-300" />
              )}
            </div>

            {device.regionalVariants && (
              <span className="mt-3 text-xs font-mono text-slate-500 text-center">
                Variants: {device.regionalVariants}
              </span>
            )}
          </div>

          {/* Right: Key Details & Specs Overview */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/brands/${device.brand.slug}`}
                className="px-3 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 font-extrabold text-xs uppercase tracking-wider rounded-lg transition"
              >
                {device.brand.name}
              </Link>

              {device.announcedDate && (
                <span className="text-xs text-slate-500 flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Announced: {device.announcedDate}
                </span>
              )}

              {device.lastVerified && (
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-semibold flex items-center ml-auto">
                  <FileCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  Verified: {formatDateEnglish(device.lastVerified)}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
              {device.name}
            </h1>

            {device.summary && (
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                {device.summary}
              </p>
            )}

            {/* Hardware Key Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-slate-200 text-left">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center">
                  <Smartphone className="w-3 h-3 mr-1 text-slate-400" />
                  Display
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 block mt-0.5">
                  {device.displaySize || 'Not specified'}
                </span>
                <span className="text-[11px] text-slate-500 truncate block">
                  {device.displayResolution || device.displayType || ''}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center">
                  <Cpu className="w-3 h-3 mr-1 text-slate-400" />
                  Chipset
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 block mt-0.5 truncate">
                  {device.chipset || 'Not specified'}
                </span>
                <span className="text-[11px] text-slate-500 truncate block">
                  {formattedRamStorage || ''}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center">
                  <Camera className="w-3 h-3 mr-1 text-slate-400" />
                  Camera
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 block mt-0.5 truncate">
                  {device.mainCamera?.split(',')[0] || 'Not specified'}
                </span>
                <span className="text-[11px] text-slate-500 truncate block">
                  {device.selfieCamera?.split(',')[0] ? `Selfie: ${device.selfieCamera.split(',')[0]}` : ''}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center">
                  <Battery className="w-3 h-3 mr-1 text-slate-400" />
                  Battery
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 block mt-0.5">
                  {device.batteryCapacity || 'Not specified'}
                </span>
                <span className="text-[11px] text-slate-500 truncate block">
                  {device.charging || ''}
                </span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href={`/compare?deviceA=${device.slug}`}
                className="inline-flex items-center px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
              >
                <Scale className="w-4 h-4 mr-2" />
                Compare Against Other Phones
              </Link>

              {device.rating && (
                <div className="inline-flex items-center px-3 py-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-bold">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500 mr-1.5" />
                  <span>Lab Score: {device.rating.toFixed(1)} / 10</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Global Pricing & Market Availability Matrix */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 my-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2 mb-6">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-brand-600 uppercase tracking-wider">
              <DollarSign className="w-4 h-4" />
              <span>International Price Matrix</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Launch MSRP vs. Current Retail Prices
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            {device.availabilityRegions ? `Regional Availability: ${device.availabilityRegions}` : 'Global Markets'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider">
                <th className="py-3 px-4">Market / Currency</th>
                <th className="py-3 px-4">Official Launch Price (MSRP)</th>
                <th className="py-3 px-4">Current Verified Retail Price</th>
                <th className="py-3 px-4">Market Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currencyList.map((curr) => {
                const launch = launchPrices[curr.code];
                const retail = retailPrices[curr.code];

                return (
                  <tr key={curr.code} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-mono font-bold text-slate-700">
                          {curr.code}
                        </span>
                        <span>{curr.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {launch || <span className="text-slate-400 font-normal">Price varies by market</span>}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {retail || <span className="text-slate-400 font-normal">Not available</span>}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      {launch ? (
                        <span className="inline-flex items-center text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Officially Released
                        </span>
                      ) : (
                        <span className="text-slate-400">Import / Regional dependent</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-slate-400 italic">
          * Launch prices reflect base storage configurations at official manufacturer announcements. Current retail prices reflect verified merchant listings and may fluctuate with carrier incentives or regional taxes.
        </p>
      </section>

      {/* Main Grid: Comprehensive Specification Sheet & Editorial Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-8">
        {/* Left Column (8 cols): Spec Sheet */}
        <div className="lg:col-span-8 space-y-8">
          <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900 pb-4 border-b border-slate-200 mb-6 flex items-center">
              <Layers className="w-6 h-6 mr-2.5 text-brand-600" />
              Full Technical Specifications
            </h2>

            {/* Spec Sections */}
            <div className="space-y-8 divide-y divide-slate-100">
              {/* Network */}
              <div className="pt-4">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-brand-700 mb-3 flex items-center">
                  <Radio className="w-4 h-4 mr-2" />
                  Network & Cellular Bands
                </h3>
                <dl className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <dt className="text-slate-500 font-medium">Bands & 5G:</dt>
                  <dd className="sm:col-span-2 text-slate-900 font-medium">
                    {device.networkBands || '5G (Sub-6GHz / mmWave), 4G LTE, 3G, 2G'}
                  </dd>

                  <dt className="text-slate-500 font-medium">SIM Configuration:</dt>
                  <dd className="sm:col-span-2 text-slate-900 font-medium">
                    {device.sim || 'Nano-SIM and eSIM'}
                  </dd>

                  {device.regionalVariants && (
                    <>
                      <dt className="text-slate-500 font-medium">Regional Model SKUs:</dt>
                      <dd className="sm:col-span-2 text-slate-900 font-medium">
                        {device.regionalVariants}
                      </dd>
                    </>
                  )}
                </dl>
              </div>

              {/* Body */}
              <div className="pt-6">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-brand-700 mb-3 flex items-center">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Body & Build
                </h3>
                <dl className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <dt className="text-slate-500 font-medium">Dimensions:</dt>
                  <dd className="sm:col-span-2 text-slate-900 font-medium">
                    {device.dimensions || 'Not specified'}
                  </dd>

                  <dt className="text-slate-500 font-medium">Weight:</dt>
                  <dd className="sm:col-span-2 text-slate-900 font-medium">
                    {device.weight || 'Not specified'}
                  </dd>

                  <dt className="text-slate-500 font-medium">Build Materials:</dt>
                  <dd className="sm:col-span-2 text-slate-900 font-medium">
                    {device.buildMaterials || 'Glass front, glass back, aluminum/titanium frame'}
                  </dd>
                </dl>
              </div>

              {/* Display */}
              <div className="pt-6">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-brand-700 mb-3 flex items-center">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Display
                </h3>
                <dl className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <dt className="text-slate-500 font-medium">Type:</dt>
                  <dd className="sm:col-span-2 text-slate-900 font-medium">
                    {device.displayType || 'OLED / AMOLED'}
                  </dd>

                  <dt className="text-slate-500 font-medium">Size:</dt>
                  <dd className="sm:col-span-2 text-slate-900 font-medium">
                    {device.displaySize || 'Not specified'}
                  </dd>

                  <dt className="text-slate-500 font-medium">Resolution:</dt>
                  <dd className="sm:col-span-2 text-slate-900 font-medium">
                    {device.displayResolution || 'Not specified'}
                  </dd>

                  <dt className="text-slate-500 font-medium">Protection:</dt>
                  <dd className="sm:col-span-2 text-slate-900 font-medium">
                    {device.displayProtection || 'Corning Gorilla Glass'}
                  </dd>
                </dl>
              </div>

              {/* Platform */}
              <div className="pt-6">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-brand-700 mb-3 flex items-center">
                  <Cpu className="w-4 h-4 mr-2" />
                  Platform & Performance
                </h3>
                <dl className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <dt className="text-slate-500 font-medium">Operating System:</dt>
                  <dd className="sm:col-span-2 text-slate-900 font-medium">
                    {device.os || 'Not specified'}
                  </dd>

                  <dt className="text-slate-500 font-medium">Chipset:</dt>
                  <dd className="sm:col-span-2 text-slate-900 font-extrabold text-slate-900">
                    {device.chipset || 'Not specified'}
                  </dd>

                  <dt className="text-slate-500 font-medium">CPU & GPU:</dt>
                  <dd className="sm:col-span-2 text-slate-900 font-medium">
                    {device.cpu || 'Octa-core'} {device.gpu ? `• ${device.gpu}` : ''}
                  </dd>

                  <dt className="text-slate-500 font-medium">RAM & Storage:</dt>
                  <dd className="sm:col-span-2 text-slate-900 font-medium">
                    {formattedRamStorage || device.ramStorage || 'Not specified'}
                  </dd>

                  <dt className="text-slate-500 font-medium">Card Slot:</dt>
                  <dd className="sm:col-span-2 text-slate-900 font-medium">
                    {device.cardSlot || 'No'}
                  </dd>
                </dl>
              </div>

              {/* Camera */}
              <div className="pt-6">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-brand-700 mb-3 flex items-center">
                  <Camera className="w-4 h-4 mr-2" />
                  Camera System
                </h3>
                <dl className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <dt className="text-slate-500 font-medium">Rear System:</dt>
                  <dd className="sm:col-span-2 text-slate-900 font-medium">
                    {device.mainCamera || 'Not specified'}
                  </dd>

                  <dt className="text-slate-500 font-medium">Front Camera:</dt>
                  <dd className="sm:col-span-2 text-slate-900 font-medium">
                    {device.selfieCamera || 'Not specified'}
                  </dd>

                  <dt className="text-slate-500 font-medium">Camera Optics & Video:</dt>
                  <dd className="sm:col-span-2 text-slate-900 font-medium">
                    {device.cameraFeatures || '4K/8K video, HDR, OIS, Night Mode'}
                  </dd>
                </dl>
              </div>

              {/* Battery */}
              <div className="pt-6">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-brand-700 mb-3 flex items-center">
                  <Battery className="w-4 h-4 mr-2" />
                  Battery & Charging
                </h3>
                <dl className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <dt className="text-slate-500 font-medium">Capacity:</dt>
                  <dd className="sm:col-span-2 text-slate-900 font-extrabold">
                    {device.batteryCapacity || 'Not specified'}
                  </dd>

                  <dt className="text-slate-500 font-medium">Charging Speeds:</dt>
                  <dd className="sm:col-span-2 text-slate-900 font-medium">
                    {device.charging || 'Fast charging, wireless charging'}
                  </dd>
                </dl>
              </div>

              {/* Connectivity & Audio */}
              <div className="pt-6">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-brand-700 mb-3 flex items-center">
                  <Zap className="w-4 h-4 mr-2" />
                  Audio & Connectivity
                </h3>
                <dl className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <dt className="text-slate-500 font-medium">Speakers & 3.5mm Jack:</dt>
                  <dd className="sm:col-span-2 text-slate-900 font-medium">
                    {device.speakers || 'Stereo speakers'} • 3.5mm Jack: {device.audioJack || 'No'}
                  </dd>

                  <dt className="text-slate-500 font-medium">Connectivity:</dt>
                  <dd className="sm:col-span-2 text-slate-900 font-medium">
                    {device.connectivity || 'Wi-Fi 7, Bluetooth 5.4, NFC, USB Type-C'}
                  </dd>

                  <dt className="text-slate-500 font-medium">Sensors:</dt>
                  <dd className="sm:col-span-2 text-slate-900 font-medium">
                    {device.sensors || 'Fingerprint, Face unlock, Accelerometer, Gyro, Proximity, Compass'}
                  </dd>
                </dl>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column (4 cols): Editorial Verdict, Pros & Cons, Rivals */}
        <div className="lg:col-span-4 space-y-6">
          {/* Editorial Score & Verdict Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Editorial Evaluation
              </span>
              {device.rating && (
                <div className="flex items-center space-x-1 text-amber-600 font-black text-xl">
                  <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                  <span>{device.rating.toFixed(1)} / 10</span>
                </div>
              )}
            </div>

            {device.verdict && (
              <div className="mb-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  NusaLensa Verdict
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic bg-white p-3.5 rounded-xl border border-slate-200">
                  &quot;{device.verdict}&quot;
                </p>
              </div>
            )}

            {/* Pros */}
            {pros.length > 0 && (
              <div className="mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block mb-2">
                  Key Strengths (Pros)
                </span>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {pros.map((p, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Cons */}
            {cons.length > 0 && (
              <div className="pt-3 border-t border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-red-600 block mb-2">
                  Drawbacks (Cons)
                </span>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {cons.map((c, idx) => (
                    <li key={idx} className="flex items-start">
                      <XCircle className="w-3.5 h-3.5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Quick Comparison Rivals */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center">
              <Scale className="w-4 h-4 mr-2 text-brand-600" />
              Compare With Competitors
            </h3>
            <div className="space-y-3">
              {rivalDevices.map((rival) => (
                <Link
                  key={rival.id}
                  href={`/compare/${device.slug}-vs-${rival.slug}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-300 transition group"
                >
                  <div className="min-w-0 pr-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      {rival.brand.name}
                    </span>
                    <span className="text-xs font-bold text-slate-800 group-hover:text-brand-700 truncate block">
                      vs. {rival.name}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 bg-white group-hover:bg-brand-600 group-hover:text-white text-slate-700 text-[11px] font-bold rounded-lg border border-slate-200 group-hover:border-transparent transition-colors flex-shrink-0">
                    Compare &rarr;
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* GSMArena Signature Top 10 by Daily Hits */}
          <TopTenTrending devices={allDevices} />

          {/* Popular Comparisons */}
          <PopularComparisons />

          {/* Sidebar Ad Unit */}
          <AdBanner slot="sidebar" />

          {/* Verified Sources Reference */}
          {sources.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs text-slate-600">
              <span className="font-bold uppercase tracking-wider text-slate-700 block mb-2">
                Primary Specification Sources:
              </span>
              <ul className="space-y-1">
                {sources.map((src, idx) => (
                  <li key={idx}>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-600 hover:underline flex items-center"
                    >
                      <ExternalLink className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span>{src.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

