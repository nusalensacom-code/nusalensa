import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

// GET: Single tag
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAdminAuth(req);
    if (auth instanceof NextResponse) return auth;

    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: { articles: true, primaryArticles: true },
        },
      },
    });

    if (!tag) return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    return NextResponse.json({ tag });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to load tag' }, { status: 500 });
  }
}

// PUT: Update tag
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAdminAuth(req, ['SUPER_ADMIN', 'ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;

    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

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

    const duplicate = await prisma.tag.findFirst({
      where: {
        slug: cleanSlug,
        id: { not: id },
      },
    });

    if (duplicate) {
      return NextResponse.json({ error: `Slug "${cleanSlug}" is already taken by another tag` }, { status: 400 });
    }

    const tag = await prisma.tag.update({
      where: { id },
      data: {
        name: name.trim(),
        slug: cleanSlug,
        description: description?.trim() || null,
        isTopic: Boolean(isTopic),
      },
    });

    return NextResponse.json({ tag, message: 'Tag updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update tag' }, { status: 500 });
  }
}

// DELETE: Delete tag
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAdminAuth(req, ['SUPER_ADMIN', 'ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;

    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: { articles: true, primaryArticles: true },
        },
      },
    });

    if (!tag) return NextResponse.json({ error: 'Tag not found' }, { status: 404 });

    await prisma.tag.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: `Tag "${tag.name}" deleted successfully` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete tag' }, { status: 500 });
  }
}

