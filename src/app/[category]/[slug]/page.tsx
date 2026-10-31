import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { SafeImage as Image } from '@/components/ui/SafeImage';
import { siteConfig } from '@/lib/siteConfig';
import { Breadcrumbs } from '@/components/ui/Breadcrumb';
import { ShareButtons } from '@/components/ui/ShareButtons';
import { AuthorBox } from '@/components/ui/AuthorBox';
import { ArticleCard } from '@/components/ui/ArticleCard';
import { AdBanner } from '@/components/ui/AdBanner';
import { TableOfContents } from '@/components/ui/TableOfContents';
import { FaqAccordion, FaqItem } from '@/components/ui/FaqAccordion';
import { SourcesBox, SourceItem } from '@/components/ui/SourcesBox';
import { InArticleRecommendation } from '@/components/ui/InArticleRecommendation';
import { JsonLd } from '@/components/seo/JsonLd';
import { generateArticleSchema, generateCanonicalUrl } from '@/lib/seo';
import { getRelatedArticles, getInArticleRecommendation } from '@/lib/internalLinking';
import {
  formatDateEnglish,
  formatDateTimeEnglish,
  renderArticleMarkdown,
  timeAgoEnglish,
  cleanExcerpt,
} from '@/lib/utils';
import {
  Calendar,
  Clock,
  Eye,
  User,
  UserCheck,
  ShieldAlert,
  ArrowLeft,
  ArrowRight,
  Tag as TagIcon,
  Flame,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

function safeIsoDate(d: Date | string | number | undefined | null): string {
  if (!d) return new Date().toISOString();
  const date = new Date(d);
  return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

interface ArticlePageProps {
  params: {
    category: string;
    slug: string;
  };
}

export async function generateStaticParams() {
  try {
    const articles = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        slug: true,
        category: { select: { slug: true } },
      },
    });
    return articles.map((article) => ({
      category: article.category.slug,
      slug: article.slug,
    }));
  } catch (e) {
    return [];
  }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      author: true,
    },
  });

  if (!article) {
    notFound();
  }

  const title = article.seoTitle || `${article.title} | ${siteConfig.name}`;
  const description = cleanExcerpt(article.seoDescription || article.excerpt);
  const canonicalUrl = generateCanonicalUrl(`/${article.category.slug}/${article.slug}`);

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
      type: 'article',
      publishedTime: safeIsoDate(article.publishedAt),
      modifiedTime: safeIsoDate(article.updatedAt),
      section: article.category.name,
      authors: [article.author.name],
      images: [
        {
          url: article.featuredImage,
          width: 1200,
          height: 630,
          alt: article.imageAltText || article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [article.featuredImage],
    },
  };
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
    include: {
      category: {
        include: { parent: true },
      },
      subcategory: true,
      primaryTopic: true,
      author: true,
      editor: true,
      tags: true,
    },
  });

  if (!article || article.status !== 'PUBLISHED') {
    notFound();
  }

  // Parse FAQs & Sources
  let faqs: FaqItem[] = [];
  if (article.faqs) {
    try {
      faqs = JSON.parse(article.faqs);
    } catch (e) {}
  }

  let sources: SourceItem[] = [];
  if (article.sources) {
    try {
      sources = JSON.parse(article.sources);
    } catch (e) {}
  }

  // In-Article Recommendation
  const inArticleRec = await getInArticleRecommendation(
    article.id,
    article.categoryId,
    article.primaryTopicId
  );

  // Content Discovery: Related articles using Internal Linking Engine
  const relatedArticles = await getRelatedArticles({
    articleId: article.id,
    categoryId: article.categoryId,
    subcategoryId: article.subcategoryId,
    primaryTopicId: article.primaryTopicId,
    tagIds: article.tags.map((t) => t.id),
    manualRelatedIds: article.manualRelatedIds,
    limit: 4,
  });

  // Previous & Next navigation
  const [prevArticle, nextArticle, popularArticles] = await Promise.all([
    prisma.article.findFirst({
      where: {
        status: 'PUBLISHED',
        publishedAt: { lt: article.publishedAt },
      },
      orderBy: { publishedAt: 'desc' },
      select: { title: true, slug: true, category: { select: { slug: true } } },
    }),
    prisma.article.findFirst({
      where: {
        status: 'PUBLISHED',
        publishedAt: { gt: article.publishedAt },
      },
      orderBy: { publishedAt: 'asc' },
      select: { title: true, slug: true, category: { select: { slug: true } } },
    }),
    prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        id: { not: article.id },
      },
      orderBy: { views: 'desc' },
      take: 5,
      include: {
        category: true,
        author: true,
      },
    }),
  ]);

  const fullUrl = `${siteConfig.url}/${article.category.slug}/${article.slug}`;

  // Hierarchical Breadcrumbs
  const breadcrumbs = [
    ...(article.category.parent
      ? [{ name: article.category.parent.name, url: `/${article.category.parent.slug}` }]
      : []),
    { name: article.category.name, url: `/${article.category.slug}` },
    ...(article.subcategory
      ? [{ name: article.subcategory.name, url: `/${article.subcategory.slug}` }]
      : []),
    { name: article.title, url: `/${article.category.slug}/${article.slug}` },
  ];

  // Dynamic Schema with ArticleType and FAQPage
  const schemaData = generateArticleSchema({
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    content: article.content,
    featuredImage: article.featuredImage,
    imageAltText: article.imageAltText,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    articleType: article.articleType,
    isNews: article.isNews,
    category: article.category,
    subcategory: article.subcategory,
    author: article.author,
    editor: article.editor,
    faqs,
  });

  const renderedHtml = renderArticleMarkdown(article.content);

  // Check if article was meaningfully updated after publishing (difference > 1 hour)
  const isMeaningfullyUpdated =
    new Date(article.updatedAt).getTime() - new Date(article.publishedAt).getTime() > 1000 * 60 * 60;

  const articleTypeLabels: Record<string, string> = {
    GUIDE: 'Practical Guide',
    TUTORIAL: 'Tutorial',
    EVERGREEN: 'Evergreen Analysis',
    OPINION: 'Opinion & Column',
    LISTICLE: 'Curated List',
    EXPLAINER: 'Deep Dive Explainer',
    NEWS: 'Breaking News',
  };

  return (
    <article className="w-full">
      <JsonLd data={schemaData} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={breadcrumbs} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-2">
          {/* Main Article Column (8 cols) */}
          <main className="lg:col-span-8">
            {/* Category & Article Type Pills */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Link
                href={`/${article.category.slug}`}
                className="inline-block px-3 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs uppercase tracking-wider rounded-md transition-colors"
              >
                {article.category.name}
              </Link>
              {article.subcategory && (
                <Link
                  href={`/${article.subcategory.slug}`}
                  className="inline-block px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-md transition-colors"
                >
                  {article.subcategory.name}
                </Link>
              )}
              {article.articleType && (
                <span className="inline-block px-2.5 py-1 bg-slate-900 text-white font-bold text-[10px] uppercase tracking-wider rounded-md">
                  {articleTypeLabels[article.articleType] || article.articleType}
                </span>
              )}
            </div>

            {/* H1 Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-extrabold text-slate-900 tracking-tight leading-tight">
              {article.title}
            </h1>

            {/* Dek / Excerpt Summary */}
            <p className="text-base sm:text-lg text-slate-600 font-normal mt-4 leading-relaxed border-l-4 border-slate-300 pl-4 py-1">
              {cleanExcerpt(article.excerpt)}
            </p>

            {/* Metadata Bar (Author, Editor, Dates, Reading Time, Views) */}
            <div className="my-6 py-4 border-y border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-3">
              <div className="flex flex-wrap items-center gap-3">
                {/* Author */}
                <Link
                  href={`/author/${article.author.slug}`}
                  className="flex items-center text-slate-900 hover:text-brand-600 font-semibold transition-colors"
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden relative mr-1.5 bg-slate-200 flex-shrink-0">
                    {article.author.avatar ? (
                      <Image
                        src={article.author.avatar}
                        alt={article.author.name}
                        fill
                        sizes="24px"
                        className="object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 m-1 text-slate-400" />
                    )}
                  </div>
                  <span>By {article.author.name}</span>
                </Link>

                {/* Editor Separation */}
                {article.editor && (
                  <>
                    <span>•</span>
                    <span className="flex items-center text-slate-600 font-medium">
                      <UserCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                      Editor: {article.editor.name}
                    </span>
                  </>
                )}

                {/* Dates */}
                <span>•</span>
                <time
                  dateTime={safeIsoDate(article.publishedAt)}
                  className="flex items-center text-slate-600"
                >
                  <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Published: {formatDateEnglish(article.publishedAt)}
                </time>

                {isMeaningfullyUpdated && (
                  <span className="flex items-center text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Updated: {formatDateEnglish(article.updatedAt)}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-3 text-slate-500 flex-shrink-0">
                <span className="flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {article.readingTime} min read
                </span>
                <span>•</span>
                <span className="flex items-center">
                  <Eye className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {article.views.toLocaleString('en-US')} views
                </span>
              </div>
            </div>

            {/* Featured Image with SEO Alt Text & Caption */}
            <figure className="my-6">
              <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-100 shadow-sm">
                <Image
                  src={article.featuredImage}
                  alt={article.imageAltText || article.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 800px"
                  className="object-cover"
                />
              </div>
              <figcaption className="text-xs text-slate-500 italic mt-2 px-1 text-center sm:text-left flex flex-wrap items-center justify-between gap-1">
                {article.imageCaption && <span>Photo: {article.imageCaption}</span>}
                {article.imageSource && (
                  <span className="text-slate-400 not-italic">Image Source: {article.imageSource}</span>
                )}
              </figcaption>
            </figure>

            {/* Share Buttons (Top) */}
            <ShareButtons title={article.title} url={fullUrl} />

            {/* Table of Contents */}
            <TableOfContents content={article.content} />

            {/* Article Body Content */}
            <div
              className="prose-slate max-w-none text-slate-800 leading-relaxed font-normal"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />

            {/* In-Article Recommendation */}
            <InArticleRecommendation article={inArticleRec} />

            {/* In-Content Ad Placement */}
            <AdBanner slot="in-content" />

            {/* Interactive FAQs if present */}
            {faqs.length > 0 && <FaqAccordion faqs={faqs} />}

            {/* Verified Sources & References Section */}
            {sources.length > 0 && <SourcesBox sources={sources} />}

            {/* Disclaimer Box */}
            <div className="p-4 sm:p-5 bg-amber-50/70 border-l-4 border-amber-500 rounded-r-xl my-8 text-xs text-amber-900 leading-relaxed flex items-start space-x-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-amber-950 mb-1">
                  Editorial Notice & Transparency Disclosure:
                </strong>
                This article is produced for general informational and educational purposes. Technical benchmarks, specifications, and buying advice reflect independent editorial evaluation. Regional availability, pricing, and carrier configurations may vary.
              </div>
            </div>

            {/* Article Topic Cluster & Tags */}
            <div className="pt-4 pb-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 flex items-center mr-1">
                <TagIcon className="w-3.5 h-3.5 mr-1" />
                Topic Hub:
              </span>
              {article.primaryTopic && (
                <Link
                  href={`/topic/${article.primaryTopic.slug}`}
                  className="px-3 py-1 bg-brand-600 text-white text-xs font-bold rounded-full shadow-xs hover:bg-brand-700 transition-colors"
                >
                  #{article.primaryTopic.name}
                </Link>
              )}
              {article.tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/topic/${tag.slug}`}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-full transition-colors"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>

            {/* Share Buttons (Bottom) */}
            <ShareButtons title={article.title} url={fullUrl} />

            {/* Author Box */}
            <AuthorBox author={article.author} />

            {/* Previous & Next Article Navigation */}
            <nav
              aria-label="Previous and Next Article Navigation"
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8 pt-6 border-t border-slate-200"
            >
              {prevArticle ? (
                <Link
                  href={`/${prevArticle.category.slug}/${prevArticle.slug}`}
                  className="p-4 rounded-xl border border-slate-200 hover:border-brand-500 hover:bg-slate-50 transition-all group flex flex-col justify-between"
                >
                  <span className="text-xs font-semibold text-slate-400 flex items-center group-hover:text-brand-600 mb-1">
                    <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                    Previous Story
                  </span>
                  <span className="text-sm font-bold text-slate-900 group-hover:text-brand-600 line-clamp-2">
                    {prevArticle.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}

              {nextArticle && (
                <Link
                  href={`/${nextArticle.category.slug}/${nextArticle.slug}`}
                  className="p-4 rounded-xl border border-slate-200 hover:border-brand-500 hover:bg-slate-50 transition-all group flex flex-col justify-between text-right"
                >
                  <span className="text-xs font-semibold text-slate-400 flex items-center justify-end group-hover:text-brand-600 mb-1">
                    Next Story
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </span>
                  <span className="text-sm font-bold text-slate-900 group-hover:text-brand-600 line-clamp-2">
                    {nextArticle.title}
                  </span>
                </Link>
              )}
            </nav>

            {/* Related Articles Section (High Relevance from Internal Linking Engine) */}
            {relatedArticles.length > 0 && (
              <section aria-label="Related Coverage" className="mt-12 pt-8 border-t-2 border-slate-900">
                <div className="flex items-center space-x-2 mb-6">
                  <Sparkles className="w-5 h-5 text-brand-600" />
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Related Coverage & Recommendations
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {relatedArticles.map((rel) => (
                    <ArticleCard key={rel.id} article={rel} variant="standard" />
                  ))}
                </div>
              </section>
            )}
          </main>

          {/* Sidebar Column (4 cols) */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Sidebar Sticky Ad */}
            <AdBanner slot="sidebar" />

            {/* Popular Articles Widget */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-200 mb-3">
                <Flame className="w-4 h-4 text-red-600 fill-red-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Most Read Stories
                </h3>
              </div>
              <div className="space-y-1">
                {popularArticles.map((art, idx) => (
                  <ArticleCard key={art.id} article={art} variant="trending" rank={idx + 1} />
                ))}
              </div>
            </div>

            {/* Category Quick Hub */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">
                Explore {article.category.name}
              </h3>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Explore verified reviews, benchmarks, and deep-dive technical reporting in {article.category.name}.
              </p>
              <Link
                href={`/${article.category.slug}`}
                className="w-full inline-flex items-center justify-center px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold rounded-lg transition-colors"
              >
                View All in {article.category.name} &rarr;
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
