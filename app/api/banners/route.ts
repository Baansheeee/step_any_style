import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (category) {
      where.category = category;
    }
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const banners = await prisma.banner.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ success: true, banners });
  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const newBanner = await prisma.banner.create({
      data: {
        category: data.category || 'HOME_MAIN',
        desktopImageUrl: data.desktopImageUrl,
        mobileImageUrl: data.mobileImageUrl,
        title: data.title || null,
        subtitle: data.subtitle || null,
        textPosition: data.textPosition || 'OVERLAY',
        ctaText: data.ctaText || null,
        ctaLink: data.ctaLink || null,
        isActive: data.isActive ?? true,
        order: data.order || 0,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });

    return NextResponse.json({ success: true, banner: newBanner }, { status: 201 });
  } catch (error) {
    console.error('Error creating banner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create banner' },
      { status: 500 }
    );
  }
}
