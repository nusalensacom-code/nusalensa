import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

// GET: Single queue item
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAdminAuth(req);
    if (auth instanceof NextResponse) return auth;

    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const item = await prisma.curatedNewsQueue.findUnique({ where: { id } });
    if (!item) return NextResponse.json({ error: 'Queue item not found' }, { status: 404 });

    return NextResponse.json({ item });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to load queue item' }, { status: 500 });
  }
}

// PUT: Update queue draft
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAdminAuth(req, ['SUPER_ADMIN', 'ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;

    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const body = await req.json();
    const {
      generatedTitle,
      generatedExcerpt,
      generatedContent,
      generatedCategory,
      generatedTags,
      seoTitle,
      seoDescription,
    } = body;

    const updated = await prisma.curatedNewsQueue.update({
      where: { id },
      data: {
        ...(generatedTitle && { generatedTitle }),
        ...(generatedExcerpt && { generatedExcerpt }),
        ...(generatedContent && { generatedContent }),
        ...(generatedCategory && { generatedCategory }),
        ...(generatedTags && { generatedTags }),
        ...(seoTitle && { seoTitle }),
        ...(seoDescription && { seoDescription }),
      },
    });

    return NextResponse.json({ item: updated, message: 'Queue draft updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update queue draft' }, { status: 500 });
  }
}

// DELETE: Delete from queue
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAdminAuth(req, ['SUPER_ADMIN', 'ADMIN']);
    if (auth instanceof NextResponse) return auth;

    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    await prisma.curatedNewsQueue.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Item deleted from queue successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete queue item' }, { status: 500 });
  }
}

