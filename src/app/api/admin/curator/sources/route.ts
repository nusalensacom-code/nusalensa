import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/adminAuth';
import { seedDefaultNewsSources } from '@/lib/newsPipeline/sources';

export const dynamic = 'force-dynamic';

// GET: List all news sources
export async function GET(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req);
    if (auth instanceof NextResponse) return auth;

    await seedDefaultNewsSources();

    const sources = await prisma.newsSource.findMany({
      orderBy: { id: 'asc' },
      include: {
        _count: { select: { queueItems: true } },
      },
    });

    return NextResponse.json({ sources });
  } catch (error: any) {
    console.error('Error fetching news sources:', error);
    return NextResponse.json({ error: error.message || 'Failed to load news sources' }, { status: 500 });
  }
}

// POST: Add new source
export async function POST(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req, ['SUPER_ADMIN', 'ADMIN']);
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const { name, url, categoryHint } = body;

    if (!name || !url) {
      return NextResponse.json({ error: 'Source name and RSS / API feed URL are required' }, { status: 400 });
    }

    const existing = await prisma.newsSource.findUnique({
      where: { url: url.trim() },
    });

    if (existing) {
      return NextResponse.json({ error: 'This feed URL is already registered' }, { status: 400 });
    }

    const source = await prisma.newsSource.create({
      data: {
        name: name.trim(),
        url: url.trim(),
        categoryHint: categoryHint?.trim() || 'technology',
        isActive: true,
      },
    });

    return NextResponse.json({ source, message: 'News source added successfully' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to add news source' }, { status: 500 });
  }
}

