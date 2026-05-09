import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const slug = params.id;
    
    // First find the product by slug to get its ID
    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const reviews = await prisma.review.findMany({
      where: { productId: product.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const slug = params.id;
    const body = await request.json();
    const { rating, comment, userName, userEmail, images, videoUrl } = body;

    if (!rating || !comment || !userName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find the product by slug to get its ID
    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const review = await prisma.review.create({
      data: {
        rating: Number(rating),
        comment,
        userName,
        userEmail,
        images: images || [],
        videoUrl: videoUrl || null,
        productId: product.id
      }
    });

    // Recalculate average rating
    const allReviews = await prisma.review.findMany({
      where: { productId: product.id },
      select: { rating: true }
    });

    const averageRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;

    await prisma.product.update({
      where: { id: product.id },
      data: { rating: averageRating }
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error('Failed to create review:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
