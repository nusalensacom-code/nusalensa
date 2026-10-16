'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Layers,
  History,
  FileText,
  Clock,
  ArrowRight,
  ExternalLink,
  Trash2,
  Cpu,
  RefreshCw,
  Plus,
  Zap,
} from 'lucide-react';
import { AiWriterGeneratorForm } from '@/components/admin/AiWriterGeneratorForm';
import { AiWriterJobProgress } from '@/components/admin/AiWriterJobProgress';
import { AiWriterEditor } from '@/components/admin/AiWriterEditor';
import { adminClientFetch } from '@/lib/clientAuthFetch';

export default function AiWriterPage() {
  const [viewState, setViewState] = useState<'form' | 'progress' | 'editor'>('form');
  const [activeJobId, setActiveJobId] = useState<number | null>(null);
  const [activeJobData, setActiveJobData] = useState<any>(null);

  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isLocalHost, setIsLocalHost] = useState(true);

  const [providerStatus, setProviderStatus] = useState({
    configured: false,
    provider: 'Built-in Synthesizer',
    model: '1,200+ Word Technical Engine',
    message: 'Checking AI provider status...',
  });

  const loadProviderStatus = async () => {
    try {
      const res = await adminClientFetch('/api/admin/ai-writer/status');
      if (res.ok) {
        const data = await res.json();
        if (data?.status) setProviderStatus(data.status);
      } else {
        setProviderStatus({
          configured: false,
          provider: 'Built-in Synthesizer',
          model: '1,200+ Word Technical Engine',
          message: 'Synthesizer teknis bawaan siap digunakan (Gratis tanpa kuota API key). Masukkan GEMINI_API_KEY atau OPENAI_API_KEY di .env jika ingin menggunakan LLM eksternal.',
        });
      }
    } catch (e) {
      setProviderStatus({
        configured: false,
        provider: 'Built-in Synthesizer',
        model: '1,200+ Word Technical Engine',
        message: 'Synthesizer teknis bawaan siap digunakan di server studio lokal komputer Anda (port 3000).',
      });
    }
  };

  const loadRecentJobs = async () => {
    try {
      setIsLoadingJobs(true);
      const res = await adminClientFetch('/api/admin/ai-writer/jobs');
      if (res.ok) {
        const data = await res.json();
        if (data?.jobs) setRecentJobs(data.jobs);
      }
    } catch (e) {} finally {
      setIsLoadingJobs(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      setIsLocalHost(host === 'localhost' || host === '127.0.0.1');
    }
    loadProviderStatus();
    loadRecentJobs();
  }, []);

  const handleJobStarted = (jobId: number) => {
    setActiveJobId(jobId);
    setViewState('progress');
  };

  const handleJobCompleted = (job: any) => {
    setActiveJobData(job);
    setViewState('editor');
    loadRecentJobs();
  };

  const handleOpenExistingJob = async (jobId: number) => {
    try {
      const res = await adminClientFetch(`/api/admin/ai-writer/jobs/${jobId}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.job) {
          setActiveJobId(jobId);
          setActiveJobData(data.job);
          setViewState('editor');
        }
      }
    } catch (e) {
      alert('Failed to load job details');
    }
  };

  const handleDeleteJob = async (jobId: number) => {
    if (!confirm('Are you sure you want to delete this generation job record?')) return;
    try {
      await adminClientFetch(`/api/admin/ai-writer/jobs/${jobId}`, { method: 'DELETE' });
      await loadRecentJobs();
    } catch (e) {}
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-brand-600" />
              AI Article Generator
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
              1,200+ Word Enforcement
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative, SEO-optimized technology articles with server-side word count validation, real DB internal links, and publication safeguards.
          </p>
        </div>

        {viewState !== 'form' && (
          <button
            onClick={() => {
              setViewState('form');
              setActiveJobId(null);
              setActiveJobData(null);
              loadRecentJobs();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Article Generator</span>
          </button>
        )}
      </div>

      {/* View 1: Generator Form & Recent Jobs */}
      {viewState === 'form' && (
        <div className="space-y-8">
          <AiWriterGeneratorForm
            onJobStarted={handleJobStarted}
            providerStatus={providerStatus}
            isLocalHost={isLocalHost}
          />

          {/* Recent Generation Jobs History */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-slate-500" />
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                  Recent Generation Jobs
                </h2>
              </div>
              <button
                onClick={loadRecentJobs}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
            </div>

            {isLoadingJobs ? (
              <div className="text-center py-8 text-xs text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-500" />
                Loading generation history...
              </div>
            ) : recentJobs.length === 0 ? (
              <div className="text-center py-8 px-4 text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2.5">
                <p className="font-medium text-slate-600">
                  {isLocalHost
                    ? 'Belum ada artikel yang di-generate. Isi formulir di atas untuk generate artikel teknologi 1.200+ kata pertama Anda!'
                    : 'Riwayat artikel & draf tersimpan di database lokal komputer Anda.'}
                </p>
                {!isLocalHost && (
                  <div>
                    <a
                      href="http://localhost:3000/admin/ai-writer"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition shadow-xs text-xs"
                    >
                      <span>Buka Riwayat di Server Lokal (http://localhost:3000)</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                      <th className="pb-3 pl-1">Primary Keyword</th>
                      <th className="pb-3">Type</th>
                      <th className="pb-3">Market</th>
                      <th className="pb-3">Word Count</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Created</th>
                      <th className="pb-3 text-right pr-1">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentJobs.map((j) => (
                      <tr key={j.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 pl-1 font-bold text-slate-900">
                          {j.primaryKeyword}
                        </td>
                        <td className="py-3 text-slate-600 font-medium">
                          {j.articleType.replace('_', ' ')}
                        </td>
                        <td className="py-3 text-slate-600 font-medium">
                          {j.targetMarket}
                        </td>
                        <td className="py-3 font-mono font-semibold text-slate-700">
                          {j.actualWordCount ? `${j.actualWordCount} words` : `Target: ${j.targetWordCount}`}
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            j.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : j.status === 'FAILED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-brand-100 text-brand-800'
                          }`}>
                            {j.status}
                          </span>
                        </td>
                        <td className="py-3 text-slate-400 font-mono text-[11px]">
                          {new Date(j.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 text-right pr-1 space-x-2">
                          <button
                            onClick={() => handleOpenExistingJob(j.id)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 rounded-lg font-bold text-slate-700 transition"
                          >
                            Open Editor
                          </button>
                          <button
                            onClick={() => handleDeleteJob(j.id)}
                            className="p-1 text-slate-400 hover:text-red-500 rounded transition"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* View 2: Progress Tracker */}
      {viewState === 'progress' && activeJobId && (
        <AiWriterJobProgress
          jobId={activeJobId}
          onJobCompleted={handleJobCompleted}
          onRetry={() => setViewState('form')}
        />
      )}

      {/* View 3: Full Article Editor */}
      {viewState === 'editor' && activeJobData && (
        <AiWriterEditor
          initialJob={activeJobData}
          onBackToGenerator={() => {
            setViewState('form');
            loadRecentJobs();
          }}
        />
      )}
    </div>
  );
}

