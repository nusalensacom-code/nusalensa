import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

// GET: List authors with article counts
export async function GET(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req);
    if (auth instanceof NextResponse) return auth;

    const authors = await prisma.author.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            articlesWritten: true,
            articlesEdited: true,
          },
        },
      },
    });

    return NextResponse.json({ authors });
  } catch (error: any) {
    console.error('Error fetching authors:', error);
    return NextResponse.json({ error: error.message || 'Failed to load authors list' }, { status: 500 });
  }
}

// POST: Create author
export async function POST(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req, ['SUPER_ADMIN', 'ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;

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

    const existing = await prisma.author.findUnique({
      where: { slug: cleanSlug },
    });

    if (existing) {
      return NextResponse.json({ error: `Slug "${cleanSlug}" is already taken` }, { status: 400 });
    }

    const author = await prisma.author.create({
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

    return NextResponse.json({ author, message: 'Author profile created successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating author:', error);
    return NextResponse.json({ error: error.message || 'Failed to create author' }, { status: 500 });
  }
}

