import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { siteConfig } from '@/lib/siteConfig';
import { ArticleCard } from '@/components/ui/ArticleCard';
import { Breadcrumbs } from '@/components/ui/Breadcrumb';
import { AdBanner } from '@/components/ui/AdBanner';
import { getTrendingArticles } from '@/lib/trending';
import { Flame, Sparkles, TrendingUp, Tag } from 'lucide-react';

export const revalidate = 60; // Revalidate every minute

export const metadata: Metadata = {
  title: `Trending Tech Topics & Most Popular Stories | ${siteConfig.name}`,
  description: 'Real-time ranking of the most discussed smartphone launches, chip architectures, AI breakthroughs, and consumer tech reviews.',
  alternates: {
    canonical: `${siteConfig.url}/trending`,
  },
  openGraph: {
    title: `Trending Tech Topics & Most Popular Stories | ${siteConfig.name}`,
    description: 'Real-time ranking of the most discussed technology news and device launches on NusaLensa.',
    url: `${siteConfig.url}/trending`,
  },
};

export default async function TrendingPage() {
  const [trendingScoredArticles, latestViralArticles, hotTopics] = await Promise.all([
    // Data-driven weighted trending score
    getTrendingArticles(10),
    // Recent viral / trending flagged articles
    prisma.article.findMany({
      where: { status: 'PUBLISHED', isTrending: true },
      orderBy: { publishedAt: 'desc' },
      take: 6,
      include: {
        category: true,
        author: true,
      },
    }),
    // Topic cluster tags
    prisma.tag.findMany({
      where: { isTopic: true },
      take: 12,
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
      <Breadcrumbs items={[{ name: 'Trending', url: '/trending' }]} />

      {/* Hero Header */}
      <section className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white rounded-2xl p-6 sm:p-10 my-6 shadow-md">
        <div className="max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Flame className="w-4 h-4 fill-white" />
            <span>REAL-TIME VELOCITY</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Trending Technology Topics
          </h1>
          <p className="text-white/90 text-sm sm:text-base mt-2 leading-relaxed">
            Data-driven dynamic ranking combining readership volume and publication recency across global consumer technology coverage.
          </p>
        </div>
      </section>

      {/* Trending Topics Pills Bar */}
      <section aria-label="Popular Topic Hubs" className="bg-slate-50 border border-slate-200 rounded-xl p-4 my-6">
        <div className="flex items-center space-x-2 mb-3">
          <Tag className="w-4 h-4 text-brand-600" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Hot Topic Hubs
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {hotTopics.map((tag) => (
            <Link
              key={tag.id}
              href={`/topic/${tag.slug}`}
              className="px-3.5 py-1.5 bg-white hover:bg-brand-50 border border-slate-200 hover:border-brand-400 rounded-full text-xs font-semibold text-slate-800 hover:text-brand-700 transition shadow-xs"
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        {/* Ranked Weighted Trending List (8 cols) */}
        <main className="lg:col-span-8">
          <div className="flex items-center space-x-2 pb-3 border-b-2 border-slate-900 mb-6">
            <TrendingUp className="w-5 h-5 text-red-600" />
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Top 10 Stories (Highest Readership Velocity)
            </h2>
          </div>

          <div className="space-y-2 bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm divide-y divide-slate-100">
            {trendingScoredArticles.map((art, idx) => (
              <ArticleCard key={art.id} article={art} variant="trending" rank={idx + 1} />
            ))}
          </div>
        </main>

        {/* Sidebar Trending Highlights (4 cols) */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-200 mb-4">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900">
                Recent Spotlight Stories
              </h3>
            </div>
            <div className="space-y-4">
              {latestViralArticles.map((art) => (
                <ArticleCard key={art.id} article={art} variant="compact" />
              ))}
            </div>
          </div>

          <AdBanner slot="sidebar" />
        </aside>
      </div>
    </div>
  );
}
