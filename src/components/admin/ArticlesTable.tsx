'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { formatDateEnglish } from '@/lib/utils';
import {
  Search,
  PlusCircle,
  Edit2,
  Trash2,
  Copy,
  Eye,
  AlertTriangle,
  CheckCircle2,
  X,
  Loader2,
  FileText,
} from 'lucide-react';

interface ArticleItem {
  id: number;
  title: string;
  slug: string;
  featuredImage: string;
  status: string;
  articleType: string;
  views: number;
  publishedAt: string | Date;
  updatedAt: string | Date;
  category: { id: number; name: string; slug: string };
  subcategory?: { id: number; name: string; slug: string } | null;
  author: { id: number; name: string; slug: string };
}

interface ArticlesTableProps {
  initialArticles: ArticleItem[];
  categories: Array<{ id: number; name: string }>;
  authors: Array<{ id: number; name: string }>;
}

export function ArticlesTable({ initialArticles, categories, authors }: ArticlesTableProps) {
  const router = useRouter();
  const [articles, setArticles] = useState<ArticleItem[]>(initialArticles);
  const [statusTab, setStatusTab] = useState<
    'ALL' | 'PUBLISHED' | 'IN_REVIEW' | 'DRAFT' | 'SCHEDULED' | 'ARCHIVED'
  >('ALL');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Modal State for Delete
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; article?: ArticleItem }>({
    open: false,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter Logic
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      // Tab status
      if (statusTab !== 'ALL' && art.status !== statusTab) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'ALL' && art.category.id.toString() !== selectedCategory) {
        return false;
      }
      // Author filter
      if (selectedAuthor !== 'ALL' && art.author.id.toString() !== selectedAuthor) {
        return false;
      }
      // Type filter
      if (selectedType !== 'ALL' && art.articleType !== selectedType) {
        return false;
      }
      // Search
      if (search.trim()) {
        const query = search.toLowerCase().trim();
        const matchTitle = art.title.toLowerCase().includes(query);
        const matchSlug = art.slug.toLowerCase().includes(query);
        const matchCat = art.category.name.toLowerCase().includes(query);
        const matchAuthor = art.author.name.toLowerCase().includes(query);
        return matchTitle || matchSlug || matchCat || matchAuthor;
      }
      return true;
    });
  }, [articles, statusTab, selectedCategory, selectedAuthor, selectedType, search]);

  // Checkbox Selection
  const isAllSelected =
    filteredArticles.length > 0 && selectedIds.length === filteredArticles.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredArticles.map((a) => a.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Confirm Single Delete
  const confirmDelete = async () => {
    if (!deleteModal.article) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/articles/${deleteModal.article.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setArticles((prev) => prev.filter((a) => a.id !== deleteModal.article?.id));
        setSelectedIds((prev) => prev.filter((id) => id !== deleteModal.article?.id));
        showToast(`Article "${deleteModal.article.title}" successfully deleted.`);
        setDeleteModal({ open: false });
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to delete article.');
      }
    } catch {
      alert('Network error occurred.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Duplicate Article as Draft
  const handleDuplicate = async (article: ArticleItem) => {
    setDuplicatingId(article.id);
    try {
      const res = await fetch(`/api/articles/${article.id}/duplicate`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.article) {
        setArticles((prev) => [
          {
            ...data.article,
            category: article.category,
            author: article.author,
            views: 0,
          },
          ...prev,
        ]);
        showToast(`Draft duplicate created for "${article.title}".`);
        router.refresh();
      } else {
        alert(data.error || 'Failed to duplicate article.');
      }
    } catch {
      alert('Network error occurred.');
    } finally {
      setDuplicatingId(null);
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedIds.length} selected articles? This action cannot be undone.`
      )
    )
      return;

    for (const id of selectedIds) {
      await fetch(`/api/articles/${id}`, { method: 'DELETE' }).catch(() => {});
    }
    setArticles((prev) => prev.filter((a) => !selectedIds.includes(a.id)));
    setSelectedIds([]);
    showToast(`${selectedIds.length} selected articles deleted.`);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs border border-slate-700 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Articles & News Index ({filteredArticles.length})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete list of tech stories, published reviews, editorial drafts, and scheduled posts.
          </p>
        </div>

        <Link
          href="/admin/articles/new"
          className="inline-flex items-center px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm space-x-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Article</span>
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 overflow-x-auto text-xs font-semibold">
        {(
          [
            { label: 'All Articles', value: 'ALL' },
            { label: 'Published', value: 'PUBLISHED' },
            { label: 'In Review', value: 'IN_REVIEW' },
            { label: 'Draft', value: 'DRAFT' },
            { label: 'Scheduled', value: 'SCHEDULED' },
            { label: 'Archived', value: 'ARCHIVED' },
          ] as const
        ).map((tab) => {
          const count =
            tab.value === 'ALL'
              ? articles.length
              : articles.filter((a) => a.status === tab.value).length;
          const isActive = statusTab === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusTab(tab.value)}
              className={`pb-3 px-3 border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Advanced Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input (5 cols) */}
          <div className="md:col-span-5 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, slug, author, or category..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* Category Dropdown (3 cols) */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Author Dropdown (2 cols) */}
          <div className="md:col-span-2">
            <select
              value={selectedAuthor}
              onChange={(e) => setSelectedAuthor(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700"
            >
              <option value="ALL">All Authors</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Dropdown (2 cols) */}
          <div className="md:col-span-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700"
            >
              <option value="ALL">All Formats</option>
              <option value="NEWS">NEWS</option>
              <option value="EVERGREEN">EVERGREEN</option>
              <option value="GUIDE">GUIDE</option>
              <option value="TUTORIAL">TUTORIAL</option>
              <option value="OPINION">OPINION</option>
              <option value="LISTICLE">LISTICLE</option>
              <option value="EXPLAINER">EXPLAINER</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between p-2.5 bg-brand-50 border border-brand-200 rounded-xl text-xs text-brand-900">
            <span className="font-semibold">
              {selectedIds.length} {selectedIds.length === 1 ? 'article' : 'articles'} selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleBulkDelete}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Articles Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {filteredArticles.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-base font-bold text-slate-800">No articles found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No articles match your current filter criteria or search query.
            </p>
            <Link
              href="/admin/articles/new"
              className="inline-flex items-center px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              <span>+ Create New Article</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-3 w-8">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 text-brand-600"
                    />
                  </th>
                  <th className="py-3 px-2 w-16">Photo</th>
                  <th className="py-3 px-3">Title & Slug</th>
                  <th className="py-3 px-2">Category</th>
                  <th className="py-3 px-2">Author</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Views</th>
                  <th className="py-3 px-2">Published</th>
                  <th className="py-3 px-2">Updated</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredArticles.map((art) => {
                  const isChecked = selectedIds.includes(art.id);
                  return (
                    <tr
                      key={art.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isChecked ? 'bg-brand-50/30' : ''
                      }`}
                    >
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelect(art.id)}
                          className="rounded border-slate-300 text-brand-600"
                        />
                      </td>

                      {/* Thumbnail */}
                      <td className="py-3 px-2">
                        <div className="relative w-12 h-9 rounded-md overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                          {art.featuredImage ? (
                            <Image
                              src={art.featuredImage}
                              alt={art.title}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-200" />
                          )}
                        </div>
                      </td>

                      {/* Title & Slug */}
                      <td className="py-3 px-3 max-w-[260px]">
                        <Link
                          href={`/admin/articles/${art.id}/edit`}
                          className="font-bold text-slate-900 hover:text-brand-600 line-clamp-1 text-xs"
                          title={art.title}
                        >
                          {art.title}
                        </Link>
                        <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                          /{art.category.slug}/{art.slug}
                        </p>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-2 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {art.category.name}
                        </span>
                      </td>

                      {/* Author */}
                      <td className="py-3 px-2 text-slate-600 whitespace-nowrap">
                        {art.author.name}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-2 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            art.status === 'PUBLISHED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : art.status === 'SCHEDULED'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : art.status === 'IN_REVIEW'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : art.status === 'ARCHIVED'
                              ? 'bg-slate-100 text-slate-500 border border-slate-300'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {art.status}
                        </span>
                      </td>

                      {/* Views */}
                      <td className="py-3 px-2 text-right font-mono font-semibold text-slate-700 whitespace-nowrap">
                        {art.views.toLocaleString('en-US')}
                      </td>

                      {/* Published Date */}
                      <td className="py-3 px-2 text-slate-500 text-[11px] whitespace-nowrap">
                        {formatDateEnglish(art.publishedAt)}
                      </td>

                      {/* Updated Date */}
                      <td className="py-3 px-2 text-slate-400 text-[11px] whitespace-nowrap">
                        {formatDateEnglish(art.updatedAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1">
                          {/* Edit */}
                          <Link
                            href={`/admin/articles/${art.id}/edit`}
                            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition"
                            title="Edit Article"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>

                          {/* Preview */}
                          <Link
                            href={`/admin/articles/${art.id}/preview`}
                            target="_blank"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                            title="Preview Article"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          {/* Duplicate */}
                          <button
                            type="button"
                            onClick={() => handleDuplicate(art)}
                            disabled={duplicatingId === art.id}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition disabled:opacity-50"
                            title="Duplicate Article"
                          >
                            {duplicatingId === art.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Delete Modal Trigger */}
                          <button
                            type="button"
                            onClick={() => setDeleteModal({ open: true, article: art })}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete Article"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.open && deleteModal.article && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-extrabold text-slate-900">
                Confirm Article Deletion
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to permanently delete the following article?
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800">
                &quot;{deleteModal.article.title}&quot;
              </div>
              <p className="text-[11px] text-red-500">
                This action is permanent and cannot be undone.
              </p>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal({ open: false })}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete Now</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
