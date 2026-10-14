'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  Eye,
  FileText,
  FolderTree,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Settings,
  Calendar,
  Layers,
} from 'lucide-react';

interface AnalyticsData {
  summary: {
    totalViews: number;
    todayViews: number;
    totalArticles: number;
    publishedArticles: number;
    gaConfigured: boolean;
    gaId: string | null;
    gscConfigured: boolean;
  };
  topArticles: {
    id: number;
    title: string;
    slug: string;
    views: number;
    status: string;
    publishedAt: string;
    category: { name: string; slug: string };
    author: { name: string };
  }[];
  categoryStats: {
    id: number;
    name: string;
    slug: string;
    articleCount: number;
    totalViews: number;
  }[];
  daysTrend: {
    date: string;
    views: number;
  }[];
}

export default function AnalyticsManager() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/analytics');
      if (!res.ok) throw new Error('Failed to load analytics data');
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="inline-block w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold">Compiling readership and engagement telemetry...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-rose-600 bg-rose-50 rounded-2xl">
        <p className="text-xs font-semibold">{errorMsg || 'Failed to load analytics data'}</p>
      </div>
    );
  }

  const maxDayViews = Math.max(...data.daysTrend.map((d) => d.views), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Readership & Performance Analytics</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Verified readership telemetry sourced directly from internal NusaLensa audit logs.
          </p>
        </div>

        <Link
          href="/admin/settings"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs transition shadow-2xs self-start sm:self-auto"
        >
          <Settings className="w-3.5 h-3.5 text-slate-500" />
          Configure GA4 & Search Console
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Page Views</span>
            <Eye className="w-4 h-4 text-primary-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {data.summary.totalViews.toLocaleString('en-US')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Across all published articles</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Today</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">
            {data.summary.todayViews.toLocaleString('en-US')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Recorded views today</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Published Articles</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {data.summary.publishedArticles}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Out of {data.summary.totalArticles} total records</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Google Analytics</span>
            <BarChart3 className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-sm font-black mt-2">
            {data.summary.gaConfigured ? (
              <span className="text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                Connected
              </span>
            ) : (
              <span className="text-slate-400">Not Configured</span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">
            {data.summary.gaId || 'No GA4 Measurement ID'}
          </div>
        </div>
      </div>

      {/* 7-Day Trend Chart */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary-600" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              7-Day Readership Trend
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">Based on ArticleView records</span>
        </div>

        <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-slate-100">
          {data.daysTrend.map((d, i) => {
            const heightPercent = Math.max(Math.round((d.views / maxDayViews) * 100), 8);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition">
                  {d.views}
                </span>
                <div
                  style={{ height: `${heightPercent}%` }}
                  className="w-full max-w-[42px] bg-primary-500/80 group-hover:bg-primary-600 rounded-t-lg transition-all duration-300"
                />
                <span className="text-[10px] font-semibold text-slate-400 truncate max-w-full">
                  {d.date.split(',')[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Articles */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary-600" />
              Top 10 Most-Read Articles
            </h2>
            <Link href="/admin/articles" className="text-xs font-semibold text-primary-600 hover:text-primary-700">
              Manage All
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-x-auto">
            {data.topArticles.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No published articles yet</div>
            ) : (
              data.topArticles.map((art, idx) => (
                <div key={art.id} className="p-3.5 hover:bg-slate-50 transition flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono font-bold text-slate-400 w-5 text-right">{idx + 1}</span>
                    <div className="min-w-0">
                      <Link
                        href={`/admin/articles/${art.id}/edit`}
                        className="font-bold text-slate-900 hover:text-primary-600 truncate block transition"
                      >
                        {art.title}
                      </Link>
                      <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>{art.category?.name}</span>
                        <span>•</span>
                        <span>{art.author?.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="px-2.5 py-0.5 rounded-full font-bold text-xs bg-primary-50 text-primary-700">
                      {art.views.toLocaleString('en-US')} views
                    </span>
                    <Link
                      href={`/${art.category.slug}/${art.slug}`}
                      target="_blank"
                      className="p-1 rounded text-slate-400 hover:text-primary-600 hover:bg-slate-100"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-primary-600" />
              Category Hub Performance
            </h2>
            <Link href="/admin/categories" className="text-xs font-semibold text-primary-600 hover:text-primary-700">
              Manage Categories
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {data.categoryStats.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No categories found</div>
            ) : (
              data.categoryStats.map((cat, idx) => (
                <div key={cat.id} className="p-3.5 hover:bg-slate-50 transition flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-400 w-5 text-right">{idx + 1}</span>
                    <div>
                      <div className="font-bold text-slate-900">{cat.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {cat.articleCount} articles published
                      </div>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full font-bold text-xs bg-slate-100 text-slate-700 font-mono">
                    {cat.totalViews.toLocaleString('en-US')} views
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* External Integrations Info Card */}
      <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <AlertCircle className="w-4 h-4" />
            Google Search Console & AdSense Telemetry
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            To view search impressions, SERP rankings, organic CTR, and monetization RPM metrics, configure your Google Search Console verification code and Google AdSense publisher ID in Website Settings.
          </p>
        </div>

        <Link
          href="/admin/settings"
          className="px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs rounded-xl transition shadow-xs flex-shrink-0"
        >
          Open Settings
        </Link>
      </div>
    </div>
  );
}
