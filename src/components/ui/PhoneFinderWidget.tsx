import React from 'react';
import Link from 'next/link';
import { Smartphone, Search, Filter, SlidersHorizontal, ChevronRight } from 'lucide-react';

interface BrandItem {
  id: number;
  name: string;
  slug: string;
  _count?: {
    devices: number;
  };
}

interface PhoneFinderWidgetProps {
  brands: BrandItem[];
}

export function PhoneFinderWidget({ brands }: PhoneFinderWidgetProps) {
  const quickFilters = [
    { label: '5G Flagships', href: '/phones?category=flagships' },
    { label: 'Under $500 USD', href: '/phones?maxPrice=500' },
    { label: 'Foldables & Flip', href: '/phones?category=foldables' },
    { label: '200MP Cameras', href: '/phones?camera=200mp' },
    { label: 'Best Battery 6000mAh', href: '/phones?battery=6000' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Smartphone className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="font-black text-xs uppercase tracking-wider text-slate-100">
              PHONE FINDER
            </h3>
            <p className="text-[10px] text-slate-400 leading-none">
              Explore devices by manufacturer
            </p>
          </div>
        </div>
      </div>

      {/* Brand Directory Grid */}
      <div className="p-3">
        <div className="grid grid-cols-2 gap-1.5">
          {brands.map((b) => (
            <Link
              key={b.id}
              href={`/brands/${b.slug}`}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-amber-600 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
            >
              <span className="truncate">{b.name}</span>
              <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded ml-1">
                {b._count?.devices || 0}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Specs Presets */}
      <div className="px-3 pb-3 pt-1 border-t border-slate-100">
        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 px-1">
          Quick Filters
        </p>
        <div className="flex flex-wrap gap-1">
          {quickFilters.map((q) => (
            <Link
              key={q.label}
              href={q.href}
              className="text-[11px] font-semibold text-slate-600 bg-slate-50 hover:bg-amber-50 hover:text-amber-700 px-2 py-1 rounded-md transition-colors border border-slate-200"
            >
              {q.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Advanced Phone Finder CTA */}
      <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-100 text-center">
        <Link
          href="/phones"
          className="text-xs font-bold text-slate-900 hover:text-amber-600 flex items-center justify-center space-x-1"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 mr-1" />
          <span>Advanced Phone Finder Tool</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

