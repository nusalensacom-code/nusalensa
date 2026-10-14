import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SafeImage as Image } from '@/components/ui/SafeImage';
import { prisma } from '@/lib/prisma';
import { siteConfig } from '@/lib/siteConfig';
import { ArticleCard } from '@/components/ui/ArticleCard';
import { Breadcrumbs } from '@/components/ui/Breadcrumb';
import { JsonLd } from '@/components/seo/JsonLd';
import { generateAuthorSchema, generateCanonicalUrl } from '@/lib/seo';
import { formatDateEnglish } from '@/lib/utils';
import { User, Twitter, Linkedin, Calendar, BookOpen, ShieldCheck } from 'lucide-react';

interface AuthorPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  try {
    const authors = await prisma.author.findMany({
      select: { slug: true },
    });
    return authors.map((a) => ({
      slug: a.slug,
    }));
  } catch (e) {
    return [];
  }
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const author = await prisma.author.findUnique({
    where: { slug: params.slug },
  });

  if (!author) {
    notFound();
  }

  const title = `${author.name} - Author Profile & Articles | ${siteConfig.name}`;
  const description = author.bio || `Technology reporting, hardware reviews, and articles by ${author.name} on ${siteConfig.name}.`;
  const canonicalUrl = generateCanonicalUrl(`/author/${author.slug}`);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
    },
  };
}

export default async function AuthorProfilePage({ params }: AuthorPageProps) {
  const author = await prisma.author.findUnique({
    where: { slug: params.slug },
    include: {
      articlesWritten: {
        where: { status: 'PUBLISHED' },
        orderBy: { publishedAt: 'desc' },
        include: {
          category: true,
        },
      },
    },
  });

  if (!author) {
    notFound();
  }

  const authorSchema = generateAuthorSchema(author);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
      <JsonLd data={authorSchema} />
      <Breadcrumbs items={[{ name: author.name, url: `/author/${author.slug}` }]} />

      {/* Author Bio Header Card */}
      <section className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-10 my-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden flex-shrink-0 bg-slate-200 border-4 border-white shadow-md">
            {author.avatar ? (
              <Image
                src={author.avatar}
                alt={author.name}
                fill
                sizes="144px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-brand-100 text-brand-700 font-bold text-3xl">
                {author.name.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <span className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                Verified Tech Journalist
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {author.role}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {author.name}
            </h1>

            {author.bio && (
              <p className="text-slate-600 text-sm sm:text-base mt-3 max-w-3xl leading-relaxed">
                {author.bio}
              </p>
            )}

            {/* Author Meta Details */}
            <div className="mt-5 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6 text-xs text-slate-500">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1.5 text-slate-400" />
                <span>Joined: {formatDateEnglish(author.createdAt)}</span>
              </div>

              <div className="flex items-center">
                <BookOpen className="w-4 h-4 mr-1.5 text-slate-400" />
                <span>{author.articlesWritten.length} Articles Published</span>
              </div>

              {/* Social links */}
              <div className="flex items-center space-x-2">
                {author.twitter && (
                  <a
                    href={`https://twitter.com/${author.twitter.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-slate-500 hover:text-black transition-colors"
                    aria-label={`Twitter ${author.name}`}
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
                {author.linkedin && (
                  <a
                    href={`https://linkedin.com/in/${author.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-slate-500 hover:text-[#0A66C2] transition-colors"
                    aria-label={`LinkedIn ${author.name}`}
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Author Articles Stream */}
      <section aria-label={`All articles by ${author.name}`} className="mt-10">
        <h2 className="text-xl font-bold text-slate-900 pb-3 border-b-2 border-slate-900 mb-6">
          Articles & Coverage by {author.name}
        </h2>

        {author.articlesWritten.length === 0 ? (
          <p className="text-slate-500 text-sm">No articles published by this author yet.</p>
        ) : (
          <div className="space-y-4">
            {author.articlesWritten.map((article) => (
              <ArticleCard
                key={article.id}
                article={{
                  ...article,
                  author: {
                    name: author.name,
                    slug: author.slug,
                    avatar: author.avatar,
                  },
                }}
                variant="horizontal"
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

