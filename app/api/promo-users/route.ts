import { NextRequest, NextResponse } from 'next/server';

// GET /api/promo-users - Get all promo users (Admin only)
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication/authorization check
    // const session = await getServerSession();
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // TODO: Fetch promo users from database
    // Example: const promoUsers = await db.promoUsers.findMany({
    //   include: {
    //     sales: true,
    //   },
    //   orderBy: { createdAt: 'desc' }
    // });

    // Placeholder response
    const promoUsers: unknown[] = [];

    return NextResponse.json({ 
      success: true, 
      data: promoUsers,
      count: promoUsers.length 
    });
  } catch (error) {
    console.error('Error fetching promo users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch promo users' },
      { status: 500 }
    );
  }
}

// POST /api/promo-users - Create a new promo user (Admin only)
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication/authorization check
    // const session = await getServerSession();
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json();
    const { name, email, password, promoCode } = body;

    // TODO: Validate input data
    if (!name || !email || !password || !promoCode) {
      return NextResponse.json(
        { success: false, error: 'Name, email, password, and promo code are required' },
        { status: 400 }
      );
    }

    // TODO: Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // TODO: Check if email already exists
    // const existingUser = await db.users.findUnique({ where: { email } });
    // if (existingUser) {
    //   return NextResponse.json(
    //     { success: false, error: 'Email already exists' },
    //     { status: 400 }
    //   );
    // }

    // TODO: Check if promo code already exists
    // const existingPromoCode = await db.promoUsers.findUnique({ where: { promoCode } });
    // if (existingPromoCode) {
    //   return NextResponse.json(
    //     { success: false, error: 'Promo code already exists' },
    //     { status: 400 }
    //   );
    // }

    // TODO: Hash password
    // const hashedPassword = await bcrypt.hash(password, 10);

    // TODO: Create promo user in database
    // const promoUser = await db.promoUsers.create({
    //   data: {
    //     name,
    //     email,
    //     password: hashedPassword,
    //     promoCode: promoCode.toUpperCase(),
    //     role: 'PROMO_USER',
    //     status: 'active',
    //   },
    // });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Promo user created successfully',
        // data: { id: promoUser.id, name: promoUser.name, email: promoUser.email, promoCode: promoUser.promoCode }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating promo user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create promo user' },
      { status: 500 }
    );
  }
}


