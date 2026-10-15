'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  RefreshCw,
  Rss,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Eye,
  Trash2,
  Search,
  Filter,
  Check,
  X,
  Layers,
  ArrowRight,
  ShieldCheck,
  FileText,
  Clock,
  Send,
  Zap,
  Globe,
  Settings,
  Plus,
  ListChecks,
  HelpCircle,
  Hash,
  Info,
  Laptop,
  Terminal,
} from 'lucide-react';
import { adminClientFetch } from '@/lib/clientAuthFetch';

interface CuratedItem {
  id: number;
  sourceName: string;
  sourceUrl: string;
  sourceTitle: string;
  sourceSummary: string | null;
  sourceImage: string | null;
  sourcePublishedAt: string | null;
  generatedTitle: string;
  generatedSlug: string;
  generatedExcerpt: string;
  generatedContent: string;
  generatedCategory: string;
  generatedTags: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoScore: number;
  faqJson: string | null;
  sourcesJson: string | null;
  headlineSuggestions: string | null;
  outlineJson: string | null;
  factCheckChecklist: string | null;
  missingCitations: string | null;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  articleId: number | null;
  createdAt: string;
}

interface NewsSourceItem {
  id: number;
  name: string;
  url: string;
  categoryHint: string | null;
  isActive: boolean;
  lastFetchedAt: string | null;
  fetchCount: number;
}

