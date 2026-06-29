import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { ensureProductsSeeded, serializeProduct } from '@/lib/products';
import { sendBulkEmail, buildPromoEmail } from '@/lib/email';
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
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sort = searchParams.get('sort');
    const search = searchParams.get('search');
    const gender = searchParams.get('gender');

    const where: any = {};
    if (gender) {
      where.collection = {
        ...where.collection,
        targetGender: gender.toUpperCase(),
      };
    }
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

    const isNew = searchParams.get('isNew') === 'true';
    const isTrending = searchParams.get('isTrending') === 'true';
    const onSale = searchParams.get('onSale') === 'true';

    if (isNew) {
      const fifteenDaysAgo = new Date();
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
      where.createdAt = { gte: fifteenDaysAgo };
    }

    if (onSale) {
      const activeEvent = await prisma.saleEvent.findFirst({
        where: { isActive: true }
      });
      
      if (activeEvent) {
        const targetCollections = (activeEvent.targetCollections as string[]) || [];
        const targetProducts = (activeEvent.targetProducts as string[]) || [];
        
        const orConditions: any[] = [];
        if (targetCollections.length > 0) {
          orConditions.push({ collectionId: { in: targetCollections } });
        }
        if (targetProducts.length > 0) {
          orConditions.push({ id: { in: targetProducts } });
        }

        if (orConditions.length > 0) {
          where.AND = [
            ...(where.AND || []),
            { OR: orConditions }
          ];
        } else {
          // If a sale is active but has no targets, no products are on sale
          where.id = 'non-existent-id-to-return-none';
        }
      } else {
        where.discount = { gt: 0 };
      }
    }

    if (isTrending) {
      where.OR = [
        ...(where.OR || []),
        { saleCount: { gt: 10 } }, // Lowered threshold for demonstration
        { rating: { gt: 4.0 } }
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price-asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price-desc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    } else if (sort === 'trending') {
      orderBy = [
        { saleCount: 'desc' },
        { rating: 'desc' },
        { createdAt: 'desc' }
      ];
    }

    const products = await prisma.product.findMany({
      where: Object.keys(where).length ? where : undefined,
      orderBy,
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
        discount: data.discount ?? 0,
        inStock: data.inStock ?? true,
        image: data.image ?? null,
        images: toJsonInput(data.images ?? []),
        videoUrl: data.videoUrl ?? null,
        advantages: toJsonInput(data.advantages ?? []),
        specifications: toJsonInput(data.specifications ?? {}),
        features: toJsonInput(data.features ?? []),
        variants: toJsonInput(data.variants ?? []),
        collectionId: data.collectionId ?? null,
      },
      include: { collection: true },
    });

    if (body.sendPromoEmail) {
      const users = await prisma.user.findMany({ select: { email: true } });
      const emails = users.map(u => u.email).filter(Boolean);
      
      if (emails.length > 0) {
        const html = buildPromoEmail(
          'New Arrival at Step & Style!',
          `We just added an amazing new product: <strong>${product.name}</strong>. Check it out now before it sells out!`,
          `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/products/${product.slug}`,
          'Shop Now'
        );
        // Send email in the background
        sendBulkEmail({
          bcc: emails,
          subject: `New Arrival: ${product.name}`,
          html,
        }).catch(err => console.error('Background promo email error:', err));
      }
    }

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

