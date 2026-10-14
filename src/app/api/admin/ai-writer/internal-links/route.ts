import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req, ['SUPER_ADMIN', 'ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;

    const [articles, devices, brands] = await Promise.all([
      prisma.article.findMany({
        where: { status: 'PUBLISHED' },
        take: 30,
        orderBy: { views: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          category: { select: { slug: true } },
        },
      }),
      prisma.device.findMany({
        take: 30,
        orderBy: { views: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          brand: { select: { slug: true, name: true } },
        },
      }),
      prisma.brand.findMany({
        take: 15,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
        },
      }),
    ]);

    const links = [
      ...articles.map((a) => ({
        id: `article-${a.id}`,
        title: a.title,
        url: `/${a.category.slug}/${a.slug}`,
        type: 'Article',
      })),
      ...devices.map((d) => ({
        id: `device-${d.id}`,
        title: `${d.brand.name} ${d.name} Specs`,
        url: `/phones/${d.brand.slug}/${d.slug}`,
        type: 'Device Specs',
      })),
      ...brands.map((b) => ({
        id: `brand-${b.id}`,
        title: `${b.name} Smartphone Hub`,
        url: `/brands/${b.slug}`,
        type: 'Brand Hub',
      })),
    ];

    return NextResponse.json({ success: true, links });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

