import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { AUTH_COOKIE_NAME, authCookieOptions, signAuthToken, type UserRole } from '@/lib/auth';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, wantsAdmin, wantsInfluencer, adminKey, defaultPrefix } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required.' }, { status: 400 });
    }

    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: 'Please provide a valid email address.' }, { status: 400 });
    }

    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters and include letters and numbers.' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'An account with this email already exists.' }, { status: 409 });
    }

    // Use environment variable for admin key
    const adminRegistrationKey = process.env.ADMIN_REGISTRATION_KEY?.trim();
    
    let role: UserRole = 'USER';
    if (wantsAdmin) {
      if (!adminKey) {
        return NextResponse.json({ success: false, error: 'Administrative key is required for admin registration.' }, { status: 400 });
      }

      // Debug log to terminal
      console.log('Admin Registration Check:', {
        received: adminKey.trim(),
        expected: adminRegistrationKey,
        match: adminKey.trim() === adminRegistrationKey
      });

      if (!adminRegistrationKey || adminKey.trim() !== adminRegistrationKey) {
        return NextResponse.json({ success: false, error: 'Invalid administrative key.' }, { status: 403 });
      }
      role = 'ADMIN';
    } else if (wantsInfluencer) {
      if (!defaultPrefix || !defaultPrefix.trim()) {
        return NextResponse.json({ success: false, error: 'Promo code prefix is required for influencer registration.' }, { status: 400 });
      }
      const prefix = defaultPrefix.trim().toUpperCase();
      if (!/^[A-Z0-9_]+$/.test(prefix)) {
        return NextResponse.json({ success: false, error: 'Prefix can only contain letters, numbers, and underscores.' }, { status: 400 });
      }
      role = 'INFLUENCER';
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        password: hashedPassword,
        role,
        adminKeyUsed: role === 'ADMIN',
      },
    });

    // Create influencer profile if registering as influencer
    if (role === 'INFLUENCER' && defaultPrefix) {
      await prisma.influencerProfile.create({
        data: {
          userId: user.id,
          defaultPrefix: defaultPrefix.trim().toUpperCase(),
          commissionRate: 0.1, // Default 10% commission
        },
      });
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
    console.error('Error registering user:', error);

    if (error instanceof Error && error.name === 'PrismaClientInitializationError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Database is unavailable. Start PostgreSQL on localhost:5432 or update DATABASE_URL.',
        },
        { status: 503 }
      );
    }

    return NextResponse.json({ success: false, error: 'Failed to register user.' }, { status: 500 });
  }
}

// You can also create separate routes for login:
// POST /api/auth/login
// POST /api/auth/logout
// GET /api/auth/me (get current user)


