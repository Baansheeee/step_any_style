import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const settings = await prisma.marketingSettings.findUnique({
      where: { id: 'marketing_settings' },
      select: {
        metaPixelId: true,
        metaPixelEnabled: true,
      }
    });

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error fetching public marketing settings:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
  }
}
