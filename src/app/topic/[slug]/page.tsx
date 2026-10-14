import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { siteConfig } from '@/lib/siteConfig';
import { ArticleCard } from '@/components/ui/ArticleCard';
import { Breadcrumbs } from '@/components/ui/Breadcrumb';
import { Pagination } from '@/components/ui/Pagination';
import { AdBanner } from '@/components/ui/AdBanner';
import { JsonLd } from '@/components/seo/JsonLd';
import { generateTopicSchema, generateCanonicalUrl } from '@/lib/seo';
import { Tag, Sparkles, Flame, BookOpen, Layers } from 'lucide-react';

interface TopicPageProps {
  params: { slug: string };
  searchParams?: { page?: string };
}

export const dynamic = 'force-static';

export async function generateStaticParams() {
  try {
    const topics = await prisma.tag.findMany({
      select: { slug: true },
    });
    return topics.map((t) => ({
      slug: t.slug,
    }));
  } catch (e) {
    return [];
  }
}

export async function generateMetadata({ params, searchParams }: TopicPageProps): Promise<Metadata> {
  const topic = await prisma.tag.findUnique({
    where: { slug: params.slug },
  });

  if (!topic) {
    notFound();
  }

  const page = parseInt(searchParams?.page || '1', 10);
  const pageSuffix = page > 1 ? ` - Page ${page}` : '';
  const title = `Topic: #${topic.name} - News, Hardware & Specs${pageSuffix} | ${siteConfig.name}`;
  const description =
    topic.description ||
    `Verified tech coverage, device specifications, benchmarks, and guides covering #${topic.name} on ${siteConfig.name}.`;
  const canonicalUrl = generateCanonicalUrl(page > 1 ? `/topic/${topic.slug}?page=${page}` : `/topic/${topic.slug}`);

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

export default async function TopicClusterPage({ params, searchParams }: TopicPageProps) {
  const topic = await prisma.tag.findUnique({
    where: { slug: params.slug },
  });

  if (!topic) {
    notFound();
  }

  const currentPage = Math.max(1, parseInt(searchParams?.page || '1', 10));
  const pageSize = 10;
  const skip = (currentPage - 1) * pageSize;

  const whereClause = {
    status: 'PUBLISHED',
    OR: [
      { primaryTopicId: topic.id },
      { tags: { some: { id: topic.id } } },
    ],
  };

  const [totalArticles, latestArticles, popularArticles, evergreenArticles, otherTopics] =
    await Promise.all([
      // Total count
      prisma.article.count({ where: whereClause }),
      // Latest articles (with pagination)
      prisma.article.findMany({
        where: whereClause,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          category: true,
          author: true,
        },
      }),
      // Popular articles in this topic
      prisma.article.findMany({
        where: whereClause,
        orderBy: { views: 'desc' },
        take: 5,
        include: {
          category: true,
          author: true,
        },
      }),
      // Evergreen articles in this topic
      prisma.article.findMany({
        where: {
          ...whereClause,
          articleType: { in: ['EVERGREEN', 'GUIDE', 'TUTORIAL', 'LISTICLE', 'EXPLAINER'] },
        },
        orderBy: { views: 'desc' },
        take: 4,
        include: {
          category: true,
          author: true,
        },
      }),
      // Related other topics
      prisma.tag.findMany({
        where: { id: { not: topic.id }, isTopic: true },
        take: 8,
      }),
    ]);

  const totalPages = Math.ceil(totalArticles / pageSize);
  const topicSchema = generateTopicSchema(topic);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
      <JsonLd data={topicSchema} />
      <Breadcrumbs items={[{ name: `Topic: #${topic.name}`, url: `/topic/${topic.slug}` }]} />

      {/* Topic Cluster Hero Banner */}
      <section className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-10 my-6 shadow-sm">
        <div className="flex items-center space-x-2 text-brand-600 text-xs font-bold uppercase tracking-wider mb-2">
          <Layers className="w-4 h-4" />
          <span>Topic Hub</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          #{topic.name}
        </h1>
        {topic.description && (
          <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-3xl leading-relaxed">
            {topic.description}
          </p>
        )}

        <div className="mt-4 pt-3 border-t border-slate-200 flex items-center space-x-4 text-xs text-slate-500">
          <span>{totalArticles} Curated Stories</span>
          <span>•</span>
          <span>Verified by NusaLensa Editorial</span>
        </div>
      </section>

      {/* Evergreen Pillar Guides if present */}
      {evergreenArticles.length > 0 && (
        <section aria-label="Topic Guides" className="my-8">
          <div className="flex items-center space-x-2 pb-3 border-b-2 border-brand-600 mb-6">
            <BookOpen className="w-5 h-5 text-brand-600" />
            <h2 className="text-xl font-bold text-slate-900">
              Essential Guides & Deep Dives #{topic.name}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {evergreenArticles.map((art) => (
              <ArticleCard key={art.id} article={art} variant="standard" />
            ))}
          </div>
        </section>
      )}

      {/* Main Articles Stream & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        <main className="lg:col-span-8">
          <div className="flex items-center space-x-2 pb-3 border-b-2 border-slate-900 mb-6">
            <Sparkles className="w-5 h-5 text-brand-600" />
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Latest Coverage: #{topic.name}
            </h2>
          </div>

          {latestArticles.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-xl text-slate-500">
              No articles linked to this topic yet.
            </div>
          ) : (
            <div className="space-y-4">
              {latestArticles.map((art) => (
                <ArticleCard key={art.id} article={art} variant="horizontal" />
              ))}

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                baseUrl={`/topic/${topic.slug}`}
              />
            </div>
          )}
        </main>

        <aside className="lg:col-span-4 space-y-6">
          {/* Popular in this topic */}
          {popularArticles.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-200 mb-3">
                <Flame className="w-4 h-4 text-red-600 fill-red-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Most Read in This Topic
                </h3>
              </div>
              <div className="space-y-1">
                {popularArticles.map((art, idx) => (
                  <ArticleCard key={art.id} article={art} variant="trending" rank={idx + 1} />
                ))}
              </div>
            </div>
          )}

          {/* Related Other Topics */}
          {otherTopics.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                Explore Related Topic Hubs
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {otherTopics.map((ot) => (
                  <Link
                    key={ot.id}
                    href={`/topic/${ot.slug}`}
                    className="px-3 py-1 bg-white hover:bg-brand-50 border border-slate-200 hover:border-brand-400 rounded-full text-xs font-medium text-slate-700 hover:text-brand-700 transition"
                  >
                    #{ot.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <AdBanner slot="sidebar" />
        </aside>
      </div>
    </div>
  );
}

