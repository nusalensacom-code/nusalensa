'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  Globe,
  Users,
  Target,
  FileText,
  Sliders,
  Link as LinkIcon,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Info,
  Zap,
} from 'lucide-react';
import { ArticleType, TargetAudience, TargetMarket, WritingTone, ResearchMode } from '@/lib/aiWriter/types';
import { adminClientFetch } from '@/lib/clientAuthFetch';

interface GeneratorFormProps {
  onJobStarted: (jobId: number) => void;
  providerStatus: {
    configured: boolean;
    provider: string;
    model: string;
    message: string;
  };
}

export function AiWriterGeneratorForm({ onJobStarted, providerStatus }: GeneratorFormProps) {
  const [primaryKeyword, setPrimaryKeyword] = useState('');
  const [articleType, setArticleType] = useState<ArticleType>('BUYING_GUIDE');
  const [targetAudience, setTargetAudience] = useState<TargetAudience>('General Consumers');
  const [targetMarket, setTargetMarket] = useState<TargetMarket>('Global');
  const [secondaryKeywordsInput, setSecondaryKeywordsInput] = useState('');
  const [targetWordCount, setTargetWordCount] = useState<number>(1500);
  const [writingTone, setWritingTone] = useState<WritingTone>('Professional');
  const [researchMode, setResearchMode] = useState<ResearchMode>('AI_KNOWLEDGE');
  const [referenceUrls, setReferenceUrls] = useState<string[]>(['']);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAddUrl = () => {
    if (referenceUrls.length < 5) {
      setReferenceUrls([...referenceUrls, '']);
    }
  };

  const handleUrlChange = (index: number, val: string) => {
    const updated = [...referenceUrls];
    updated[index] = val;
    setReferenceUrls(updated);
  };

  const handleRemoveUrl = (index: number) => {
    const updated = referenceUrls.filter((_, i) => i !== index);
    setReferenceUrls(updated.length > 0 ? updated : ['']);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!primaryKeyword.trim()) {
      setErrorMsg('Please enter a Primary Keyword.');
      return;
    }

    if (targetWordCount < 1200) {
      setErrorMsg('Minimum target word count must be at least 1,200 words.');
      return;
    }

    setIsSubmitting(true);

    try {
      const secondaryKeywords = secondaryKeywordsInput
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);

      const validUrls = referenceUrls.map((u) => u.trim()).filter((u) => u.startsWith('http'));

      const res = await adminClientFetch('/api/admin/ai-writer/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primaryKeyword: primaryKeyword.trim(),
          articleType,
          targetAudience,
          targetMarket,
          secondaryKeywords,
          targetWordCount,
          writingTone,
          researchMode,
          referenceUrls: validUrls,
        }),
      });

      if (res.status === 405) {
        throw new Error(
          'Cloudflare Pages runs in Static Hosting mode. To generate new articles with AI and save to database, please use the local admin dashboard at http://localhost:3000/admin/ai-writer'
        );
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to start generation job');
      }

      onJobStarted(data.jobId);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while initiating generation.');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Provider Connectivity Status Banner */}
      <div className={`p-4 rounded-2xl border text-xs flex items-start justify-between gap-3 ${
        providerStatus.configured
          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
          : 'bg-amber-50 border-amber-200 text-amber-800'
      }`}>
        <div className="flex items-start gap-2.5">
          {providerStatus.configured ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <div className="font-bold flex items-center gap-1.5">
              <span>AI Provider Status:</span>
              <span className="uppercase font-black px-1.5 py-0.5 bg-white/70 rounded border text-[10px]">
                {providerStatus.provider} ({providerStatus.model})
              </span>
            </div>
            <p className="mt-0.5 text-slate-600 leading-relaxed">
              {providerStatus.message}
            </p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid of Main Inputs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        {/* Primary Keyword */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            1. Primary Keyword <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={primaryKeyword}
              onChange={(e) => setPrimaryKeyword(e.target.value)}
              placeholder="e.g. Best smartphones under $500 in 2026 or Samsung Galaxy S25 vs iPhone 16"
              className="w-full pl-4 pr-10 py-3 text-sm font-semibold rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-slate-900 transition"
            />
            <Target className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            The core search query or hardware topic this article should rank for.
          </p>
        </div>

        {/* 2-Column Row: Article Type & Target Market */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              2. Article Type <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={articleType}
                onChange={(e) => setArticleType(e.target.value as ArticleType)}
                className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-slate-800 transition"
              >
                <option value="BUYING_GUIDE">Buying Guide (Picks, criteria & budget)</option>
                <option value="REVIEW">Smartphone Review (Hardware, camera & verdict)</option>
                <option value="COMPARISON">Smartphone Comparison (Head-to-head spec shootout)</option>
                <option value="HOW_TO">How-To Tutorial (Prerequisites & step-by-step)</option>
                <option value="NEWS">News Article (5W+1H, verified announcements)</option>
                <option value="EXPLAINER">Technology Explainer (Silicon & architecture breakdown)</option>
                <option value="LISTICLE">Listicle (Ranked compilation)</option>
                <option value="EVERGREEN">Evergreen SEO Article (Comprehensive reference)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              3. Target Market <span className="text-red-500">*</span>
            </label>
            <select
              value={targetMarket}
              onChange={(e) => setTargetMarket(e.target.value as TargetMarket)}
              className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-slate-800 transition"
            >
              <option value="Global">Global (Multi-currency USD, EUR, GBP, AUD)</option>
              <option value="United States">United States (USD $ / FCC specs)</option>
              <option value="United Kingdom">United Kingdom (GBP £ / VAT inclusive)</option>
              <option value="Canada">Canada (CAD $ / Canadian carriers)</option>
              <option value="Australia">Australia (AUD $ / ACMA bands)</option>
            </select>
          </div>
        </div>

        {/* 2-Column Row: Target Audience & Writing Tone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              4. Target Audience <span className="text-red-500">*</span>
            </label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value as TargetAudience)}
              className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-slate-800 transition"
            >
              <option value="General Consumers">General Consumers (Clear, accessible language)</option>
              <option value="Smartphone Enthusiasts">Smartphone Enthusiasts (Silicon, display PWM, sensor specs)</option>
              <option value="Tech Beginners">Tech Beginners (Jargon-free, foundational explainers)</option>
              <option value="Professional Users">Professional Users (Enterprise security, productivity)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              5. Writing Tone <span className="text-red-500">*</span>
            </label>
            <select
              value={writingTone}
              onChange={(e) => setWritingTone(e.target.value as WritingTone)}
              className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-slate-800 transition"
            >
              <option value="Professional">Professional (Neutral, evidence-based tech journalism)</option>
              <option value="Informative">Informative (Educational, balanced and thorough)</option>
              <option value="Conversational">Conversational (Engaging, direct reader dialogue)</option>
              <option value="Analytical">Analytical (Benchmark-focused, critical hardware analysis)</option>
            </select>
          </div>
        </div>

        {/* Target Word Count Slider & Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <span>6. Target Word Count (Excluding Metadata)</span>
              <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                Min: 1,200 words
              </span>
            </label>
            <span className="text-sm font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
              {targetWordCount.toLocaleString()} words
            </span>
          </div>
          <input
            type="range"
            min={1200}
            max={4000}
            step={100}
            value={targetWordCount}
            onChange={(e) => setTargetWordCount(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>1,200 words (Minimum)</span>
            <span>1,500 words (Default Standard)</span>
            <span>2,500 words (Deep Dive)</span>
            <span>4,000 words (Pillar Guide)</span>
          </div>
        </div>

        {/* Secondary Keywords */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            7. Secondary Keywords (Optional)
          </label>
          <input
            type="text"
            value={secondaryKeywordsInput}
            onChange={(e) => setSecondaryKeywordsInput(e.target.value)}
            placeholder="e.g. camera performance, battery life, snapdragon benchmarks (comma-separated)"
            className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-slate-900 transition"
          />
        </div>

        {/* Research Mode & Reference URLs */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              8. Research Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className={`p-3 rounded-xl border text-xs font-semibold cursor-pointer flex items-center gap-2.5 transition ${
                researchMode === 'AI_KNOWLEDGE' ? 'border-brand-500 bg-brand-50/50 text-brand-900 ring-1 ring-brand-500' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}>
                <input
                  type="radio"
                  name="researchMode"
                  value="AI_KNOWLEDGE"
                  checked={researchMode === 'AI_KNOWLEDGE'}
                  onChange={() => setResearchMode('AI_KNOWLEDGE')}
                  className="sr-only"
                />
                <Sparkles className="w-4 h-4 text-brand-600 flex-shrink-0" />
                <div>
                  <div className="font-bold">AI Knowledge</div>
                  <div className="text-[10px] text-slate-500 font-normal">Internal intelligence & DB</div>
                </div>
              </label>

              <label className={`p-3 rounded-xl border text-xs font-semibold cursor-pointer flex items-center gap-2.5 transition ${
                researchMode === 'WEB_RESEARCH' ? 'border-brand-500 bg-brand-50/50 text-brand-900 ring-1 ring-brand-500' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}>
                <input
                  type="radio"
                  name="researchMode"
                  value="WEB_RESEARCH"
                  checked={researchMode === 'WEB_RESEARCH'}
                  onChange={() => setResearchMode('WEB_RESEARCH')}
                  className="sr-only"
                />
                <Globe className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <div>
                  <div className="font-bold">Web Research</div>
                  <div className="text-[10px] text-slate-500 font-normal">Live research & feeds</div>
                </div>
              </label>

              <label className={`p-3 rounded-xl border text-xs font-semibold cursor-pointer flex items-center gap-2.5 transition ${
                researchMode === 'OFFICIAL_SOURCES' ? 'border-brand-500 bg-brand-50/50 text-brand-900 ring-1 ring-brand-500' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}>
                <input
                  type="radio"
                  name="researchMode"
                  value="OFFICIAL_SOURCES"
                  checked={researchMode === 'OFFICIAL_SOURCES'}
                  onChange={() => setResearchMode('OFFICIAL_SOURCES')}
                  className="sr-only"
                />
                <Zap className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <div>
                  <div className="font-bold">Official Sources</div>
                  <div className="text-[10px] text-slate-500 font-normal">Manufacturer specs first</div>
                </div>
              </label>
            </div>
          </div>

          {/* Reference URLs */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                9. Optional Reference URLs (Official pages, whitepapers, press releases)
              </label>
              {referenceUrls.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddUrl}
                  className="text-[11px] font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add URL
                </button>
              )}
            </div>

            <div className="space-y-2">
              {referenceUrls.map((url, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => handleUrlChange(idx, e.target.value)}
                      placeholder="https://www.apple.com/iphone-16-pro/specs/ or official documentation"
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    />
                    <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                  {referenceUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveUrl(idx)}
                      className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 transition"
                      title="Remove URL"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Protected by NusaLensa SSRF defense layer (Internal networks and loopbacks strictly disallowed).
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
          >
            <Sparkles className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
            <span>{isSubmitting ? 'Initiating Generation...' : 'Generate Article'}</span>
          </button>
        </div>
      </div>
    </form>
  );
}

