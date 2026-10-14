import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/adminAuth';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'image/svg+xml',
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// GET: List media items
export async function GET(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q');

    let whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { filename: { contains: search } },
        { altText: { contains: search } },
      ];
    }

    const media = await prisma.media.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ media });
  } catch (error: any) {
    console.error('Error listing media:', error);
    return NextResponse.json({ error: error.message || 'Failed to load media' }, status(500));
  }
}

// POST: Upload file or save URL
export async function POST(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req, ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR']);
    if (auth instanceof NextResponse) return auth;

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const directUrl = formData.get('url') as string | null;
    const title = (formData.get('title') as string) || '';
    const altText = (formData.get('altText') as string) || '';
    const caption = (formData.get('caption') as string) || '';
    const source = (formData.get('source') as string) || '';

    // If uploading via file
    if (file && typeof file === 'object' && file.size > 0) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File size exceeds 5MB limit (Current size: ${(file.size / 1024 / 1024).toFixed(2)} MB)` },
          { status: 400 }
        );
      }

      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `File format "${file.type}" is not supported. Allowed formats: WebP, AVIF, PNG, JPEG, GIF, SVG.` },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      // Ensure directory public/uploads exists
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Generate clean unique filename
      const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const ext = path.extname(originalName) || '.jpg';
      const baseName = path.basename(originalName, ext);
      const uniqueName = `${baseName}_${Date.now()}${ext}`;
      const filePath = path.join(uploadDir, uniqueName);

      fs.writeFileSync(filePath, buffer);

      const publicUrl = `/uploads/${uniqueName}`;

      const mediaRecord = await prisma.media.create({
        data: {
          filename: uniqueName,
          title: title || originalName,
          url: publicUrl,
          altText: altText || title || originalName,
          caption: caption || null,
          source: source || null,
          mimeType: file.type,
          fileSize: file.size,
        },
      });

      return NextResponse.json({ media: mediaRecord, message: 'File uploaded successfully' }, { status: 201 });
    }

    // Alternatively, if saving an external image URL
    if (directUrl) {
      const mediaRecord = await prisma.media.create({
        data: {
          filename: path.basename(directUrl) || 'external-image',
          title: title || 'External Image',
          url: directUrl,
          altText: altText || title || null,
          caption: caption || null,
          source: source || null,
          mimeType: 'image/jpeg',
          fileSize: null,
        },
      });

      return NextResponse.json({ media: mediaRecord, message: 'Image URL saved successfully' }, { status: 201 });
    }

    return NextResponse.json({ error: 'A file or direct image URL must be provided' }, { status: 400 });
  } catch (error: any) {
    console.error('Error uploading media:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload file' }, { status: 500 });
  }
}

function status(code: number) {
  return { status: code };
}

