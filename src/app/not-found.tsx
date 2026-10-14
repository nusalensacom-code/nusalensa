import React from 'react';
import Link from 'next/link';
import { HelpCircle, Home, Search, ArrowLeft } from 'lucide-react';
import { siteConfig } from '@/lib/siteConfig';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-slate-50">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 text-center shadow-lg">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-6">
          <HelpCircle className="w-8 h-8" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-red-600">
          404 Error
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1 mb-3">
          Page Not Found
        </h1>

        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          The page you are looking for might have been moved, renamed, or is unavailable in the {siteConfig.name} global index.
        </p>

        {/* Quick Search form */}
        <form action="/search" method="GET" className="relative mb-6">
          <input
            type="text"
            name="q"
            placeholder="Search phones, comparisons, or news..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>

        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
          >
            <Home className="w-4 h-4 mr-1.5" />
            <span>Return to Homepage</span>
          </Link>
          <Link
            href="/phones"
            className="inline-flex items-center justify-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
          >
            <span>Browse Phone Database</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

