import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Get active sale event
    const activeEvent = await prisma.saleEvent.findFirst({
      where: { isActive: true },
    });

    if (!activeEvent) {
      return NextResponse.json({ show: false });
    }

    // 2. Count products with discounts
    const discountedCount = await prisma.product.count({
      where: {
        discount: { gt: 0 }
      }
    });

    // Logic: Show if more than 10 products have discounts, 
    // or if a specific event is active and at least one product is on sale.
    const shouldShow = discountedCount > 10 || (activeEvent && discountedCount > 0);

    return NextResponse.json({
      show: shouldShow,
      bannerText: activeEvent.bannerText,
      eventName: activeEvent.name,
      count: discountedCount
    });
  } catch (error) {
    return NextResponse.json({ show: false });
  }
}
