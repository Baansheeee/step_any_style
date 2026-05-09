import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        product: {
          select: {
            id: true,
            slug: true,
            name: true,
            image: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch reviews' }, { status: 500 });
  }
}
