import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { name, email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: trimmedEmail },
    });

    if (existing) {
      if (existing.status !== 'ACTIVE') {
        await prisma.newsletterSubscriber.update({
          where: { email: trimmedEmail },
          data: { status: 'ACTIVE', name: name || existing.name },
        });
      }
      return NextResponse.json({
        message: 'Your email is already registered for the NusaLensa newsletter.',
      });
    }

    await prisma.newsletterSubscriber.create({
      data: {
        email: trimmedEmail,
        name: name ? name.trim() : null,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({
      message: 'Thank you! You have successfully subscribed to the NusaLensa tech briefing.',
    });
  } catch (error) {
    console.error('Newsletter error:', error);
    return NextResponse.json(
      { error: 'A server error occurred while processing your subscription.' },
      { status: 500 }
    );
  }
}

