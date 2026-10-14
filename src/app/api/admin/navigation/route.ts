import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

// GET: List navigation items
export async function GET(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(req.url);
    const location = searchParams.get('location'); // HEADER or FOOTER

    let whereClause: any = {};
    if (location && ['HEADER', 'FOOTER'].includes(location)) {
      whereClause.location = location;
    }

    const items = await prisma.navigationItem.findMany({
      where: whereClause,
      orderBy: [{ location: 'asc' }, { order: 'asc' }],
    });

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error('Error listing navigation items:', error);
    return NextResponse.json({ error: error.message || 'Failed to load navigation items' }, { status: 500 });
  }
}

// POST: Add new navigation item
export async function POST(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req, ['SUPER_ADMIN', 'ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const { label, url, location, order, isActive } = body;

    if (!label || !url) {
      return NextResponse.json({ error: 'Navigation label and destination URL are required' }, { status: 400 });
    }

    const item = await prisma.navigationItem.create({
      data: {
        label: label.trim(),
        url: url.trim(),
        location: location === 'FOOTER' ? 'FOOTER' : 'HEADER',
        order: Number(order) || 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({ item, message: 'Navigation item added successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating navigation item:', error);
    return NextResponse.json({ error: error.message || 'Failed to add navigation item' }, { status: 500 });
  }
}

