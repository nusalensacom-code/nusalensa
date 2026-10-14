'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  faqs: FaqItem[];
  title?: string;
}

export function FaqAccordion({ faqs, title = 'Frequently Asked Questions (FAQ)' }: FaqAccordionProps) {
  const [openIndices, setOpenIndices] = useState<number[]>([0]);

  if (!faqs || faqs.length === 0) return null;

  const toggleIndex = (idx: number) => {
    if (openIndices.includes(idx)) {
      setOpenIndices(openIndices.filter((i) => i !== idx));
    } else {
      setOpenIndices([...openIndices, idx]);
    }
  };

  return (
    <section
      aria-label="Frequently Asked Questions"
      className="my-10 p-6 sm:p-8 bg-slate-50 border border-slate-200 rounded-2xl"
    >
      <div className="flex items-center space-x-2 text-slate-900 font-extrabold text-xl sm:text-2xl mb-6">
        <HelpCircle className="w-6 h-6 text-cyan-700 flex-shrink-0" />
        <h2>{title}</h2>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndices.includes(idx);
          return (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all shadow-xs"
            >
              <button
                type="button"
                onClick={() => toggleIndex(idx)}
                aria-expanded={isOpen}
                className="w-full text-left px-5 py-4 flex items-center justify-between text-sm sm:text-base font-bold text-slate-900 hover:text-cyan-700 transition-colors"
              >
                <span>{faq.question}</span>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0 ml-2" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0 ml-2" />
                )}
              </button>

              {isOpen && (
                <div className="px-5 pb-4 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
