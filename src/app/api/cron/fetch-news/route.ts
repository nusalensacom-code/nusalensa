import { NextRequest, NextResponse } from 'next/server';
import { runNewsPipeline } from '@/lib/newsPipeline/pipeline';
import { revalidateHomepageAndNews } from '@/lib/revalidate';

export const dynamic = 'force-dynamic';

/**
 * Automated Cron Endpoint for Scheduled News Ingestion & Publishing.
 * Supports Vercel Cron, Cloudflare Workers / Cron Triggers, GitHub Actions, or local scheduled tasks.
 *
 * Usage:
 *   GET /api/cron/fetch-news?token=YOUR_CRON_SECRET&autoPublish=true
 *   POST /api/cron/fetch-news
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token') || req.headers.get('authorization')?.replace('Bearer ', '');
    const cronSecret = process.env.CRON_SECRET || 'nusalensa-cron-secret-2026';

    // Verify token if CRON_SECRET is configured
    if (process.env.CRON_SECRET && token !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized: Invalid cron authentication token.' }, { status: 401 });
    }

    const autoPublish = searchParams.get('autoPublish') !== 'false'; // Defaults to true for cron
    const maxItems = parseInt(searchParams.get('max') || '5', 10);

    console.log(`[CRON] Starting automated news intake (autoPublish=${autoPublish}, max=${maxItems})...`);

    const report = await runNewsPipeline({
      maxItemsPerSource: maxItems,
      autoPublish,
    });

    console.log(`[CRON] News intake completed:`, report);

    if (autoPublish) {
      revalidateHomepageAndNews();
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      mode: autoPublish ? 'AUTO_PUBLISH_LIVE' : 'QUEUE_FOR_REVIEW',
      report,
    });
  } catch (error: any) {
    console.error('[CRON] News intake fatal error:', error);
    return NextResponse.json({ error: error.message || 'Internal cron pipeline error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}

