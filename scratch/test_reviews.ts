import { prisma } from '../lib/prisma';

async function test() {
  try {
    const r = await prisma.review.findMany({ include: { product: true } });
    console.log('Total Reviews:', r.length);
    if (r.length > 0) {
      console.log('Sample Review Product:', r[0].product?.name || 'NULL');
    }
    
    const featured = await prisma.review.findMany({
      where: {
        OR: [
          { isFeatured: true },
          { rating: { gte: 4 } }
        ]
      }
    });
    console.log('Featured/High Rating Count:', featured.length);
  } catch (e) {
    console.error('Query Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
