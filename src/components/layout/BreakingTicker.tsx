import React from 'react';
import Link from 'next/link';
import { Flame } from 'lucide-react';

interface BreakingNewsItem {
  id: number;
  title: string;
  slug: string;
  categorySlug: string;
}

interface BreakingTickerProps {
  items: BreakingNewsItem[];
}

export function BreakingTicker({ items }: BreakingTickerProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 text-xs py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center">
        <div className="flex items-center space-x-1.5 bg-red-600 text-white font-bold px-2.5 py-0.5 rounded-sm flex-shrink-0 uppercase tracking-wider text-[11px] mr-3 shadow-sm">
          <Flame className="w-3.5 h-3.5 fill-white animate-pulse" />
          <span>TRENDING</span>
        </div>

        <div className="overflow-x-auto whitespace-nowrap scrollbar-none flex-1 flex items-center space-x-6 text-slate-300">
          {items.map((item, index) => (
            <Link
              key={item.id}
              href={`/${item.categorySlug}/${item.slug}`}
              className="hover:text-white transition-colors flex items-center space-x-2"
            >
              <span className="text-red-500 font-bold">#{index + 1}</span>
              <span className="hover:underline">{item.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

