import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendBulkEmail, buildPromoEmail } from '@/lib/email';

export async function GET() {
  try {
    const sales = await prisma.saleEvent.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ sales });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, bannerText, isActive, discountPercent, targetCollections, targetProducts } = body;

    // If this one is active, deactivate all others and apply discounts
    if (isActive) {
      // Deactivate others
      await prisma.saleEvent.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });

      // Apply discounts to products in target collections
      if (targetCollections && targetCollections.length > 0) {
        await prisma.product.updateMany({
          where: {
            collectionId: { in: targetCollections }
          },
          data: {
            discount: discountPercent
          }
        });
      }

      // Apply discounts to individual target products
      if (targetProducts && targetProducts.length > 0) {
        await prisma.product.updateMany({
          where: {
            id: { in: targetProducts }
          },
          data: {
            discount: discountPercent
          }
        });
      }
    }

    const sale = await prisma.saleEvent.create({
      data: { 
        name, 
        bannerText, 
        isActive, 
        discountPercent, 
        targetCollections,
        targetProducts
      },
    });

    if (body.sendPromoEmail) {
      const users = await prisma.user.findMany({ select: { email: true } });
      const emails = users.map(u => u.email).filter(Boolean);
      
      if (emails.length > 0) {
        const html = buildPromoEmail(
          'Huge Sale Event!',
          `We just launched a new sale event: <strong>${name}</strong>. Enjoy up to ${discountPercent}% off on selected items! Hurry up and grab your favorites before the stock runs out.`,
          `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}`,
          'Shop the Sale'
        );
        sendBulkEmail({
          bcc: emails,
          subject: `Sale Alert: ${name} is live!`,
          html,
        }).catch(err => console.error('Background promo email error:', err));
      }
    }

    return NextResponse.json({ sale });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create sale' }, { status: 500 });
  }
}
