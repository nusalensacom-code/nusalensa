import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface InArticleRecommendationProps {
  article: {
    id: number;
    title: string;
    slug: string;
    category: {
      slug: string;
      name: string;
    };
  } | null;
}

export function InArticleRecommendation({ article }: InArticleRecommendationProps) {
  if (!article) return null;

  return (
    <aside
      aria-label="Related Reading Recommendation"
      className="my-8 p-4 bg-cyan-50/70 border-l-4 border-cyan-700 rounded-r-xl flex items-center justify-between gap-4 transition-all hover:bg-cyan-50"
    >
      <div className="flex items-center space-x-3 min-w-0">
        <span className="px-2 py-0.5 bg-cyan-700 text-white font-extrabold text-[10px] uppercase tracking-wider rounded flex-shrink-0">
          RELATED READING
        </span>
        <Link
          href={`/${article.category.slug}/${article.slug}`}
          className="text-sm font-bold text-slate-900 hover:text-cyan-700 transition-colors line-clamp-1 leading-snug"
        >
          {article.title}
        </Link>
      </div>

      <Link
        href={`/${article.category.slug}/${article.slug}`}
        className="p-1 text-cyan-700 hover:text-cyan-800 flex-shrink-0"
        aria-label={`Read also: ${article.title}`}
      >
        <ArrowRight className="w-4 h-4" />
      </Link>
    </aside>
  );
}
