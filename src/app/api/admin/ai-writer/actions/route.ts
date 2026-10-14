import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/adminAuth';
import { processEditorSectionAction, SectionActionRequest } from '@/lib/aiWriter/editorActions';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req, ['SUPER_ADMIN', 'ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;

    const body = (await req.json().catch(() => ({}))) as SectionActionRequest;
    if (!body.action) {
      return NextResponse.json({ error: 'Action parameter is required.' }, { status: 400 });
    }

    const result = await processEditorSectionAction(body);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error processing section action' }, { status: 500 });
  }
}

