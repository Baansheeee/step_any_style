import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const token =
      request.cookies.get(AUTH_COOKIE_NAME)?.value ||
      request.headers.get('Authorization')?.replace('Bearer ', '') ||
      null;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyAuthToken(token);
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const params = await context.params;
    const applicationId = params.id;
    const body = await request.json();
    const { notes } = body;

    // Fetch the application
    const application = await prisma.affiliateApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (application.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Application has already been processed' },
        { status: 400 }
      );
    }

    // Update application status
    await prisma.affiliateApplication.update({
      where: { id: applicationId },
      data: {
        status: 'REJECTED',
        reviewedBy: payload.userId,
        reviewedAt: new Date(),
        notes: notes || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error rejecting affiliate application:', error);
    return NextResponse.json(
      { error: 'Failed to reject application' },
      { status: 500 }
    );
  }
}

