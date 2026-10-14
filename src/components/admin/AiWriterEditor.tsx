'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  Smartphone,
  Monitor,
  Link as LinkIcon,
  Search,
  BookOpen,
  Sliders,
  RefreshCw,
  Zap,
  ExternalLink,
  ShieldCheck,
  CheckSquare,
  Square,
  HelpCircle,
  ArrowRight,
  Plus,
  Trash2,
  Copy,
  FileText,
} from 'lucide-react';
import { countWords } from '@/lib/aiWriter/wordCounter';
import { adminClientFetch } from '@/lib/clientAuthFetch';

interface EditorProps {
  initialJob: any;
  onBackToGenerator: () => void;
}

export function AiWriterEditor({ initialJob, onBackToGenerator }: EditorProps) {
  // Core article state
  const [title, setTitle] = useState(initialJob?.generatedTitle || initialJob?.article?.title || '');
  const [slug, setSlug] = useState(initialJob?.generatedSlug || initialJob?.article?.slug || '');
  const [content, setContent] = useState(initialJob?.generatedContent || initialJob?.article?.content || '');
  const [excerpt, setExcerpt] = useState(initialJob?.generatedExcerpt || initialJob?.article?.excerpt || '');
  const [featuredImage, setFeaturedImage] = useState(initialJob?.article?.featuredImage || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80');
  const [imageAltText, setImageAltText] = useState(initialJob?.article?.imageAltText || '');

  // SEO State
  const [seoTitle, setSeoTitle] = useState(initialJob?.article?.seoTitle || title);
  const [seoDescription, setSeoDescription] = useState(initialJob?.article?.seoDescription || excerpt);

  // Status & Metadata
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>(initialJob?.article?.status || 'DRAFT');
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(initialJob?.article?.categoryId || 1);

  // Tabs & Views
  const [activeTab, setActiveTab] = useState<'editor' | 'desktop-preview' | 'mobile-preview' | 'seo-tools'>('editor');

  // Section AI Modifiers
  const [selectedText, setSelectedText] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Internal Links Picker
  const [internalLinks, setInternalLinks] = useState<any[]>([]);
  const [isLinkPickerOpen, setIsLinkPickerOpen] = useState(false);

  // Supporting Elements
  const headlineOptions: string[] = initialJob?.headlineOptionsJson ? JSON.parse(initialJob.headlineOptionsJson) : [];
  const imagePrompt = initialJob?.imagePromptJson ? JSON.parse(initialJob.imagePromptJson) : null;
  const researchSources = initialJob?.researchSourcesJson ? JSON.parse(initialJob.researchSourcesJson) : [];
  const factCheckList = initialJob?.factCheckListJson ? JSON.parse(initialJob.factCheckListJson) : [];
  const faqs = initialJob?.faqJson ? JSON.parse(initialJob.faqJson) : [];

  // Editorial Checklist
  const [checklist, setChecklist] = useState({
    factsChecked: true,
    sourcesReviewed: true,
    wordCountVerified: countWords(content) >= 1200,
    headlineReviewed: true,
    seoMetadataChecked: true,
    internalLinksChecked: true,
    imagesAuthorized: true,
    articlePreviewReviewed: false,
  });

  // Save feedback
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Word count dynamic computation
  const currentWordCount = countWords(content);
  const targetWords = initialJob?.targetWordCount || 1500;
  const meetsMinimum = currentWordCount >= 1200;

  // Load categories and internal links on mount
  useEffect(() => {
    adminClientFetch('/api/admin/categories')
      .then((r) => r.ok && r.json())
      .then((data) => {
        if (data?.categories) setCategories(data.categories);
      })
      .catch(() => {});

    adminClientFetch('/api/admin/ai-writer/internal-links')
      .then((r) => r.ok && r.json())
      .then((data) => {
        if (data?.links) setInternalLinks(data.links);
      })
      .catch(() => {});
  }, []);

  // Update checklist word count verification when content changes
  useEffect(() => {
    setChecklist((prev) => ({
      ...prev,
      wordCountVerified: currentWordCount >= 1200,
    }));
  }, [currentWordCount]);

  // Handle Save (Draft or Published)
  const handleSave = async (publishNow = false) => {
    setIsSaving(true);
    setSaveMsg('');
    setErrorMsg('');

    try {
      const res = await adminClientFetch('/api/admin/ai-writer/save-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: initialJob?.id,
          articleId: initialJob?.articleId || initialJob?.article?.id,
          title,
          slug,
          content,
          excerpt,
          featuredImage,
          imageAltText,
          seoTitle,
          seoDescription,
          status: publishNow ? 'PUBLISHED' : 'DRAFT',
          categoryId: selectedCategoryId,
          checklist,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save article.');

      setStatus(publishNow ? 'PUBLISHED' : 'DRAFT');
      setSaveMsg(publishNow ? '🎉 Article successfully published live on NusaLensa!' : '✓ Article saved as draft.');
      setTimeout(() => setSaveMsg(''), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  // Section AI Modifiers (Expand, Shorten, Rewrite, Grammar, etc.)
  const handleSectionAction = async (actionType: any) => {
    if (!selectedText.trim() && actionType !== 'REGENERATE_SEO') {
      alert('Please select or highlight text in the article body first to apply this section AI action.');
      return;
    }

    setIsProcessingAction(true);
    setActionSuccessMsg('');

    try {
      const res = await adminClientFetch('/api/admin/ai-writer/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType,
          text: selectedText,
          contextTitle: title,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');

      if (actionType === 'REGENERATE_SEO' && data.seoResult) {
        if (data.seoResult.seoTitle) setSeoTitle(data.seoResult.seoTitle);
        if (data.seoResult.seoDescription) setSeoDescription(data.seoResult.seoDescription);
        setActionSuccessMsg('SEO Title & Description regenerated!');
      } else if (data.resultText) {
        // Replace selected text in content
        if (content.includes(selectedText)) {
          setContent(content.replace(selectedText, data.resultText));
          setActionSuccessMsg(`Section ${actionType.toLowerCase()} completed successfully!`);
          setSelectedText('');
        } else {
          // If not an exact substring, append or offer
          setContent(`${content}\n\n${data.resultText}`);
          setActionSuccessMsg(`Generated content appended to article body!`);
        }
      }
      setTimeout(() => setActionSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(`Action error: ${err.message}`);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Insert internal link into markdown
  const handleInsertLink = (linkItem: any) => {
    const markdownLink = `[${linkItem.title}](${linkItem.url})`;
    setContent((prev: string) => `${prev} ${markdownLink} `);
    setIsLinkPickerOpen(false);
    setActionSuccessMsg(`Inserted internal link to "${linkItem.title}"`);
    setTimeout(() => setActionSuccessMsg(''), 3000);
  };

  const toggleChecklistItem = (key: keyof typeof checklist) => {
    setChecklist({ ...checklist, [key]: !checklist[key] });
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onBackToGenerator}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 transition"
          >
            &larr; Back to Generator
          </button>

          <span className="h-4 w-px bg-slate-200" />

          {/* Word Count Badge */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${
            meetsMinimum ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            <span>Verified Word Count:</span>
            <span className="font-mono">{currentWordCount.toLocaleString()}</span>
            <span>/ {targetWords.toLocaleString()} words</span>
            {meetsMinimum ? '✓' : '(Under 1,200 min)'}
          </div>

          {/* Status Badge */}
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
            status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }`}>
            {status}
          </span>
        </div>

        {/* View Mode Tabs & Save Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs">
            <button
              onClick={() => { setActiveTab('editor'); }}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'editor' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Editor
            </button>
            <button
              onClick={() => {
                setActiveTab('desktop-preview');
                setChecklist((p) => ({ ...p, articlePreviewReviewed: true }));
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'desktop-preview' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              Desktop
            </button>
            <button
              onClick={() => {
                setActiveTab('mobile-preview');
                setChecklist((p) => ({ ...p, articlePreviewReviewed: true }));
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'mobile-preview' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Mobile
            </button>
            <button
              onClick={() => setActiveTab('seo-tools')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'seo-tools' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              SEO & Specs
            </button>
          </div>

          {/* Save Draft Button */}
          <button
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            <Save className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
            <span>Save Draft</span>
          </button>

          {/* Publish Button */}
          <button
            onClick={() => {
              if (confirm('Publish this article live to NusaLensa.com now? It will immediately appear on the homepage and news feed.')) {
                handleSave(true);
              }
            }}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-xs transition"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>Publish Article</span>
          </button>
        </div>
      </div>

      {saveMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveMsg}</span>
        </div>
      )}

      {actionSuccessMsg && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Main Workspace Layout */}
      {activeTab === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 Cols): Article Headline, AI Modifiers Toolbar & Body */}
          <div className="lg:col-span-2 space-y-4">
            {/* Title & Slug */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Article Headline (H1)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-lg font-black text-slate-900 border-b border-slate-200 pb-2 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-mono">Slug:</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="flex-1 font-mono text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-200 text-xs"
                />
              </div>
            </div>

            {/* AI Section Modifiers Toolbar */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-3 text-white shadow-xs flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <Sparkles className="w-4 h-4" />
                <span>Section AI Assist:</span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSectionAction('EXPAND')}
                  disabled={isProcessingAction}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition"
                  title="Expand highlighted section with more specs & context"
                >
                  Expand
                </button>
                <button
                  type="button"
                  onClick={() => handleSectionAction('SHORTEN')}
                  disabled={isProcessingAction}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition"
                  title="Condense highlighted section"
                >
                  Shorten
                </button>
                <button
                  type="button"
                  onClick={() => handleSectionAction('REWRITE')}
                  disabled={isProcessingAction}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition"
                  title="Rewrite paragraph in professional tone"
                >
                  Rewrite
                </button>
                <button
                  type="button"
                  onClick={() => handleSectionAction('IMPROVE_READABILITY')}
                  disabled={isProcessingAction}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition"
                  title="Improve sentence structure and flow"
                >
                  Readability
                </button>
                <button
                  type="button"
                  onClick={() => handleSectionAction('CHECK_GRAMMAR')}
                  disabled={isProcessingAction}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition"
                  title="Correct grammar and spelling"
                >
                  Grammar
                </button>
                <button
                  type="button"
                  onClick={() => setIsLinkPickerOpen(true)}
                  className="px-2.5 py-1 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-bold transition flex items-center gap-1"
                >
                  <LinkIcon className="w-3 h-3" />
                  + Internal Link
                </button>
              </div>
            </div>

            {/* Smart Internal Link Picker Modal */}
            {isLinkPickerOpen && (
              <div className="p-4 bg-slate-50 border border-brand-300 rounded-2xl space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-brand-600" />
                    Insert Verified Internal Link from Database
                  </span>
                  <button
                    onClick={() => setIsLinkPickerOpen(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    Close
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {internalLinks.map((linkItem) => (
                    <button
                      key={linkItem.id}
                      type="button"
                      onClick={() => handleInsertLink(linkItem)}
                      className="w-full text-left p-2 rounded-lg bg-white hover:bg-brand-50 border border-slate-200 hover:border-brand-300 transition flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-slate-800">{linkItem.title}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-500 font-mono px-2 py-0.5 rounded">
                        {linkItem.type}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Markdown Body Textarea */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Article Body (Markdown Format)
                </label>
                <span className="text-[11px] font-mono text-slate-400">
                  Highlight text to use Section AI actions above
                </span>
              </div>
              <textarea
                rows={28}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onSelect={(e: any) => {
                  const sel = e.target.value.substring(e.target.selectionStart, e.target.selectionEnd);
                  if (sel && sel.length > 5) setSelectedText(sel);
                }}
                className="w-full font-mono text-xs text-slate-800 leading-relaxed border border-slate-200 rounded-xl p-4 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Right Column (1 Col): Pre-Publication Checklist & Metadata */}
          <div className="space-y-5">
            {/* Editorial Checklist (Mandatory for publication) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Editorial Quality Checklist
              </h3>
              <p className="text-[11px] text-slate-500">
                Confirm editorial review steps before publishing:
              </p>

              <div className="space-y-2 text-xs">
                {[
                  { key: 'factsChecked', label: '1. Facts & claims verified against primary sources' },
                  { key: 'sourcesReviewed', label: '2. Source citations confirmed & documented' },
                  { key: 'wordCountVerified', label: `3. Word count requirement satisfied (${currentWordCount} words)` },
                  { key: 'headlineReviewed', label: '4. Headline reviewed for accuracy & zero clickbait' },
                  { key: 'seoMetadataChecked', label: '5. SEO meta title & description checked' },
                  { key: 'internalLinksChecked', label: '6. Verified internal links inserted' },
                  { key: 'imagesAuthorized', label: '7. Featured image concept authorized' },
                  { key: 'articlePreviewReviewed', label: '8. Desktop & Mobile preview reviewed' },
                ].map(({ key, label }) => {
                  const checked = (checklist as any)[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleChecklistItem(key as any)}
                      className={`w-full text-left p-2 rounded-xl border flex items-start gap-2.5 transition ${
                        checked ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      {checked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                      )}
                      <span className="text-[11px] leading-tight">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category & Featured Image */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Primary Category
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Featured Image URL
                </label>
                <input
                  type="url"
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                />
                <input
                  type="text"
                  placeholder="Image Alt Text (SEO)"
                  value={imageAltText}
                  onChange={(e) => setImageAltText(e.target.value)}
                  className="w-full mt-2 px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              {featuredImage && (
                <div className="rounded-xl overflow-hidden border border-slate-200">
                  <img src={featuredImage} alt="Preview" className="w-full h-32 object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Preview Tab */}
      {activeTab === 'desktop-preview' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm max-w-4xl mx-auto space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="px-2.5 py-1 bg-brand-50 text-brand-700 text-xs font-bold rounded-lg uppercase">
              DESKTOP PREVIEW
            </span>
            <h1 className="text-3xl font-black text-slate-900 mt-3 tracking-tight">
              {title}
            </h1>
            <p className="text-sm text-slate-500 mt-2 italic">
              {excerpt}
            </p>
          </div>

          {featuredImage && (
            <div className="rounded-2xl overflow-hidden">
              <img src={featuredImage} alt={imageAltText || title} className="w-full h-80 object-cover" />
            </div>
          )}

          <div className="prose prose-slate max-w-none text-sm leading-relaxed whitespace-pre-line font-sans">
            {content}
          </div>
        </div>
      )}

      {/* Mobile Preview Tab (Smartphone Mockup) */}
      {activeTab === 'mobile-preview' && (
        <div className="flex justify-center p-4">
          <div className="w-[375px] min-h-[667px] bg-white rounded-[40px] border-[10px] border-slate-900 shadow-2xl p-4 overflow-y-auto space-y-4">
            <div className="w-32 h-4 bg-slate-900 rounded-full mx-auto mb-2" />
            <h1 className="text-lg font-black text-slate-900 leading-snug">
              {title}
            </h1>
            {featuredImage && (
              <img src={featuredImage} alt="Mobile preview" className="w-full h-40 object-cover rounded-xl" />
            )}
            <p className="text-xs text-slate-500 italic">
              {excerpt}
            </p>
            <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-line border-t border-slate-100 pt-3">
              {content}
            </div>
          </div>
        </div>
      )}

      {/* SEO & Supporting Elements Tab */}
      {activeTab === 'seo-tools' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SEO Metadata Editor */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Search className="w-4 h-4 text-brand-600" />
                Google Search Snippet Preview
              </h3>
              <button
                type="button"
                onClick={() => handleSectionAction('REGENERATE_SEO')}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Regenerate SEO
              </button>
            </div>

            {/* Google SERP Preview Card */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
              <div className="text-xs text-slate-500 font-mono">https://nusalensa.com &rsaquo; {slug}</div>
              <div className="text-base font-semibold text-blue-700 hover:underline cursor-pointer">
                {seoTitle || title}
              </div>
              <div className="text-xs text-slate-600 leading-relaxed">
                {seoDescription || excerpt}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                SEO Meta Title (50-60 characters)
              </label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Meta Description (140-155 characters)
              </label>
              <textarea
                rows={3}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
          </div>

          {/* Alternative Headlines & Image Prompts */}
          <div className="space-y-6">
            {/* Alternative Headlines */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Alternative Headline Suggestions
              </h3>
              <div className="space-y-2">
                {headlineOptions.map((h, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-slate-800">{h}</span>
                    <button
                      type="button"
                      onClick={() => setTitle(h)}
                      className="text-[11px] font-bold text-brand-600 hover:text-brand-700 px-2 py-1 bg-white rounded border border-slate-200 shadow-2xs"
                    >
                      Use Headline
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Image Concept & Prompt */}
            {imagePrompt && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2 text-xs">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                  Featured Image Generation Concept
                </h3>
                <p className="text-slate-600 font-medium">{imagePrompt.concept}</p>
                <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] leading-relaxed">
                  {imagePrompt.generationPrompt}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

