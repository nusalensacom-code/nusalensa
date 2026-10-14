'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

interface NewsletterBoxProps {
  compact?: boolean;
  className?: string;
}

export function NewsletterBox({ compact = false, className = '' }: NewsletterBoxProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(true);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (!consent) {
      setStatus('error');
      setMessage('Please accept the newsletter terms to proceed.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'Thank you! You are now subscribed to the NusaLensa Technology Briefing.');
        setName('');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    }
  };

  if (compact) {
    return (
      <div className={`bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 ${className}`}>
        <div className="flex items-center space-x-2 text-cyan-400 mb-2">
          <Mail className="w-5 h-5 text-cyan-400" />
          <span className="text-xs font-semibold uppercase tracking-wider">Weekly Tech Briefing</span>
        </div>
        <h3 className="text-lg font-bold">Independent Hardware Intelligence</h3>
        <p className="text-xs text-slate-300 mt-1 mb-4">
          Smartphone specs, lab benchmarks, and price updates delivered every week. Zero spam.
        </p>

        {status === 'success' ? (
          <div className="flex items-center text-emerald-400 text-sm bg-emerald-950/50 p-3 rounded-lg border border-emerald-800">
            <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{message}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address..."
              required
              className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center space-x-1"
            >
              <span>{status === 'loading' ? 'Subscribing...' : 'Subscribe Now'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <section
      aria-label="Newsletter Subscription"
      className={`relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl p-6 sm:p-10 my-10 shadow-lg border border-slate-800 ${className}`}
    >
      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-medium mb-4">
          <Mail className="w-3.5 h-3.5" />
          <span>NusaLensa Global Tech Intelligence</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Empirical hardware insights directly in your inbox.
        </h2>

        <p className="text-slate-300 text-sm sm:text-base mt-2 mb-6">
          Join technology enthusiasts and hardware engineers across the US, UK, Canada, and Australia. Get verified smartphone reviews, silicon architecture breakdowns, and international pricing trends without spam.
        </p>

        {status === 'success' ? (
          <div className="flex items-center justify-center p-4 rounded-xl bg-emerald-900/60 border border-emerald-500 text-emerald-200 text-sm">
            <CheckCircle className="w-5 h-5 mr-2 text-emerald-400 flex-shrink-0" />
            <span>{message}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <div>
                <label htmlFor="newsletter-name" className="block text-xs font-medium text-slate-300 mb-1">
                  Full Name (Optional)
                </label>
                <input
                  id="newsletter-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                />
              </div>

              <div>
                <label htmlFor="newsletter-email" className="block text-xs font-medium text-slate-300 mb-1">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  required
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                />
              </div>
            </div>

            <div className="flex items-center justify-start space-x-2 text-left">
              <input
                id="newsletter-consent"
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 bg-slate-800 border-slate-700 cursor-pointer"
              />
              <label htmlFor="newsletter-consent" className="text-xs text-slate-400 cursor-pointer select-none">
                I agree to receive the weekly NusaLensa technology briefing and understand I can unsubscribe at any time.
              </label>
            </div>

            {status === 'error' && (
              <div className="flex items-center text-xs text-red-400 bg-red-950/60 p-2.5 rounded-lg border border-red-800">
                <AlertCircle className="w-4 h-4 mr-1.5 flex-shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full sm:w-auto px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe to Briefing'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
