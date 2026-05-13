import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { isActive } = body;

    const saleEvent = await prisma.saleEvent.findUnique({
      where: { id }
    });

    if (!saleEvent) {
      return NextResponse.json({ error: 'Sale event not found' }, { status: 404 });
    }

    // If activating this one, deactivate others and apply discounts
    if (isActive) {
      await prisma.saleEvent.updateMany({
        where: { id: { not: id }, isActive: true },
        data: { isActive: false },
      });

      // Apply discounts
      const targetCollections = saleEvent.targetCollections as string[];
      const targetProducts = saleEvent.targetProducts as string[];
      
      if (targetCollections && targetCollections.length > 0) {
        await prisma.product.updateMany({
          where: { collectionId: { in: targetCollections } },
          data: { discount: saleEvent.discountPercent }
        });
      }

      if (targetProducts && targetProducts.length > 0) {
        await prisma.product.updateMany({
          where: { id: { in: targetProducts } },
          data: { discount: saleEvent.discountPercent }
        });
      }
    } else {
      // If deactivating, reset discounts for these collections and products
      const targetCollections = saleEvent.targetCollections as string[];
      const targetProducts = saleEvent.targetProducts as string[];

      if (targetCollections && targetCollections.length > 0) {
        await prisma.product.updateMany({
          where: { collectionId: { in: targetCollections } },
          data: { discount: 0 }
        });
      }

      if (targetProducts && targetProducts.length > 0) {
        await prisma.product.updateMany({
          where: { id: { in: targetProducts } },
          data: { discount: 0 }
        });
      }
    }

    const sale = await prisma.saleEvent.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json({ sale });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update sale' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const saleEvent = await prisma.saleEvent.findUnique({
      where: { id }
    });

    if (saleEvent) {
      // Reset discounts for targeted collections
      const targetCollections = saleEvent.targetCollections as string[];
      if (targetCollections && targetCollections.length > 0) {
        await prisma.product.updateMany({
          where: { collectionId: { in: targetCollections } },
          data: { discount: 0 }
        });
      }

      // Reset discounts for targeted individual products
      const targetProducts = saleEvent.targetProducts as string[];
      if (targetProducts && targetProducts.length > 0) {
        await prisma.product.updateMany({
          where: { id: { in: targetProducts } },
          data: { discount: 0 }
        });
      }
    }

    await prisma.saleEvent.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete sale' }, { status: 500 });
  }
}
