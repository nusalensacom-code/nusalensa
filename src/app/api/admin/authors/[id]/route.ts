import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

// GET: Single author
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAdminAuth(req);
    if (auth instanceof NextResponse) return auth;

    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const author = await prisma.author.findUnique({
      where: { id },
      include: {
        _count: {
          select: { articlesWritten: true, articlesEdited: true },
        },
      },
    });

    if (!author) return NextResponse.json({ error: 'Author not found' }, { status: 404 });
    return NextResponse.json({ author });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to load author' }, { status: 500 });
  }
}

// PUT: Update author
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAdminAuth(req, ['SUPER_ADMIN', 'ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;

    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const body = await req.json();
    const { name, slug, email, bio, avatar, role, twitter, linkedin } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Author name and slug are required' }, { status: 400 });
    }

    const cleanSlug = slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const duplicate = await prisma.author.findFirst({
      where: {
        slug: cleanSlug,
        id: { not: id },
      },
    });

    if (duplicate) {
      return NextResponse.json({ error: `Slug "${cleanSlug}" is already taken by another author` }, { status: 400 });
    }

    const author = await prisma.author.update({
      where: { id },
      data: {
        name: name.trim(),
        slug: cleanSlug,
        email: email?.trim() || null,
        bio: bio?.trim() || null,
        avatar: avatar?.trim() || null,
        role: role?.trim() || 'Editorial Staff',
        twitter: twitter?.trim() || null,
        linkedin: linkedin?.trim() || null,
      },
    });

    return NextResponse.json({ author, message: 'Author profile updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update author' }, { status: 500 });
  }
}

// DELETE: Safe delete author
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAdminAuth(req, ['SUPER_ADMIN', 'ADMIN']);
    if (auth instanceof NextResponse) return auth;

    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const author = await prisma.author.findUnique({
      where: { id },
      include: {
        _count: {
          select: { articlesWritten: true, articlesEdited: true },
        },
      },
    });

    if (!author) return NextResponse.json({ error: 'Author not found' }, { status: 404 });

    if (author._count.articlesWritten > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete author "${author.name}" because they have written ${author._count.articlesWritten} articles. Reassign their articles first.`,
        },
        { status: 400 }
      );
    }

    await prisma.author.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: `Author "${author.name}" deleted successfully` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete author' }, { status: 500 });
  }
}

