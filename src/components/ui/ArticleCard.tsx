'use client';

import React from 'react';
import Link from 'next/link';
import { SafeImage as Image } from '@/components/ui/SafeImage';
import { Clock, Eye, User } from 'lucide-react';
import { timeAgo, formatDateEnglish } from '@/lib/utils';

function safeIsoDate(d: Date | string | number | undefined | null): string {
  if (!d) return new Date().toISOString();
  const date = new Date(d);
  return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

export interface ArticleCardData {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  imageAltText?: string | null;
  imageCaption?: string | null;
  publishedAt: Date | string;
  readingTime?: number;
  views?: number;
  articleType?: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  category: {
    name: string;
    slug: string;
  };
  subcategory?: {
    name: string;
    slug: string;
  } | null;
  author?: {
    name: string;
    slug: string;
    avatar?: string | null;
  } | null;
}

interface ArticleCardProps {
  article: ArticleCardData;
  variant?: 'featured' | 'supporting' | 'standard' | 'compact' | 'trending' | 'horizontal';
  rank?: number;
  className?: string;
}

export function ArticleCard({
  article,
  variant = 'standard',
  rank,
  className = '',
}: ArticleCardProps) {
  const articleUrl = `/${article.category.slug}/${article.slug}`;
  const categoryUrl = `/${article.category.slug}`;
  const altText = article.imageAltText || article.title;

  const articleTypeBadges: Record<string, { label: string; color: string }> = {
    GUIDE: { label: 'Buying Guide', color: 'bg-indigo-600 text-white' },
    TUTORIAL: { label: 'How-To', color: 'bg-emerald-600 text-white' },
    EVERGREEN: { label: 'Deep Dive', color: 'bg-teal-600 text-white' },
    OPINION: { label: 'Analysis', color: 'bg-purple-600 text-white' },
    LISTICLE: { label: 'Top Picks', color: 'bg-rose-600 text-white' },
    EXPLAINER: { label: 'Explainer', color: 'bg-blue-600 text-white' },
    NEWS: { label: 'News', color: 'bg-red-600 text-white' },
    REVIEW: { label: 'Review', color: 'bg-cyan-700 text-white' },
  };

  const badge = article.articleType ? articleTypeBadges[article.articleType] : null;

  // 1. FEATURED HERO BIG CARD
  if (variant === 'featured') {
    return (
      <article className={`group relative bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col ${className}`}>
        <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-slate-100">
          <Link href={articleUrl} tabIndex={-1} aria-label={article.title}>
            <Image
              src={article.featuredImage}
              alt={altText}
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </Link>
          <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
            <Link
              href={categoryUrl}
              className="px-3 py-1 bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold uppercase tracking-wider rounded-md shadow-sm transition-colors"
            >
              {article.category.name}
            </Link>
            {badge && badge.label.toLowerCase() !== article.category.name.toLowerCase() && (
              <span className={`px-2.5 py-1 ${badge.color} text-xs font-bold uppercase tracking-wider rounded-md shadow-sm`}>
                {badge.label}
              </span>
            )}
            {article.isTrending && (
              <span className="px-2.5 py-1 bg-amber-500 text-white text-xs font-bold uppercase tracking-wider rounded-md shadow-sm">
                Trending
              </span>
            )}
          </div>
        </div>

        <div className="p-5 sm:p-7 flex flex-col flex-1">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 group-hover:text-cyan-700 transition-colors leading-tight">
            <Link href={articleUrl}>{article.title}</Link>
          </h2>

          <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed line-clamp-3">
            {article.excerpt}
          </p>

          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex items-center space-x-2">
              {article.author && (
                <Link
                  href={`/author/${article.author.slug}`}
                  className="font-semibold text-slate-800 hover:text-cyan-700 transition-colors flex items-center"
                >
                  <User className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {article.author.name}
                </Link>
              )}
              <span>•</span>
              <time dateTime={safeIsoDate(article.publishedAt)}>
                {timeAgo(article.publishedAt)}
              </time>
            </div>

            <div className="flex items-center space-x-3">
              {article.readingTime && (
                <span className="flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {article.readingTime} min read
                </span>
              )}
              {article.views !== undefined && (
                <span className="flex items-center">
                  <Eye className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {article.views.toLocaleString('en-US')}
                </span>
              )}
            </div>
          </div>
        </div>
      </article>
    );
  }

  // 2. SUPPORTING HERO CARD
  if (variant === 'supporting') {
    return (
      <article className={`group flex gap-3.5 p-3 rounded-xl hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0 ${className}`}>
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
          <Link href={articleUrl} tabIndex={-1} aria-label={article.title}>
            <Image
              src={article.featuredImage}
              alt={altText}
              fill
              sizes="120px"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </Link>
        </div>
        <div className="flex flex-col justify-between flex-1 min-w-0">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Link
                href={categoryUrl}
                className="text-[11px] font-bold text-cyan-700 hover:text-cyan-800 uppercase tracking-wider block"
              >
                {article.category.name}
              </Link>
              {badge && badge.label.toLowerCase() !== article.category.name.toLowerCase() && (
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${badge.color}`}>
                  {badge.label}
                </span>
              )}
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-cyan-700 transition-colors leading-snug line-clamp-2">
              <Link href={articleUrl}>{article.title}</Link>
            </h3>
          </div>
          <div className="flex items-center text-xs text-slate-400 mt-2 space-x-2">
            <span>{timeAgo(article.publishedAt)}</span>
            {article.readingTime && (
              <>
                <span>•</span>
                <span>{article.readingTime} min read</span>
              </>
            )}
          </div>
        </div>
      </article>
    );
  }

  // 3. COMPACT LIST CARD
  if (variant === 'compact') {
    return (
      <article className={`group flex items-start gap-3 py-3 border-b border-slate-100 last:border-b-0 ${className}`}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1.5 mb-0.5">
            <Link
              href={categoryUrl}
              className="text-[11px] font-bold text-cyan-700 hover:text-cyan-800 uppercase tracking-wider block"
            >
              {article.category.name}
            </Link>
            {badge && (
              <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold uppercase ${badge.color}`}>
                {badge.label}
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-slate-900 group-hover:text-cyan-700 transition-colors line-clamp-2 leading-snug">
            <Link href={articleUrl}>{article.title}</Link>
          </h3>
          <div className="flex items-center text-[11px] text-slate-400 mt-1 space-x-2">
            <time dateTime={safeIsoDate(article.publishedAt)}>
              {timeAgo(article.publishedAt)}
            </time>
          </div>
        </div>
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
          <Link href={articleUrl} tabIndex={-1} aria-label={article.title}>
            <Image
              src={article.featuredImage}
              alt={altText}
              fill
              sizes="80px"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </Link>
        </div>
      </article>
    );
  }

  // 4. TRENDING NUMBERED CARD
  if (variant === 'trending') {
    return (
      <article className={`group flex items-start gap-4 py-3 border-b border-slate-100 last:border-b-0 ${className}`}>
        {rank !== undefined && (
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-200 group-hover:text-cyan-600 transition-colors flex-shrink-0 w-8 text-center leading-none mt-1">
            {rank < 10 ? `0${rank}` : rank}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <Link
              href={categoryUrl}
              className="text-[11px] font-bold text-cyan-700 uppercase tracking-wider block"
            >
              {article.category.name}
            </Link>
            {badge && badge.label.toLowerCase() !== article.category.name.toLowerCase() && (
              <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold uppercase ${badge.color}`}>
                {badge.label}
              </span>
            )}
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-cyan-700 transition-colors line-clamp-2 leading-snug">
            <Link href={articleUrl}>{article.title}</Link>
          </h3>
          <div className="flex items-center text-xs text-slate-400 mt-2 space-x-2">
            <span>{timeAgo(article.publishedAt)}</span>
            {article.views !== undefined && (
              <>
                <span>•</span>
                <span className="flex items-center">
                  <Eye className="w-3 h-3 mr-1 text-slate-400" />
                  {article.views.toLocaleString('en-US')}
                </span>
              </>
            )}
          </div>
        </div>
      </article>
    );
  }

  // 5. HORIZONTAL CARD
  if (variant === 'horizontal') {
    return (
      <article className={`group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col sm:flex-row ${className}`}>
        <div className="relative sm:w-2/5 aspect-[16/10] sm:aspect-auto sm:min-h-[200px] overflow-hidden bg-slate-100">
          <Link href={articleUrl} tabIndex={-1} aria-label={article.title}>
            <Image
              src={article.featuredImage}
              alt={altText}
              fill
              sizes="(max-width: 640px) 100vw, 320px"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </Link>
        </div>
        <div className="p-4 sm:p-5 sm:w-3/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Link
                  href={categoryUrl}
                  className="text-xs font-bold text-cyan-700 hover:text-cyan-800 uppercase tracking-wider"
                >
                  {article.category.name}
                </Link>
                {badge && (
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${badge.color}`}>
                    {badge.label}
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400">
                {timeAgo(article.publishedAt)}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-cyan-700 transition-colors leading-snug line-clamp-2">
              <Link href={articleUrl}>{article.title}</Link>
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-2 line-clamp-2 leading-relaxed">
              {article.excerpt}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            {article.author && (
              <span className="font-medium text-slate-700">
                By {article.author.name}
              </span>
            )}
            {article.readingTime && (
              <span>{article.readingTime} min read</span>
            )}
          </div>
        </div>
      </article>
    );
  }

  // 6. STANDARD CARD
  return (
    <article className={`group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col ${className}`}>
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <Link href={articleUrl} tabIndex={-1} aria-label={article.title}>
          <Image
            src={article.featuredImage}
            alt={altText}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 380px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        <div className="absolute top-3 left-3 z-10 flex gap-1.5">
          <Link
            href={categoryUrl}
            className="px-2.5 py-1 bg-white/95 backdrop-blur-sm hover:bg-white text-cyan-800 text-xs font-bold uppercase tracking-wider rounded-md shadow-sm transition-colors"
          >
            {article.category.name}
          </Link>
          {badge && (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shadow-sm ${badge.color}`}>
              {badge.label}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-cyan-700 transition-colors leading-snug line-clamp-2">
            <Link href={articleUrl}>{article.title}</Link>
          </h3>
          <p className="text-slate-600 text-xs sm:text-sm mt-2 line-clamp-2 leading-relaxed">
            {article.excerpt}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <time dateTime={safeIsoDate(article.publishedAt)}>
            {formatDateEnglish(article.publishedAt)}
          </time>
          {article.readingTime && (
            <span>{article.readingTime} min read</span>
          )}
        </div>
      </div>
    </article>
  );
}
