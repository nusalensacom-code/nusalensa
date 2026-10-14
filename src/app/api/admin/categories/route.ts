import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

// GET: List all categories (optionally only parents or include children)
export async function GET(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(req.url);
    const parentOnly = searchParams.get('parentOnly') === 'true';
    const subcategoryOnly = searchParams.get('subcategoryOnly') === 'true';

    let whereClause: any = {};
    if (parentOnly) {
      whereClause.parentId = null;
    } else if (subcategoryOnly) {
      whereClause.parentId = { not: null };
    }

    const categories = await prisma.category.findMany({
      where: whereClause,
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
        children: {
          select: { id: true, name: true, slug: true, order: true },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            articles: true,
            articlesAsSubcategory: true,
            children: true,
          },
        },
      },
    });

    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: error.message || 'Failed to load categories' }, { status: 500 });
  }
}

// POST: Create a new category
export async function POST(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req, ['SUPER_ADMIN', 'ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const { name, slug, description, seoTitle, seoDescription, order, parentId } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    // Clean slug
    const cleanSlug = slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check duplicate slug
    const existing = await prisma.category.findUnique({
      where: { slug: cleanSlug },
    });

    if (existing) {
      return NextResponse.json({ error: `Slug "${cleanSlug}" is already taken` }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: cleanSlug,
        description: description?.trim() || null,
        seoTitle: seoTitle?.trim() || null,
        seoDescription: seoDescription?.trim() || null,
        order: typeof order === 'number' ? order : 0,
        parentId: parentId ? parseInt(String(parentId), 10) : null,
      },
      include: {
        parent: true,
      },
    });

    return NextResponse.json({ category, message: 'Category created successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: error.message || 'Failed to create category' }, { status: 500 });
  }
}

