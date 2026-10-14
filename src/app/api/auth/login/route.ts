import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  verifyPassword,
  signSessionToken,
  checkLoginRateLimit,
  recordFailedLogin,
  resetLoginRateLimit,
} from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const clientIp = req.headers.get('x-forwarded-for') || 'local-client';
    const rateLimitKey = `${clientIp}:${trimmedEmail}`;

    // 1. Rate Limiting Check
    const rateCheck = checkLoginRateLimit(rateLimitKey);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many failed login attempts. Access is temporarily locked for ${rateCheck.remainingSeconds} seconds.`,
        },
        { status: 429 }
      );
    }

    let user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    // If user not yet in DB, check against ADMIN_EMAIL & ADMIN_PASSWORD env vars
    const envAdminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.trim().toLowerCase() : null;
    const envAdminPassword = process.env.ADMIN_PASSWORD ? process.env.ADMIN_PASSWORD.trim() : null;

    if (!user && envAdminEmail && trimmedEmail === envAdminEmail && envAdminPassword && password === envAdminPassword) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(envAdminPassword, 10);
      user = await prisma.user.create({
        data: {
          email: envAdminEmail,
          password: hashedPassword,
          name: 'Super Administrator',
          role: 'SUPER_ADMIN',
        },
      });
    }

    if (!user) {
      recordFailedLogin(rateLimitKey);
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      recordFailedLogin(rateLimitKey);
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Success: reset rate limiter
    resetLoginRateLimit(rateLimitKey);

    // Sign session token
    const token = signSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const isHttps = req.nextUrl.protocol === 'https:' || req.headers.get('x-forwarded-proto') === 'https';

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    // Set cookies (only secure if actually served via HTTPS)
    response.cookies.set({
      name: 'nusalensa_session',
      value: token,
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    response.cookies.set({
      name: 'updateyuk_session',
      value: token,
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'System error during authentication.' },
      { status: 500 }
    );
  }
}
