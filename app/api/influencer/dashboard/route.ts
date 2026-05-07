import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AUTH_COOKIE_NAME, verifyAuthToken } from '@/lib/auth';

async function requireInfluencer(request: NextRequest) {
  const token =
    request.cookies.get(AUTH_COOKIE_NAME)?.value ||
    request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return null;
  }

  const payload = await verifyAuthToken(token);
  if (!payload || payload.role !== 'INFLUENCER') {
    return null;
  }

  return payload;
}

export async function GET(request: NextRequest) {
  try {
    const influencerUser = await requireInfluencer(request);
    if (!influencerUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const profile = await prisma.influencerProfile.findUnique({
      where: { userId: influencerUser.userId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
    }

    const promoCodes = await prisma.promoCode.findMany({
      where: { influencerId: profile.id },
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const orders = await prisma.order.findMany({
      where: {
        promoCode: {
          influencerId: profile.id,
        },
      },
      include: {
        promoCode: {
          select: {
            code: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const summary = await prisma.order.aggregate({
      where: {
        promoCode: {
          influencerId: profile.id,
        },
        status: 'COMPLETED',
      },
      _sum: {
        subtotal: true,
        discountAmount: true,
        total: true,
      },
      _count: {
        id: true,
      },
    });

    const grossSales = Number(summary._sum.total ?? 0);
    const totalDiscount = Number(summary._sum.discountAmount ?? 0);
    const totalOrders = summary._count.id ?? 0;
    const estimatedCommission = grossSales * Number(profile.commissionRate);

    return NextResponse.json({
      success: true,
      profile,
      metrics: {
        totalOrders,
        grossSales,
        totalDiscount,
        estimatedCommission,
        promoCodeCount: promoCodes.length,
      },
      promoCodes,
      orders,
    });
  } catch (error) {
    console.error('Failed to load influencer dashboard:', error);
    return NextResponse.json({ success: false, error: 'Failed to load dashboard.' }, { status: 500 });
  }
}




