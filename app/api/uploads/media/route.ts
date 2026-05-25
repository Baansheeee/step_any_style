import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
  'image/svg+xml',
];

const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
];

function getExtension(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/avif': 'avif',
    'image/svg+xml': 'svg',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/ogg': 'ogg',
    'video/quicktime': 'mov',
  };
  return map[mimeType] || 'bin';
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files');

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided.' },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'media');
    await fs.mkdir(uploadDir, { recursive: true });

    const uploadedUrls: string[] = [];
    const errors: string[] = [];

    for (const file of files) {
      if (!(file instanceof File)) {
        errors.push('Invalid file entry skipped.');
        continue;
      }

      const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
      const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

      if (!isImage && !isVideo) {
        errors.push(`"${file.name}" has unsupported type (${file.type}).`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        errors.push(`"${file.name}" exceeds the 50 MB size limit.`);
        continue;
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = getExtension(file.type);
      const uniqueName = `${isVideo ? 'vid' : 'img'}-${crypto.randomUUID()}.${ext}`;

      await fs.writeFile(path.join(uploadDir, uniqueName), buffer);
      uploadedUrls.push(`/uploads/media/${uniqueName}`);
    }

    if (uploadedUrls.length === 0 && errors.length > 0) {
      return NextResponse.json(
        { success: false, error: errors.join(' ') },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Media upload failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload media.' },
      { status: 500 }
    );
  }
}
