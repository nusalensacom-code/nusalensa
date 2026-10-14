'use client';

import React, { useState } from 'react';
import { Share2, Check, MessageCircle, Twitter, Facebook, Send } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
  url: string;
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      // fallback
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 py-4 my-6 border-y border-slate-100">
      <span className="text-sm font-semibold text-slate-700 flex items-center mr-2">
        <Share2 className="w-4 h-4 mr-1.5 text-slate-500" />
        Share:
      </span>

      {/* Twitter / X */}
      <a
        href={shareLinks.twitter}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
        className="flex items-center px-3 py-1.5 bg-black hover:bg-slate-800 text-white text-xs font-semibold rounded-full shadow-xs transition-transform active:scale-95"
      >
        <Twitter className="w-3.5 h-3.5 mr-1" />
        X / Twitter
      </a>

      {/* Facebook */}
      <a
        href={shareLinks.facebook}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        className="flex items-center px-3 py-1.5 bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-semibold rounded-full shadow-xs transition-transform active:scale-95"
      >
        <Facebook className="w-3.5 h-3.5 mr-1" />
        Facebook
      </a>

      {/* WhatsApp */}
      <a
        href={shareLinks.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
        className="flex items-center px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold rounded-full shadow-xs transition-transform active:scale-95"
      >
        <MessageCircle className="w-3.5 h-3.5 mr-1 fill-white" />
        WhatsApp
      </a>

      {/* Telegram */}
      <a
        href={shareLinks.telegram}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Telegram"
        className="flex items-center px-3 py-1.5 bg-[#229ED9] hover:bg-[#1f8fc4] text-white text-xs font-semibold rounded-full shadow-xs transition-transform active:scale-95"
      >
        <Send className="w-3.5 h-3.5 mr-1" />
        Telegram
      </a>

      {/* Copy Link */}
      <button
        onClick={handleCopy}
        type="button"
        className="flex items-center px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-full transition-colors active:scale-95 ml-auto"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            <span className="text-emerald-700 font-semibold">Copied!</span>
          </>
        ) : (
          <span>Copy Link</span>
        )}
      </button>
    </div>
  );
}
