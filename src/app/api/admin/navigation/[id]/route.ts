import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

// PUT: Update navigation item
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAdminAuth(req, ['SUPER_ADMIN', 'ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;

    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const body = await req.json();
    const { label, url, location, order, isActive } = body;

    const updateData: any = {};
    if (label !== undefined) updateData.label = label.trim();
    if (url !== undefined) updateData.url = url.trim();
    if (location !== undefined) updateData.location = location === 'FOOTER' ? 'FOOTER' : 'HEADER';
    if (order !== undefined) updateData.order = Number(order);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const updated = await prisma.navigationItem.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ item: updated, message: 'Navigation item updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update navigation item' }, { status: 500 });
  }
}

// DELETE: Delete navigation item
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAdminAuth(req, ['SUPER_ADMIN', 'ADMIN']);
    if (auth instanceof NextResponse) return auth;

    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    await prisma.navigationItem.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Navigation item deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete navigation item' }, { status: 500 });
  }
}

