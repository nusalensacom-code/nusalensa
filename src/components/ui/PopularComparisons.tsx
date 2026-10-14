import React from 'react';
import Link from 'next/link';
import { Scale, ArrowRight } from 'lucide-react';
import { SafeImage } from './SafeImage';

interface MatchupItem {
  id: string;
  slug: string;
  device1: {
    name: string;
    image: string;
    brand: string;
  };
  device2: {
    name: string;
    image: string;
    brand: string;
  };
}

export function PopularComparisons() {
  const matchups: MatchupItem[] = [
    {
      id: '1',
      slug: 'iphone-16-pro-max-vs-samsung-galaxy-s25-ultra',
      device1: {
        name: 'iPhone 16 Pro Max',
        image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=200&q=80',
        brand: 'Apple',
      },
      device2: {
        name: 'Galaxy S25 Ultra',
        image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=200&q=80',
        brand: 'Samsung',
      },
    },
    {
      id: '2',
      slug: 'pixel-9-pro-vs-samsung-galaxy-s25',
      device1: {
        name: 'Pixel 9 Pro',
        image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=200&q=80',
        brand: 'Google',
      },
      device2: {
        name: 'Galaxy S25',
        image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=200&q=80',
        brand: 'Samsung',
      },
    },
    {
      id: '3',
      slug: 'xiaomi-15-pro-vs-oneplus-13',
      device1: {
        name: 'Xiaomi 15 Pro',
        image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=200&q=80',
        brand: 'Xiaomi',
      },
      device2: {
        name: 'OnePlus 13',
        image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=200&q=80',
        brand: 'OnePlus',
      },
    },
    {
      id: '4',
      slug: 'iphone-16-vs-samsung-galaxy-s25',
      device1: {
        name: 'iPhone 16',
        image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=200&q=80',
        brand: 'Apple',
      },
      device2: {
        name: 'Galaxy S25',
        image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=200&q=80',
        brand: 'Samsung',
      },
    },
    {
      id: '5',
      slug: 'xperia-1-vi-vs-samsung-galaxy-s25-ultra',
      device1: {
        name: 'Xperia 1 VI',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=200&q=80',
        brand: 'Sony',
      },
      device2: {
        name: 'Galaxy S25 Ultra',
        image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=200&q=80',
        brand: 'Samsung',
      },
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Scale className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-black text-xs uppercase tracking-wider text-slate-100">
              POPULAR COMPARISONS
            </h3>
            <p className="text-[10px] text-slate-400 leading-none">
              Head-to-head hardware shootouts
            </p>
          </div>
        </div>
      </div>

      {/* Comparison List */}
      <div className="divide-y divide-slate-100">
        {matchups.map((m) => (
          <Link
            key={m.id}
            href={`/compare/${m.slug}`}
            className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors group"
          >
            {/* Device 1 */}
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200 overflow-hidden relative flex-shrink-0">
                <SafeImage src={m.device1.image} alt={m.device1.name} fill className="object-cover" />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-cyan-600 transition-colors truncate">
                {m.device1.name}
              </span>
            </div>

            {/* VS Badge */}
            <div className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-black text-[10px] uppercase mx-2 flex-shrink-0">
              VS
            </div>

            {/* Device 2 */}
            <div className="flex items-center space-x-2 flex-1 min-w-0 justify-end text-right">
              <span className="text-xs font-bold text-slate-800 group-hover:text-cyan-600 transition-colors truncate">
                {m.device2.name}
              </span>
              <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200 overflow-hidden relative flex-shrink-0">
                <SafeImage src={m.device2.image} alt={m.device2.name} fill className="object-cover" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Compare Tool Link */}
      <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-100 text-center">
        <Link
          href="/compare"
          className="text-xs font-bold text-cyan-700 hover:text-cyan-800 flex items-center justify-center"
        >
          <span>Open Full Comparison Matrix</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Link>
      </div>
    </div>
  );
}

