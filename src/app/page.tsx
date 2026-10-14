import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { siteConfig } from '@/lib/siteConfig';
import { BreakingTicker } from '@/components/layout/BreakingTicker';
import { ArticleCard } from '@/components/ui/ArticleCard';
import { DeviceCard } from '@/components/ui/DeviceCard';
import { AdBanner } from '@/components/ui/AdBanner';
import { NewsletterBox } from '@/components/ui/NewsletterBox';
import { TopTenTrending } from '@/components/ui/TopTenTrending';
import { PopularComparisons } from '@/components/ui/PopularComparisons';
import { PhoneFinderWidget } from '@/components/ui/PhoneFinderWidget';
import { DeviceSpotlight } from '@/components/ui/DeviceSpotlight';
import { LiveArticleWatcher } from '@/components/ui/LiveArticleWatcher';
import { getTrendingArticles } from '@/lib/trending';
import {
  Flame,
  Sparkles,
  Smartphone,
  Scale,
  ArrowRight,
  Cpu,
  Layers,
  Award,
  BookOpen,
  Newspaper,
  SlidersHorizontal,
} from 'lucide-react';

export const revalidate = 60; // ISR 60 seconds

export const metadata: Metadata = {
  title: `${siteConfig.name} — Global Technology News, Smartphone Database & Specs`,
  description:
    'Independent global technology publication and mobile hardware database. Verified smartphone specifications, benchmark evaluations, side-by-side comparisons, and tech news.',
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    title: `${siteConfig.name} — Global Technology News, Smartphone Database & Specs`,
    description:
      'Independent global tech newsroom and smartphone database covering hardware benchmarks, silicon architectures, reviews, and buying guides.',
    url: siteConfig.url,
  },
};

