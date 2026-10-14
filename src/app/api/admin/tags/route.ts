import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

// GET: List all tags with article counts
export async function GET(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(req.url);
    const topicOnly = searchParams.get('topicOnly') === 'true';

    let whereClause: any = {};
    if (topicOnly) {
      whereClause.isTopic = true;
    }

    const tags = await prisma.tag.findMany({
      where: whereClause,
      orderBy: [{ isTopic: 'desc' }, { name: 'asc' }],
      include: {
        _count: {
          select: {
            articles: true,
            primaryArticles: true,
          },
        },
      },
    });

    return NextResponse.json({ tags });
  } catch (error: any) {
    console.error('Error fetching tags:', error);
    return NextResponse.json({ error: error.message || 'Failed to load tags' }, { status: 500 });
  }
}

// POST: Create a new tag
export async function POST(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req, ['SUPER_ADMIN', 'ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const { name, slug, description, isTopic } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Tag name and slug are required' }, { status: 400 });
    }

    const cleanSlug = slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const existing = await prisma.tag.findUnique({
      where: { slug: cleanSlug },
    });

    if (existing) {
      return NextResponse.json({ error: `Slug "${cleanSlug}" is already taken` }, { status: 400 });
    }

    const tag = await prisma.tag.create({
      data: {
        name: name.trim(),
        slug: cleanSlug,
        description: description?.trim() || null,
        isTopic: Boolean(isTopic),
      },
    });

    return NextResponse.json({ tag, message: 'Tag / Topic added successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating tag:', error);
    return NextResponse.json({ error: error.message || 'Failed to create tag' }, { status: 500 });
  }
}

