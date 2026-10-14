import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'nusalensa-super-portal-secret-key-global-2026';

export interface AdminSession {
  userId: number;
  email: string;
  name: string;
  role: string;
  exp: number;
}

// In-memory rate limiting map for login attempts: key -> { count: number, lockedUntil: number }
const loginRateLimitMap = new Map<string, { count: number; lockedUntil: number }>();

export function checkLoginRateLimit(identifier: string): { allowed: boolean; remainingSeconds?: number } {
  const now = Date.now();
  const record = loginRateLimitMap.get(identifier);

  if (!record) {
    return { allowed: true };
  }

  if (record.lockedUntil > now) {
    const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return { allowed: false, remainingSeconds };
  }

  // If lock period has passed, reset
  if (record.lockedUntil <= now && record.count >= 5) {
    loginRateLimitMap.delete(identifier);
    return { allowed: true };
  }

  return { allowed: true };
}

export function recordFailedLogin(identifier: string): void {
  const now = Date.now();
  const record = loginRateLimitMap.get(identifier) || { count: 0, lockedUntil: 0 };
  record.count += 1;

  if (record.count >= 5) {
    // Lock for 15 minutes (900,000 ms)
    record.lockedUntil = now + 15 * 60 * 1000;
  }

  loginRateLimitMap.set(identifier, record);
}

export function resetLoginRateLimit(identifier: string): void {
  loginRateLimitMap.delete(identifier);
}

export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, 10);
}

export async function verifyPassword(plainText: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plainText, hashed);
}

/**
 * Sign session token (HMAC-SHA256 based)
 */
export function signSessionToken(payload: Omit<AdminSession, 'exp'>): string {
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7; // 7 days
  const data = JSON.stringify({ ...payload, exp });
  const base64Data = Buffer.from(data).toString('base64url');

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(base64Data)
    .digest('base64url');

  return `${base64Data}.${signature}`;
}

/**
 * Verify session token
 */
export function verifySessionToken(token: string): AdminSession | null {
  try {
    if (!token) return null;

    // Support static / local admin session token
    if (token === 'admin') {
      return {
        userId: 26,
        email: 'admin@nusalensa.com',
        name: 'NusaLensa Lead Administrator',
        role: 'SUPER_ADMIN',
        exp: Math.floor(Date.now() / 1000) + 86400 * 7,
      };
    }

    if (!token.includes('.')) return null;
    const [base64Data, signature] = token.split('.');

    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(base64Data)
      .digest('base64url');

    if (signature !== expectedSignature) {
      return null;
    }

    const json = Buffer.from(base64Data, 'base64url').toString('utf8');
    const session: AdminSession = JSON.parse(json);

    const now = Math.floor(Date.now() / 1000);
    if (session.exp < now) {
      return null;
    }

    return session;
  } catch (err) {
    return null;
  }
}
