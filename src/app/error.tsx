'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log sanitized error locally without displaying internal details to users
    console.error('Handled application error:', error?.message);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-slate-50">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 text-center shadow-lg">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
          System Notice
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1 mb-3">
          Unable to Load Page
        </h1>

        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          We encountered an unexpected error while processing your request. Our engineering team has logged this occurrence for investigation.
        </p>

        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <button
            onClick={() => reset()}
            type="button"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
          >
            <RefreshCw className="w-4 h-4 mr-1.5" />
            <span>Reload Page</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
          >
            <Home className="w-4 h-4 mr-1.5" />
            <span>Go to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

