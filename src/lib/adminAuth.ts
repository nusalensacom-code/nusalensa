import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, AdminSession } from '@/lib/auth';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'AUTHOR';

export interface AuthResult {
  authenticated: boolean;
  user?: AdminSession;
  error?: string;
}

/**
 * Get current session from cookie in NextRequest
 */
export function getAdminSessionFromRequest(req: NextRequest): AdminSession | null {
  const authHeader = req.headers.get('authorization');
  let token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    token =
      req.cookies.get('nusalensa_session')?.value ||
      req.cookies.get('updateyuk_session')?.value ||
      null;
  }

  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * Check if session has required roles
 */
export function hasRequiredRole(session: AdminSession, allowedRoles: UserRole[]): boolean {
  if (session.role === 'SUPER_ADMIN') return true; // Super admin can do everything
  return allowedRoles.includes(session.role as UserRole);
}

/**
 * API route guard helper: returns user if authorized, otherwise returns NextResponse error
 */
export function requireAdminAuth(
  req: NextRequest,
  allowedRoles: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR']
): { user: AdminSession } | NextResponse {
  const session = getAdminSessionFromRequest(req);
  if (!session) {
    return NextResponse.json(
      { error: 'Access denied. Your session has expired or you are not logged in.' },
      { status: 401 }
    );
  }

  if (!hasRequiredRole(session, allowedRoles)) {
    return NextResponse.json(
      { error: `Insufficient permissions for role: ${session.role}.` },
      { status: 403 }
    );
  }

  return { user: session };
}
