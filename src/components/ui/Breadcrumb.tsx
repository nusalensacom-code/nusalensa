import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { generateBreadcrumbSchema, BreadcrumbItem } from '@/lib/seo';
import { JsonLd } from '../seo/JsonLd';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const fullItems: BreadcrumbItem[] = [
    { name: 'Home', url: '/' },
    ...items,
  ];

  const schemaData = generateBreadcrumbSchema(fullItems);

  return (
    <>
      <JsonLd data={schemaData} />
      <nav aria-label="Breadcrumb" className="py-3 text-sm text-slate-500 overflow-x-auto whitespace-nowrap">
        <ol className="flex items-center space-x-2">
          {fullItems.map((item, index) => {
            const isLast = index === fullItems.length - 1;

            return (
              <li key={item.url + index} className="flex items-center space-x-2">
                {index > 0 && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                )}
                {index === 0 ? (
                  <Link
                    href="/"
                    className="flex items-center text-slate-600 hover:text-cyan-700 transition-colors"
                  >
                    <Home className="w-3.5 h-3.5 mr-1" />
                    <span>{item.name}</span>
                  </Link>
                ) : isLast ? (
                  <span
                    className="text-slate-900 font-medium truncate max-w-[280px] sm:max-w-md"
                    aria-current="page"
                  >
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.url}
                    className="text-slate-600 hover:text-cyan-700 transition-colors"
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
