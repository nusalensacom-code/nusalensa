import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '7d'; // 'today', '7d', '30d', 'all'

    // Total counts
    const totalArticles = await prisma.article.count();
    const publishedArticles = await prisma.article.count({ where: { status: 'PUBLISHED' } });
    const totalViewsAggregate = await prisma.article.aggregate({ _sum: { views: true } });
    const totalViews = totalViewsAggregate._sum.views || 0;

    // Top 10 articles by views
    const topArticles = await prisma.article.findMany({
      take: 10,
      orderBy: { views: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        views: true,
        status: true,
        publishedAt: true,
        category: { select: { name: true, slug: true } },
        author: { select: { name: true } },
      },
    });

    // Top categories by total views of their articles
    const categories = await prisma.category.findMany({
      include: {
        articles: {
          select: { views: true },
        },
        _count: {
          select: { articles: true },
        },
      },
    });

    const categoryStats = categories
      .map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        articleCount: c._count.articles,
        totalViews: c.articles.reduce((acc, curr) => acc + (curr.views || 0), 0),
      }))
      .sort((a, b) => b.totalViews - a.totalViews)
      .slice(0, 8);

    // Date calculations for daily view trends (past 7 days)
    const now = new Date();
    const daysTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

      const dayViews = await prisma.articleView.count({
        where: {
          createdAt: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      });

      daysTrend.push({
        date: d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }),
        views: dayViews,
      });
    }

    // Today's views
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const todayViews = await prisma.articleView.count({
      where: { createdAt: { gte: startOfToday } },
    });

    // Check if Google Analytics or Search Console is configured in Settings
    const gaSetting = await prisma.setting.findUnique({ where: { key: 'ga_id' } });
    const gscSetting = await prisma.setting.findUnique({ where: { key: 'gsc_verification' } });

    return NextResponse.json({
      summary: {
        totalViews,
        todayViews,
        totalArticles,
        publishedArticles,
        gaConfigured: Boolean(gaSetting?.value?.trim()),
        gaId: gaSetting?.value || null,
        gscConfigured: Boolean(gscSetting?.value?.trim()),
      },
      topArticles,
      categoryStats,
      daysTrend,
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: error.message || 'Failed to load analytics' }, { status: 500 });
  }
}

