import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAdminAuth(req, ['SUPER_ADMIN', 'ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;

    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const updated = await prisma.curatedNewsQueue.update({
      where: { id },
      data: { status: 'REJECTED' },
    });

    return NextResponse.json({
      success: true,
      message: 'Queue item rejected successfully.',
      item: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to reject item' }, { status: 500 });
  }
}

