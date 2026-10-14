import React from 'react';

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 animate-pulse space-y-8">
      {/* Skeleton Header */}
      <div className="h-8 bg-slate-200 rounded-lg w-1/3 mb-4" />
      <div className="h-4 bg-slate-100 rounded-md w-1/2 mb-8" />

      {/* Skeleton Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 aspect-[16/10] bg-slate-200 rounded-2xl" />
        <div className="lg:col-span-5 space-y-4">
          <div className="h-24 bg-slate-100 rounded-xl" />
          <div className="h-24 bg-slate-100 rounded-xl" />
          <div className="h-24 bg-slate-100 rounded-xl" />
          <div className="h-24 bg-slate-100 rounded-xl" />
        </div>
      </div>

      {/* Skeleton Feed Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
        <div className="h-64 bg-slate-100 rounded-xl" />
        <div className="h-64 bg-slate-100 rounded-xl" />
        <div className="h-64 bg-slate-100 rounded-xl" />
        <div className="h-64 bg-slate-100 rounded-xl" />
      </div>
    </div>
  );
}

