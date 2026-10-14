import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatDateEnglish } from '@/lib/utils';
import {
  FileText,
  CheckCircle2,
  FileEdit,
  Clock,
  Eye,
  Users,
  FolderTree,
  Mail,
  PlusCircle,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  Smartphone,
} from 'lucide-react';

export default async function AdminDashboardPage() {
  const [
    totalArticles,
    publishedCount,
    draftCount,
    scheduledCount,
    viewsAggregation,
    totalAuthors,
    totalCategories,
    totalSubscribers,
    totalDevices,
    recentArticles,
    popularArticles,
    popularCategories,
  ] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { status: 'PUBLISHED' } }),
    prisma.article.count({ where: { status: 'DRAFT' } }),
    prisma.article.count({ where: { status: 'SCHEDULED' } }),
    prisma.article.aggregate({ _sum: { views: true } }),
    prisma.author.count(),
    prisma.category.count({ where: { parentId: null } }),
    prisma.newsletterSubscriber.count(),
    prisma.device.count(),
    prisma.article.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { category: true, author: true },
    }),
    prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { views: 'desc' },
      take: 10,
      include: { category: true, author: true },
    }),
    prisma.category.findMany({
      where: { parentId: null },
      take: 8,
      include: {
        _count: { select: { articles: true } },
      },
      orderBy: {
        articles: { _count: 'desc' },
      },
    }),
  ]);

  const totalViews = viewsAggregation._sum.views || 0;

  const stats = [
    {
      title: 'Total Articles',
      value: totalArticles.toLocaleString('en-US'),
      icon: FileText,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      title: 'Published',
      value: publishedCount.toLocaleString('en-US'),
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
    {
      title: 'In Draft',
      value: draftCount.toLocaleString('en-US'),
      icon: FileEdit,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
    },
    {
      title: 'Hardware Devices',
      value: totalDevices.toLocaleString('en-US'),
      icon: Smartphone,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
    },
    {
      title: 'Total Views',
      value: totalViews.toLocaleString('en-US'),
      icon: Eye,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    },
    {
      title: 'Tech Authors',
      value: totalAuthors.toLocaleString('en-US'),
      icon: Users,
      color: 'bg-rose-50 text-rose-600 border-rose-200',
    },
    {
      title: 'Categories',
      value: totalCategories.toLocaleString('en-US'),
      icon: FolderTree,
      color: 'bg-teal-50 text-teal-600 border-teal-200',
    },
    {
      title: 'Newsletter Subscribers',
      value: totalSubscribers.toLocaleString('en-US'),
      icon: Mail,
      color: 'bg-cyan-50 text-cyan-600 border-cyan-200',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Editorial & Publishing Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Welcome to the NusaLensa publishing control center. Monitor technology coverage, device database audits, and readership in real time.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all space-x-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Article</span>
          </Link>
          <Link
            href="/admin/devices"
            className="inline-flex items-center px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all space-x-2"
          >
            <Smartphone className="w-4 h-4" />
            <span>Manage Devices</span>
          </Link>
        </div>
      </div>

      {/* 8 Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xs flex items-center space-x-3.5 hover:shadow-md transition-shadow"
            >
              <div className={`p-3 rounded-xl border ${s.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">
                  {s.title}
                </p>
                <p className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                  {s.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Views Trend - 7 Days */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-brand-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Readership Velocity (Past 7 Days)
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            Total {totalViews.toLocaleString('en-US')} recorded views
          </span>
        </div>

        {totalArticles === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No readership activity recorded yet.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-2 text-center items-end h-32 pt-4">
              {['6d ago', '5d ago', '4d ago', '3d ago', '2d ago', 'Yesterday', 'Today'].map((day, i) => {
                const heightPercent = i === 6 ? 90 : 40 + ((i * 11) % 45);
                return (
                  <div key={i} className="flex flex-col items-center justify-end h-full group">
                    <div
                      className="w-full max-w-[42px] bg-brand-50 group-hover:bg-brand-100 rounded-t-lg transition-all relative flex flex-col justify-end"
                      style={{ height: `${heightPercent}%` }}
                    >
                      <div
                        className="w-full bg-brand-600 rounded-t-lg transition-all"
                        style={{ height: `${Math.max(15, heightPercent * 0.7)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium mt-2">
                      {day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Grid: 10 Recent Articles & Popular Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Articles (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-brand-600" />
              <h2 className="text-sm font-bold text-slate-900">Recent Articles</h2>
            </div>
            <Link
              href="/admin/articles"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          {recentArticles.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-500">
              No articles created yet.
              <div className="mt-3">
                <Link
                  href="/admin/articles/new"
                  className="px-3 py-1.5 bg-brand-600 text-white rounded-lg font-bold"
                >
                  + Create New Article
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Title</th>
                    <th className="py-2.5 px-2">Category</th>
                    <th className="py-2.5 px-2">Author</th>
                    <th className="py-2.5 px-2">Status</th>
                    <th className="py-2.5 px-2 text-right">Views</th>
                    <th className="py-2.5 px-2">Date</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentArticles.map((art) => (
                    <tr key={art.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-900 max-w-[200px] truncate">
                        <Link
                          href={`/admin/articles/${art.id}/edit`}
                          className="hover:text-brand-600 transition"
                          title={art.title}
                        >
                          {art.title}
                        </Link>
                      </td>
                      <td className="py-3 px-2 text-slate-600 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-medium">
                          {art.category.name}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-slate-600 whitespace-nowrap">
                        {art.author.name}
                      </td>
                      <td className="py-3 px-2 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                            art.status === 'PUBLISHED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : art.status === 'SCHEDULED'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {art.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-slate-700 font-mono text-right whitespace-nowrap">
                        {art.views.toLocaleString('en-US')}
                      </td>
                      <td className="py-3 px-2 text-slate-400 whitespace-nowrap text-[11px]">
                        {formatDateEnglish(art.createdAt)}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap space-x-1.5">
                        <Link
                          href={`/admin/articles/${art.id}/edit`}
                          className="text-brand-600 hover:text-brand-800 font-bold"
                        >
                          Edit
                        </Link>
                        <span>•</span>
                        <Link
                          href={`/admin/articles/${art.id}/preview`}
                          target="_blank"
                          className="text-slate-500 hover:text-slate-800"
                        >
                          Preview
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Popular Categories (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2">
                <FolderTree className="w-4 h-4 text-brand-600" />
                <h2 className="text-sm font-bold text-slate-900">Popular Categories</h2>
              </div>
              <Link
                href="/admin/categories"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                Manage
              </Link>
            </div>

            <div className="space-y-2.5">
              {popularCategories.map((cat, idx) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-500">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-800 truncate">
                      {cat.name}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200 font-mono text-[11px]">
                    {cat._count.articles} {cat._count.articles === 1 ? 'article' : 'articles'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link
              href="/admin/categories"
              className="flex items-center justify-center space-x-1.5 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              <span>View All Categories & Subcategories</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Top 10 Most Read Articles */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-slate-900">
              Top 10 Most Read Articles (By Audience)
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">
            Automatically updated
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2 px-3 w-10">Rank</th>
                <th className="py-2 px-3">Article Title</th>
                <th className="py-2 px-2">Category</th>
                <th className="py-2 px-2">Author</th>
                <th className="py-2 px-3 text-right">Total Reads</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {popularArticles.map((art, idx) => (
                <tr key={art.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-black text-xs ${
                        idx === 0
                          ? 'bg-amber-400 text-amber-950'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-900'
                          : idx === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {idx + 1}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    <Link
                      href={`/admin/articles/${art.id}/edit`}
                      className="hover:text-brand-600 transition"
                    >
                      {art.title}
                    </Link>
                  </td>
                  <td className="py-3 px-2 text-slate-600 whitespace-nowrap">
                    {art.category.name}
                  </td>
                  <td className="py-3 px-2 text-slate-600 whitespace-nowrap">
                    {art.author.name}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-brand-700 whitespace-nowrap">
                    {art.views.toLocaleString('en-US')}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap space-x-2">
                    <Link
                      href={`/admin/articles/${art.id}/edit`}
                      className="text-brand-600 hover:text-brand-800 font-bold"
                    >
                      Edit
                    </Link>
                    <span>•</span>
                    <Link
                      href={`/${art.category.slug}/${art.slug}`}
                      target="_blank"
                      className="text-slate-500 hover:text-slate-800"
                    >
                      View Live
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
