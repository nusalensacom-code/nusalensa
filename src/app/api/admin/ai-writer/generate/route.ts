import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/adminAuth';
import { GenerationInput } from '@/lib/aiWriter/types';
import { executeAiArticleJob } from '@/lib/aiWriter/generator';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req, ['SUPER_ADMIN', 'ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;

    const body = await req.json().catch(() => ({}));
    const {
      primaryKeyword,
      articleType = 'BUYING_GUIDE',
      targetAudience = 'General Consumers',
      targetMarket = 'Global',
      secondaryKeywords = [],
      targetWordCount = 1500,
      writingTone = 'Professional',
      researchMode = 'AI_KNOWLEDGE',
      referenceUrls = [],
    } = body;

    if (!primaryKeyword || typeof primaryKeyword !== 'string' || !primaryKeyword.trim()) {
      return NextResponse.json({ error: 'Primary Keyword is required.' }, { status: 400 });
    }

    const wordCount = Math.max(parseInt(String(targetWordCount), 10) || 1500, 1200);

    // Prevent duplicate spam submissions within 30 seconds for the same keyword
    const recentDuplicate = await prisma.aiGenerationJob.findFirst({
      where: {
        primaryKeyword: primaryKeyword.trim(),
        status: { in: ['QUEUED', 'RESEARCHING', 'DRAFTING', 'VALIDATING'] },
        createdAt: { gte: new Date(Date.now() - 30000) },
      },
    });

    if (recentDuplicate) {
      return NextResponse.json({
        success: true,
        message: 'A generation job for this keyword is already in progress.',
        jobId: recentDuplicate.id,
      });
    }

    // Resolve valid user ID in database to guarantee foreign key integrity
    let resolvedUserId: number | null = null;
    if (auth.user?.userId) {
      const existingUser = await prisma.user.findUnique({ where: { id: auth.user.userId } });
      if (existingUser) {
        resolvedUserId = existingUser.id;
      }
    }
    if (!resolvedUserId) {
      const fallbackAdmin = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
      resolvedUserId = fallbackAdmin?.id || null;
    }

    // 1. Create Job Record in Database
    const job = await prisma.aiGenerationJob.create({
      data: {
        primaryKeyword: primaryKeyword.trim(),
        secondaryKeywords: Array.isArray(secondaryKeywords) ? secondaryKeywords.join(', ') : secondaryKeywords,
        articleType,
        targetAudience,
        targetMarket,
        targetWordCount: wordCount,
        actualWordCount: 0,
        writingTone,
        researchMode,
        referenceUrls: JSON.stringify(referenceUrls || []),
        status: 'QUEUED',
        currentStep: 'Job queued for generation...',
        progressPercent: 5,
        userId: resolvedUserId,
      },
    });

    const generationInput: GenerationInput = {
      primaryKeyword: primaryKeyword.trim(),
      articleType,
      targetAudience,
      targetMarket,
      secondaryKeywords: Array.isArray(secondaryKeywords) ? secondaryKeywords : [secondaryKeywords].filter(Boolean),
      targetWordCount: wordCount,
      writingTone,
      researchMode,
      referenceUrls: Array.isArray(referenceUrls) ? referenceUrls : [],
      userId: resolvedUserId || undefined,
    };

    // Execute generation pipeline
    // Run asynchronously to allow non-blocking immediate response for polling
    executeAiArticleJob(job.id, generationInput).catch((err) => {
      console.error(`[Background Job ${job.id}] Execution failed:`, err);
    });

    return NextResponse.json({
      success: true,
      jobId: job.id,
      message: 'Article generation job initiated successfully.',
    });
  } catch (error: any) {
    console.error('AI Generate API error:', error);
    return NextResponse.json({ error: error.message || 'Internal generation error' }, { status: 500 });
  }
}

