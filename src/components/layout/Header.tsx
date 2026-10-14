import React from 'react';
import Link from 'next/link';
import { Search, TrendingUp, Sparkles, ShieldCheck, Scale, Smartphone, Tablet, SlidersHorizontal } from 'lucide-react';
import { siteConfig } from '@/lib/siteConfig';
import { MobileNav } from './MobileNav';
import { BrandStrip } from './BrandStrip';
import { formatDateEnglish } from '@/lib/utils';

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  children?: {
    id: number;
    name: string;
    slug: string;
  }[];
}

interface BrandItem {
  id: number;
  name: string;
  slug: string;
  _count?: {
    devices: number;
  };
}

interface HeaderProps {
  categories: CategoryItem[];
  brands?: BrandItem[];
}

export function Header({ categories, brands = [] }: HeaderProps) {
  const currentDate = formatDateEnglish(new Date());

  const primaryNav = [
    { label: 'NEWS', href: '/news' },
    { label: 'REVIEWS', href: '/reviews' },
    { label: 'COMPARE', href: '/compare' },
    { label: 'PHONES', href: '/phones' },
    { label: 'TABLETS', href: '/tablets' },
    { label: 'BUYING GUIDES', href: '/buying-guides' },
    { label: 'HOW-TO', href: '/how-to' },
    { label: 'TECHNOLOGY', href: '/technology' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900 border-b border-slate-800 shadow-md">
      {/* Top Utility Bar (Desktop only) */}
      <div className="hidden lg:block bg-slate-950/80 text-slate-400 py-1 px-4 text-xs border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="font-semibold text-slate-300">{currentDate}</span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-400 flex items-center font-bold tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Independent Global Smartphone & Technology Intelligence
            </span>
          </div>

          <div className="flex items-center space-x-4 text-[11px]">
            <Link
              href="/compare"
              className="text-slate-300 hover:text-white flex items-center font-semibold transition-colors"
            >
              <Scale className="w-3.5 h-3.5 mr-1 text-amber-400" />
              Compare Engine
            </Link>
            <Link href="/editorial-policy" className="hover:text-white transition-colors">
              Editorial Policy
            </Link>
            <Link href="/about" className="hover:text-white transition-colors">
              About NusaLensa
            </Link>
            <Link
              href="/admin/login"
              className="text-amber-400 hover:text-amber-300 font-bold transition-colors"
            >
              Editorial Desk
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center group">
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-white group-hover:text-amber-400 transition-colors">
                {siteConfig.name}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded ml-1">
                GLOBAL
              </span>
            </div>
          </Link>
        </div>

        {/* Global Search Bar (GSMArena Style Prominent Input) */}
        <div className="hidden md:flex flex-1 max-w-lg mx-6">
          <form action="/search" method="GET" className="relative w-full">
            <input
              type="text"
              name="q"
              placeholder="Search phone model, brand, chipset, specs, review..."
              className="w-full pl-9 pr-20 py-2 text-xs sm:text-sm bg-slate-800/90 border border-slate-700 rounded-lg focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-white placeholder-slate-400 font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded transition-colors uppercase"
            >
              Find
            </button>
          </form>
        </div>

        {/* Action Buttons & Mobile Toggle */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Quick Phone Finder button */}
          <Link
            href="/phones"
            className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold hover:bg-slate-700 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
            Phone Finder
          </Link>

          {/* Quick Compare shortcut */}
          <Link
            href="/compare"
            className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/20 transition-colors"
          >
            <Scale className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
            Compare
          </Link>

          {/* Mobile search quick icon */}
          <Link
            href="/search"
            aria-label="Search NusaLensa"
            className="p-2 text-slate-300 hover:text-amber-400 md:hidden"
          >
            <Search className="w-5 h-5" />
          </Link>

          {/* Mobile Nav Drawer */}
          <MobileNav categories={categories} />
        </div>
      </div>

      {/* Primary Global Navigation Bar (GSMArena Dark High-Contrast Strip) */}
      <nav
        aria-label="Global Technology Navigation"
        className="border-t border-slate-800 bg-slate-950/60"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center space-x-1 sm:space-x-1.5 overflow-x-auto whitespace-nowrap py-1.5 scrollbar-none text-xs font-bold text-slate-300 uppercase tracking-wider">
            <Link
              href="/"
              className="px-3 py-1 rounded text-amber-400 hover:bg-slate-800 font-black transition-colors flex-shrink-0"
            >
              HOME
            </Link>

            {primaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-1 rounded hover:text-white hover:bg-slate-800 transition-colors flex-shrink-0"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* GSMArena Iconic Top Brand Bar */}
      {brands && brands.length > 0 && <BrandStrip brands={brands} />}
    </header>
  );
}
