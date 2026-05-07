import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ regionId: string }> }
) {
  try {
    const { regionId } = await context.params;
    const cities = await prisma.shippingCity.findMany({
      where: {
        regionId: regionId,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ data: cities });
  } catch (error) {
    console.error('Failed to fetch cities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cities' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ regionId: string }> }
) {
  try {
    const { regionId } = await context.params;
    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'City name is required' },
        { status: 400 }
      );
    }

    // Check if region exists
    const region = await prisma.shippingRegion.findUnique({
      where: { id: regionId },
    });

    if (!region) {
      return NextResponse.json(
        { error: 'Region not found' },
        { status: 404 }
      );
    }

    // Check for duplicate city in same region
    const existing = await prisma.shippingCity.findFirst({
      where: {
        name,
        regionId: regionId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'City already exists in this region' },
        { status: 400 }
      );
    }

    const city = await prisma.shippingCity.create({
      data: {
        name,
        regionId: regionId,
      },
    });

    return NextResponse.json({ data: city }, { status: 201 });
  } catch (error) {
    console.error('Failed to create city:', error);
    return NextResponse.json(
      { error: 'Failed to create city' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ regionId: string }> }
) {
  try {
    const { regionId } = await context.params;
    const body = await req.json();
    const { shippingCost } = body;

    if (shippingCost === undefined || typeof shippingCost !== 'number') {
      return NextResponse.json(
        { error: 'Shipping cost is required' },
        { status: 400 }
      );
    }

    const updatedRegion = await prisma.shippingRegion.update({
      where: {
        id: regionId,
      },
      data: {
        shippingCost,
      },
      include: {
        cities: true
      }
    });

    return NextResponse.json({ data: updatedRegion });
  } catch (error) {
    console.error('Failed to update region cost:', error);
    return NextResponse.json(
      { error: 'Failed to update region cost' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ regionId: string }> }
) {
  try {
    const { regionId } = await context.params;
    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get('cityId');

    if (!cityId) {
      // Delete the entire region if no cityId provided
      await prisma.shippingCity.deleteMany({
        where: { regionId: regionId }
      });
      await prisma.shippingRegion.delete({
        where: { id: regionId }
      });
      return NextResponse.json({ success: true });
    }

    const result = await prisma.shippingCity.deleteMany({
      where: {
        id: cityId,
        regionId: regionId,
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'City not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete city:', error);
    return NextResponse.json(
      { error: 'Failed to delete city' },
      { status: 500 }
    );
  }
}
