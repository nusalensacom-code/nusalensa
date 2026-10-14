import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'ALL'; // PENDING_REVIEW, APPROVED, REJECTED, ALL
    const search = searchParams.get('q');
    const category = searchParams.get('category');

    let whereClause: any = {};

    if (status !== 'ALL') {
      whereClause.status = status;
    }

    if (category && category !== 'ALL') {
      whereClause.generatedCategory = category;
    }

    if (search) {
      whereClause.OR = [
        { sourceTitle: { contains: search } },
        { generatedTitle: { contains: search } },
        { sourceName: { contains: search } },
      ];
    }

    const items = await prisma.curatedNewsQueue.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const pendingCount = await prisma.curatedNewsQueue.count({ where: { status: 'PENDING_REVIEW' } });
    const approvedCount = await prisma.curatedNewsQueue.count({ where: { status: 'APPROVED' } });
    const rejectedCount = await prisma.curatedNewsQueue.count({ where: { status: 'REJECTED' } });
    const totalCount = await prisma.curatedNewsQueue.count();

    return NextResponse.json({
      items,
      stats: {
        total: totalCount,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      },
    });
  } catch (error: any) {
    console.error('Error fetching curator queue:', error);
    return NextResponse.json({ error: error.message || 'Failed to load curation queue' }, { status: 500 });
  }
}

