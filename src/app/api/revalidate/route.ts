import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { revalidateHomepageAndNews } from '@/lib/revalidate';

export const dynamic = 'force-dynamic';

/**
 * On-demand revalidation endpoint for homepage and site feeds.
 * Usage:
 *   GET /api/revalidate?path=/&secret=YOUR_CRON_SECRET
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret') || req.headers.get('authorization')?.replace('Bearer ', '');
    const validSecret = process.env.CRON_SECRET || 'nusalensa-cron-secret-2026';

    if (process.env.CRON_SECRET && secret !== validSecret) {
      return NextResponse.json({ error: 'Unauthorized: Invalid revalidation secret.' }, { status: 401 });
    }

    const path = searchParams.get('path') || '/';
    revalidatePath(path);
    revalidateHomepageAndNews();

    return NextResponse.json({
      revalidated: true,
      path,
      now: new Date().toISOString(),
      message: `Static cache purged and regenerated for "${path}".`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Revalidation error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}

