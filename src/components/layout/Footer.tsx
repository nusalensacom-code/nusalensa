import React from 'react';
import Link from 'next/link';
import { Twitter, Facebook, Instagram, Youtube, Send, ShieldCheck } from 'lucide-react';
import { siteConfig } from '@/lib/siteConfig';

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
}

interface FooterProps {
  categories: CategoryItem[];
}

export function Footer({ categories }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white border-t border-slate-800 pt-14 pb-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand & Mission (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-baseline space-x-1">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {siteConfig.name}
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block ml-0.5" />
            </Link>

            <p className="text-slate-300 text-sm leading-relaxed max-w-sm">
              {siteConfig.description}
            </p>

            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 max-w-sm text-xs text-slate-300 space-y-1">
              <div className="flex items-center text-emerald-400 font-semibold mb-1">
                <ShieldCheck className="w-4 h-4 mr-1.5" />
                <span>Editorial Independence Guarantee</span>
              </div>
              <p>
                NusaLensa operates with complete editorial autonomy. We do not accept payment for favorable reviews or allow commercial partnerships to influence hardware verdicts.
              </p>
            </div>

            {/* Social Channels */}
            <div className="pt-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                Official Channels
              </p>
              <div className="flex items-center space-x-3">
                <a
                  href={siteConfig.socials.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-800 hover:bg-black flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                  aria-label="X Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href={siteConfig.socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-800 hover:bg-[#1877F2] flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href={siteConfig.socials.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-800 hover:bg-[#FF0000] flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
                <a
                  href={siteConfig.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-800 hover:bg-[#E4405F] flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href={siteConfig.socials.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-800 hover:bg-[#229ED9] flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                  aria-label="Telegram"
                >
                  <Send className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Column 1: Hardware Database */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-cyan-500 pl-2">
              Device Database
            </h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <Link href="/phones" className="hover:text-cyan-400 transition-colors">
                  Smartphones
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-cyan-400 transition-colors">
                  Device Comparison Tool
                </Link>
              </li>
              <li>
                <Link href="/tablets" className="hover:text-cyan-400 transition-colors">
                  Tablets & Slates
                </Link>
              </li>
              <li>
                <Link href="/brands/apple" className="hover:text-cyan-400 transition-colors">
                  Apple Devices
                </Link>
              </li>
              <li>
                <Link href="/brands/samsung" className="hover:text-cyan-400 transition-colors">
                  Samsung Galaxy Hub
                </Link>
              </li>
              <li>
                <Link href="/brands/google" className="hover:text-cyan-400 transition-colors">
                  Google Pixel Lineup
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Editorial & Research */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-cyan-500 pl-2">
              Editorial Coverage
            </h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <Link href="/news" className="hover:text-cyan-400 transition-colors">
                  Technology News
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="hover:text-cyan-400 transition-colors">
                  Hardware Reviews
                </Link>
              </li>
              <li>
                <Link href="/buying-guides" className="hover:text-cyan-400 transition-colors">
                  Buying Guides
                </Link>
              </li>
              <li>
                <Link href="/how-to" className="hover:text-cyan-400 transition-colors">
                  How-To & Guides
                </Link>
              </li>
              <li>
                <Link href="/technology" className="hover:text-cyan-400 transition-colors">
                  AI & Silicon Deep Dives
                </Link>
              </li>
              <li>
                <Link href="/trending" className="hover:text-cyan-400 transition-colors">
                  Trending Tech Topics
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Newsroom */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-cyan-500 pl-2">
              Trust & Legal
            </h3>
            <ul className="space-y-2 text-sm text-slate-300">
              {siteConfig.footerLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-cyan-400 transition-colors">
                    {link.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/admin/login" className="text-cyan-400 hover:underline">
                  Editorial CMS Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>
            &copy; {currentYear} <strong className="text-slate-200">{siteConfig.name}</strong>. All rights reserved. Primary domain:{' '}
            <a href="https://nusalensa.com" className="hover:text-cyan-400 underline">
              https://nusalensa.com
            </a>
          </p>

          <p className="flex items-center text-slate-400">
            Independent global technology intelligence for consumers in North America, Europe, Australia, and worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
}
