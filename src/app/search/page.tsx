import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { siteConfig } from '@/lib/siteConfig';
import { ArticleCard } from '@/components/ui/ArticleCard';
import { Pagination } from '@/components/ui/Pagination';
import { Breadcrumbs } from '@/components/ui/Breadcrumb';
import { Search, Sparkles, TrendingUp, HelpCircle } from 'lucide-react';

interface SearchPageProps {
  searchParams: {
    q?: string;
    page?: string;
  };
}

export const dynamic = 'force-static';

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const query = searchParams.q ? searchParams.q.trim() : '';
  const title = query
    ? `Search Results: "${query}" | ${siteConfig.name}`
    : `Search Technology News & Hardware Specs | ${siteConfig.name}`;
  const description = query
    ? `Find smartphone specifications, benchmarks, in-depth technology news, and buying guides for "${query}".`
    : `Search verified smartphone reviews, device comparisons, and tech reporting on ${siteConfig.name}.`;

  return {
    title,
    description,
    robots: {
      index: false, // Strictly prevent search engines from indexing duplicate internal search queries
      follow: true,
    },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q ? searchParams.q.trim() : '';
  const currentPage = Math.max(1, parseInt(searchParams.page || '1', 10));
  const pageSize = 10;
  const skip = (currentPage - 1) * pageSize;

  const popularSearches = [
    'iPhone 16 Pro Max',
    'Galaxy S25 Ultra',
    'Pixel 9 Pro',
    'Snapdragon 8 Elite',
    'OnePlus 13',
    'Apple Intelligence',
    'OLED Display',
    'Battery Life',
  ];

  let articles: any[] = [];
  let totalResults = 0;

  if (query) {
    const searchWhere = {
      status: 'PUBLISHED',
      OR: [
        { title: { contains: query } },
        { excerpt: { contains: query } },
        { content: { contains: query } },
        { category: { name: { contains: query } } },
        { author: { name: { contains: query } } },
        { tags: { some: { name: { contains: query } } } },
      ],
    };

    [totalResults, articles] = await Promise.all([
      prisma.article.count({ where: searchWhere }),
      prisma.article.findMany({
        where: searchWhere,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          category: true,
          author: true,
        },
      }),
    ]);
  }

  const totalPages = Math.ceil(totalResults / pageSize);

  // Suggested articles if no results
  const suggestedArticles = await prisma.article.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { views: 'desc' },
    take: 4,
    include: {
      category: true,
      author: true,
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
      <Breadcrumbs items={[{ name: 'Search', url: '/search' }]} />

      {/* Search Header Banner */}
      <section className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-10 my-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Search Hardware & Tech Coverage
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            Search smartphone specifications, tech reviews, buyer guides, and breaking industry news.
          </p>

          <form action="/search" method="GET" className="relative flex items-center">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search phones, chipsets, cameras, or news (e.g. iPhone 16, Snapdragon)..."
              required
              className="w-full pl-12 pr-28 py-3.5 bg-white border-2 border-slate-300 rounded-full text-sm sm:text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 shadow-sm transition"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4" />
            <button
              type="submit"
              className="absolute right-2 px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold rounded-full transition-colors shadow-sm"
            >
              Search
            </button>
          </form>

          {/* Popular searches tags */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium mr-1 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1 text-amber-500" />
              Popular Searches:
            </span>
            {popularSearches.map((term) => (
              <Link
                key={term}
                href={`/search?q=${encodeURIComponent(term)}`}
                className="px-2.5 py-1 bg-white hover:bg-slate-200 border border-slate-200 rounded-full text-slate-600 transition"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Search Results Area */}
      {query ? (
        <section aria-label="Search Results" className="mt-8">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Results for <span className="text-brand-600">"{query}"</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Found {totalResults} matching {totalResults === 1 ? 'article' : 'articles'}
            </span>
          </div>

          {articles.length === 0 ? (
            /* Empty state */
            <div className="bg-white border border-slate-200 rounded-2xl p-10 sm:p-14 text-center my-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                <HelpCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                No articles matched "{query}"
              </h3>
              <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                Try searching for a device model, brand, or broader technology term, or explore trending coverage below.
              </p>

              {/* Recommended alternatives */}
              <div className="mt-10 text-left">
                <div className="flex items-center space-x-2 mb-4">
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Recommended Reading
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {suggestedArticles.map((s) => (
                    <ArticleCard key={s.id} article={s} variant="standard" />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="space-y-4">
                {articles.map((art) => (
                  <ArticleCard key={art.id} article={art} variant="horizontal" />
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                baseUrl={`/search?q=${encodeURIComponent(query)}`}
              />
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
