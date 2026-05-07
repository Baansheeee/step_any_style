import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { ensureProductsSeeded, serializeProduct } from '@/lib/products';
import { AUTH_COOKIE_NAME, verifyAuthToken } from '@/lib/auth';
import { parseProductPayload } from '@/lib/productValidation';

function toJsonInput(value: unknown) {
  return value === undefined ? undefined : (value as Prisma.InputJsonValue);
}

async function requireAdmin(request: NextRequest) {
  const token =
    request.cookies.get(AUTH_COOKIE_NAME)?.value ||
    request.headers.get('Authorization')?.replace('Bearer ', '') ||
    null;

  if (!token) {
    return null;
  }

  const payload = await verifyAuthToken(token);
  if (!payload || payload.role !== 'ADMIN') {
    return null;
  }

  return payload;
}

// GET /api/products - Get all products
export async function GET(request: NextRequest) {
  try {
    await ensureProductsSeeded();

    const searchParams = request.nextUrl.searchParams;
    const collectionSlug = searchParams.get('collection');
    const collectionId = searchParams.get('collectionId');
    const inStock = searchParams.get('inStock');

    const where: any = {};
    if (collectionSlug) {
      where.collection = { slug: { equals: collectionSlug, mode: 'insensitive' } };
    }
    if (collectionId) {
      where.collectionId = collectionId;
    }
    if (inStock === 'true') {
      where.inStock = true;
    } else if (inStock === 'false') {
      where.inStock = false;
    }

    const products = await prisma.product.findMany({
      where: Object.keys(where).length ? where : undefined,
      orderBy: { createdAt: 'desc' },
      include: { collection: true },
    });

    return NextResponse.json({
      success: true,
      data: products.map(serializeProduct),
      count: products.length,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST /api/products - Create a new product (Admin only)
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { data, error } = parseProductPayload(body, { requireSlug: true, allowPartial: false });

    if (error) {
      console.warn('Product validation failed:', error, 'Payload:', body);
      return NextResponse.json({ success: false, error }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        slug: data.slug!,
        name: data.name!,
        description: data.description!,
        shortDescription: data.shortDescription!,
        price: data.price!,
        originalPrice: data.originalPrice ?? null,
        inStock: data.inStock ?? true,
        image: data.image ?? null,
        images: toJsonInput(data.images ?? []),
        advantages: toJsonInput(data.advantages ?? []),
        specifications: toJsonInput(data.specifications ?? {}),
        features: toJsonInput(data.features ?? []),
        variants: toJsonInput(data.variants ?? []),
        collectionId: data.collectionId ?? null,
      },
      include: { collection: true },
    });

    return NextResponse.json(
      {
        success: true,
        data: serializeProduct(product),
      },
      { status: 201 },
    );
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Slug already exists. Please choose a different identifier.' },
        { status: 409 },
      );
    }

    console.error('Error creating product:', error);
    return NextResponse.json({ success: false, error: 'Failed to create product' }, { status: 500 });
  }
}

