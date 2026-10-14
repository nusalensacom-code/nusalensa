'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Globe,
  Sparkles,
  DollarSign,
  BarChart3,
  Mail,
  Share2,
  Save,
  CheckCircle2,
  AlertTriangle,
  X,
  Shield,
  Radio,
} from 'lucide-react';

export default function SettingsManager() {
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'SEO' | 'MONETIZATION' | 'ANALYTICS' | 'CONTACT' | 'SOCIAL'>('GENERAL');
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/settings');
      if (!res.ok) throw new Error('Failed to load settings');
      const data = await res.json();
      setSettings(data.settings || {});
    } catch (err: any) {
      setErrorMsg(err.message || 'System error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save settings');

      setSuccessMsg('Website configuration successfully updated!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { key: 'GENERAL', label: 'Identity & Brand', icon: Globe },
    { key: 'SEO', label: 'SEO & Search Console', icon: Sparkles },
    { key: 'MONETIZATION', label: 'Advertising & Affiliates', icon: DollarSign },
    { key: 'ANALYTICS', label: 'Google Analytics (GA4)', icon: BarChart3 },
    { key: 'CONTACT', label: 'Newsroom Contact', icon: Mail },
    { key: 'SOCIAL', label: 'Social Channels', icon: Share2 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">System & Platform Settings</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200">
              Live Configuration
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure global website settings, international SEO metadata, and tracking IDs for NusaLensa.
          </p>
        </div>

        <button
          onClick={() => handleSave()}
          disabled={isSaving || isLoading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition active:scale-95 self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save All Settings'}
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 p-1.5 bg-slate-100 rounded-2xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`p-2.5 rounded-xl text-center transition flex flex-col items-center gap-1.5 ${
                isActive ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:bg-white/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-primary-600' : 'text-slate-400'}`} />
              <span className="text-[11px] font-bold">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        {/* Tab 1: General */}
        {activeTab === 'GENERAL' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Brand Identity & Publishing Metadata</h2>
              <p className="text-xs text-slate-500 mt-0.5">Core brand information for NusaLensa.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Site Name</label>
                <input
                  type="text"
                  value={settings.site_name || 'NusaLensa'}
                  onChange={(e) => handleChange('site_name', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Tagline / Mission</label>
                <input
                  type="text"
                  value={settings.site_tagline || 'Global Smartphone Database & Technology Intelligence'}
                  onChange={(e) => handleChange('site_tagline', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Global Description</label>
              <textarea
                rows={3}
                value={settings.site_description || 'Independent global technology and smartphone information platform featuring hardware specifications, head-to-head comparisons, and tech news.'}
                onChange={(e) => handleChange('site_description', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Logo URL</label>
                <input
                  type="text"
                  value={settings.site_logo || ''}
                  onChange={(e) => handleChange('site_logo', e.target.value)}
                  placeholder="/images/logo.png"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Favicon URL</label>
                <input
                  type="text"
                  value={settings.site_favicon || ''}
                  onChange={(e) => handleChange('site_favicon', e.target.value)}
                  placeholder="/favicon.ico"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: SEO */}
        {activeTab === 'SEO' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">SEO & Webmaster Search Console</h2>
              <p className="text-xs text-slate-500 mt-0.5">Search engine indexing, Open Graph tags, and domain ownership verification.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Title Template Format</label>
                <input
                  type="text"
                  value={settings.seo_title_format || '%s | NusaLensa'}
                  onChange={(e) => handleChange('seo_title_format', e.target.value)}
                  placeholder="%s | NusaLensa"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Google Search Console Verification Tag</label>
                <input
                  type="text"
                  value={settings.gsc_verification || ''}
                  onChange={(e) => handleChange('gsc_verification', e.target.value)}
                  placeholder="google-site-verification token"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Global Keywords</label>
              <input
                type="text"
                value={settings.seo_keywords || 'smartphones, phone specifications, device comparison, mobile technology, reviews, benchmarks, Android, iOS'}
                onChange={(e) => handleChange('seo_keywords', e.target.value)}
                placeholder="smartphones, specs, phone compare, reviews, tech news"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Default Social Share (OG) Image URL</label>
              <input
                type="text"
                value={settings.seo_og_image || ''}
                onChange={(e) => handleChange('seo_og_image', e.target.value)}
                placeholder="https://nusalensa.com/og-image.jpg"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Monetization */}
        {activeTab === 'MONETIZATION' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Advertising & Monetization</h2>
              <p className="text-xs text-slate-500 mt-0.5">Google AdSense publisher configuration and responsive ad slot placements.</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Google AdSense Publisher ID
              </label>
              <input
                type="text"
                value={settings.adsense_client_id || ''}
                onChange={(e) => handleChange('adsense_client_id', e.target.value)}
                placeholder="ca-pub-1234567890123456"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
              />
              <p className="text-[11px] text-slate-400 mt-0.5">
                Format: <code>ca-pub-XXXXXXXXXXXXXXXX</code>. If provided, AdSense scripts will be loaded on public views.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.adsense_auto_ads === 'true'}
                  onChange={(e) => handleChange('adsense_auto_ads', e.target.checked ? 'true' : 'false')}
                  className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-xs font-bold text-slate-800">
                  Enable Google Auto-Ads (AI-placed responsive ads)
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Header Ad Slot ID</label>
                <input
                  type="text"
                  value={settings.adsense_header_slot || ''}
                  onChange={(e) => handleChange('adsense_header_slot', e.target.value)}
                  placeholder="e.g. 1234567890"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">In-Article Ad Slot ID</label>
                <input
                  type="text"
                  value={settings.adsense_in_article_slot || ''}
                  onChange={(e) => handleChange('adsense_in_article_slot', e.target.value)}
                  placeholder="Slot ID"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Sidebar Ad Slot ID</label>
                <input
                  type="text"
                  value={settings.adsense_sidebar_slot || ''}
                  onChange={(e) => handleChange('adsense_sidebar_slot', e.target.value)}
                  placeholder="Slot ID"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Analytics */}
        {activeTab === 'ANALYTICS' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Google Analytics 4 (GA4)</h2>
              <p className="text-xs text-slate-500 mt-0.5">Real-time readership analytics and event telemetry.</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Measurement ID
              </label>
              <input
                type="text"
                value={settings.ga_id || ''}
                onChange={(e) => handleChange('ga_id', e.target.value)}
                placeholder="G-XXXXXXXXXX"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
              />
              <p className="text-[11px] text-slate-400 mt-0.5">
                Obtain this Measurement ID in Google Analytics (Admin &gt; Data Streams &gt; Web).
              </p>
            </div>
          </div>
        )}

        {/* Tab 5: Contact */}
        {activeTab === 'CONTACT' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Newsroom Contact & Communications</h2>
              <p className="text-xs text-slate-500 mt-0.5">Contact details displayed across footer and Contact pages.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Editorial Email</label>
                <input
                  type="email"
                  value={settings.contact_email || 'editorial@nusalensa.com'}
                  onChange={(e) => handleChange('contact_email', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Press & Review Units Email</label>
                <input
                  type="email"
                  value={settings.contact_press_email || 'press@nusalensa.com'}
                  onChange={(e) => handleChange('contact_press_email', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Headquarters Address</label>
              <textarea
                rows={2}
                value={settings.contact_address || 'NusaLensa Newsroom, 100 Montgomery St, Suite 1800, San Francisco, CA 94104, United States'}
                onChange={(e) => handleChange('contact_address', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition resize-none"
              />
            </div>
          </div>
        )}

        {/* Tab 6: Social */}
        {activeTab === 'SOCIAL' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Official Social Channels</h2>
              <p className="text-xs text-slate-500 mt-0.5">Public channels linked across header, articles, and footer.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">X (Twitter) URL</label>
                <input
                  type="text"
                  value={settings.social_twitter || 'https://x.com/nusalensa'}
                  onChange={(e) => handleChange('social_twitter', e.target.value)}
                  placeholder="https://x.com/nusalensa"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">YouTube Channel URL</label>
                <input
                  type="text"
                  value={settings.social_youtube || 'https://youtube.com/@nusalensa'}
                  onChange={(e) => handleChange('social_youtube', e.target.value)}
                  placeholder="https://youtube.com/@nusalensa"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">GitHub / Open Spec URL</label>
                <input
                  type="text"
                  value={settings.social_github || 'https://github.com/nusalensa'}
                  onChange={(e) => handleChange('social_github', e.target.value)}
                  placeholder="https://github.com/nusalensa"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">LinkedIn Organization URL</label>
                <input
                  type="text"
                  value={settings.social_linkedin || 'https://linkedin.com/company/nusalensa'}
                  onChange={(e) => handleChange('social_linkedin', e.target.value)}
                  placeholder="https://linkedin.com/company/nusalensa"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                />
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 rounded-xl transition shadow-xs flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
