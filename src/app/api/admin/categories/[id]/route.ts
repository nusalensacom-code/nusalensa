import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

// GET: Single category
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAdminAuth(req);
    if (auth instanceof NextResponse) return auth;

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        _count: {
          select: { articles: true, articlesAsSubcategory: true, children: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ category });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to load category' }, { status: 500 });
  }
}

// PUT: Update category
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAdminAuth(req, ['SUPER_ADMIN', 'ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body = await req.json();
    const { name, slug, description, seoTitle, seoDescription, order, parentId } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const cleanSlug = slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Prevent setting self as parent
    const parsedParentId = parentId ? parseInt(String(parentId), 10) : null;
    if (parsedParentId === id) {
      return NextResponse.json({ error: 'Category cannot be its own parent' }, { status: 400 });
    }

    // Check duplicate slug with another category
    const duplicate = await prisma.category.findFirst({
      where: {
        slug: cleanSlug,
        id: { not: id },
      },
    });

    if (duplicate) {
      return NextResponse.json({ error: `Slug "${cleanSlug}" is already taken by another category` }, { status: 400 });
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: name.trim(),
        slug: cleanSlug,
        description: description?.trim() || null,
        seoTitle: seoTitle?.trim() || null,
        seoDescription: seoDescription?.trim() || null,
        order: typeof order === 'number' ? order : 0,
        parentId: parsedParentId,
      },
      include: {
        parent: true,
      },
    });

    return NextResponse.json({ category: updated, message: 'Category updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update category' }, { status: 500 });
  }
}

// DELETE: Delete category safely
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAdminAuth(req, ['SUPER_ADMIN', 'ADMIN']);
    if (auth instanceof NextResponse) return auth;

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { articles: true, articlesAsSubcategory: true, children: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const totalArticles = category._count.articles + category._count.articlesAsSubcategory;
    if (totalArticles > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete category "${category.name}" because it still has ${totalArticles} associated articles. Reassign or delete those articles first.`,
        },
        { status: 400 }
      );
    }

    if (category._count.children > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete category "${category.name}" because it has ${category._count.children} subcategories. Delete or move subcategories first.`,
        },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: `Category "${category.name}" deleted successfully.` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete category' }, { status: 500 });
  }
}

