import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { siteConfig } from '@/lib/siteConfig';
import { Breadcrumbs } from '@/components/ui/Breadcrumb';
import { DeviceCard } from '@/components/ui/DeviceCard';
import { ArticleCard } from '@/components/ui/ArticleCard';
import { SafeImage as Image } from '@/components/ui/SafeImage';
import { Globe, MapPin, Smartphone, Newspaper, ExternalLink } from 'lucide-react';

interface BrandPageProps {
  params: {
    'brand-slug': string;
  };
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const brandSlug = params['brand-slug'];
  const brand = await prisma.brand.findUnique({
    where: { slug: brandSlug },
  });

  if (!brand) {
    notFound();
  }

  const title = `${brand.name} Phones, Tablets & Specs Catalog | ${siteConfig.name}`;
  const description = `Complete list of ${brand.name} smartphones and tablets. Specifications, launch prices, lab ratings, and latest ${brand.name} technology news on NusaLensa.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteConfig.url}/brands/${brand.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/brands/${brand.slug}`,
    },
  };
}

export default async function BrandShowcasePage({ params }: BrandPageProps) {
  const brandSlug = params['brand-slug'];

  const brand = await prisma.brand.findUnique({
    where: { slug: brandSlug },
    include: {
      devices: {
        orderBy: { releasedDate: 'desc' },
        include: { brand: true },
      },
    },
  });

  if (!brand) {
    notFound();
  }

  // Related articles mentioning this brand
  const relatedArticles = await prisma.article.findMany({
    where: {
      status: 'PUBLISHED',
      OR: [
        { title: { contains: brand.name } },
        { content: { contains: brand.name } },
        { tags: { some: { name: { contains: brand.name } } } },
      ],
    },
    take: 4,
    orderBy: { publishedAt: 'desc' },
    include: {
      category: true,
      author: true,
    },
  });

  const breadcrumbs = [
    { name: 'Smartphones', url: '/phones' },
    { name: 'Brands', url: '/phones' },
    { name: brand.name, url: `/brands/${brand.slug}` },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <Breadcrumbs items={breadcrumbs} />

      {/* Brand Hero Card */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 my-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-center flex-shrink-0 shadow-xs">
            {brand.logo ? (
              <Image
                src={brand.logo}
                alt={brand.name}
                fill
                sizes="96px"
                className="object-contain p-2"
              />
            ) : (
              <span className="text-3xl font-black text-brand-600">
                {brand.name.charAt(0)}
              </span>
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1 text-xs text-slate-500 font-medium">
              {brand.country && (
                <span className="flex items-center text-slate-600">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {brand.country}
                </span>
              )}
              {brand.website && (
                <>
                  <span>•</span>
                  <a
                    href={brand.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-600 hover:underline flex items-center font-semibold"
                  >
                    <Globe className="w-3.5 h-3.5 mr-1" />
                    Official Website
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {brand.name} Devices & Hardware Catalog
            </h1>

            {brand.description && (
              <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-3xl leading-relaxed">
                {brand.description}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Devices Section */}
      <section aria-label={`${brand.name} Devices`} className="my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center">
            <Smartphone className="w-5 h-5 mr-2 text-brand-600" />
            <span>{brand.name} Released Devices</span>
            <span className="ml-2 text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
              {brand.devices.length} {brand.devices.length === 1 ? 'model' : 'models'}
            </span>
          </h2>
        </div>

        {brand.devices.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
            <p className="text-base font-bold text-slate-800">
              No devices cataloged for {brand.name} yet
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Check back soon as our hardware desk imports and verifies new models.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {brand.devices.map((device) => (
              <DeviceCard key={device.id} device={device} variant="grid" />
            ))}
          </div>
        )}
      </section>

      {/* Brand Related News Articles */}
      {relatedArticles.length > 0 && (
        <section aria-label={`${brand.name} News & Coverage`} className="mt-14 pt-8 border-t-2 border-slate-900">
          <div className="flex items-center space-x-2 mb-6">
            <Newspaper className="w-5 h-5 text-brand-600" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Latest {brand.name} News & Coverage
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedArticles.map((article) => (
              <ArticleCard key={article.id} article={article} variant="standard" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

