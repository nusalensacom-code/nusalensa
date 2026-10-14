import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

// PUT: Update subscriber status or details
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAdminAuth(req, ['SUPER_ADMIN', 'ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;

    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const body = await req.json();
    const { status, name, email } = body;

    const updated = await prisma.newsletterSubscriber.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(name !== undefined && { name: name?.trim() || null }),
        ...(email && { email: email.toLowerCase().trim() }),
      },
    });

    return NextResponse.json({ subscriber: updated, message: 'Subscriber status updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update subscriber' }, { status: 500 });
  }
}

// DELETE: Remove subscriber
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAdminAuth(req, ['SUPER_ADMIN', 'ADMIN']);
    if (auth instanceof NextResponse) return auth;

    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    await prisma.newsletterSubscriber.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Subscriber deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete subscriber' }, { status: 500 });
  }
}

