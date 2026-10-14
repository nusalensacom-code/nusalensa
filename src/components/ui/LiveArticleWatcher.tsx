'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowUp, RefreshCw, X } from 'lucide-react';

interface LiveArticleWatcherProps {
  initialLatestId: number;
  initialPublishedAt?: string | null;
}

export function LiveArticleWatcher({ initialLatestId, initialPublishedAt }: LiveArticleWatcherProps) {
  const router = useRouter();
  const [newArticleAlert, setNewArticleAlert] = useState<{ title: string; slug: string } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const currentLatestIdRef = useRef(initialLatestId);

  useEffect(() => {
    currentLatestIdRef.current = initialLatestId;
  }, [initialLatestId]);

  useEffect(() => {
    let isMounted = true;

    const checkForFreshArticles = async () => {
      try {
        const res = await fetch('/api/articles/latest', { cache: 'no-store' });
        if (!res.ok) return;

        const data = await res.json();
        if (!isMounted) return;

        const incomingId = data?.articleId;
        const incomingArticle = data?.latestArticle;

        if (incomingId && incomingId > currentLatestIdRef.current) {
          console.log('[LiveWatcher] Fresh article detected:', incomingArticle?.title);
          currentLatestIdRef.current = incomingId;
          setNewArticleAlert({
            title: incomingArticle?.title || 'New Article Published',
            slug: incomingArticle?.slug || '',
          });

          // Smoothly trigger Next.js router refresh so server components update
          setIsUpdating(true);
          router.refresh();
          setTimeout(() => setIsUpdating(false), 2000);
        }
      } catch (err) {
        // Silently ignore background polling errors
      }
    };

    // Poll every 25 seconds for new articles
    const interval = setInterval(checkForFreshArticles, 25000);

    // Also check immediately when the user switches back to this browser tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkForFreshArticles();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [router]);

  if (!newArticleAlert) return null;

  return (
    <aside
      aria-label="New article alert"
      className="fixed bottom-6 right-6 z-50 max-w-sm bg-slate-900/95 backdrop-blur-md text-white border border-primary-500/50 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center flex-shrink-0 shadow-md">
          {isUpdating ? (
            <RefreshCw className="w-4 h-4 text-white animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 text-amber-300" />
          )}
        </div>
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-primary-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            Fresh News Just Published
          </div>
          <p className="text-xs font-bold text-slate-100 line-clamp-2 mt-0.5">
            {newArticleAlert.title}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={() => {
                router.refresh();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setNewArticleAlert(null);
              }}
              className="inline-flex items-center gap-1 px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white font-bold text-[11px] rounded-lg transition"
            >
              <ArrowUp className="w-3 h-3" />
              View on Homepage
            </button>
            <button
              onClick={() => setNewArticleAlert(null)}
              className="text-slate-400 hover:text-white text-xs px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        </div>
        <button
          onClick={() => setNewArticleAlert(null)}
          className="text-slate-400 hover:text-white p-1 rounded-md"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}

