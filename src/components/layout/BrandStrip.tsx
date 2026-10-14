import React from 'react';
import Link from 'next/link';
import { Smartphone } from 'lucide-react';

interface BrandItem {
  id: number;
  name: string;
  slug: string;
  _count?: {
    devices: number;
  };
}

interface BrandStripProps {
  brands: BrandItem[];
}

export function BrandStrip({ brands }: BrandStripProps) {
  // Sort popular brands first or take top ones
  const topBrands = brands.slice(0, 10);

  return (
    <div className="w-full bg-slate-900 border-b border-slate-800 text-slate-300 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between py-1.5 overflow-x-auto whitespace-nowrap scrollbar-none gap-3">
          <div className="flex items-center space-x-1.5 flex-shrink-0 text-amber-400 font-bold uppercase tracking-wider text-[11px] pr-2 border-r border-slate-800">
            <Smartphone className="w-3.5 h-3.5" />
            <span>PHONE BRANDS:</span>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto scrollbar-none">
            {topBrands.map((brand) => (
              <Link
                key={brand.id}
                href={`/brands/${brand.slug}`}
                className="px-2.5 py-0.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 font-bold tracking-wide transition-colors uppercase text-[11px] flex-shrink-0"
              >
                {brand.name}
                {brand._count?.devices ? (
                  <span className="text-[10px] text-slate-400 ml-1 font-normal">
                    ({brand._count.devices})
                  </span>
                ) : null}
              </Link>
            ))}
          </div>

          <Link
            href="/phones"
            className="text-amber-400 hover:text-amber-300 font-bold uppercase text-[11px] flex-shrink-0 pl-3 border-l border-slate-800 hover:underline"
          >
            All Brands &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

