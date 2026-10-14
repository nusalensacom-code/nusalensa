import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SafeImage as Image } from '@/components/ui/SafeImage';
import { prisma } from '@/lib/prisma';
import { siteConfig } from '@/lib/siteConfig';
import { Breadcrumbs } from '@/components/ui/Breadcrumb';
import { AuthorBox } from '@/components/ui/AuthorBox';
import { FaqAccordion, FaqItem } from '@/components/ui/FaqAccordion';
import { SourcesBox, SourceItem } from '@/components/ui/SourcesBox';
import { formatDateEnglish, renderArticleMarkdown } from '@/lib/utils';
import {
  Calendar,
  Clock,
  Eye,
  ArrowLeft,
  Edit,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Editorial Preview | NusaLensa CMS',
  robots: {
    index: false,
    follow: false,
  },
};

interface PreviewPageProps {
  params: { id: string };
}

export default async function AdminArticlePreviewPage({ params }: PreviewPageProps) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) notFound();

  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      category: true,
      subcategory: true,
      author: true,
      editor: true,
      primaryTopic: true,
      tags: true,
    },
  });

  if (!article) {
    notFound();
  }

  // Parse FAQs & Sources
  let faqs: FaqItem[] = [];
  if (article.faqs) {
    try {
      faqs = JSON.parse(article.faqs);
    } catch (e) {}
  }

  let sources: SourceItem[] = [];
  if (article.sources) {
    try {
      sources = JSON.parse(article.sources);
    } catch (e) {}
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Admin Preview Banner */}
      <div className="sticky top-0 z-50 bg-amber-500 text-slate-950 px-4 py-2.5 shadow-md flex items-center justify-between text-xs font-bold">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4" />
          <span>EDITORIAL PREVIEW MODE</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-[10px] uppercase font-black">
            STATUS: {article.status}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href={`/admin/articles/${article.id}/edit`}
            className="inline-flex items-center space-x-1 px-3 py-1 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Return to Editor</span>
          </Link>
          <Link
            href="/admin/articles"
            className="inline-flex items-center space-x-1 px-2.5 py-1 bg-amber-600/30 hover:bg-amber-600/50 rounded-lg text-slate-950 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Article List</span>
          </Link>
        </div>
      </div>

      {/* Main Public-Like Article Container */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Breadcrumbs
          items={[
            { name: article.category.name, url: `/${article.category.slug}` },
            ...(article.subcategory
              ? [{ name: article.subcategory.name, url: `/${article.subcategory.slug}` }]
              : []),
            { name: article.title, url: '#' },
          ]}
        />

        <header className="my-6">
          <div className="flex items-center space-x-2 mb-3">
            <span className="px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-bold uppercase tracking-wider rounded">
              {article.category.name}
            </span>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded">
              {article.articleType}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            {article.title}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 mt-3 font-medium leading-relaxed">
            {article.excerpt}
          </p>

          <div className="mt-5 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-3">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-900">
                By {article.author.name}
              </span>
              {article.editor && (
                <>
                  <span>•</span>
                  <span>Editor: {article.editor.name}</span>
                </>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1" />
                {formatDateEnglish(article.publishedAt)}
              </span>
              <span className="flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1" />
                {article.readingTime} min read
              </span>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <figure className="my-6">
          <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
            <Image
              src={article.featuredImage}
              alt={article.imageAltText || article.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 896px"
              className="object-cover"
            />
          </div>
          {(article.imageCaption || article.imageSource) && (
            <figcaption className="text-xs text-slate-500 mt-2 text-center">
              {article.imageCaption}
              {article.imageSource && (
                <span className="ml-1 text-slate-400 italic">
                  (Source: {article.imageSource})
                </span>
              )}
            </figcaption>
          )}
        </figure>

        {/* Article Content */}
        <div
          className="prose prose-slate max-w-none my-8 leading-relaxed text-slate-800 text-base sm:text-lg"
          dangerouslySetInnerHTML={{ __html: renderArticleMarkdown(article.content) }}
        />

        {/* FAQs */}
        {faqs.length > 0 && <FaqAccordion faqs={faqs} />}

        {/* Sources */}
        {sources.length > 0 && <SourcesBox sources={sources} />}

        {/* Author Box */}
        <div className="my-8">
          <AuthorBox author={article.author} />
        </div>
      </article>
    </div>
  );
}
