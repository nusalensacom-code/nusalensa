import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/adminAuth';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// GET: List subscribers
export async function GET(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q');
    const status = searchParams.get('status');

    let whereClause: any = {};
    if (status && status !== 'ALL') {
      whereClause.status = status;
    }
    if (search) {
      whereClause.OR = [
        { email: { contains: search } },
        { name: { contains: search } },
      ];
    }

    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    const totalCount = await prisma.newsletterSubscriber.count();
    const activeCount = await prisma.newsletterSubscriber.count({ where: { status: 'ACTIVE' } });
    const unsubscribedCount = await prisma.newsletterSubscriber.count({ where: { status: 'UNSUBSCRIBED' } });

    return NextResponse.json({
      subscribers,
      stats: { total: totalCount, active: activeCount, unsubscribed: unsubscribedCount },
    });
  } catch (error: any) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json({ error: error.message || 'Failed to load newsletter subscribers' }, { status: 500 });
  }
}

// POST: Add subscriber manually
export async function POST(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req, ['SUPER_ADMIN', 'ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const { email, name, status } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Please provide a valid email address' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json({ error: 'This email is already subscribed' }, { status: 400 });
    }

    const token = crypto.randomBytes(16).toString('hex');

    const subscriber = await prisma.newsletterSubscriber.create({
      data: {
        email: cleanEmail,
        name: name?.trim() || null,
        status: status === 'UNSUBSCRIBED' ? 'UNSUBSCRIBED' : 'ACTIVE',
        unsubscribeToken: token,
      },
    });

    return NextResponse.json({ subscriber, message: 'Subscriber added successfully' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to add subscriber' }, { status: 500 });
  }
}

