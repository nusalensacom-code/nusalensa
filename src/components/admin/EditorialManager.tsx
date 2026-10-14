'use client';

import React, { useState, useEffect } from 'react';
import {
  FileEdit,
  Save,
  CheckCircle2,
  AlertTriangle,
  X,
  ShieldCheck,
  RotateCcw,
  BookOpen,
  FileText,
  AlertOctagon,
} from 'lucide-react';

export default function EditorialManager() {
  const [activeTab, setActiveTab] = useState<'policy_editorial' | 'policy_correction' | 'policy_factcheck' | 'policy_disclaimer'>('policy_editorial');
  const [policies, setPolicies] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadPolicies = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/editorial');
      if (!res.ok) throw new Error('Failed to load editorial policies');
      const data = await res.json();
      setPolicies(data.policies || {});
    } catch (e: any) {
      setErrorMsg(e.message || 'System error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/editorial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policies),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save policies');

      setSuccessMsg('Editorial standards and policy guidelines saved successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to save policies');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { key: 'policy_editorial', label: 'Editorial Policy', icon: BookOpen, desc: 'Independence, benchmark methodology, and reporting standards.' },
    { key: 'policy_correction', label: 'Corrections Policy', icon: RotateCcw, desc: 'Errata workflow, spec updates, and transparent revisions.' },
    { key: 'policy_factcheck', label: 'Fact-Checking Guidelines', icon: ShieldCheck, desc: 'Primary source verification and hardware benchmark rigor.' },
    { key: 'policy_disclaimer', label: 'Disclaimers & Disclosures', icon: AlertOctagon, desc: 'Affiliate links, sponsored testing, and commercial independence.' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Editorial Standards & Guidelines</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200">
              E-E-A-T Standards
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Maintain international journalistic transparency and compliance required by Google Search and Google News.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving || isLoading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition active:scale-95 self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save All Policies'}
        </button>
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

      {/* Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-1.5 bg-slate-100 rounded-2xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`p-3 rounded-xl text-left transition flex flex-col gap-1 ${
                isActive ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:bg-white/50'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold">
                <Icon className={`w-4 h-4 ${isActive ? 'text-primary-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </div>
              <span className="text-[10px] text-slate-400 line-clamp-1">{tab.desc}</span>
            </button>
          );
        })}
      </div>

      {/* Editor Content Area */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {tabs.find((t) => t.key === activeTab)?.label}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Supports standard Markdown formatting (# Heading, - List, **Bold**, etc.).
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Setting Key: {activeTab}
          </span>
        </div>

        <textarea
          rows={16}
          value={policies[activeTab] || ''}
          onChange={(e) => setPolicies({ ...policies, [activeTab]: e.target.value })}
          placeholder="Draft or update policy content here..."
          className="w-full p-4 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition leading-relaxed resize-y"
        />

        <div className="flex items-center justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 rounded-xl transition shadow-xs"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
