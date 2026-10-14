import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req, ['SUPER_ADMIN', 'ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;

    const jobs = await prisma.aiGenerationJob.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        primaryKeyword: true,
        articleType: true,
        targetMarket: true,
        targetWordCount: true,
        actualWordCount: true,
        status: true,
        currentStep: true,
        progressPercent: true,
        errorMessage: true,
        articleId: true,
        createdAt: true,
        article: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            category: { select: { slug: true } },
          },
        },
      },
    });

    return NextResponse.json({ success: true, jobs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

