'use client';

import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { adminClientFetch } from '@/lib/clientAuthFetch';
import { getClientJob } from '@/lib/aiWriter/clientGenerator';

interface JobProgressProps {
  jobId: number;
  initialJob?: any;
  onJobCompleted: (job: any) => void;
  onRetry: () => void;
}

export function AiWriterJobProgress({ jobId, initialJob, onJobCompleted, onRetry }: JobProgressProps) {
  const [job, setJob] = useState<any>(initialJob || null);
  const [error, setError] = useState('');

  useEffect(() => {
    let intervalId: any;
    let isMounted = true;

    // Check if initialJob is already completed
    if (initialJob && initialJob.status === 'COMPLETED') {
      setJob(initialJob);
      const timer = setTimeout(() => {
        if (isMounted) onJobCompleted(initialJob);
      }, 700);
      return () => clearTimeout(timer);
    }

    const fetchStatus = async () => {
      // 1. Check client-side generated jobs in localStorage
      const localJob = getClientJob(jobId);
      if (localJob) {
        if (!isMounted) return;
        setJob(localJob);
        if (localJob.status === 'COMPLETED') {
          clearInterval(intervalId);
          setTimeout(() => {
            if (isMounted) onJobCompleted(localJob);
          }, 600);
          return;
        } else if (localJob.status === 'FAILED') {
          clearInterval(intervalId);
          setError('Generation failed.');
          return;
        }
      }

      // 2. Poll server if available
      try {
        const res = await adminClientFetch(`/api/admin/ai-writer/jobs/${jobId}`);
        if (!res.ok) {
          if (localJob) return; // If localJob exists, do not error out
          throw new Error('Failed to retrieve job status');
        }

        const data = await res.json();
        if (!isMounted) return;

        if (data?.job) {
          setJob(data.job);

          if (data.job.status === 'COMPLETED') {
            clearInterval(intervalId);
            setTimeout(() => {
              if (isMounted) onJobCompleted(data.job);
            }, 800);
          } else if (data.job.status === 'FAILED') {
            clearInterval(intervalId);
            setError(data.job.errorMessage || 'Generation failed.');
          }
        }
      } catch (err: any) {
        if (!localJob && isMounted) {
          setError(err.message || 'Error communicating with generation engine');
        }
      }
    };

    fetchStatus();
    intervalId = setInterval(fetchStatus, 1500);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [jobId, initialJob, onJobCompleted]);

  const steps = [
    { name: 'Intent Analysis', icon: Search, pct: 15 },
    { name: 'Fact Collection', icon: ShieldCheck, pct: 30 },
    { name: 'Outline Synthesis', icon: Layers, pct: 45 },
    { name: 'Deep Drafting', icon: FileText, pct: 70 },
    { name: 'Word Count Validation', icon: Cpu, pct: 85 },
    { name: 'SEO & Ready', icon: CheckCircle2, pct: 100 },
  ];

  const currentPercent = job?.progressPercent || 10;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-600 animate-pulse" />
              Generating In-Depth Article
            </h2>
            <span className="text-[10px] font-bold bg-brand-50 text-brand-700 px-2.5 py-0.5 rounded-full border border-brand-200 uppercase tracking-wider">
              {job?.status || 'INITIALIZING'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Topic: <strong className="text-slate-800">{job?.primaryKeyword || 'Loading...'}</strong> | Target: {job?.targetWordCount || 1500} words | Market: {job?.targetMarket || 'Global'}
          </p>
        </div>

        <div className="text-right">
          <span className="text-2xl font-black text-brand-600 font-mono">
            {currentPercent}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
          <div
            className="h-full bg-gradient-to-r from-brand-600 via-indigo-600 to-emerald-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${currentPercent}%` }}
          />
        </div>
        <p className="text-xs font-semibold text-slate-700 mt-2 flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5 text-brand-600 animate-spin" />
          <span>{job?.currentStep || 'Initializing journalistic pipeline...'}</span>
        </p>
      </div>

      {/* Visual Step Workflow Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2">
        {steps.map((st, i) => {
          const Icon = st.icon;
          const isDone = currentPercent >= st.pct;
          const isCurrent = currentPercent >= (st.pct - 15) && currentPercent < st.pct;

          return (
            <div
              key={i}
              className={`p-3 rounded-xl border text-center transition ${
                isDone
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                  : isCurrent
                  ? 'bg-brand-50 border-brand-300 text-brand-900 ring-2 ring-brand-500/20'
                  : 'bg-slate-50/60 border-slate-200/60 text-slate-400'
              }`}
            >
              <div className="flex justify-center mb-1.5">
                <Icon className={`w-4 h-4 ${isDone ? 'text-emerald-600' : isCurrent ? 'text-brand-600 animate-bounce' : 'text-slate-400'}`} />
              </div>
              <div className="text-[11px] font-bold leading-tight">{st.name}</div>
            </div>
          );
        })}
      </div>

      {/* Error state if failed */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
          <button
            onClick={onRetry}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition text-xs"
          >
            Retry Generation
          </button>
        </div>
      )}
    </div>
  );
}

