import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/adminAuth';
import { getProviderStatus } from '@/lib/aiWriter/provider';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req, ['SUPER_ADMIN', 'ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;

    const status = getProviderStatus();

    return NextResponse.json({
      success: true,
      status,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

