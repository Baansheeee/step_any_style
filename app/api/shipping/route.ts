import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const regions = await prisma.shippingRegion.findMany({
      include: {
        cities: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ data: regions });
  } catch (error) {
    console.error('Failed to fetch shipping regions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shipping regions' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, shippingCost } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Region name is required' },
        { status: 400 }
      );
    }

    const region = await prisma.shippingRegion.create({
      data: { 
        name,
        shippingCost: Number(shippingCost) || 0
      },
      include: { cities: true },
    });

    return NextResponse.json({ data: region }, { status: 201 });
  } catch (error) {
    console.error('Failed to create region:', error);
    return NextResponse.json(
      { error: 'Failed to create region' },
      { status: 500 }
    );
  }
}
