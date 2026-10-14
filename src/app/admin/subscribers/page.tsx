import React from 'react';
import { prisma } from '@/lib/prisma';
import { formatDateEnglish } from '@/lib/utils';
import { Users, Mail } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminSubscribersPage() {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Newsletter Subscribers ({subscribers.length})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Global readers subscribed to daily smartphone intelligence digests and hardware benchmarks from NusaLensa.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <th className="pb-3">Name</th>
              <th className="pb-3">Email Address</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Subscribed Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {subscribers.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500">
                  No subscribers registered yet.
                </td>
              </tr>
            ) : (
              subscribers.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="py-3 font-semibold text-slate-900">
                    {s.name || 'Anonymous Reader'}
                  </td>
                  <td className="py-3 text-slate-700 font-mono flex items-center">
                    <Mail className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {s.email}
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400">
                    {formatDateEnglish(s.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
