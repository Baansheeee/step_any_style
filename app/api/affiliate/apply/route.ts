import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendEmail } from '@/lib/email';

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, channelLink1, channelLink2 } = body;

    if (!email || !channelLink1) {
      return NextResponse.json(
        { error: 'Email and Channel Link 1 are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(channelLink1);
      if (channelLink2) {
        new URL(channelLink2);
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format for channel links' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Check if application already exists for this email
    const existing = await prisma.affiliateApplication.findFirst({
      where: { email: email.toLowerCase() },
    });

    if (existing && existing.status === 'PENDING') {
      return NextResponse.json(
        { error: 'You already have a pending application' },
        { status: 400 }
      );
    }

    // Generate password and default prefix
    const password = generatePassword();
    const hashedPassword = await bcrypt.hash(password, 10);
    const defaultPrefix = email.split('@')[0].toUpperCase().substring(0, 8);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'INFLUENCER',
      },
    });

    // Create influencer profile
    const influencer = await prisma.influencerProfile.create({
      data: {
        userId: user.id,
        defaultPrefix,
        commissionRate: 0.1, // 10% default
      },
    });

    // Create application
    const application = await prisma.affiliateApplication.create({
      data: {
        email: email.toLowerCase(),
        channelLink1,
        channelLink2: channelLink2 || null,
      },
    });

    const result = { user, influencer, application };

    // Send application received email with credentials
    const loginUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #9333ea; }
            .credential-item { margin: 15px 0; }
            .label { font-weight: bold; color: #6b7280; }
            .value { color: #111827; font-size: 18px; margin-top: 5px; }
            .button { display: inline-block; background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Application Received!</h1>
            </div>
            <div class="content">
              <p>Thank you for applying to the Step & Style Affiliate Program!</p>
              <p>We have received your application and it is currently under review. In the meantime, we've created your account so you can access your dashboard.</p>
              
              <div class="credentials">
                <h2 style="color: #9333ea; margin-top: 0;">Your Login Credentials</h2>
                <div class="credential-item">
                  <div class="label">Email:</div>
                  <div class="value">${email}</div>
                </div>
                <div class="credential-item">
                  <div class="label">Password:</div>
                  <div class="value">${password}</div>
                </div>
              </div>

              <p><strong>Next Steps:</strong></p>
              <ul>
                <li>Login to your account using the credentials above</li>
                <li>Access your influencer dashboard</li>
                <li>Wait for admin approval - you'll receive your promo code once approved</li>
              </ul>

              <div style="text-align: center;">
                <a href="${loginUrl}" class="button">Login to Dashboard</a>
              </div>

              <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <strong>Important:</strong> Please change your password after your first login for security purposes.
              </p>

              <div class="footer">
                <p>If you have any questions, please contact our affiliate support team.</p>
                <p>Thank you for joining Step & Style! 🚀</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      await sendEmail({
        to: email,
        subject: 'Step & Style Affiliate Application Received - Your Account is Ready!',
        html: emailHtml,
      });
    } catch (emailError) {
      console.error('Failed to send application email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      application: {
        id: result.application.id,
        email: result.application.email,
        status: result.application.status,
      },
    });
  } catch (error) {
    console.error('Error creating affiliate application:', error);
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}

