'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FolderTree,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  order: number;
  parentId: number | null;
  parent?: { id: number; name: string; slug: string } | null;
  children?: { id: number; name: string; slug: string; order: number }[];
  _count: {
    articles: number;
    articlesAsSubcategory: number;
    children: number;
  };
}

export default function CategoriesManager({ initialFilter }: { initialFilter?: 'parentOnly' | 'subcategoryOnly' }) {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    parentId: '',
    order: 0,
    description: '',
    seoTitle: '',
    seoDescription: '',
  });

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const url = initialFilter ? `/api/admin/categories?${initialFilter}=true` : '/api/admin/categories';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load categories');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while loading categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [initialFilter]);

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      parentId: initialFilter === 'subcategoryOnly' && categories.length > 0 ? String(categories[0].parentId || '') : '',
      order: categories.length + 1,
      description: '',
      seoTitle: '',
      seoDescription: '',
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (item: CategoryItem) => {
    setEditingCategory(item);
    setFormData({
      name: item.name,
      slug: item.slug,
      parentId: item.parentId ? String(item.parentId) : '',
      order: item.order,
      description: item.description || '',
      seoTitle: item.seoTitle || '',
      seoDescription: item.seoDescription || '',
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  // Auto-generate slug when name changes
  const handleNameChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: editingCategory
        ? prev.slug
        : val
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, ''),
    }));
  };

  // Submit create or edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      setErrorMsg('Category name and URL slug are required');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const endpoint = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          order: Number(formData.order) || 0,
          parentId: formData.parentId ? Number(formData.parentId) : null,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to save category');
      }

      setSuccessMsg(editingCategory ? 'Category updated successfully!' : 'New category created successfully!');
      setIsModalOpen(false);
      await loadCategories();

      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'System error saving category');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete category
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/admin/categories/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to delete category');
      }

      setSuccessMsg(`Category "${deleteTarget.name}" deleted successfully.`);
      setDeleteTarget(null);
      await loadCategories();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while deleting category');
      setDeleteTarget(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered categories
  const filteredCategories = categories.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q) ||
      (c.parent?.name && c.parent.name.toLowerCase().includes(q))
    );
  });

  const availableParents = categories.filter((c) => !c.parentId && (!editingCategory || c.id !== editingCategory.id));

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {initialFilter === 'subcategoryOnly' ? 'Subcategories' : 'Categories & Channels'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200">
              {categories.length} total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {initialFilter === 'subcategoryOnly'
              ? 'Organize specialized sub-topics and topical clusters for search engine topical authority.'
              : 'Manage primary content channels and topical taxonomy across NusaLensa.'}
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs shadow-sm transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          {initialFilter === 'subcategoryOnly' ? 'Add Subcategory' : 'Add Category'}
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

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search category or slug..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
          />
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-16">Order</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">URL Slug</th>
                <th className="py-3 px-4">Parent Category</th>
                <th className="py-3 px-4 text-center">Subcategories</th>
                <th className="py-3 px-4 text-center">Articles</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    <div className="inline-block w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <div>Loading categories...</div>
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FolderTree className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-1" />
                    <p className="font-medium text-slate-600">No categories found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {search ? 'Try clearing your search query' : 'Click "Add Category" to create your first content taxonomy.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition group">
                    <td className="py-3 px-4 font-mono font-bold text-slate-400">
                      #{c.order}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-primary-600 transition flex items-center gap-1.5">
                        {c.name}
                      </div>
                      {c.description && (
                        <div className="text-[11px] text-slate-400 line-clamp-1 max-w-sm mt-0.5">
                          {c.description}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">
                      /{c.slug}
                    </td>
                    <td className="py-3 px-4">
                      {c.parent ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                          <Layers className="w-3 h-3 text-slate-400" />
                          {c.parent.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Primary Channel</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full font-semibold text-[11px] bg-slate-100 text-slate-600">
                        {c._count.children || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full font-bold text-[11px] bg-primary-50 text-primary-700">
                        {c._count.articles + c._count.articlesAsSubcategory}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Link
                          href={`/${c.slug}`}
                          target="_blank"
                          title="View on Website"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(c)}
                          title="Edit Category"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(c)}
                          title="Delete Category"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form: Add / Edit Category */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-primary-600" />
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Name & Slug */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. News, Reviews, Buying Guides, How-To, Technology"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  URL Slug <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-slate-100 border border-r-0 border-slate-300 text-slate-500 text-xs rounded-l-xl font-mono">
                    /
                  </span>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="news"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-r-xl font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                  />
                </div>
              </div>

              {/* Parent & Order */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Parent Category
                  </label>
                  <select
                    value={formData.parentId}
                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                  >
                    <option value="">— None (Primary Channel) —</option>
                    {availableParents.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Category Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Editorial scope and coverage overview for this section..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition resize-none"
                />
              </div>

              {/* SEO Fields */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Search Engine Optimization (SEO)
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    SEO Meta Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.seoTitle}
                    onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                    placeholder="Latest Technology News, Smartphone Reviews & Specs | NusaLensa"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    SEO Meta Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.seoDescription}
                    onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                    placeholder="Comprehensive technology reporting, mobile phone benchmarks, hands-on reviews, and global buying guides..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition resize-none"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 rounded-xl transition shadow-xs"
                >
                  {isSubmitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirm Delete */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <h3 className="font-bold text-slate-900 text-sm">Delete Category?</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Are you sure you want to delete category{' '}
              <span className="font-bold text-slate-800">&ldquo;{deleteTarget.name}&rdquo;</span>?
            </p>

            {(deleteTarget._count.articles > 0 || deleteTarget._count.children > 0) && (
              <div className="mt-3 p-3 bg-rose-50/70 border border-rose-200 rounded-xl text-rose-800 text-[11px] leading-relaxed">
                <strong>Data Protection Warning:</strong> This category contains{' '}
                {deleteTarget._count.articles} articles and {deleteTarget._count.children} subcategories.
                Deletion will be prevented by the database to protect referential integrity.
              </div>
            )}

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl transition"
              >
                {isSubmitting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
