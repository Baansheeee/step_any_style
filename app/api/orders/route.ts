import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AUTH_COOKIE_NAME, verifyAuthToken } from '@/lib/auth';
import { sendEmail } from '@/lib/email';

const paymentMethodMap = {
  card: 'CARD',
  direct: 'DIRECT',
  cod: 'COD',
} as const;

function buildOrderSummaryEmail({
  title,
  order,
  message,
}: {
  title: string;
  order: any;
  message: string;
}) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>${title}</h2>
      <p>${message}</p>
      <p><strong>Order ID:</strong> ${order.id}</p>
      <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
      <p><strong>Subtotal:</strong> Rs.${Number(order.subtotal).toFixed(2)}</p>
      <p><strong>Discount:</strong> Rs.${Number(order.discountAmount).toFixed(2)}</p>
      <p><strong>Shipping Cost:</strong> Rs.${Number(order.shippingCost).toFixed(2)}</p>
      <p><strong>Total:</strong> Rs.${Number(order.total).toFixed(2)}</p>
      <h3>Items</h3>
      <ul>
        ${order.items
          .map(
            (item: any) =>
              `<li>${item.name}${item.size ? ` (Size: ${item.size})` : ''}${item.color ? ` (Color: ${item.color})` : ''} × ${item.quantity} — Rs. ${(item.price * item.quantity).toFixed(2)}</li>`,
          )
          .join('')}
      </ul>
      <p><strong>Shipping Address:</strong><br/>
        ${order.shippingName}<br/>
        ${order.shippingAddress}, ${order.shippingCity}, ${order.shippingRegion}<br/>
        ${order.shippingPostalCode}<br/>
        ${order.shippingPhone}
      </p>
    </div>
  `;
}

// GET /api/orders - Get user's orders
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyAuthToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = payload.role === 'ADMIN';

    const orders = await prisma.order.findMany({
      where: isAdmin ? undefined : { userId: payload.userId },
      include: {
        promoCode: {
          select: {
            code: true,
            discountPercent: true,
          },
        },
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const payload = token ? await verifyAuthToken(token) : null;

    if (payload?.role === 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Administrators cannot place orders.' },
        { status: 403 },
      );
    }

    const {
      items,
      shippingAddress,
      paymentMethod,
      directAccount,
      promoCodeId,
      subtotal,
      promoDiscount,
      total,
      receiptUrl,
      paymentIntentId,
      shippingRegion,
      shippingCity,
    } = await request.json();

    if (!items || !Array.isArray(items) || !items.length) {
      return NextResponse.json({ success: false, error: 'Cart is empty' }, { status: 400 });
    }

    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.email ||
      !shippingAddress.phone ||
      !shippingAddress.address
    ) {
      return NextResponse.json({ success: false, error: 'Shipping details are incomplete.' }, { status: 400 });
    }

    if (!shippingRegion || !shippingCity) {
      return NextResponse.json({ success: false, error: 'Shipping region and city are required.' }, { status: 400 });
    }

    if (!paymentMethod || !['cod'].includes(paymentMethod)) {
      return NextResponse.json({ success: false, error: 'Only Cash on Delivery is accepted.' }, { status: 400 });
    }

    // Get shipping cost from database
    const cityData = await prisma.shippingCity.findFirst({
      where: {
        name: shippingCity,
        region: {
          name: shippingRegion,
        },
      },
      include: {
        region: true,
      },
    });

    if (!cityData) {
      return NextResponse.json(
        { success: false, error: 'Selected shipping location is not available.' },
        { status: 400 },
      );
    }

    const normalizedMethod = 'COD';

    let promoCode = null;
    if (promoCodeId) {
      promoCode = await prisma.promoCode.findUnique({ where: { id: promoCodeId } });
      if (!promoCode) {
        return NextResponse.json({ success: false, error: 'Invalid promo code.' }, { status: 400 });
      }
    }

    const numericSubtotal = Number(subtotal) || 0;
    const numericPromoDiscount = Number(promoDiscount) || 0;
    const numericShippingCost = Number(cityData?.region?.shippingCost) || 0;
    const numericTotal = Number(total) || 0;

    const sanitizedItems = items.map((item: any) => ({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      quantity: Number(item.quantity),
      image: item.image ?? null,
      size: item.size ?? null,
      color: item.color ?? null,
    }));

    const order = await prisma.order.create({
      data: {
        user: payload?.userId ? { connect: { id: payload.userId } } : undefined,
        promoCode: promoCodeId ? { connect: { id: promoCodeId } } : undefined,
        subtotal: numericSubtotal,
        discountAmount: numericPromoDiscount,
        shippingCost: numericShippingCost,
        total: numericTotal,
        paymentMethod: normalizedMethod,
        paymentStatus: 'PENDING',
        paymentIntentId: paymentIntentId || null,
        receiptUrl: receiptUrl || null,
        directAccount: directAccount || null,
        shippingName: shippingAddress.fullName,
        shippingEmail: shippingAddress.email,
        shippingPhone: shippingAddress.phone,
        shippingAddress: shippingAddress.address,
        shippingCity: shippingCity,
        shippingRegion: shippingRegion,
        shippingPostalCode: shippingAddress.postalCode,
        items: sanitizedItems,
      },
      include: {
        promoCode: {
          select: {
            code: true,
            discountPercent: true,
          },
        },
      },
    });

    if (promoCode) {
      await prisma.promoCode.update({
        where: { id: promoCode.id },
        data: {
          usageCount: { increment: 1 },
          totalGrossSales: { increment: numericSubtotal },
          totalDiscount: { increment: numericPromoDiscount },
        },
      });
    }

    await sendEmail({
      to: order.shippingEmail,
      subject: 'We received your Step & Style order',
      html: buildOrderSummaryEmail({
        title: 'Order received!',
        order,
        message: 'Your Cash on Delivery order has been received. Our team will prepare it for delivery shortly.',
      }),
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Order created successfully',
        data: { orderId: order.id },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 });
  }
}
