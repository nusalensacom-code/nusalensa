import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ArticleForm } from '@/components/admin/ArticleForm';

export async function generateStaticParams() {
  try {
    const articles = await prisma.article.findMany({ select: { id: true } });
    return articles.map((a) => ({ id: String(a.id) }));
  } catch (e) {
    return [];
  }
}

interface EditArticlePageProps {
  params: { id: string };
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const id = parseInt(params.id, 10);
  const article = await prisma.article.findUnique({
    where: { id },
    include: { tags: true },
  });

  if (!article) {
    notFound();
  }

  const [categories, authors, tags, existingArticles] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { order: 'asc' },
      include: {
        children: { orderBy: { order: 'asc' } },
      },
    }),
    prisma.author.findMany({ orderBy: { name: 'asc' } }),
    prisma.tag.findMany({ orderBy: { name: 'asc' } }),
    prisma.article.findMany({
      where: { id: { not: id } },
      orderBy: { publishedAt: 'desc' },
      take: 25,
      select: { id: true, title: true },
    }),
  ]);

  return (
    <div>
      <ArticleForm
        initialData={article}
        categories={categories}
        authors={authors}
        tags={tags}
        existingArticles={existingArticles}
        isEdit={true}
      />
    </div>
  );
}
