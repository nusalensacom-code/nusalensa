import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { devices: true },
        },
      },
    });

    return NextResponse.json({ brands });
  } catch (error: any) {
    console.error('Error fetching brands:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brands', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, logo, country, website, description } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Brand name and slug are required' },
        { status: 400 }
      );
    }

    const existing = await prisma.brand.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A brand with this slug already exists' },
        { status: 409 }
      );
    }

    const brand = await prisma.brand.create({
      data: {
        name,
        slug,
        logo: logo || null,
        country: country || null,
        website: website || null,
        description: description || null,
      },
    });

    return NextResponse.json({ brand }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating brand:', error);
    return NextResponse.json(
      { error: 'Failed to create brand', details: error.message },
      { status: 500 }
    );
  }
}

