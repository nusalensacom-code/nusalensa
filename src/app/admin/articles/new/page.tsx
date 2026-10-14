import React from 'react';
import { prisma } from '@/lib/prisma';
import { ArticleForm } from '@/components/admin/ArticleForm';

export default async function NewArticlePage() {
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
      orderBy: { publishedAt: 'desc' },
      take: 25,
      select: { id: true, title: true },
    }),
  ]);

  return (
    <div>
      <ArticleForm
        categories={categories}
        authors={authors}
        tags={tags}
        existingArticles={existingArticles}
        isEdit={false}
      />
    </div>
  );
}
