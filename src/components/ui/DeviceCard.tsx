import React from 'react';
import Link from 'next/link';
import { SafeImage as Image } from '@/components/ui/SafeImage';
import { Cpu, Smartphone, Camera, Battery, ArrowRight, Scale, Star } from 'lucide-react';

export interface DeviceCardProps {
  device: {
    id: string | number;
    name: string;
    slug: string;
    modelCode?: string | null;
    image?: string | null;
    featuredImage?: string | null;
    displaySize?: string | null;
    displayType?: string | null;
    chipset?: string | null;
    mainCamera?: string | null;
    batteryCapacity?: string | null;
    launchPrices?: string | null;
    retailPrices?: string | null;
    rating?: number | null;
    deviceType?: string;
    brand: {
      name: string;
      slug: string;
    };
  };
  variant?: 'grid' | 'compact' | 'horizontal';
}

export function DeviceCard({ device, variant = 'grid' }: DeviceCardProps) {
  // Parse launch pricing safely
  let parsedLaunchPrices: Record<string, string> = {};
  if (device.launchPrices) {
    try {
      parsedLaunchPrices = JSON.parse(device.launchPrices);
    } catch (e) {}
  }

  // Display primary currency or fallback
  const primaryPrice =
    parsedLaunchPrices.USD ||
    parsedLaunchPrices.GBP ||
    parsedLaunchPrices.EUR ||
    parsedLaunchPrices.AUD ||
    parsedLaunchPrices.CAD ||
    'Price varies by market';

  const detailUrl =
    device.deviceType === 'TABLET'
      ? `/tablets/${device.brand.slug}/${device.slug}`
      : `/phones/${device.brand.slug}/${device.slug}`;

  const imageSrc = device.featuredImage || device.image;

  if (variant === 'compact') {
    return (
      <div className="flex items-center space-x-3 p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition group">
        <div className="relative w-14 h-14 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={device.name}
              fill
              sizes="56px"
              className="object-contain p-1 group-hover:scale-105 transition-transform"
            />
          ) : (
            <Smartphone className="w-6 h-6 text-slate-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 block truncate">
            {device.brand.name}
          </span>
          <Link
            href={detailUrl}
            className="text-sm font-bold text-slate-900 hover:text-brand-600 line-clamp-1 transition-colors"
          >
            {device.name}
          </Link>
          <span className="text-xs text-slate-500 font-medium block mt-0.5">
            {primaryPrice}
          </span>
        </div>
      </div>
    );
  }

  return (
    <article className="flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-brand-400 transition-all duration-200 group">
      {/* Device Photo & Brand Badge */}
      <div className="relative aspect-[4/3] bg-gradient-to-b from-slate-50 to-slate-100/80 p-6 flex items-center justify-center border-b border-slate-100">
        <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-md text-[11px] font-extrabold text-slate-700 uppercase tracking-wider shadow-xs">
          {device.brand.name}
        </span>

        {device.rating && (
          <span className="absolute top-3 right-3 px-2 py-0.5 bg-amber-500 text-white rounded-md text-xs font-bold flex items-center shadow-xs">
            <Star className="w-3 h-3 fill-white mr-1" />
            {device.rating.toFixed(1)}
          </span>
        )}

        <div className="relative w-full h-full max-h-48 flex items-center justify-center">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={device.name}
              fill
              sizes="(max-width: 768px) 100vw, 350px"
              className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <Smartphone className="w-16 h-16 text-slate-300" />
          )}
        </div>
      </div>

      {/* Content & Specifications Summary */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
            <Link href={detailUrl} className="focus:outline-none">
              {device.name}
            </Link>
          </h3>

          {/* Quick Hardware Specs Grid */}
          <div className="mt-3.5 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
            {device.displaySize && (
              <div className="flex items-center text-slate-700">
                <Smartphone className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0" />
                <span className="truncate">{device.displaySize} {device.displayType ? `• ${device.displayType}` : ''}</span>
              </div>
            )}
            {device.chipset && (
              <div className="flex items-center text-slate-700">
                <Cpu className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0" />
                <span className="truncate font-medium">{device.chipset}</span>
              </div>
            )}
            {device.mainCamera && (
              <div className="flex items-center text-slate-700">
                <Camera className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0" />
                <span className="truncate">{device.mainCamera}</span>
              </div>
            )}
            {device.batteryCapacity && (
              <div className="flex items-center text-slate-700">
                <Battery className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0" />
                <span className="truncate">{device.batteryCapacity}</span>
              </div>
            )}
          </div>
        </div>

        {/* Pricing & Footer Actions */}
        <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Launch Price
            </span>
            <span className="text-sm font-extrabold text-slate-900">
              {primaryPrice}
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <Link
              href={`/compare?device=${device.slug}`}
              title="Add to comparison"
              className="p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition"
            >
              <Scale className="w-4 h-4" />
            </Link>

            <Link
              href={detailUrl}
              className="inline-flex items-center px-3 py-1.5 bg-slate-900 hover:bg-brand-600 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
            >
              Specs
              <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

