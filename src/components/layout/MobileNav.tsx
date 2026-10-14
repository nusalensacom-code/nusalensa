'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Menu,
  X,
  Search,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  Scale,
  Tablet,
  Newspaper,
  BookOpen,
  HelpCircle,
  Cpu,
  TrendingUp,
} from 'lucide-react';
import { siteConfig } from '@/lib/siteConfig';

interface SubcategoryItem {
  id: number;
  name: string;
  slug: string;
}

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  children?: SubcategoryItem[];
}

interface MobileNavProps {
  categories: CategoryItem[];
}

export function MobileNav({ categories }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsOpen(false);
    }
  };

  const navLinks = [
    { label: 'Phones Database', href: '/phones', icon: Smartphone },
    { label: 'Device Comparison', href: '/compare', icon: Scale },
    { label: 'Tablets', href: '/tablets', icon: Tablet },
    { label: 'Tech News', href: '/news', icon: Newspaper },
    { label: 'Hardware Reviews', href: '/reviews', icon: BookOpen },
    { label: 'Buying Guides', href: '/buying-guides', icon: TrendingUp },
    { label: 'How-To & Guides', href: '/how-to', icon: HelpCircle },
    { label: 'AI & Silicon', href: '/technology', icon: Cpu },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        type="button"
        aria-label="Open navigation menu"
        className="p-2 -mr-2 text-slate-700 hover:text-cyan-700 rounded-lg lg:hidden"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 z-50 w-full max-w-xs h-full bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <span className="font-black text-xl tracking-tight text-slate-900">
              {siteConfig.name}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 font-bold">
              GLOBAL
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Drawer Search */}
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search smartphones, specs, guides..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Main Navigation Links */}
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">
              Platform Sections
            </p>
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-3 py-2 text-sm font-semibold text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4 text-cyan-700" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              );
            })}
          </div>

          {/* Trust & Newsroom */}
          <div className="border-t border-slate-100 pt-4 space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">
              Editorial Standards & Legal
            </p>
            <Link
              href="/editorial-policy"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-2 px-3 py-1.5 text-xs text-slate-600 hover:text-cyan-700"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Editorial Policy</span>
            </Link>
            <Link
              href="/corrections-policy"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-1.5 text-xs text-slate-600 hover:text-cyan-700"
            >
              Corrections & Clarifications Policy
            </Link>
            <Link
              href="/advertising-disclosure"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-1.5 text-xs text-slate-600 hover:text-cyan-700"
            >
              Advertising & Affiliate Disclosure
            </Link>
            <Link
              href="/about"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-1.5 text-xs text-slate-600 hover:text-cyan-700"
            >
              About NusaLensa
            </Link>
            <Link
              href="/contact"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-1.5 text-xs text-slate-600 hover:text-cyan-700"
            >
              Contact Newsroom
            </Link>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
          <p className="text-[11px] text-slate-500">
            &copy; {new Date().getFullYear()} {siteConfig.name}. Global Technology Platform.
          </p>
        </div>
      </aside>
    </>
  );
}
