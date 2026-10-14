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
import { generateCanonicalUrl } from '@/lib/seo';
import { Folder, Flame, ArrowRight, Layers, Sparkles } from 'lucide-react';

interface CategoryPageProps {
  params: { category: string };
  searchParams?: { page?: string };
}

export const dynamic = 'force-static';

export async function generateStaticParams() {
  try {
    const categories = await prisma.category.findMany({
      select: { slug: true },
    });
    return categories.map((cat) => ({
      category: cat.slug,
    }));
  } catch (e) {
    return [];
  }
}

export async function generateMetadata({ params, searchParams }: CategoryPageProps): Promise<Metadata> {
  const category = await prisma.category.findUnique({
    where: { slug: params.category },
    include: { parent: true },
  });

  if (!category) {
    notFound();
  }

  const page = parseInt(searchParams?.page || '1', 10);
  const pageSuffix = page > 1 ? ` - Page ${page}` : '';
  const title = category.seoTitle
    ? `${category.seoTitle}${pageSuffix}`
    : `${category.name}${pageSuffix} | Tech News & Analysis | ${siteConfig.name}`;
  const description =
    category.seoDescription ||
    category.description ||
    `Latest news, reviews, and in-depth hardware analysis covering ${category.name} on NusaLensa.`;

  const canonicalUrl = generateCanonicalUrl(
    page > 1 ? `/${category.slug}?page=${page}` : `/${category.slug}`
  );

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

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const category = await prisma.category.findUnique({
    where: { slug: params.category },
    include: {
      children: { orderBy: { order: 'asc' } },
      parent: true,
    },
  });

  if (!category) {
    notFound();
  }

  const currentPage = Math.max(1, parseInt(searchParams?.page || '1', 10));
  const pageSize = 10;
  const skip = (currentPage - 1) * pageSize;

  // Category IDs to include (if parent, include all children subcategories; if subcategory, match itself)
  const categoryIds = [category.id, ...category.children.map((c) => c.id)];

  const whereClause = {
    status: 'PUBLISHED',
    OR: [
      { categoryId: { in: categoryIds } },
      { subcategoryId: { in: categoryIds } },
    ],
  };

  const [totalArticles, articles, popularInCategory, featuredArticle] = await Promise.all([
    // Total count
    prisma.article.count({ where: whereClause }),
    // Articles stream
    prisma.article.findMany({
      where: whereClause,
      orderBy: { publishedAt: 'desc' },
      skip,
      take: pageSize,
      include: {
        category: true,
        subcategory: true,
        author: true,
      },
    }),
    // Popular in Category
    prisma.article.findMany({
      where: whereClause,
      orderBy: { views: 'desc' },
      take: 5,
      include: {
        category: true,
        author: true,
      },
    }),
    // Featured article in Category
    prisma.article.findFirst({
      where: {
        ...whereClause,
        isFeatured: true,
      },
      orderBy: { publishedAt: 'desc' },
      include: {
        category: true,
        author: true,
      },
    }),
  ]);

  const totalPages = Math.ceil(totalArticles / pageSize);

  const breadcrumbs = [
    ...(category.parent
      ? [{ name: category.parent.name, url: `/${category.parent.slug}` }]
      : []),
    { name: category.name, url: `/${category.slug}` },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />

      {/* Category Header Banner */}
      <section className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 my-6">
        <div className="flex items-center space-x-2 text-brand-600 text-xs font-bold uppercase tracking-wider mb-2">
          <Folder className="w-4 h-4" />
          <span>{category.parent ? `Sub-hub of ${category.parent.name}` : `Topic Hub: ${category.name}`}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-3xl leading-relaxed">
            {category.description}
          </p>
        )}

        {/* Subcategories pills navigation */}
        {category.children.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-200 flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center">
              <Layers className="w-3.5 h-3.5 mr-1" />
              Subcategories:
            </span>
            {category.children.map((child) => (
              <Link
                key={child.id}
                href={`/${child.slug}`}
                className="px-3 py-1 bg-white hover:bg-brand-50 border border-slate-200 hover:border-brand-300 rounded-full text-xs font-medium text-slate-700 hover:text-brand-700 transition shadow-xs"
              >
                {child.name}
              </Link>
            ))}
          </div>
        )}

        {/* Parent category link if on subcategory */}
        {category.parent && (
          <div className="mt-4 pt-3 border-t border-slate-200 text-xs">
            <Link
              href={`/${category.parent.slug}`}
              className="text-brand-600 hover:text-brand-700 font-semibold"
            >
              &larr; Back to {category.parent.name}
            </Link>
          </div>
        )}
      </section>

      {/* Top Category Ad */}
      <AdBanner slot="top-banner" />

      {/* Main Articles Stream & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        <main className="lg:col-span-8">
          {articles.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500">
              <p className="text-lg font-semibold">No articles published in this category yet.</p>
              <p className="text-sm mt-1">Check back soon for new analysis, product coverage, and tech reporting.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* If on page 1, show featured article if available */}
              {currentPage === 1 && featuredArticle && (
                <ArticleCard article={featuredArticle} variant="featured" />
              )}

              {/* Remaining articles in list / horizontal view */}
              <div className="space-y-4">
                {(currentPage === 1 && featuredArticle
                  ? articles.filter((a) => a.id !== featuredArticle.id)
                  : articles
                ).map((article) => (
                  <ArticleCard key={article.id} article={article} variant="horizontal" />
                ))}
              </div>

              {/* SEO Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                baseUrl={`/${category.slug}`}
              />
            </div>
          )}
        </main>

        {/* Category Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Popular in Category */}
          {popularInCategory.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-200 mb-3">
                <Flame className="w-4 h-4 text-red-600 fill-red-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Most Popular in {category.name}
                </h2>
              </div>
              <div className="space-y-1">
                {popularInCategory.map((art, idx) => (
                  <ArticleCard key={art.id} article={art} variant="trending" rank={idx + 1} />
                ))}
              </div>
            </div>
          )}

          {/* Sticky Sidebar Ad */}
          <AdBanner slot="sidebar" />
        </aside>
      </div>
    </div>
  );
}
