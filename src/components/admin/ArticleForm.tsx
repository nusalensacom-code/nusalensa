'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { slugify, calculateReadingTime } from '@/lib/utils';
import { siteConfig } from '@/lib/siteConfig';
import { getMatchedEditorialImage } from '@/lib/aiWriter/imageMatcher';
import {
  Save,
  Globe,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowLeft,
  Plus,
  Trash2,
  ShieldCheck,
  BookOpen,
  Image as ImageIcon,
  Sparkles,
  Layers,
  FileCheck,
  Eye,
} from 'lucide-react';

interface Subcategory {
  id: number;
  name: string;
  slug?: string;
}

interface Category {
  id: number;
  name: string;
  slug?: string;
  children?: Subcategory[];
}

interface Author {
  id: number;
  name: string;
  role?: string;
}

interface Tag {
  id: number;
  name: string;
  slug?: string;
  isTopic?: boolean;
}

interface ArticleMinimal {
  id: number;
  title: string;
}

interface ArticleFormProps {
  initialData?: any;
  categories: Category[];
  authors: Author[];
  tags: Tag[];
  existingArticles?: ArticleMinimal[];
  isEdit?: boolean;
}

export function ArticleForm({
  initialData,
  categories,
  authors,
  tags,
  existingArticles = [],
  isEdit = false,
}: ArticleFormProps) {
  const router = useRouter();

  // Basic Information
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [autoSlug, setAutoSlug] = useState(!isEdit);
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [content, setContent] = useState(initialData?.content || '');

  // Taxonomy & Classification
  const [categoryId, setCategoryId] = useState<number>(initialData?.categoryId || categories[0]?.id || 1);
  const [subcategoryId, setSubcategoryId] = useState<number | ''>(initialData?.subcategoryId || '');
  const [primaryTopicId, setPrimaryTopicId] = useState<number | ''>(initialData?.primaryTopicId || '');
  const [articleType, setArticleType] = useState<string>(initialData?.articleType || 'NEWS');

  // Staff (Author & Editor Separation)
  const [authorId, setAuthorId] = useState<number>(initialData?.authorId || authors[0]?.id || 1);
  const [editorId, setEditorId] = useState<number | ''>(initialData?.editorId || (authors[1]?.id || ''));

  // Image SEO
  const defaultMatchedImg = getMatchedEditorialImage(initialData?.title || 'Technology', initialData?.articleType || 'NEWS');
  const [featuredImage, setFeaturedImage] = useState(
    initialData?.featuredImage || defaultMatchedImg.url
  );
  const [imageAltText, setImageAltText] = useState(initialData?.imageAltText || '');
  const [imageCaption, setImageCaption] = useState(initialData?.imageCaption || '');
  const [imageSource, setImageSource] = useState(initialData?.imageSource || '');

  // Status & Flags
  const [status, setStatus] = useState(initialData?.status || 'PUBLISHED');
  const [isFeatured, setIsFeatured] = useState(Boolean(initialData?.isFeatured));
  const [isTrending, setIsTrending] = useState(Boolean(initialData?.isTrending));

  // SEO Fields
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || '');
  const [canonicalUrl, setCanonicalUrl] = useState(initialData?.canonicalUrl || '');

  // Tags & Topic Clusters
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(
    initialData?.tags?.map((t: any) => t.id) || []
  );

  // Sources & References (JSON Array)
  const [sources, setSources] = useState<Array<{ name: string; url: string; accessDate: string; notes: string }>>(() => {
    if (initialData?.sources) {
      try {
        return JSON.parse(initialData.sources);
      } catch (e) {}
    }
    return [];
  });

  // FAQs (JSON Array)
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>(() => {
    if (initialData?.faqs) {
      try {
        return JSON.parse(initialData.faqs);
      } catch (e) {}
    }
    return [];
  });

  // Manual Related Articles Override (JSON Array of IDs)
  const [manualRelatedIds, setManualRelatedIds] = useState<number[]>(() => {
    if (initialData?.manualRelatedIds) {
      try {
        return JSON.parse(initialData.manualRelatedIds);
      } catch (e) {}
    }
    return [];
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [scheduledAt, setScheduledAt] = useState<string>(
    initialData?.publishedAt
      ? new Date(initialData.publishedAt).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );
  const [timezone, setTimezone] = useState('UTC');

  // Insert formatting snippet into content textarea
  const insertFormatting = (snippet: string) => {
    const textarea = document.getElementById('article-content-textarea') as HTMLTextAreaElement | null;
    if (!textarea) {
      setContent((prev: string) => prev + snippet);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selection = content.substring(start, end);
    let replacement = snippet;
    if (snippet === '**') replacement = `**${selection || 'bold text'}**`;
    else if (snippet === '*') replacement = `*${selection || 'italic text'}*`;
    else if (snippet === '<u></u>') replacement = `<u>${selection || 'underline text'}</u>`;

    const newText = content.substring(0, start) + replacement + content.substring(end);
    setContent(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 10);
  };

  // Autosave Draft to localStorage
  useEffect(() => {
    if (!title && !content) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          `draft_article_${isEdit ? initialData?.id : 'new'}`,
          JSON.stringify({ title, slug, excerpt, content, timestamp: new Date().toISOString() })
        );
        const now = new Date();
        setLastSaved(
          `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
        );
      } catch (e) {}
    }, 4000);
    return () => clearTimeout(timer);
  }, [title, slug, excerpt, content, isEdit, initialData?.id]);

  // Auto-slug sync
  useEffect(() => {
    if (autoSlug && title) {
      setSlug(slugify(title));
    }
  }, [title, autoSlug]);

  const activeCategory = categories.find((c) => c.id === categoryId);
  const availableSubcategories = activeCategory?.children || [];

  const effectiveSeoTitle = seoTitle || (title ? `${title} | ${siteConfig.name}` : `Article Title | ${siteConfig.name}`);
  const effectiveSeoDesc = seoDescription || excerpt || `In-depth reporting, reviews, and technology analysis from ${siteConfig.name}.`;
  const readingTime = calculateReadingTime(content);
  const wordCount = content.split(/\s+/).filter(Boolean).length;

  // Real SEO Score & Checklist Evaluation
  const seoChecklist = useMemo(() => {
    return [
      { id: 'title', label: 'Informative H1 Title (min. 20 chars)', passed: title.trim().length >= 20, points: 10 },
      { id: 'seoTitle', label: 'SEO Title optimized', passed: effectiveSeoTitle.length >= 25, points: 10 },
      { id: 'metaDesc', label: 'Compelling Meta Description (min. 50 chars)', passed: effectiveSeoDesc.length >= 50, points: 10 },
      { id: 'slug', label: 'Clean & semantic URL slug', passed: Boolean(slug && slug.length >= 5), points: 5 },
      { id: 'image', label: 'Featured image provided', passed: Boolean(featuredImage), points: 10 },
      { id: 'imageAlt', label: 'Image Alt text filled (Image SEO)', passed: Boolean(imageAltText.trim()), points: 10 },
      { id: 'author', label: 'Accredited journalist author selected', passed: Boolean(authorId), points: 5 },
      { id: 'editor', label: 'Reviewing editor assigned', passed: Boolean(editorId), points: 5 },
      { id: 'category', label: 'Primary category designated', passed: Boolean(categoryId), points: 5 },
      { id: 'primaryTopic', label: 'Primary topic hub assigned', passed: Boolean(primaryTopicId), points: 5 },
      { id: 'tags', label: 'At least 1 related tag attached', passed: selectedTagIds.length >= 1, points: 5 },
      { id: 'contentLength', label: 'Substantive article length (min. 150 words)', passed: wordCount >= 150, points: 5 },
      { id: 'sources', label: 'Verified primary data sources cited', passed: sources.length >= 1, points: 10 },
      { id: 'articleType', label: 'Article format aligns with editorial standards', passed: Boolean(articleType), points: 5 },
    ];
  }, [
    title,
    effectiveSeoTitle,
    effectiveSeoDesc,
    slug,
    featuredImage,
    imageAltText,
    authorId,
    editorId,
    categoryId,
    primaryTopicId,
    selectedTagIds,
    wordCount,
    sources,
    articleType,
  ]);

  const seoScore = useMemo(() => {
    return seoChecklist.reduce((acc, item) => acc + (item.passed ? item.points : 0), 0);
  }, [seoChecklist]);

  // Handlers for Sources
  const addSource = () => {
    setSources([
      ...sources,
      {
        name: '',
        url: '',
        accessDate: new Date().toISOString().split('T')[0],
        notes: '',
      },
    ]);
  };

  const updateSource = (idx: number, field: string, val: string) => {
    const updated = [...sources];
    updated[idx] = { ...updated[idx], [field]: val };
    setSources(updated);
  };

  const removeSource = (idx: number) => {
    setSources(sources.filter((_, i) => i !== idx));
  };

  // Handlers for FAQs
  const addFaq = () => {
    setFaqs([...faqs, { question: '', answer: '' }]);
  };

  const updateFaq = (idx: number, field: 'question' | 'answer', val: string) => {
    const updated = [...faqs];
    updated[idx] = { ...updated[idx], [field]: val };
    setFaqs(updated);
  };

  const removeFaq = (idx: number) => {
    setFaqs(faqs.filter((_, i) => i !== idx));
  };

  // Handlers for Tags & Manual Related
  const toggleTag = (id: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleManualRelated = (artId: number) => {
    setManualRelatedIds((prev) =>
      prev.includes(artId) ? prev.filter((i) => i !== artId) : [...prev, artId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      setMessage({ type: 'error', text: 'Title and content are required.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    const payload = {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      imageAltText: imageAltText || title,
      imageCaption: imageCaption || null,
      imageSource: imageSource || null,
      categoryId,
      subcategoryId: subcategoryId ? Number(subcategoryId) : null,
      authorId,
      editorId: editorId ? Number(editorId) : null,
      primaryTopicId: primaryTopicId ? Number(primaryTopicId) : null,
      articleType,
      status,
      publishedAt: status === 'SCHEDULED' ? new Date(scheduledAt).toISOString() : undefined,
      isFeatured,
      isTrending,
      isNews: articleType === 'NEWS',
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
      canonicalUrl: canonicalUrl || null,
      sources: sources.filter((s) => s.name && s.url),
      faqs: faqs.filter((f) => f.question && f.answer),
      manualRelatedIds,
      tagIds: selectedTagIds,
    };

    try {
      const url = isEdit ? `/api/articles/${initialData.id}` : '/api/articles';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (res.ok) {
        setMessage({
          type: 'success',
          text: isEdit ? 'Article updated successfully.' : 'New article created and published!',
        });
        if (!isEdit) {
          setTimeout(() => {
            router.push('/admin/articles');
          }, 1000);
        }
      } else {
        setMessage({ type: 'error', text: resData.error || 'Failed to save article.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Server network error occurred.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/articles"
            className="p-2 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {isEdit ? 'Edit Article & SEO Validation' : 'Write Article & SEO Validation'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              SEO Readiness Score: <strong className={seoScore >= 80 ? 'text-emerald-600' : 'text-amber-600'}>{seoScore}/100</strong> • {wordCount} words • {readingTime} min read
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isEdit && initialData?.id && (
            <Link
              href={`/admin/articles/${initialData.id}/preview`}
              target="_blank"
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center space-x-1.5"
            >
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </Link>
          )}
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Publish Article'}</span>
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl flex items-center text-xs ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* SEO Score Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-brand-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Editorial SEO Scorecard (Standards & Best Practices)
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-32 bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all ${
                  seoScore >= 80 ? 'bg-emerald-500' : seoScore >= 60 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${seoScore}%` }}
              />
            </div>
            <span className="text-xs font-bold text-slate-700">{seoScore}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          {seoChecklist.map((c) => (
            <div key={c.id} className="flex items-center space-x-1.5 text-slate-600">
              {c.passed ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
              )}
              <span className={`truncate ${c.passed ? 'font-medium text-slate-800' : 'text-slate-400'}`}>
                {c.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Editor Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Article Title (H1) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter specific, accurate, and informative article title..."
              required
              className="w-full px-4 py-3 text-lg font-bold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
            />
          </div>

          {/* Slug */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                SEO Canonical Slug:
              </label>
              <label className="text-[11px] text-slate-500 flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSlug}
                  onChange={(e) => setAutoSlug(e.target.checked)}
                  className="mr-1.5 rounded text-brand-600"
                />
                Auto-sync from title
              </label>
            </div>
            <div className="flex items-center text-xs text-slate-500 font-mono bg-white px-3 py-2 rounded-lg border border-slate-300">
              <span className="text-slate-400 select-none">/category/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setAutoSlug(false);
                  setSlug(e.target.value);
                }}
                required
                className="w-full bg-transparent focus:outline-none text-slate-900 font-mono"
              />
            </div>
          </div>

          {/* Excerpt / Dek */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Dek Summary / Lead Paragraph <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief summary of article essence for readers and search snippets..."
              required
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition leading-relaxed"
            />
          </div>

          {/* Content (Rich Formatting Toolbar & Editor) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center space-x-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Article Content (Rich Formatting & Markdown) <span className="text-red-500">*</span>
                </label>
                {lastSaved && (
                  <span className="text-[10px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ✓ Auto-saved: {lastSaved}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {wordCount} words • {readingTime} min read
              </span>
            </div>

            {/* Formatting Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border border-slate-300 rounded-t-xl border-b-0 text-xs select-none">
              <button
                type="button"
                onClick={() => insertFormatting('\n\n## Subheading H2\n')}
                className="px-2 py-1 bg-white hover:bg-slate-200 border border-slate-200 rounded font-bold text-slate-800 text-[11px]"
                title="Heading 2"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('\n\n### Subheading H3\n')}
                className="px-2 py-1 bg-white hover:bg-slate-200 border border-slate-200 rounded font-bold text-slate-800 text-[11px]"
                title="Heading 3"
              >
                H3
              </button>
              <span className="w-px h-4 bg-slate-300 mx-0.5" />
              <button
                type="button"
                onClick={() => insertFormatting('**')}
                className="px-2 py-1 bg-white hover:bg-slate-200 border border-slate-200 rounded font-black text-slate-800 text-[11px]"
                title="Bold"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('*')}
                className="px-2 py-1 bg-white hover:bg-slate-200 border border-slate-200 rounded italic font-serif text-slate-800 text-[11px]"
                title="Italic"
              >
                I
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('<u></u>')}
                className="px-2 py-1 bg-white hover:bg-slate-200 border border-slate-200 rounded underline text-slate-800 text-[11px]"
                title="Underline"
              >
                U
              </button>
              <span className="w-px h-4 bg-slate-300 mx-0.5" />
              <button
                type="button"
                onClick={() => insertFormatting('\n> Key editorial quote...\n')}
                className="px-2 py-1 bg-white hover:bg-slate-200 border border-slate-200 rounded text-slate-700 text-[11px]"
                title="Blockquote"
              >
                &ldquo; Quote
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('\n1. First step\n2. Second step\n')}
                className="px-2 py-1 bg-white hover:bg-slate-200 border border-slate-200 rounded text-slate-700 text-[11px]"
                title="Ordered List"
              >
                1. 2. 3.
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('\n- Bullet point one\n- Bullet point two\n')}
                className="px-2 py-1 bg-white hover:bg-slate-200 border border-slate-200 rounded text-slate-700 text-[11px]"
                title="Bullet List"
              >
                • Bullet
              </button>
              <span className="w-px h-4 bg-slate-300 mx-0.5" />
              <button
                type="button"
                onClick={() => insertFormatting('[Link Text](https://example.com)')}
                className="px-2 py-1 bg-white hover:bg-slate-200 border border-slate-200 rounded text-slate-700 text-[11px]"
                title="Link"
              >
                🔗 Link
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('![Image Description](https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80)')}
                className="px-2 py-1 bg-white hover:bg-slate-200 border border-slate-200 rounded text-slate-700 text-[11px]"
                title="Image"
              >
                🖼️ Image
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('\n| Feature | Specification |\n|---|---|\n| Chipset | Snapdragon 8 Elite |\n')}
                className="px-2 py-1 bg-white hover:bg-slate-200 border border-slate-200 rounded text-slate-700 text-[11px]"
                title="Table"
              >
                📊 Table
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('\n```javascript\n// Code snippet here\n```\n')}
                className="px-2 py-1 bg-white hover:bg-slate-200 border border-slate-200 rounded font-mono text-slate-700 text-[11px]"
                title="Code Block"
              >
                {'</>'} Code
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('\nhttps://www.youtube.com/watch?v=dQw4w9WgXcQ\n')}
                className="px-2 py-1 bg-white hover:bg-slate-200 border border-slate-200 rounded text-red-600 font-bold text-[11px]"
                title="YouTube Embed"
              >
                ▶ YouTube
              </button>
            </div>

            <textarea
              id="article-content-textarea"
              rows={16}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write full article markdown content here... Use formatting buttons above."
              required
              className="w-full px-4 py-3 font-mono text-sm bg-white border border-slate-300 rounded-b-xl rounded-t-none focus:outline-none focus:ring-2 focus:ring-brand-500 transition leading-relaxed"
            />
          </div>

          {/* Sources & References Editor */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-brand-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Verified Sources & References (Trust & Citation)
                </h3>
              </div>
              <button
                type="button"
                onClick={addSource}
                className="inline-flex items-center px-2.5 py-1 bg-white hover:bg-brand-50 border border-slate-200 rounded-lg text-xs font-semibold text-brand-700 transition"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Source
              </button>
            </div>

            {sources.length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                No sources added yet. Click above to cite manufacturer spec sheets, whitepapers, or benchmarks.
              </p>
            ) : (
              <div className="space-y-3">
                {sources.map((src, idx) => (
                  <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 relative">
                    <button
                      type="button"
                      onClick={() => removeSource(idx)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-red-600"
                      title="Remove Source"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-6">
                      <input
                        type="text"
                        placeholder="Source / Publisher (e.g. Apple Newsroom, Qualcomm)"
                        value={src.name}
                        onChange={(e) => updateSource(idx, 'name', e.target.value)}
                        className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                      />
                      <input
                        type="url"
                        placeholder="https://..."
                        value={src.url}
                        onChange={(e) => updateSource(idx, 'url', e.target.value)}
                        className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={src.accessDate}
                        onChange={(e) => updateSource(idx, 'accessDate', e.target.value)}
                        className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-600"
                      />
                      <input
                        type="text"
                        placeholder="Citation notes (optional)"
                        value={src.notes}
                        onChange={(e) => updateSource(idx, 'notes', e.target.value)}
                        className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FAQ Editor */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-brand-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Frequently Asked Questions (FAQ & Schema)
                </h3>
              </div>
              <button
                type="button"
                onClick={addFaq}
                className="inline-flex items-center px-2.5 py-1 bg-white hover:bg-brand-50 border border-slate-200 rounded-lg text-xs font-semibold text-brand-700 transition"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add FAQ
              </button>
            </div>

            {faqs.length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                No FAQs added. Add questions and concise answers for reader clarity and FAQPage rich snippets.
              </p>
            ) : (
              <div className="space-y-3">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 relative">
                    <button
                      type="button"
                      onClick={() => removeFaq(idx)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-red-600"
                      title="Remove FAQ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="pr-6">
                      <input
                        type="text"
                        placeholder="FAQ Question..."
                        value={faq.question}
                        onChange={(e) => updateFaq(idx, 'question', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-bold"
                      />
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Concise, direct answer..."
                      value={faq.answer}
                      onChange={(e) => updateFaq(idx, 'answer', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Google SERP Preview & SEO Configuration */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
              <Globe className="w-4 h-4 text-brand-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Google SERP Snippet Preview
              </h3>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs">
              <p className="text-[11px] text-emerald-800 font-mono truncate">
                https://nusalensa.com/{activeCategory?.slug || 'news'}/{slug || 'article-slug'}
              </p>
              <h4 className="text-base font-semibold text-[#1a0dab] hover:underline cursor-pointer truncate mt-0.5">
                {effectiveSeoTitle}
              </h4>
              <p className="text-slate-600 text-xs mt-1 line-clamp-2 leading-relaxed">
                {effectiveSeoDesc}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Custom SEO Title (Fallback to H1)
                </label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder={`e.g. Snapdragon 8 Elite Benchmarks & Analysis | ${siteConfig.name}`}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Custom Meta Description
                </label>
                <textarea
                  rows={2}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Summary snippet displayed in search results..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Custom Canonical URL (Optional)
                </label>
                <input
                  type="url"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  placeholder="https://nusalensa.com/..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Status & Article Type */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2">
              Status & Format
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Article Format (Schema Directive)
              </label>
              <select
                value={articleType}
                onChange={(e) => setArticleType(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold text-slate-800"
              >
                <option value="NEWS">NEWS (NewsArticle Schema)</option>
                <option value="EVERGREEN">EVERGREEN (Article Schema)</option>
                <option value="GUIDE">GUIDE (Practical Guide)</option>
                <option value="TUTORIAL">TUTORIAL (Step-by-Step)</option>
                <option value="OPINION">OPINION (Analysis & Column)</option>
                <option value="LISTICLE">LISTICLE (Curated List)</option>
                <option value="EXPLAINER">EXPLAINER (Deep Dive Explainer)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Editorial Publication Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
              >
                <option value="PUBLISHED">PUBLISHED (Live Public)</option>
                <option value="IN_REVIEW">IN_REVIEW (Editorial Review)</option>
                <option value="DRAFT">DRAFT (Draft Concept)</option>
                <option value="SCHEDULED">SCHEDULED (Scheduled)</option>
                <option value="ARCHIVED">ARCHIVED (Archived)</option>
              </select>
            </div>

            {status === 'SCHEDULED' && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-2 text-xs">
                <label className="block font-bold text-purple-900">
                  Scheduled Publication Timestamp
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  required
                  className="w-full px-2.5 py-1.5 bg-white border border-purple-300 rounded-lg text-purple-950 font-mono text-xs focus:ring-2 focus:ring-purple-500"
                />
                <div className="flex items-center justify-between text-[11px] text-purple-700">
                  <span>Timezone:</span>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="bg-white border border-purple-300 rounded px-1.5 py-0.5 text-[11px]"
                  >
                    <option value="UTC">UTC (Universal)</option>
                    <option value="EST">EST (US / New York)</option>
                    <option value="PST">PST (US / California)</option>
                    <option value="GMT">GMT (London)</option>
                    <option value="AEST">AEST (Sydney)</option>
                  </select>
                </div>
              </div>
            )}

            <div className="space-y-2 pt-2 border-t border-slate-200">
              <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                <span className="font-semibold">Hero Featured Story</span>
              </label>

              <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTrending}
                  onChange={(e) => setIsTrending(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500"
                />
                <span className="font-semibold">Trending Ticker Flag</span>
              </label>
            </div>
          </div>

          {/* Taxonomy & Subcategories */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2">
              Taxonomy & Topic Hub
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Category <span className="text-red-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(Number(e.target.value));
                  setSubcategoryId('');
                }}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {availableSubcategories.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subcategory (Optional)
                </label>
                <select
                  value={subcategoryId}
                  onChange={(e) => setSubcategoryId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700"
                >
                  <option value="">— No Subcategory —</option>
                  {availableSubcategories.map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      {sc.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Topic Hub
              </label>
              <select
                value={primaryTopicId}
                onChange={(e) => setPrimaryTopicId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700"
              >
                <option value="">— Select Topic Hub —</option>
                {tags.map((t) => (
                  <option key={t.id} value={t.id}>
                    #{t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Supporting Tags
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-white rounded-lg border border-slate-200">
                {tags.map((t) => {
                  const selected = selectedTagIds.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleTag(t.id)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition ${
                        selected
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      #{t.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Author and Editor Assignment */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2">
              Journalist & Editor Assignment
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Author (Journalist) <span className="text-red-500">*</span>
              </label>
              <select
                value={authorId}
                onChange={(e) => setAuthorId(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              >
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.role || 'Staff Writer'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Editorial Reviewer / Editor
              </label>
              <select
                value={editorId}
                onChange={(e) => setEditorId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700"
              >
                <option value="">— Select Reviewing Editor —</option>
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.role || 'Editor'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Featured Image & Image SEO */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2">
              Media & Image SEO
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cover Image URL
              </label>
              <input
                type="url"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                placeholder="https://..."
                required
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Image Alt Text (Image SEO) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={imageAltText}
                onChange={(e) => setImageAltText(e.target.value)}
                placeholder="Objective visual description for accessibility & SEO..."
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Photo Caption
              </label>
              <input
                type="text"
                value={imageCaption}
                onChange={(e) => setImageCaption(e.target.value)}
                placeholder="Photo context displayed beneath image..."
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Image Copyright & Credit Source
              </label>
              <input
                type="text"
                value={imageSource}
                onChange={(e) => setImageSource(e.target.value)}
                placeholder="e.g. Apple / Reuters / Unsplash"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {featuredImage && (
              <div className="mt-2 rounded-xl overflow-hidden aspect-video relative bg-slate-200 border border-slate-200">
                <img
                  src={featuredImage}
                  alt={imageAltText || 'Preview'}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Manual Related Articles Override */}
          {existingArticles.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2">
                Manual Related Articles Override
              </h3>
              <p className="text-[11px] text-slate-500">
                Select articles to prioritize in the related recommendations module:
              </p>
              <div className="max-h-40 overflow-y-auto space-y-1 p-2 bg-white rounded-lg border border-slate-200 text-xs">
                {existingArticles.map((ea) => {
                  const isChecked = manualRelatedIds.includes(ea.id);
                  return (
                    <label key={ea.id} className="flex items-center space-x-2 py-1 cursor-pointer hover:bg-slate-50 px-1 rounded">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleManualRelated(ea.id)}
                        className="rounded text-brand-600"
                      />
                      <span className="truncate text-slate-800">{ea.title}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
