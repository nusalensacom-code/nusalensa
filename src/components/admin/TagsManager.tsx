'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Tags as TagsIcon,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  X,
  Flame,
  Hash,
} from 'lucide-react';

interface TagItem {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  isTopic: boolean;
  createdAt: string;
  _count: {
    articles: number;
    primaryArticles: number;
  };
}

export default function TagsManager() {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTopic, setFilterTopic] = useState<'ALL' | 'TOPIC' | 'TAG'>('ALL');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TagItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    isTopic: false,
  });

  const loadTags = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/tags');
      if (!res.ok) throw new Error('Failed to load tags');
      const data = await res.json();
      setTags(data.tags || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'System error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTags();
  }, []);

  const handleOpenCreate = () => {
    setEditingTag(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      isTopic: false,
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: TagItem) => {
    setEditingTag(item);
    setFormData({
      name: item.name,
      slug: item.slug,
      description: item.description || '',
      isTopic: item.isTopic,
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: editingTag
        ? prev.slug
        : val
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, ''),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      setErrorMsg('Tag name and URL slug are required');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const endpoint = editingTag ? `/api/admin/tags/${editingTag.id}` : '/api/admin/tags';
      const method = editingTag ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to save tag');

      setSuccessMsg(editingTag ? 'Tag updated successfully!' : 'New tag created successfully!');
      setIsModalOpen(false);
      await loadTags();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/admin/tags/${deleteTarget.id}`, { method: 'DELETE' });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to delete tag');

      setSuccessMsg(`Tag "${deleteTarget.name}" deleted successfully.`);
      setDeleteTarget(null);
      await loadTags();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while deleting');
      setDeleteTarget(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTags = tags.filter((t) => {
    const q = search.toLowerCase();
    const matchesSearch = t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q);
    if (!matchesSearch) return false;

    if (filterTopic === 'TOPIC') return t.isTopic;
    if (filterTopic === 'TAG') return !t.isTopic;
    return true;
  });

  const topicCount = tags.filter((t) => t.isTopic).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Tags & Pillar Topics</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200">
              {tags.length} total
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-500" />
              {topicCount} pillar topics
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage search entities, topic hubs, silicon chips, and device taxonomy tags.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs shadow-sm transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Tag / Topic
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

      {/* Search & Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tags or topics..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start">
          <button
            onClick={() => setFilterTopic('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterTopic === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All ({tags.length})
          </button>
          <button
            onClick={() => setFilterTopic('TOPIC')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
              filterTopic === 'TOPIC' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            Pillar Topics ({topicCount})
          </button>
          <button
            onClick={() => setFilterTopic('TAG')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterTopic === 'TAG' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Standard Tags ({tags.length - topicCount})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Tag Name</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Entity Type</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-center">Article Count</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    <div className="inline-block w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <div>Loading tags...</div>
                  </td>
                </tr>
              ) : filteredTags.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <TagsIcon className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-1" />
                    <p className="font-medium text-slate-600">No tags found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {search ? 'Try modifying your search keywords' : 'Add your first tag with the button above'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTags.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition group">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                      {t.isTopic ? (
                        <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                          <Flame className="w-3 h-3" />
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
                          <Hash className="w-3 h-3" />
                        </span>
                      )}
                      <span>{t.name}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                      /topic/{t.slug}
                    </td>
                    <td className="py-3 px-4">
                      {t.isTopic ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Flame className="w-2.5 h-2.5" />
                          Pillar Topic
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600">
                          Standard Tag
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px] max-w-xs truncate">
                      {t.description || '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-primary-50 text-primary-700">
                        {t._count.articles + t._count.primaryArticles}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Link
                          href={`/topic/${t.slug}`}
                          target="_blank"
                          title="View Public Topic Hub"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(t)}
                          title="Edit Tag"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(t)}
                          title="Delete Tag"
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

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <TagsIcon className="w-4 h-4 text-primary-600" />
                {editingTag ? 'Edit Tag / Pillar Topic' : 'Add New Tag / Topic'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Tag Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Snapdragon 8 Elite, Apple Intelligence, OLED"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  URL Slug <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-slate-100 border border-r-0 border-slate-300 text-slate-500 text-xs rounded-l-xl font-mono">
                    /topic/
                  </span>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="snapdragon-8-elite"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-r-xl font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                  />
                </div>
              </div>

              {/* isTopic Toggle */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isTopic}
                    onChange={(e) => setFormData({ ...formData, isTopic: e.target.checked })}
                    className="mt-0.5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      Designate as Pillar Topic
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Pillar topics can be chosen as primary article topics and highlighted across top navigation ticker hubs.
                    </p>
                  </div>
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Topic Description (SEO & Topic Hub)
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Overview and scope of this hardware technology or entity..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 rounded-xl transition shadow-xs"
                >
                  {isSubmitting ? 'Saving...' : editingTag ? 'Update Tag' : 'Save Tag'}
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

            <h3 className="font-bold text-slate-900 text-sm">Delete Tag?</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Are you sure you want to delete tag{' '}
              <span className="font-bold text-slate-800">&ldquo;{deleteTarget.name}&rdquo;</span>?
            </p>

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
