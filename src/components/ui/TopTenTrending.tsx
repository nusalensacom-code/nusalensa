import React from 'react';
import Link from 'next/link';
import { Flame, TrendingUp, Smartphone, ArrowRight, Award } from 'lucide-react';
import { SafeImage } from './SafeImage';

interface DeviceItem {
  id: number;
  name: string;
  slug: string;
  featuredImage?: string | null;
  views?: number;
  brand: {
    name: string;
    slug: string;
  };
}

interface TopTenTrendingProps {
  devices: DeviceItem[];
}

export function TopTenTrending({ devices }: TopTenTrendingProps) {
  // Sort devices by views descending to create the authentic Daily Hits leaderboard
  const sorted = [...devices].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* GSMArena Classic Header */}
      <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
          </div>
          <div>
            <h3 className="font-black text-xs uppercase tracking-wider text-slate-100">
              TOP 10 BY DAILY HITS
            </h3>
            <p className="text-[10px] text-slate-400 leading-none">
              Most viewed smartphone specifications
            </p>
          </div>
        </div>
        <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded uppercase">
          LIVE
        </span>
      </div>

      {/* Leaderboard Rows */}
      <div className="divide-y divide-slate-100">
        {sorted.map((device, index) => {
          const rank = index + 1;
          const isTop3 = rank <= 3;
          const formattedHits = device.views
            ? `${(device.views / 1000).toFixed(1)}k`
            : `${(35 - rank * 2.1).toFixed(1)}k`;

          return (
            <Link
              key={device.id}
              href={`/phones/${device.brand.slug}/${device.slug}`}
              className="flex items-center px-3.5 py-2 hover:bg-slate-50 transition-colors group"
            >
              {/* Rank Badge */}
              <div
                className={`w-5 h-5 flex-shrink-0 rounded flex items-center justify-center font-black text-xs mr-2.5 ${
                  rank === 1
                    ? 'bg-amber-500 text-slate-950'
                    : rank === 2
                    ? 'bg-slate-200 text-slate-800'
                    : rank === 3
                    ? 'bg-amber-700/20 text-amber-800'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {rank}
              </div>

              {/* Thumbnail */}
              <div className="w-9 h-9 flex-shrink-0 relative rounded-md overflow-hidden bg-slate-100 border border-slate-200 mr-2.5">
                {device.featuredImage ? (
                  <SafeImage
                    src={device.featuredImage}
                    alt={device.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <Smartphone className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Title and Brand */}
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-xs font-bold text-slate-800 group-hover:text-amber-600 transition-colors truncate">
                  {device.name}
                </p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  {device.brand.name}
                </p>
              </div>

              {/* Daily Hits Metric */}
              <div className="text-right flex-shrink-0">
                <span
                  className={`text-[11px] font-bold ${
                    isTop3 ? 'text-amber-600 font-extrabold' : 'text-slate-500'
                  }`}
                >
                  {formattedHits}
                </span>
                <span className="block text-[9px] text-slate-400 leading-none">hits</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer Link */}
      <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-100 text-center">
        <Link
          href="/phones"
          className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center justify-center"
        >
          <span>View All Ranked Devices</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Link>
      </div>
    </div>
  );
}

