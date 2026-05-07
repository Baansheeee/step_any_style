import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AUTH_COOKIE_NAME, verifyAuthToken } from '@/lib/auth';

function toNumber(value: any): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyAuthToken(token);
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const orders = await prisma.order.findMany({
      include: {
        promoCode: {
          include: {
            influencer: {
              include: {
                user: {
                  select: { name: true, email: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const completedOrders = orders.filter((order: any) => order.status === 'COMPLETED');
    const pendingOrders = orders.filter((order: any) => order.status !== 'COMPLETED').length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let grossRevenue = 0;
    let totalDiscounts = 0;
    let totalCommission = 0;
    let netProfitToday = 0;
    let ordersToday = 0;

    const influencerMap = new Map<
      string,
      {
        influencerId: string;
        name: string;
        email: string;
        promoCodes: Set<string>;
        totalSales: number;
        grossSales: number;
        totalCommission: number;
      }
    >();

    completedOrders.forEach((order: any) => {
      const subtotal = toNumber(order.subtotal);
      const discount = toNumber(order.discountAmount);
      const total = toNumber(order.total);
      const orderDate = new Date(order.createdAt);
      const promoInfluencer = order.promoCode?.influencer;
      const commissionRate = promoInfluencer ? toNumber(promoInfluencer.commissionRate) : 0;
      const commission = total * commissionRate;

      grossRevenue += subtotal;
      totalDiscounts += discount;
      totalCommission += commission;

      if (orderDate >= today) {
        ordersToday += 1;
        netProfitToday += total - discount - commission;
      }

      if (promoInfluencer) {
        const influencerId = promoInfluencer.userId;
        const existing = influencerMap.get(influencerId) ?? {
          influencerId,
          name: promoInfluencer.user?.name || 'Unnamed Influencer',
          email: promoInfluencer.user?.email || '',
          promoCodes: new Set<string>(),
          totalSales: 0,
          grossSales: 0,
          totalCommission: 0,
        };

        existing.totalSales += 1;
        existing.grossSales += total;
        existing.totalCommission += commission;
        if (order.promoCode?.code) {
          existing.promoCodes.add(order.promoCode.code);
        }

        influencerMap.set(influencerId, existing);
      }
    });

    const grossProfit = grossRevenue - totalDiscounts;
    const netRevenue = grossProfit - totalCommission;

    const influencers = Array.from(influencerMap.values()).map((item) => ({
      ...item,
      promoCodes: Array.from(item.promoCodes),
    }));

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalOrders: orders.length,
          completedOrders: completedOrders.length,
          pendingOrders,
          grossRevenue,
          totalDiscounts,
          grossProfit,
          totalCommission,
          netRevenue,
          ordersToday,
          netProfitToday,
        },
        influencers,
      },
    });
  } catch (error) {
    console.error('Error building analytics:', error);
    return NextResponse.json({ success: false, error: 'Failed to load analytics' }, { status: 500 });
  }
}

