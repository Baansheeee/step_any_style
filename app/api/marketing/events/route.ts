import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuthToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventName, eventData, url } = body;

    if (!eventName) {
      return NextResponse.json({ success: false, error: 'Event name is required' }, { status: 400 });
    }

    // Try to get user identity from auth cookie
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    let userInfo = null;
    
    if (token) {
      const payload = await verifyAuthToken(token);
      if (payload) {
        userInfo = {
          id: payload.userId,
          email: payload.email,
          role: payload.role,
        };
      }
    }

    // Capture basic request data for anonymous tracking
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Merge identity data into eventData safely
    const enrichedData = {
      ...(eventData || {}),
      _identity: {
        user: userInfo || 'anonymous',
        ip,
      }
    };

    const newEvent = await prisma.marketingEvent.create({
      data: {
        eventName,
        eventData: enrichedData,
        url: url || null,
      },
    });

    return NextResponse.json({ success: true, data: newEvent });
  } catch (error: any) {
    console.error('Failed to log marketing event:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
