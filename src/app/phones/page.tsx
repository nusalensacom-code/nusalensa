import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { siteConfig } from '@/lib/siteConfig';
import { Breadcrumbs } from '@/components/ui/Breadcrumb';
import { DeviceCard } from '@/components/ui/DeviceCard';
import { PhoneFinderWidget } from '@/components/ui/PhoneFinderWidget';
import { TopTenTrending } from '@/components/ui/TopTenTrending';
import { PopularComparisons } from '@/components/ui/PopularComparisons';
import { AdBanner } from '@/components/ui/AdBanner';
import { Smartphone, Filter, Search, Scale, Sparkles, CheckCircle2 } from 'lucide-react';

interface PhonesPageProps {
  searchParams?: {
    brand?: string;
    q?: string;
    sort?: string;
  };
}

export const dynamic = 'force-static';

export async function generateMetadata({ searchParams }: PhonesPageProps): Promise<Metadata> {
  const brandSlug = searchParams?.brand;
  let brandName = '';
  if (brandSlug) {
    const brand = await prisma.brand.findUnique({ where: { slug: brandSlug } });
    if (brand) brandName = `${brand.name} `;
  }

  const title = `All ${brandName}Smartphones — Specifications, Prices & Comparisons | ${siteConfig.name}`;
  const description = `Explore verified technical specifications, benchmark scores, camera capabilities, and launch vs. retail pricing for all ${brandName}smartphones on NusaLensa.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteConfig.url}/phones${brandSlug ? `?brand=${brandSlug}` : ''}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/phones`,
    },
  };
}

export default async function PhonesCatalogPage({ searchParams }: PhonesPageProps) {
  const brandFilter = searchParams?.brand;
  const searchQuery = searchParams?.q?.trim();
  const sort = searchParams?.sort || 'latest';

  // Fetch all brands with device counts
  const brands = await prisma.brand.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      _count: {
        select: { devices: { where: { deviceType: { in: ['SMARTPHONE', 'PHONE'] } } } },
      },
    },
  });

  // Build where clause
  const where: any = {
    deviceType: { in: ['SMARTPHONE', 'PHONE'] },
  };

  if (brandFilter) {
    where.brand = { slug: brandFilter };
  }

  if (searchQuery) {
    where.OR = [
      { name: { contains: searchQuery } },
      { chipset: { contains: searchQuery } },
      { regionalVariants: { contains: searchQuery } },
    ];
  }

  // Determine ordering
  let orderBy: any = { releasedDate: 'desc' };
  if (sort === 'rating') {
    orderBy = { rating: 'desc' };
  } else if (sort === 'views') {
    orderBy = { views: 'desc' };
  }

  const devices = await prisma.device.findMany({
    where,
    orderBy,
    include: {
      brand: true,
    },
  });

  // All devices for Top 10 sidebar
  const allRankedDevices = await prisma.device.findMany({
    where: { deviceType: { in: ['SMARTPHONE', 'PHONE', 'TABLET'] } },
    orderBy: { views: 'desc' },
    take: 10,
    include: { brand: true },
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6">
      <Breadcrumbs items={[{ name: 'Smartphones', url: '/phones' }]} />

      {/* Catalog Header Hero (GSMArena Dark Banner) */}
      <section className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 sm:p-8 my-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-amber-500/20 text-amber-400 rounded text-[11px] font-black uppercase tracking-wider mb-2">
              <Smartphone className="w-3.5 h-3.5" />
              <span>SMARTPHONE DATABASE & PHONE FINDER</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {brandFilter ? `${devices[0]?.brand?.name || 'Brand'} Smartphones` : 'All Smartphone Specifications'}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
              Verified technical specifications, laboratory benchmark ratings, camera optics, and official launch vs. retail pricing across USD, GBP, EUR, AUD, and CAD.
            </p>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            <Link
              href="/compare"
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl transition flex items-center space-x-1.5"
            >
              <Scale className="w-4 h-4" />
              <span>Compare Phones</span>
            </Link>
          </div>
        </div>
      </section>

      {/* GSMArena 3-Column Catalog Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Column: Phone Finder Brand List (3 cols) */}
        <aside className="lg:col-span-3 space-y-5">
          <PhoneFinderWidget brands={brands} />
          <AdBanner slot="sidebar" />
        </aside>

        {/* Center Column: Devices Cards Grid (6 cols) */}
        <main className="lg:col-span-6 space-y-5">
          {/* Filter Bar & Sort Controls */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-900">
                Showing {devices.length} {devices.length === 1 ? 'model' : 'models'}
              </span>
              {brandFilter && (
                <Link
                  href="/phones"
                  className="ml-2 text-[11px] font-semibold text-amber-600 hover:underline"
                >
                  (Show All Brands)
                </Link>
              )}
            </div>

            <div className="flex items-center space-x-3 text-xs text-slate-600 font-bold">
              <span className="text-slate-400 text-[11px] uppercase">Sort by:</span>
              <Link
                href={`/phones?${brandFilter ? `brand=${brandFilter}&` : ''}sort=latest`}
                className={`px-2.5 py-1 rounded-lg transition ${
                  sort === 'latest' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'
                }`}
              >
                Latest
              </Link>
              <Link
                href={`/phones?${brandFilter ? `brand=${brandFilter}&` : ''}sort=views`}
                className={`px-2.5 py-1 rounded-lg transition ${
                  sort === 'views' ? 'bg-amber-500 text-slate-950' : 'hover:bg-slate-100'
                }`}
              >
                Daily Hits
              </Link>
              <Link
                href={`/phones?${brandFilter ? `brand=${brandFilter}&` : ''}sort=rating`}
                className={`px-2.5 py-1 rounded-lg transition ${
                  sort === 'rating' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'
                }`}
              >
                Score
              </Link>
            </div>
          </div>

          {/* Cards Grid */}
          {devices.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500 shadow-xs">
              <Smartphone className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-base font-bold text-slate-800">No smartphones found</p>
              <p className="text-xs text-slate-500 mt-1">
                Try adjusting your brand filter or search query.
              </p>
              <Link
                href="/phones"
                className="mt-4 inline-block px-4 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl hover:bg-amber-600 transition"
              >
                Clear Brand Filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {devices.map((device) => (
                <DeviceCard key={device.id} device={device} variant="grid" />
              ))}
            </div>
          )}
        </main>

        {/* Right Column: Top 10 by Daily Hits & Comparisons (3 cols) */}
        <aside className="lg:col-span-3 space-y-5">
          <TopTenTrending devices={allRankedDevices} />
          <PopularComparisons />
        </aside>

      </div>
    </div>
  );
}