export default function NewsCuratorManager() {
  const [items, setItems] = useState<CuratedItem[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingPipeline, setIsFetchingPipeline] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING_REVIEW');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isLocalHost, setIsLocalHost] = useState(true);

  // Messages
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Review & Edit Modal
  const [reviewItem, setReviewItem] = useState<CuratedItem | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sources Modal
  const [isSourcesModalOpen, setIsSourcesModalOpen] = useState(false);
  const [sources, setSources] = useState<NewsSourceItem[]>([]);
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [newSourceCategory, setNewSourceCategory] = useState('news');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      setIsLocalHost(host === 'localhost' || host === '127.0.0.1');
    }
  }, []);

  // Safe JSON extraction helper
  const safeExtractJson = async (res: Response) => {
    try {
      const text = await res.text();
      return text ? JSON.parse(text) : {};
    } catch {
      return {};
    }
  };

  // Load Queue
  const loadQueue = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (categoryFilter !== 'ALL') params.append('category', categoryFilter);
      if (search) params.append('q', search);

      const res = await adminClientFetch(`/api/admin/curator/queue?${params.toString()}`);
      if (res.ok) {
        const data = await safeExtractJson(res);
        if (data?.items) {
          setItems(data.items || []);
          if (data.stats) setStats(data.stats);
        }
      }
    } catch (err: any) {
      console.warn('Notice loading queue:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSources = async () => {
    try {
      const res = await adminClientFetch('/api/admin/curator/sources');
      if (res.ok) {
        const data = await safeExtractJson(res);
        setSources(data?.sources || []);
      }
    } catch (e) {
      console.warn('Notice loading sources:', e);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [statusFilter, categoryFilter]);

  // Run pipeline fetch
  const handleTriggerPipeline = async (autoPublish: boolean = false) => {
    setIsFetchingPipeline(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await adminClientFetch('/api/admin/curator/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoPublish }),
      });

      if (res.status === 405 || res.status === 404) {
        throw new Error(
          'Cloudflare Pages (Hosting Statis CDN): Perayapan berita internasional & penulisan database SQLite berjalan di server lokal Anda (http://localhost:3000/admin/news-curator) atau via GitHub Actions / perintah "npm run news:auto". Silakan gunakan server lokal Anda untuk auto-publish instan.'
        );
      }

      const data = await safeExtractJson(res);

      if (!res.ok) {
        throw new Error(data?.error || `Gagal memproses feed berita (HTTP ${res.status})`);
      }

      setSuccessMsg(data?.message || (autoPublish ? 'Berita teknologi global terbaru berhasil diambil, disintesis, dan dipublikasikan langsung ke web live!' : 'Berhasil memindai feed berita internasional dan menambahkannya ke antrean review!'));
      await loadQueue();
      await loadSources();
      setTimeout(() => setSuccessMsg(''), 6000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat memproses feed berita');
    } finally {
      setIsFetchingPipeline(false);
    }
  };

  // Open review modal
  const handleOpenReview = (item: CuratedItem) => {
    setReviewItem(item);
    setEditForm({
      generatedTitle: item.generatedTitle,
      generatedExcerpt: item.generatedExcerpt,
      generatedContent: item.generatedContent,
      generatedCategory: item.generatedCategory,
      generatedTags: item.generatedTags || '',
      seoTitle: item.seoTitle || '',
      seoDescription: item.seoDescription || '',
    });
  };

  // Approve item
  const handleApprove = async (id: number, publishNow: boolean = true) => {
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await adminClientFetch(`/api/admin/curator/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publishNow, ...editForm }),
      });

      if (res.status === 405 || res.status === 404) {
        throw new Error(
          'Hosting Statis CDN (Cloudflare Pages): Fitur persetujuan artikel memerlukan database lokal di http://localhost:3000/admin/news-curator.'
        );
      }

      const data = await safeExtractJson(res);
      if (!res.ok) {
        throw new Error(data?.error || `Gagal menyetujui artikel (HTTP ${res.status})`);
      }

      setSuccessMsg(data?.message || (publishNow ? 'Artikel berhasil disetujui dan dipublikasikan live!' : 'Artikel disimpan sebagai draf editorial.'));
      setReviewItem(null);
      await loadQueue();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saat menyetujui artikel');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reject item
  const handleReject = async (id: number) => {
    try {
      const res = await adminClientFetch(`/api/admin/curator/${id}/reject`, { method: 'POST' });
      if (res.status === 405 || res.status === 404) {
        throw new Error('Fitur ini memerlukan server lokal di http://localhost:3000/admin/news-curator.');
      }

      const data = await safeExtractJson(res);
      if (!res.ok) {
        throw new Error(data?.error || `Gagal menolak item (HTTP ${res.status})`);
      }

      setSuccessMsg('Item berhasil ditolak dan dihapus dari antrean intake.');
      if (reviewItem?.id === id) setReviewItem(null);
      await loadQueue();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e: any) {
      setErrorMsg(e.message || 'Terjadi kesalahan saat menolak item');
    }
  };

  // Add source
  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminClientFetch('/api/admin/curator/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSourceName,
          url: newSourceUrl,
          categoryHint: newSourceCategory,
        }),
      });

      if (res.status === 405 || res.status === 404) {
        throw new Error('Fitur ini memerlukan server lokal di http://localhost:3000/admin/news-curator.');
      }

      const data = await safeExtractJson(res);
      if (!res.ok) throw new Error(data?.error || 'Gagal menambahkan sumber');

      setNewSourceName('');
      setNewSourceUrl('');
      await loadSources();
      setSuccessMsg('Sumber berita baru berhasil didaftarkan!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e: any) {
      setErrorMsg(e.message || 'Error saat menambahkan sumber');
    }
  };

  const handleToggleSource = async (src: NewsSourceItem) => {
    try {
      await adminClientFetch(`/api/admin/curator/sources/${src.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !src.isActive }),
      });
      await loadSources();
    } catch (e) {}
  };

  // Parse helper for AI review arrays
  const parseJsonArray = (str: string | null) => {
    if (!str) return [];
    try {
      const parsed = JSON.parse(str);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  return (
    <div className="space-y-6">
      {/* Cloudflare Pages Static Notice on Live Domain */}
      {!isLocalHost && (
        <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-slate-800 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white flex-shrink-0 mt-0.5 shadow-sm">
              <Globe className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200">
                  Cloudflare Pages (Static CDN Mode)
                </span>
                <span className="text-xs text-slate-500 font-medium">Domain Publik: nusalensa.com</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                Domain live di-host sebagai Static CDN berkecepatan tinggi. Pipeline perayapan RSS GSMArena &amp; penulisan database otomatis bekerja melalui 2 opsi:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1 text-xs">
                <div className="p-3 rounded-xl bg-white border border-blue-100 shadow-2xs">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                    <Laptop className="w-4 h-4 text-blue-600" />
                    1. Admin Lokal (Instan &amp; Interaktif)
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Buka <a href="http://localhost:3000/admin/news-curator" target="_blank" rel="noreferrer" className="text-blue-600 font-bold underline">http://localhost:3000/admin/news-curator</a> di komputer Anda untuk klik tombol <strong>Auto-Publish Live</strong> secara langsung.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white border border-blue-100 shadow-2xs">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                    <Terminal className="w-4 h-4 text-emerald-600" />
                    2. CLI Terminal / Otomasi GitHub
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Jalankan <code className="px-1.5 py-0.5 bg-slate-100 text-slate-800 rounded font-mono font-semibold">npm run news:auto</code> di terminal, atau biarkan <strong>GitHub Actions Cron</strong> otomatis mengambil berita setiap 30 menit.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary-600" />
              Automated News Intake & AI Editorial Queue
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200">
              Human-in-the-Loop
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Global Tech Newsrooms (RSS/APIs) &rarr; Intake & Deduplication &rarr; AI Topic Classification & Outline &rarr; Editorial Review Queue &rarr; Published on NusaLensa.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* RSS Sources Modal Button */}
          <button
            onClick={() => {
              setIsSourcesModalOpen(true);
              loadSources();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs transition shadow-2xs"
          >
            <Rss className="w-4 h-4 text-slate-500" />
            Manage Sources ({sources.length || 7})
          </button>

          {/* Trigger Pipeline Button (To Review Queue) */}
          <button
            onClick={() => handleTriggerPipeline(false)}
            disabled={isFetchingPipeline}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-95"
            title="Fetch latest articles and stage them in the Review Queue for editorial check"
          >
            <RefreshCw className={`w-4 h-4 ${isFetchingPipeline ? 'animate-spin' : ''}`} />
            {isFetchingPipeline ? 'Processing...' : 'Fetch to Queue'}
          </button>

          {/* Instant Auto-Publish Live Button */}
          <button
            onClick={() => handleTriggerPipeline(true)}
            disabled={isFetchingPipeline}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-95 shadow-primary-500/20"
            title="Automatically fetch latest GSMArena & international tech stories and publish them live to Homepage & /news"
          >
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
            {isFetchingPipeline ? 'Publishing Live...' : 'Auto-Publish Live (Instant)'}
          </button>
        </div>
      </div>

      {/* Visual Pipeline Workflow Diagram */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl text-white shadow-sm overflow-x-auto">
        <div className="text-[11px] font-bold uppercase tracking-wider text-primary-300 mb-2.5 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          NusaLensa News Intake & Fact-Checking Architecture
        </div>

        <div className="flex items-center gap-2 text-xs min-w-[750px]">
          <div className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 font-semibold flex items-center gap-1">
            <Rss className="w-3.5 h-3.5 text-amber-400" />
            International Sources
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />

          <div className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 font-semibold flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            Intake Fetcher
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />

          <div className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Duplicate Detection
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />

          <div className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            AI Outline & Facts
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />

          <div className="px-3 py-1.5 rounded-lg bg-primary-500/30 border border-primary-400/50 font-bold text-primary-200 flex items-center gap-1 ring-1 ring-primary-400">
            <Eye className="w-3.5 h-3.5 text-primary-300" />
            EDITORIAL REVIEW QUEUE
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />

          <div className="px-3 py-1.5 rounded-lg bg-emerald-600/40 border border-emerald-400/50 font-black text-emerald-200 flex items-center gap-1">
            <Send className="w-3.5 h-3.5 text-emerald-300" />
            Published Live
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-500 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-rose-500 hover:text-rose-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats Counter */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => setStatusFilter('PENDING_REVIEW')}
          className={`p-4 rounded-2xl border text-left transition ${
            statusFilter === 'PENDING_REVIEW'
              ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/20'
              : 'bg-white border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">In Review Queue</span>
            <Eye className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{stats.pending}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Awaiting editorial sign-off</div>
        </button>

        <button
          onClick={() => setStatusFilter('APPROVED')}
          className={`p-4 rounded-2xl border text-left transition ${
            statusFilter === 'APPROVED'
              ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-400/20'
              : 'bg-white border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Approved / Published</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{stats.approved}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Live on NusaLensa</div>
        </button>

        <button
          onClick={() => setStatusFilter('REJECTED')}
          className={`p-4 rounded-2xl border text-left transition ${
            statusFilter === 'REJECTED'
              ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-400/20'
              : 'bg-white border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rejected</span>
            <XCircle className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{stats.rejected}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Dismissed by editors</div>
        </button>

        <button
          onClick={() => setStatusFilter('ALL')}
          className={`p-4 rounded-2xl border text-left transition ${
            statusFilter === 'ALL'
              ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-400/20'
              : 'bg-white border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Total Processed</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{stats.total}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">All ingested stories</div>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadQueue()}
            placeholder="Search headline or source..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="news">News</option>
            <option value="technology">Technology</option>
            <option value="reviews">Reviews</option>
            <option value="buying-guides">Buying Guides</option>
            <option value="how-to">How-To</option>
          </select>
        </div>
      </div>

      {/* Queue Items List */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="inline-block w-7 h-7 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-xs font-medium">Loading editorial review queue...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 space-y-3">
          <Sparkles className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
          <p className="font-bold text-slate-700 text-sm">No items in the review queue</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Click <strong>"Fetch Latest Tech Feeds"</strong> above to scan international publisher newsrooms and generate structured outlines for review.
          </p>
          <button
            onClick={() => handleTriggerPipeline(false)}
            disabled={isFetchingPipeline}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl transition inline-flex items-center gap-2 mt-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetchingPipeline ? 'animate-spin' : ''}`} />
            Scan Feeds Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition flex flex-col lg:flex-row gap-5 items-start"
            >
              {/* Thumbnail */}
              <div className="w-full lg:w-48 aspect-video lg:aspect-4/3 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 relative">
                {item.sourceImage ? (
                  <img
                    src={item.sourceImage}
                    alt={item.generatedTitle}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as any).src = 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <FileText className="w-8 h-8 stroke-1" />
                  </div>
                )}
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900/80 text-white uppercase backdrop-blur-xs">
                  {item.generatedCategory}
                </span>
              </div>

              {/* Center Content */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                    <Rss className="w-3 h-3 text-amber-500" />
                    {item.sourceName}
                  </span>

                  <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                    SEO Score: {item.seoScore}/100
                  </span>

                  {item.status === 'PENDING_REVIEW' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      In Review Queue
                    </span>
                  )}
                  {item.status === 'APPROVED' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Published Live
                    </span>
                  )}
                  {item.status === 'REJECTED' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                      Rejected
                    </span>
                  )}

                  <span className="text-[11px] text-slate-400">
                    {new Date(item.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* Generated Title */}
                <h3 className="font-black text-slate-900 text-sm sm:text-base leading-snug line-clamp-2">
                  {item.generatedTitle}
                </h3>

                {/* Original Source Reference */}
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <span className="text-slate-400">Source:</span>
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary-600 hover:underline truncate max-w-xs sm:max-w-md inline-flex items-center gap-0.5"
                  >
                    <span>{item.sourceTitle}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                </div>

                {/* Excerpt */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {item.generatedExcerpt}
                </p>

                {/* Tags */}
                {item.generatedTags && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.generatedTags.split(',').slice(0, 4).map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium">
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons Column */}
              <div className="w-full lg:w-44 flex flex-col gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 flex-shrink-0">
                {item.status === 'PENDING_REVIEW' ? (
                  <>
                    <button
                      onClick={() => handleOpenReview(item)}
                      className="w-full py-2.5 px-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Review & Approve
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleApprove(item.id, false)}
                        title="Save as draft in catalog"
                        className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition text-center"
                      >
                        Save Draft
                      </button>
                      <button
                        onClick={() => handleReject(item.id)}
                        title="Reject this item"
                        className="py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[11px] font-semibold transition"
                      >
                        Reject
                      </button>
                    </div>
                  </>
                ) : item.status === 'APPROVED' ? (
                  <div className="space-y-2">
                    <span className="w-full py-2 px-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      Published
                    </span>
                    <button
                      onClick={() => handleOpenReview(item)}
                      className="w-full py-1.5 px-3 text-slate-500 hover:text-slate-800 text-xs font-medium text-center"
                    >
                      View Details
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <span className="w-full py-1.5 px-3 bg-slate-100 text-slate-500 rounded-xl text-xs font-medium text-center block">
                      Rejected
                    </span>
                    <button
                      onClick={() => handleApprove(item.id, true)}
                      className="w-full py-1.5 px-3 text-primary-600 hover:text-primary-700 text-xs font-bold text-center"
                    >
                      Restore & Publish
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review & Edit Modal (HUMAN-IN-THE-LOOP EDITORIAL APPROVAL) */}
      {reviewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Editorial Review & AI Fact-Checking Assistant
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-50 text-primary-700">
                  SEO: {reviewItem.seoScore}/100
                </span>
              </div>
              <button
                onClick={() => setReviewItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Source Info & AI Assistants */}
              <div className="space-y-4">
                {/* Source Attribution Box */}
                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                    <Rss className="w-4 h-4 text-amber-500" />
                    Original Source Intake
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase">Outlet & URL:</label>
                    <div className="font-semibold text-slate-900 text-xs mt-0.5">{reviewItem.sourceName}</div>
                    <a
                      href={reviewItem.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-primary-600 hover:underline truncate block mt-0.5 font-mono"
                    >
                      {reviewItem.sourceUrl}
                    </a>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase">Original Headline:</label>
                    <p className="text-xs font-bold text-slate-800 mt-0.5 leading-snug">
                      {reviewItem.sourceTitle}
                    </p>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase">Source Raw Summary:</label>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                      {reviewItem.sourceSummary || 'No summary text provided by feed.'}
                    </p>
                  </div>

                  {reviewItem.sourceImage && (
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase">Source Image:</label>
                      <div className="aspect-video bg-slate-200 rounded-xl overflow-hidden mt-1 border border-slate-200">
                        <img src={reviewItem.sourceImage} alt="" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Headline Suggestions */}
                {reviewItem.headlineSuggestions && (
                  <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 space-y-2">
                    <div className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      Headline Suggestions
                    </div>
                    <div className="space-y-1.5">
                      {parseJsonArray(reviewItem.headlineSuggestions).map((head: string, idx: number) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setEditForm({ ...editForm, generatedTitle: head })}
                          className="w-full text-left text-xs text-slate-800 hover:text-primary-700 bg-white p-2 rounded-lg border border-amber-200/60 hover:border-primary-400 transition"
                        >
                          &ldquo;{head}&rdquo;
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Fact-Checking Checklist */}
                {reviewItem.factCheckChecklist && (
                  <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80 space-y-2">
                    <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                      <ListChecks className="w-4 h-4 text-emerald-600" />
                      Fact-Checking Checklist
                    </div>
                    <ul className="space-y-1 text-xs text-slate-700">
                      {parseJsonArray(reviewItem.factCheckChecklist).map((checkItem: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span>{checkItem}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Right Column: AI Generated Draft & SEO Editable Fields */}
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-primary-700 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <FileText className="w-4 h-4 text-primary-600" />
                  Editorial Draft & Markdown Output
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Article Title (H1)</label>
                  <input
                    type="text"
                    value={editForm.generatedTitle || ''}
                    onChange={(e) => setEditForm({ ...editForm, generatedTitle: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Category</label>
                    <select
                      value={editForm.generatedCategory || 'news'}
                      onChange={(e) => setEditForm({ ...editForm, generatedCategory: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none"
                    >
                      <option value="news">News</option>
                      <option value="technology">Technology</option>
                      <option value="reviews">Reviews</option>
                      <option value="buying-guides">Buying Guides</option>
                      <option value="how-to">How-To</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Tags (Comma-Separated)</label>
                    <input
                      type="text"
                      value={editForm.generatedTags || ''}
                      onChange={(e) => setEditForm({ ...editForm, generatedTags: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Editorial Excerpt / Lead</label>
                  <textarea
                    rows={2}
                    value={editForm.generatedExcerpt || ''}
                    onChange={(e) => setEditForm({ ...editForm, generatedExcerpt: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Article Content (Markdown)</label>
                  <textarea
                    rows={12}
                    value={editForm.generatedContent || ''}
                    onChange={(e) => setEditForm({ ...editForm, generatedContent: e.target.value })}
                    className="w-full p-3 text-xs font-mono border border-slate-300 rounded-xl focus:outline-none resize-y"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <button
                type="button"
                onClick={() => handleReject(reviewItem.id)}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800"
              >
                Reject & Dismiss
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleApprove(reviewItem.id, false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition"
                >
                  Save as Draft
                </button>

                <button
                  type="button"
                  onClick={() => handleApprove(reviewItem.id, true)}
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 rounded-xl transition shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Publishing...' : 'Approve & Publish Live'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manage Sources Modal */}
      {isSourcesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Rss className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-slate-900 text-sm">International Tech News Sources (RSS & Newsrooms)</h3>
              </div>
              <button
                onClick={() => setIsSourcesModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Add Source Form */}
              <form onSubmit={handleAddSource} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-primary-600" />
                  Register New Feed Source
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    value={newSourceName}
                    onChange={(e) => setNewSourceName(e.target.value)}
                    placeholder="Source Name (e.g. 9to5Google)"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none"
                  />
                  <select
                    value={newSourceCategory}
                    onChange={(e) => setNewSourceCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none"
                  >
                    <option value="news">News</option>
                    <option value="technology">Technology</option>
                    <option value="reviews">Reviews</option>
                    <option value="buying-guides">Buying Guides</option>
                    <option value="how-to">How-To</option>
                  </select>
                </div>

                <input
                  type="url"
                  required
                  value={newSourceUrl}
                  onChange={(e) => setNewSourceUrl(e.target.value)}
                  placeholder="https://feed.domain.com/rss.xml"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono focus:outline-none"
                />

                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl transition shadow-2xs"
                >
                  Add News Feed
                </button>
              </form>

              {/* Sources List */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Active International Feeds ({sources.length})
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                  {sources.map((src) => (
                    <div key={src.id} className="p-3.5 bg-white hover:bg-slate-50 transition flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>{src.name}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-mono">
                            {src.categoryHint}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono truncate max-w-sm">
                          {src.url}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Total ingested: {src.fetchCount} articles
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleSource(src)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                          src.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {src.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
