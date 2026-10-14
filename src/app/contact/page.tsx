import React from 'react';
import type { Metadata } from 'next';
import { siteConfig } from '@/lib/siteConfig';
import { Breadcrumbs } from '@/components/ui/Breadcrumb';
import { Mail, MapPin, Send, MessageSquare, Newspaper, Wrench } from 'lucide-react';

export const metadata: Metadata = {
  title: `Contact Us & Newsroom Inquiries | ${siteConfig.name}`,
  description: `Get in touch with the NusaLensa editorial team. Submit press releases, coordinate hardware review units, or send technical inquiries and correction requests.`,
  alternates: {
    canonical: `${siteConfig.url}/contact`,
  },
};

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <Breadcrumbs items={[{ name: 'Contact Us', url: '/contact' }]} />

      <article className="my-8">
        <div className="border-b border-slate-200 pb-6 mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
            Get In Touch
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
            Contact the NusaLensa Editorial Team
          </h1>
          <p className="text-base sm:text-lg text-slate-600 mt-2 leading-relaxed">
            We welcome hardware review coordination, official press releases, technical tips, and reader feedback from technology enthusiasts around the globe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
          {/* Office & Contact Inboxes */}
          <div className="space-y-6">
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Direct Editorial Inboxes</h2>

              <div className="space-y-3 text-sm text-slate-700">
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900">General Editorial & Tips:</strong>
                    <span className="text-slate-600">{siteConfig.publisher.email}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Newspaper className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900">Press Releases & Hardware Review Units:</strong>
                    <span className="text-slate-600">press@nusalensa.com</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Wrench className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900">Corrections & Spec Verification:</strong>
                    <span className="text-slate-600">corrections@nusalensa.com</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 pt-2 border-t border-slate-200">
                  <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900">Mailing Address:</strong>
                    <span className="text-slate-600">{siteConfig.publisher.address}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-brand-50/60 border border-brand-200 rounded-2xl text-xs text-brand-950 space-y-2">
              <span className="font-bold uppercase tracking-wider block">Press Materials & Review Units:</span>
              <p className="leading-relaxed">
                When shipping review hardware or sharing embargoed product announcements, please contact our hardware desk in advance. In keeping with our editorial independence policy, NusaLensa does not accept sponsored reviews or guaranteed positive coverage.
              </p>
            </div>
          </div>

          {/* Contact Message Form */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-brand-600" />
              Send a Direct Message
            </h2>

            <form className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your full name"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@domain.com"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Topic / Subject
                </label>
                <select className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option>Hardware Spec Correction</option>
                  <option>News Tip / Leaks</option>
                  <option>Review Unit Coordination</option>
                  <option>Advertising / Sponsorship Inquiries</option>
                  <option>General Editorial Feedback</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Message
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detail your inquiry, include relevant device links or references..."
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-lg transition-colors shadow-sm"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Inquiry
              </button>
            </form>
          </div>
        </div>
      </article>
    </div>
  );
}