export default async function HomePage() {
  // 1. Fresh breaking headline ticker
  const breakingArticles = await prisma.article.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take: 6,
    select: {
      id: true,
      title: true,
      slug: true,
      category: { select: { slug: true } },
    },
  });

  const tickerItems = breakingArticles.map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    categorySlug: a.category.slug,
  }));

  // 2. Hero News (1 main big headline + 4 supporting news)
  const heroArticles = await prisma.article.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take: 5,
    include: {
      category: true,
      author: true,
    },
  });

  const mainHero = heroArticles[0];
  const supportingHero = heroArticles.slice(1, 5);

  // 3. All Devices for GSMArena Top 10 & Spotlight
  const allDevices = await prisma.device.findMany({
    where: { deviceType: { in: ['SMARTPHONE', 'PHONE', 'TABLET'] } },
    orderBy: { views: 'desc' },
    include: { brand: true },
  });

  const spotlightDevice = allDevices.find((d) => d.slug === 'galaxy-s25-ultra') || allDevices[0];

  // 4. Smartphone Brands with counts
  const brands = await prisma.brand.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      _count: { select: { devices: true } },
    },
  });

  // 5. Hardware Reviews & In-Depth Tests
  const reviewsAndGuides = await prisma.article.findMany({
    where: {
      status: 'PUBLISHED',
      category: { slug: { in: ['reviews', 'buying-guides', 'tablets', 'how-to'] } },
    },
    orderBy: { publishedAt: 'desc' },
    take: 4,
    include: {
      category: true,
      author: true,
    },
  });

  // 6. Technology, AI & Silicon Coverage
  const techDeepDives = await prisma.article.findMany({
    where: {
      status: 'PUBLISHED',
      category: { slug: { in: ['technology', 'news', 'phones'] } },
    },
    orderBy: { publishedAt: 'desc' },
    skip: 5,
    take: 5,
    include: {
      category: true,
      author: true,
    },
  });

  return (
    <div className="w-full pb-12">
      {/* 1. Breaking News Ticker */}
      <BreakingTicker items={tickerItems} />

      {/* Top Banner Ad Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 my-3">
        <AdBanner slot="top-banner" />
      </div>

      {/* 2. Master GSMArena 3-Column Powerhouse Layout */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN: Phone Finder & Device Spotlight (3 cols)    */}
          {/* ======================================================== */}
          <aside className="lg:col-span-3 space-y-5 order-2 lg:order-1">
            {/* Phone Finder & Brand Directory */}
            <PhoneFinderWidget brands={brands} />

            {/* Device of the Day / Spotlight */}
            {spotlightDevice && <DeviceSpotlight device={spotlightDevice} />}

            {/* Quick Links / GSMArena Style Catalog Shortcuts */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-xs">
              <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] mb-3 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>DATABASE SECTIONS</span>
                <Smartphone className="w-3.5 h-3.5 text-amber-500" />
              </h4>
              <ul className="space-y-1.5 font-bold text-slate-700">
                <li>
                  <Link href="/phones" className="flex items-center justify-between hover:text-amber-600 transition-colors py-1">
                    <span>All Smartphones</span>
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono">{allDevices.length}</span>
                  </Link>
                </li>
                <li>
                  <Link href="/tablets" className="flex items-center justify-between hover:text-amber-600 transition-colors py-1">
                    <span>Tablets & Slates</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </Link>
                </li>
                <li>
                  <Link href="/compare" className="flex items-center justify-between hover:text-amber-600 transition-colors py-1">
                    <span>Side-by-Side Compare</span>
                    <Scale className="w-3 h-3 text-cyan-600" />
                  </Link>
                </li>
                <li>
                  <Link href="/reviews" className="flex items-center justify-between hover:text-amber-600 transition-colors py-1">
                    <span>Hardware Lab Reviews</span>
                    <Award className="w-3 h-3 text-amber-500" />
                  </Link>
                </li>
                <li>
                  <Link href="/buying-guides" className="flex items-center justify-between hover:text-amber-600 transition-colors py-1">
                    <span>Smartphone Buying Guides</span>
                    <BookOpen className="w-3 h-3 text-slate-400" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* In-column Ad Banner */}
            <AdBanner slot="sidebar" />
          </aside>

          {/* ======================================================== */}
          {/* CENTER COLUMN: Lead Stories, Reviews & Tech Stream (6 cols) */}
          {/* ======================================================== */}
          <main className="lg:col-span-6 space-y-6 order-1 lg:order-2">
            
            {/* Top Featured Hero Grid */}
            {mainHero && (
              <section aria-label="Lead Story and Highlights" className="space-y-4">
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <ArticleCard article={mainHero} variant="featured" className="w-full" />
                </div>

                {/* 2 Sub-Features Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {supportingHero.slice(0, 2).map((art) => (
                    <div key={art.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs hover:border-slate-300 transition">
                      <ArticleCard article={art} variant="standard" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Quick Head-to-Head Comparison Banner */}
            <section className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block mb-0.5">
                  COMPARISON ENGINE
                </span>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Compare Devices Side-by-Side
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                  Analyze sensors, benchmark scores, battery life, and launch prices in USD, GBP, and EUR.
                </p>
              </div>
              <div className="flex-shrink-0 flex items-center space-x-2">
                <Link
                  href="/compare"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl transition flex items-center space-x-1"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Compare</span>
                </Link>
              </div>
            </section>

            {/* In-Depth Hardware Reviews & Lab Tests */}
            {reviewsAndGuides.length > 0 && (
              <section aria-label="Hardware Reviews">
                <div className="flex items-center justify-between pb-2.5 border-b-2 border-slate-900 mb-4">
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
                      IN-DEPTH REVIEWS & TESTS
                    </h2>
                  </div>
                  <Link
                    href="/reviews"
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center"
                  >
                    All Reviews &rarr;
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {reviewsAndGuides.map((article) => (
                    <div key={article.id} className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs hover:border-slate-300 transition flex flex-col justify-between">
                      <ArticleCard article={article} variant="standard" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* In-feed Ad Banner */}
            <AdBanner slot="between-cards" />

            {/* Latest Technology Reporting Stream */}
            {techDeepDives.length > 0 && (
              <section aria-label="Latest Reporting">
                <div className="flex items-center justify-between pb-2.5 border-b-2 border-slate-900 mb-4">
                  <div className="flex items-center space-x-2">
                    <Newspaper className="w-4 h-4 text-slate-800" />
                    <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
                      LATEST NEWS & ANALYSIS
                    </h2>
                  </div>
                  <Link
                    href="/news"
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center"
                  >
                    All News &rarr;
                  </Link>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden shadow-xs">
                  {techDeepDives.map((article) => (
                    <div key={article.id} className="p-3 sm:p-4 hover:bg-slate-50 transition">
                      <ArticleCard article={article} variant="horizontal" />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </main>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: Top 10 by Daily Hits & Comparisons (3 cols) */}
          {/* ======================================================== */}
          <aside className="lg:col-span-3 space-y-5 order-3">
            {/* The Signature GSMArena Top 10 by Daily Hits */}
            <TopTenTrending devices={allDevices} />

            {/* Popular Head-to-Head Matchups */}
            <PopularComparisons />

            {/* Global Newsletter Briefing */}
            <NewsletterBox />

            {/* Sidebar Ad Unit */}
            <AdBanner slot="sidebar" />
          </aside>

        </div>
      </div>

      {/* 3. Bottom Advertisement Banner */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 mt-8">
        <AdBanner slot="bottom-banner" />
      </div>

      {/* 4. Live Background Article Watcher & Instant Revalidation Trigger */}
      <LiveArticleWatcher
        initialLatestId={mainHero?.id || 0}
        initialPublishedAt={mainHero?.publishedAt ? new Date(mainHero.publishedAt).toISOString() : null}
      />
    </div>
  );
}
