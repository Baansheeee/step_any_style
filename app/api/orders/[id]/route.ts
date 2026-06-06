import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AUTH_COOKIE_NAME, verifyAuthToken } from '@/lib/auth';
import { sendEmail } from '@/lib/email';

const paymentStatuses = ['APPROVED', 'DISAPPROVED', 'PENDING'] as const;

function buildStatusEmail(
  order: any,
  {
    title,
    message,
  }: {
    title: string;
    message: string;
  },
) {
  const itemsHtml = Array.isArray(order.items)
    ? order.items
      .map(
        (item: any) =>
          `<li>${item.name}${item.size ? ` (Size: ${item.size})` : ''}${item.color ? ` (Color: ${item.color})` : ''} × ${item.quantity} — Rs. ${(Number(item.price) * Number(item.quantity)).toFixed(2)}</li>`,
      )
      .join('')
    : '';

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>${title}</h2>
      <p>${message}</p>
      <p><strong>Order ID:</strong> ${order.id}</p>
      <p><strong>Subtotal:</strong> Rs.${Number(order.subtotal).toFixed(2)}</p>
      <p><strong>Discount:</strong> Rs.${Number(order.discountAmount).toFixed(2)}</p>
      <p><strong>Shipping Cost:</strong> Rs.${Number(order.shippingCost).toFixed(2)}</p>
      <p><strong>Total:</strong> Rs.${Number(order.total).toFixed(2)}</p>
      <h3>Items</h3>
      <ul>${itemsHtml}</ul>
      <p><strong>Shipping To:</strong><br/>
      ${order.shippingCity}, ${order.shippingRegion}</p>
      ${order.adminNote
      ? `<p><strong>Latest admin note:</strong> ${order.adminNote}</p>`
      : ''
    }
      <p>Thank you for shopping with Step & Styl.</p>
    </div>
  `;
}

// GET /api/orders/[id] - Get a single order by ID
export async function GET(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyAuthToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
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
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    if (payload.role !== 'ADMIN' && order.userId !== payload.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch order' }, { status: 500 });
  }
}

// PUT /api/orders/[id] - Update payment status (Admin only)
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyAuthToken(token);
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { paymentStatus, adminNote, action } = body as {
      paymentStatus?: (typeof paymentStatuses)[number];
      adminNote?: string;
      action?: 'OUT_FOR_DELIVERY' | 'DELIVERED';
    };

    if (!paymentStatus && !action) {
      return NextResponse.json(
        { success: false, error: 'Specify a payment status or action to perform.' },
        { status: 400 },
      );
    }

    if (paymentStatus && !paymentStatuses.includes(paymentStatus)) {
      return NextResponse.json({ success: false, error: 'Invalid payment status.' }, { status: 400 });
    }

    if (paymentStatus === 'DISAPPROVED' && !adminNote?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Please provide a reason when disapproving an order.' },
        { status: 400 },
      );
    }

    const updateData: any = {};
    let emailMeta: { title: string; message: string } | null = null;

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
      updateData.adminNote = adminNote || null;
      updateData.approvedAt = paymentStatus === 'APPROVED' ? new Date() : null;
      updateData.disapprovedAt = paymentStatus === 'DISAPPROVED' ? new Date() : null;

      if (paymentStatus === 'APPROVED') {
        emailMeta = {
          title: 'Payment approved ✅',
          message: 'Your payment has been verified. We are preparing your order for delivery.',
        };
      } else if (paymentStatus === 'DISAPPROVED') {
        emailMeta = {
          title: 'Payment issue ⚠️',
          message: `We could not verify your payment. Reason: ${adminNote}. Sorry for the inconvenience—please place the order again.`,
        };
      }
    }

    if (action === 'OUT_FOR_DELIVERY') {
      // Get the current order to access items and ensure we only reduce stock once
      const currentOrder = await prisma.order.findUnique({
        where: { id: params.id },
      });

      if (currentOrder && currentOrder.status === 'PENDING') {
        const items = (currentOrder.items as any[]) || [];
        for (const item of items) {
          if (!item.id) continue;

          const product = await prisma.product.findUnique({
            where: { id: item.id },
          });

          if (product && Array.isArray(product.variants)) {
            const variants = [...(product.variants as any[])];
            const variantIndex = variants.findIndex(
              (v) =>
                String(v.size).toLowerCase() === String(item.size || '').toLowerCase() &&
                String(v.color).toLowerCase() === String(item.color || '').toLowerCase(),
            );

            if (variantIndex > -1) {
              const quantityToReduce = Number(item.quantity) || 1;
              variants[variantIndex].stock = Math.max(0, variants[variantIndex].stock - quantityToReduce);

              await prisma.product.update({
                where: { id: product.id },
                data: {
                  variants,
                  saleCount: { increment: quantityToReduce }
                },
              });
            }
          }
        }
      }

      updateData.status = 'SHIPPED';
      emailMeta = {
        title: 'Out for delivery 🚚',
        message: 'Great news! Your order is now out for delivery and should arrive soon.',
      };
    } else if (action === 'DELIVERED') {
      updateData.status = 'COMPLETED';
      emailMeta = {
        title: 'Order delivered 🎉',
        message: 'Your order has been delivered. We hope you enjoy your purchase!',
      };
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid updates were provided.' },
        { status: 400 },
      );
    }

    const order = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
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
    });

    if (emailMeta) {
      await sendEmail({
        to: order.shippingEmail,
        subject: emailMeta.title,
        html: buildStatusEmail(order, emailMeta),
      });
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error('Error updating order:', error);
    if (error?.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 });
  }
}
