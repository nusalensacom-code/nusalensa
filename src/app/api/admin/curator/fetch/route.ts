import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/adminAuth';
import { runNewsPipeline } from '@/lib/newsPipeline/pipeline';
import { revalidateHomepageAndNews } from '@/lib/revalidate';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req, ['SUPER_ADMIN', 'ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;

    const body = await req.json().catch(() => ({}));
    const autoPublish = body.autoPublish === true;

    const report = await runNewsPipeline({ maxItemsPerSource: 5, autoPublish });

    const message = autoPublish
      ? `Automated pipeline completed: ${report.newDraftsCreated} tech stories published live (${report.duplicatesSkipped} duplicates skipped).`
      : `Intake pipeline completed: ${report.newDraftsCreated} new candidate stories queued for review (${report.duplicatesSkipped} duplicates skipped).`;

    if (autoPublish) {
      revalidateHomepageAndNews();
    }

    return NextResponse.json({
      success: true,
      message,
      report,
    });
  } catch (error: any) {
    console.error('Error running curator pipeline:', error);
    return NextResponse.json({ error: error.message || 'Failed to run news intake pipeline' }, { status: 500 });
  }
}

