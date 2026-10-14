import React from 'react';
import Link from 'next/link';
import { Sparkles, Smartphone, Cpu, Camera, Battery, Scale, ArrowRight } from 'lucide-react';
import { SafeImage } from './SafeImage';

interface DeviceItem {
  id: number;
  name: string;
  slug: string;
  featuredImage?: string | null;
  displaySize?: string | null;
  chipset?: string | null;
  mainCamera?: string | null;
  batteryCapacity?: string | null;
  rating?: number | null;
  brand: {
    name: string;
    slug: string;
  };
}

interface DeviceSpotlightProps {
  device: DeviceItem;
}

export function DeviceSpotlight({ device }: DeviceSpotlightProps) {
  // Extract concise strings for display
  const shortDisplay = device.displaySize ? device.displaySize.split(',')[0] : '6.8" OLED 120Hz';
  const shortCamera = device.mainCamera ? device.mainCamera.split(':')[1]?.split(',')[0] || '200MP' : '50MP Triple';
  const shortChipset = device.chipset ? device.chipset.split('(')[0] : 'Snapdragon 8 Elite';
  const shortBattery = device.batteryCapacity ? device.batteryCapacity.split(' ')[0] + ' ' + (device.batteryCapacity.split(' ')[1] || 'mAh') : '5000 mAh';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="font-black text-xs uppercase tracking-wider text-slate-100">
              DEVICE SPOTLIGHT
            </h3>
            <p className="text-[10px] text-slate-400 leading-none">
              Featured flagship hardware
            </p>
          </div>
        </div>
        {device.rating && (
          <span className="text-[11px] font-black bg-emerald-500 text-slate-950 px-2 py-0.5 rounded">
            {device.rating} / 10
          </span>
        )}
      </div>

      <div className="p-4">
        {/* Device Image & Title */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-20 h-24 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative flex-shrink-0">
            {device.featuredImage ? (
              <SafeImage src={device.featuredImage} alt={device.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <Smartphone className="w-8 h-8" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block mb-0.5">
              {device.brand.name}
            </span>
            <Link
              href={`/phones/${device.brand.slug}/${device.slug}`}
              className="text-sm sm:text-base font-black text-slate-900 hover:text-amber-600 transition-colors line-clamp-2 leading-snug"
            >
              {device.name}
            </Link>
            <span className="inline-block mt-2 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Verified Specs Sheet
            </span>
          </div>
        </div>

        {/* 4 Iconic GSMArena Spec Badges */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
            <div className="flex items-center text-slate-400 text-[10px] uppercase font-bold mb-1">
              <Smartphone className="w-3 h-3 mr-1 text-slate-500" />
              <span>Display</span>
            </div>
            <p className="font-bold text-slate-800 truncate text-[11px]">{shortDisplay}</p>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
            <div className="flex items-center text-slate-400 text-[10px] uppercase font-bold mb-1">
              <Camera className="w-3 h-3 mr-1 text-slate-500" />
              <span>Camera</span>
            </div>
            <p className="font-bold text-slate-800 truncate text-[11px]">{shortCamera}</p>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
            <div className="flex items-center text-slate-400 text-[10px] uppercase font-bold mb-1">
              <Cpu className="w-3 h-3 mr-1 text-slate-500" />
              <span>Chipset</span>
            </div>
            <p className="font-bold text-slate-800 truncate text-[11px]">{shortChipset}</p>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
            <div className="flex items-center text-slate-400 text-[10px] uppercase font-bold mb-1">
              <Battery className="w-3 h-3 mr-1 text-slate-500" />
              <span>Battery</span>
            </div>
            <p className="font-bold text-slate-800 truncate text-[11px]">{shortBattery}</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Link
            href={`/phones/${device.brand.slug}/${device.slug}`}
            className="flex items-center justify-center py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            <span>Full Specs</span>
            <ArrowRight className="w-3 h-3 ml-1" />
          </Link>

          <Link
            href={`/compare/${device.slug}-vs-samsung-galaxy-s25-ultra`}
            className="flex items-center justify-center py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
          >
            <Scale className="w-3 h-3 mr-1 text-slate-500" />
            <span>Compare</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

