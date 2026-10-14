'use client';

import React, { useState } from 'react';
import { List, ChevronDown, ChevronUp } from 'lucide-react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!content) return null;

  const items: TocItem[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('## ')) {
      const text = trimmed.replace('## ', '');
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      items.push({ id, text, level: 2 });
    } else if (trimmed.startsWith('### ')) {
      const text = trimmed.replace('### ', '');
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      items.push({ id, text, level: 3 });
    }
  }

  if (items.length < 2) return null;

  return (
    <nav
      aria-label="Table of Contents"
      className="bg-slate-50 border border-slate-200 rounded-xl p-4 my-6 transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
          <List className="w-4 h-4 text-cyan-700" />
          <span>Table of Contents</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center p-1 rounded transition-colors"
          aria-expanded={isOpen}
        >
          <span className="mr-1">{isOpen ? 'Hide' : 'Show'}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isOpen && (
        <ol className="mt-3 space-y-2 text-sm border-t border-slate-200 pt-3">
          {items.map((item, idx) => (
            <li
              key={idx}
              className={`${
                item.level === 3 ? 'pl-4 text-xs' : 'font-medium text-slate-800'
              }`}
            >
              <a
                href={`#${item.id}`}
                className="text-slate-700 hover:text-cyan-700 transition-colors flex items-start"
              >
                <span className="text-slate-400 mr-2">{idx + 1}.</span>
                <span>{item.text}</span>
              </a>
            </li>
          ))}
        </ol>
      )}
    </nav>
  );
}
