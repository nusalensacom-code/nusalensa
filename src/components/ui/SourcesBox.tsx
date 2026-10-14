import React from 'react';
import { BookOpen, ExternalLink, Calendar } from 'lucide-react';
import { formatDateEnglish } from '@/lib/utils';

export interface SourceItem {
  name: string;
  url: string;
  accessDate?: string;
  notes?: string;
}

interface SourcesBoxProps {
  sources: SourceItem[];
}

export function SourcesBox({ sources }: SourcesBoxProps) {
  if (!sources || sources.length === 0) return null;

  return (
    <section
      aria-label="Verified Sources and Citations"
      className="my-8 p-5 sm:p-6 bg-slate-50 border border-slate-200 rounded-2xl"
    >
      <div className="flex items-center space-x-2 text-slate-900 font-bold text-base sm:text-lg mb-3">
        <BookOpen className="w-5 h-5 text-cyan-700 flex-shrink-0" />
        <h2>Verified Sources & Citations</h2>
      </div>

      <p className="text-xs text-slate-500 mb-4 leading-relaxed">
        To maintain factual integrity and transparent reporting, this analysis references the following official manufacturer documentation, benchmark telemetry, or regulatory filings:
      </p>

      <ul className="space-y-3">
        {sources.map((src, idx) => (
          <li
            key={idx}
            className="p-3 bg-white border border-slate-200 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs"
          >
            <div className="flex-1">
              <a
                href={src.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="font-bold text-slate-900 hover:text-cyan-700 inline-flex items-center group transition-colors"
              >
                <span>{src.name}</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1 text-slate-400 group-hover:text-cyan-700 transition-colors" />
              </a>
              {src.notes && (
                <p className="text-slate-500 text-[11px] mt-0.5 leading-normal">
                  {src.notes}
                </p>
              )}
            </div>

            {src.accessDate && (
              <div className="flex items-center text-slate-400 text-[11px] flex-shrink-0 font-medium">
                <Calendar className="w-3.5 h-3.5 mr-1" />
                <span>Verified: {formatDateEnglish(src.accessDate)}</span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
