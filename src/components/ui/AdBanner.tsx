import React from 'react';
import { siteConfig } from '@/lib/siteConfig';

interface AdBannerProps {
  slot: 'top-banner' | 'in-content' | 'sidebar' | 'between-cards' | 'bottom-banner';
  className?: string;
  forcePreview?: boolean;
}

export function AdBanner({ slot, className = '', forcePreview = false }: AdBannerProps) {
  const clientId = siteConfig.monetization.adsenseClientId;

  // Sesuai aturan: jika ADSENSE_CLIENT_ID kosong dan tidak dipaksa preview, jangan render apa pun agar UX tetap bersih
  if (!clientId && !forcePreview) {
    return null;
  }

  // Reserved aspect-ratio dan min-height ketat untuk mengeliminasi Cumulative Layout Shift (CLS < 0.1)
  const slotDimensions = {
    'top-banner': 'w-full max-w-[970px] min-h-[90px] my-4 mx-auto',
    'in-content': 'w-full max-w-[728px] min-h-[280px] my-8 mx-auto',
    'sidebar': 'w-full min-h-[250px] my-6',
    'between-cards': 'w-full min-h-[100px] my-6',
    'bottom-banner': 'w-full max-w-[970px] min-h-[90px] my-8 mx-auto',
  };

  const slotLabels = {
    'top-banner': 'Leaderboard Display (728x90)',
    'in-content': 'In-Article Native Ad (336x280)',
    'sidebar': 'Sidebar Medium Rectangle (300x250)',
    'between-cards': 'Feed Ad / Native Content Ad',
    'bottom-banner': 'Bottom Anchor Ad (728x90)',
  };

  return (
    <aside
      aria-label="Iklan Sponsor"
      className={`relative flex flex-col items-center justify-center bg-slate-50/60 border border-dashed border-slate-200/80 rounded-xl p-2 text-center overflow-hidden transition-all ${slotDimensions[slot]} ${className}`}
    >
      <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">
        Iklan / Ads
      </div>

      {clientId ? (
        <div className="w-full flex-1 flex flex-col items-center justify-center">
          <ins
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', minHeight: '100%' }}
            data-ad-client={clientId}
            data-ad-slot="1234567890"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      ) : (
        <div className="py-2 text-center text-slate-400">
          <p className="text-xs font-medium text-slate-500">Ruang Iklan Terverifikasi</p>
          <p className="text-[10px] text-slate-400">{slotLabels[slot]}</p>
        </div>
      )}
    </aside>
  );
}
