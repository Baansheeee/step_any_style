import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing Prisma connection...');
    const users = await prisma.user.findMany({ take: 1 });
    console.log('Successfully connected to database. Found', users.length, 'users.');

    console.log('Testing AffiliateApplication access...');
    const applications = await prisma.affiliateApplication.findMany({ take: 1 });
    console.log('Successfully accessed AffiliateApplication. Found', applications.length, 'applications.');
  } catch (error) {
    console.error('Database test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
