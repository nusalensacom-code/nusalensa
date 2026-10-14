import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { siteConfig } from '@/lib/siteConfig';
import { Breadcrumbs } from '@/components/ui/Breadcrumb';
import { DeviceCard } from '@/components/ui/DeviceCard';
import { Tablet, Search, CheckCircle2, Scale } from 'lucide-react';

interface TabletsPageProps {
  searchParams?: {
    brand?: string;
    q?: string;
  };
}

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Tablets & Slates Specifications, Prices & Reviews | ${siteConfig.name}`,
    description: `Compare tablet specifications, OLED/Liquid Retina displays, stylus support, desktop-class processors (Apple M-series, Snapdragon X), and international prices.`,
    alternates: {
      canonical: `${siteConfig.url}/tablets`,
    },
    openGraph: {
      title: `Tablets & Slates Specifications, Prices & Reviews | ${siteConfig.name}`,
      description: `Comprehensive database of tablets and productivity slates on NusaLensa.`,
      url: `${siteConfig.url}/tablets`,
    },
  };
}

export default async function TabletsCatalogPage({ searchParams }: TabletsPageProps) {
  const brandFilter = searchParams?.brand;
  const searchQuery = searchParams?.q?.trim();

  // Fetch tablet brands
  const brands = await prisma.brand.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { devices: { where: { deviceType: 'TABLET' } } },
      },
    },
  });

  const where: any = {
    deviceType: 'TABLET',
  };

  if (brandFilter) {
    where.brand = { slug: brandFilter };
  }

  if (searchQuery) {
    where.OR = [
      { name: { contains: searchQuery } },
      { chipset: { contains: searchQuery } },
    ];
  }

  const devices = await prisma.device.findMany({
    where,
    orderBy: { releasedDate: 'desc' },
    include: { brand: true },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <Breadcrumbs items={[{ name: 'Tablets', url: '/tablets' }]} />

      {/* Header Banner */}
      <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 my-6 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-wider mb-3 text-indigo-300">
            <Tablet className="w-3.5 h-3.5" />
            <span>TABLETS & PRODUCTIVITY SLATES</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Tablet Hardware Specs & International Pricing
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-3 leading-relaxed">
            Detailed specifications for iPadOS, Android, and Windows slates. Featuring tandem OLED displays, desktop-class silicon, pencil latency, and multi-currency pricing.
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-300">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span>Tandem OLED & Mini-LED</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span>Stylus & Keyboard Specs</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span>Desktop-Class Silicon</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span>Cellular 5G vs Wi-Fi SKUs</span>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center flex-wrap gap-2">
            <Link
              href="/tablets"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                !brandFilter
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              All Tablet Makers
            </Link>
            {brands.map((b) => (
              <Link
                key={b.id}
                href={`/tablets?brand=${b.slug}`}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1 ${
                  brandFilter === b.slug
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{b.name}</span>
                {b._count.devices > 0 && (
                  <span className="text-[10px] opacity-75 font-normal">
                    ({b._count.devices})
                  </span>
                )}
              </Link>
            ))}
          </div>

          <form action="/tablets" method="GET" className="relative flex-shrink-0 w-full md:w-72">
            {brandFilter && <input type="hidden" name="brand" value={brandFilter} />}
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder="Search tablets by name or chip..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>
        </div>
      </section>

      {/* Grid */}
      <section aria-label="Tablets Catalog">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center">
            <span>Tablets & Slates</span>
            <span className="ml-2 text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
              {devices.length} {devices.length === 1 ? 'model' : 'models'}
            </span>
          </h2>
        </div>

        {devices.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
            <Tablet className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-base font-bold text-slate-800">No tablets found</p>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search criteria or explore our smartphone database.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {devices.map((device) => (
              <DeviceCard key={device.id} device={device} variant="grid" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

