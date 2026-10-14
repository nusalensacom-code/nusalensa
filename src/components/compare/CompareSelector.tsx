'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Scale } from 'lucide-react';

interface DeviceItem {
  id: string | number;
  name: string;
  slug: string;
  brand: {
    name: string;
  };
}

interface CompareSelectorProps {
  devices: DeviceItem[];
  defaultSlugA?: string;
  defaultSlugB?: string;
}

export function CompareSelector({ devices, defaultSlugA, defaultSlugB }: CompareSelectorProps) {
  const router = useRouter();
  const [deviceA, setDeviceA] = useState(defaultSlugA || devices[0]?.slug || '');
  const [deviceB, setDeviceB] = useState(defaultSlugB || devices[1]?.slug || devices[0]?.slug || '');

  const handleCompare = (e: React.FormEvent) => {
    e.preventDefault();
    if (deviceA && deviceB && deviceA !== deviceB) {
      router.push(`/compare/${deviceA}-vs-${deviceB}`);
    }
  };

  return (
    <form onSubmit={handleCompare} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
      {/* Device A Selector */}
      <div className="md:col-span-5 space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          Select Device 1 (Left):
        </label>
        <select
          value={deviceA}
          onChange={(e) => setDeviceA(e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {devices.map((d) => (
            <option key={d.id} value={d.slug}>
              {d.brand.name} {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* VS Pill */}
      <div className="md:col-span-2 flex items-center justify-center pb-2">
        <div className="w-12 h-12 rounded-full bg-slate-900 text-white font-black text-sm flex items-center justify-center shadow-md">
          VS
        </div>
      </div>

      {/* Device B Selector */}
      <div className="md:col-span-5 space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          Select Device 2 (Right):
        </label>
        <select
          value={deviceB}
          onChange={(e) => setDeviceB(e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {devices.map((d) => (
            <option key={d.id} value={d.slug}>
              {d.brand.name} {d.name}
            </option>
          ))}
        </select>
      </div>

      <div className="md:col-span-12 pt-4">
        <button
          type="submit"
          className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm rounded-xl transition shadow-md flex items-center justify-center space-x-2"
        >
          <Scale className="w-4 h-4" />
          <span>Compare Devices Now</span>
        </button>
      </div>
    </form>
  );
}

