import React from 'react';
import { prisma } from '@/lib/prisma';
import { ArticlesTable } from '@/components/admin/ArticlesTable';

export default async function AdminArticlesPage() {
  const [articles, categories, authors] = await Promise.all([
    prisma.article.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        subcategory: true,
        author: true,
      },
    }),
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.author.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <ArticlesTable
      initialArticles={articles as any}
      categories={categories}
      authors={authors}
    />
  );
}
