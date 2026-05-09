import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Fetch reviews that have at least one image or a videoUrl
    // We'll also include the product info so we can link back to it
    const reviews = await prisma.review.findMany({
      where: {
        OR: [
          {
            images: {
              not: {
                equals: [],
              },
            },
          },
          {
            videoUrl: {
              not: null,
            },
          },
        ],
      },
      include: {
        product: {
          select: {
            id: true,
            slug: true,
            name: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 12, // Limit to 12 for the homepage section
    });

    // Flatten and transform the data for the frontend
    const mediaItems = reviews.flatMap(review => {
      const items: any[] = [];
      
      if (Array.isArray(review.images)) {
        review.images.forEach((img: string) => {
          items.push({
            type: 'image',
            url: img,
            productSlug: review.product.slug,
            productName: review.product.name,
            userName: review.userName,
          });
        });
      }
      
      if (review.videoUrl) {
        items.push({
          type: 'video',
          url: review.videoUrl,
          productSlug: review.product.slug,
          productName: review.product.name,
          userName: review.userName,
        });
      }
      
      return items;
    });

    return NextResponse.json({ success: true, media: mediaItems });
  } catch (error) {
    console.error('Failed to fetch review media:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch media' }, { status: 500 });
  }
}
