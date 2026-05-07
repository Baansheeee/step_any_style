import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { AUTH_COOKIE_NAME, authCookieOptions, signAuthToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid credentials.' }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json({ success: false, error: 'Invalid credentials.' }, { status: 401 });
    }

    const token = await signAuthToken({ userId: user.id, email: user.email, role: user.role, name: user.name });
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions);
    return response;
  } catch (error) {
    console.error('Error logging in:', error);

    if (error instanceof Error && error.name === 'PrismaClientInitializationError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Database is unavailable. Start PostgreSQL on localhost:5432 or update DATABASE_URL.',
        },
        { status: 503 }
      );
    }

    return NextResponse.json({ success: false, error: 'Failed to login.' }, { status: 500 });
  }
}


