'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Search,
  Copy,
  Check,
  Trash2,
  Edit2,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  X,
  FileImage,
  Link2,
} from 'lucide-react';

interface MediaItem {
  id: number;
  filename: string | null;
  title: string;
  url: string;
  altText: string | null;
  caption: string | null;
  source: string | null;
  mimeType: string | null;
  fileSize: number | null;
  width: number | null;
  height: number | null;
  createdAt: string;
}

export default function MediaManager() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMode, setUploadMode] = useState<'FILE' | 'URL'>('FILE');
  const [externalUrl, setExternalUrl] = useState('');
  const [imageTitle, setImageTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inspector / Edit Modal
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit form in Inspector
  const [metadataForm, setMetadataForm] = useState({
    title: '',
    altText: '',
    caption: '',
    source: '',
  });

  const loadMedia = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/media');
      if (!res.ok) throw new Error('Failed to load media library');
      const data = await res.json();
      setMediaList(data.media || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'System error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', imageTitle || file.name);

      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload file');

      setSuccessMsg('Image uploaded successfully!');
      setImageTitle('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      await loadMedia();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!externalUrl) return;

    setIsUploading(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('url', externalUrl);
      formData.append('title', imageTitle || 'External Image');

      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save image URL');

      setSuccessMsg('Image URL saved to media library!');
      setExternalUrl('');
      setImageTitle('');
      await loadMedia();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopyUrl = (item: MediaItem) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSelectMedia = (item: MediaItem) => {
    setSelectedMedia(item);
    setMetadataForm({
      title: item.title,
      altText: item.altText || '',
      caption: item.caption || '',
      source: item.source || '',
    });
  };

  const handleSaveMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedia) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/admin/media/${selectedMedia.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metadataForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save metadata');

      setSuccessMsg('Media metadata updated successfully!');
      setSelectedMedia(null);
      await loadMedia();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save metadata');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/admin/media/${deleteTarget.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete media');

      setSuccessMsg('Media deleted successfully.');
      setDeleteTarget(null);
      if (selectedMedia?.id === deleteTarget.id) setSelectedMedia(null);
      await loadMedia();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete media');
      setDeleteTarget(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMedia = mediaList.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      (m.filename && m.filename.toLowerCase().includes(q)) ||
      (m.altText && m.altText.toLowerCase().includes(q))
    );
  });

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Media Library & Digital Assets</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200">
              {mediaList.length} files
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Optimized image repository (WebP/AVIF/PNG/JPEG), SEO alt text metadata, and editorial attribution.
          </p>
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

      {/* Upload Box */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Upload className="w-4 h-4 text-primary-600" />
            Upload New Media
          </h2>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setUploadMode('FILE')}
              className={`px-3 py-1 rounded-md transition ${
                uploadMode === 'FILE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              Upload File (Max 5MB)
            </button>
            <button
              onClick={() => setUploadMode('URL')}
              className={`px-3 py-1 rounded-md transition ${
                uploadMode === 'URL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              Save External URL
            </button>
          </div>
        </div>

        {uploadMode === 'FILE' ? (
          <div className="border-2 border-dashed border-slate-300 hover:border-primary-500 rounded-2xl p-6 text-center transition bg-slate-50/50">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/webp,image/avif,image/gif,image/svg+xml"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload-input"
              disabled={isUploading}
            />
            <label
              htmlFor="file-upload-input"
              className="cursor-pointer flex flex-col items-center justify-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center shadow-xs">
                {isUploading ? (
                  <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="w-6 h-6" />
                )}
              </div>
              <div className="text-xs font-bold text-slate-800">
                {isUploading ? 'Uploading file...' : 'Click to select image file'}
              </div>
              <p className="text-[11px] text-slate-400">
                Supported formats: WebP, AVIF, PNG, JPG, GIF, SVG (Maximum 5MB)
              </p>
            </label>
          </div>
        ) : (
          <form onSubmit={handleUrlSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="url"
                required
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... or public image URL"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition font-mono"
              />
              <input
                type="text"
                value={imageTitle}
                onChange={(e) => setImageTitle(e.target.value)}
                placeholder="Image Title / Description"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
              />
            </div>
            <button
              type="submit"
              disabled={isUploading || !externalUrl}
              className="px-4 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 rounded-xl transition shadow-xs flex items-center gap-2"
            >
              <Link2 className="w-3.5 h-3.5" />
              Save URL to Media Library
            </button>
          </form>
        )}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search media by title or filename..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
          />
        </div>
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="inline-block w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-xs">Loading media assets...</p>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400">
          <ImageIcon className="w-12 h-12 mx-auto text-slate-300 mb-2 stroke-1" />
          <p className="font-medium text-slate-600 text-sm">No media files in library</p>
          <p className="text-xs text-slate-400 mt-1">
            {search ? 'No results matched your search' : 'Use the upload box above to add your first asset'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredMedia.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition group flex flex-col"
            >
              <div
                className="relative aspect-video bg-slate-100 overflow-hidden cursor-pointer"
                onClick={() => handleSelectMedia(m)}
              >
                <img
                  src={m.url}
                  alt={m.altText || m.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  onError={(e) => {
                    (e.target as any).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23ddd" width="100" height="100"/><text fill="%23999" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">No Img</text></svg>';
                  }}
                />
                <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold">
                  View Details
                </div>
              </div>

              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="font-semibold text-slate-900 text-xs truncate" title={m.title}>
                    {m.title}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-between">
                    <span>{formatFileSize(m.fileSize)}</span>
                    <span className="uppercase font-mono">{m.mimeType?.split('/')[1] || 'IMG'}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleCopyUrl(m)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-primary-600 transition"
                    title="Copy image URL"
                  >
                    {copiedId === m.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleSelectMedia(m)}
                      title="Edit Metadata"
                      className="p-1 rounded text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(m)}
                      title="Delete"
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inspector / Edit Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileImage className="w-4 h-4 text-primary-600" />
                Media Details & Metadata
              </h3>
              <button
                onClick={() => setSelectedMedia(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Preview & Info */}
              <div className="space-y-4">
                <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center">
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.title}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Filename:</span>
                    <span className="font-mono font-medium truncate max-w-[150px]">{selectedMedia.filename || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">File Size:</span>
                    <span className="font-mono">{formatFileSize(selectedMedia.fileSize)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Content Type:</span>
                    <span className="font-mono">{selectedMedia.mimeType || '—'}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Direct URL:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={selectedMedia.url}
                      className="w-full px-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-xl font-mono text-slate-700 focus:outline-none"
                    />
                    <button
                      onClick={() => handleCopyUrl(selectedMedia)}
                      className="p-2 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-xl transition flex-shrink-0"
                      title="Copy URL"
                    >
                      {copiedId === selectedMedia.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Edit form */}
              <form onSubmit={handleSaveMetadata} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Media Title
                  </label>
                  <input
                    type="text"
                    value={metadataForm.title}
                    onChange={(e) => setMetadataForm({ ...metadataForm, title: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Image Alt Text (SEO & Accessibility)
                  </label>
                  <input
                    type="text"
                    value={metadataForm.altText}
                    onChange={(e) => setMetadataForm({ ...metadataForm, altText: e.target.value })}
                    placeholder="Descriptive text for accessibility & search bots"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Image Caption
                  </label>
                  <textarea
                    rows={2}
                    value={metadataForm.caption}
                    onChange={(e) => setMetadataForm({ ...metadataForm, caption: e.target.value })}
                    placeholder="Editorial caption displayed below in-article images"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Source Attribution & Licensing
                  </label>
                  <input
                    type="text"
                    value={metadataForm.source}
                    onChange={(e) => setMetadataForm({ ...metadataForm, source: e.target.value })}
                    placeholder="e.g. Official Press Unit / Apple, Unsplash"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteTarget(selectedMedia);
                    }}
                    className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                  >
                    Delete File
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedMedia(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 rounded-xl transition shadow-xs"
                    >
                      {isSubmitting ? 'Saving...' : 'Save Metadata'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
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

            <h3 className="font-bold text-slate-900 text-sm">Delete Media File?</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Are you sure you want to delete{' '}
              <span className="font-bold text-slate-800">&ldquo;{deleteTarget.title}&rdquo;</span>? The image record and stored metadata will be removed.
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
