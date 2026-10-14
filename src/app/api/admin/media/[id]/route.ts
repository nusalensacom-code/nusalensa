import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/adminAuth';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// GET: Single media
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAdminAuth(req);
    if (auth instanceof NextResponse) return auth;

    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) return NextResponse.json({ error: 'Media not found' }, { status: 404 });

    return NextResponse.json({ media });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to load media' }, { status: 500 });
  }
}

// PUT: Update metadata (title, altText, caption, source)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAdminAuth(req, ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR']);
    if (auth instanceof NextResponse) return auth;

    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const body = await req.json();
    const { title, altText, caption, source } = body;

    const media = await prisma.media.update({
      where: { id },
      data: {
        title: title || 'Untitled',
        altText: altText || null,
        caption: caption || null,
        source: source || null,
      },
    });

    return NextResponse.json({ media, message: 'Media metadata updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update metadata' }, { status: 500 });
  }
}

// DELETE: Delete media from DB and filesystem (if local)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAdminAuth(req, ['SUPER_ADMIN', 'ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;

    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) return NextResponse.json({ error: 'Media not found' }, { status: 404 });

    // If local file in /uploads/, delete from disk
    if (media.url.startsWith('/uploads/')) {
      const fileName = path.basename(media.url);
      const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.warn('Failed to delete physical file:', e);
        }
      }
    }

    await prisma.media.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Media deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete media' }, { status: 500 });
  }
}

