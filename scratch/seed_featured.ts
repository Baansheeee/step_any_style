import { prisma } from '../lib/prisma';
import { ensureProductsSeeded } from '../lib/products';

async function main() {
  await ensureProductsSeeded();
  const products = await prisma.product.findMany();
  console.log(`Found ${products.length} products.`);

  const reviewTemplates = [
    { rating: 5, comment: "Amazing product! Works exactly as described.", userName: "Ayesha Khan" },
    { rating: 5, comment: "Best purchase I've ever made.", userName: "Fatima Ali" },
    { rating: 5, comment: "Excellent quality and fast shipping.", userName: "Zainab Ahmed" },
    { rating: 5, comment: "Love this! It's gentle and the results are fantastic.", userName: "Hira Malik" }
  ];

  await prisma.review.deleteMany({});

  for (const product of products) {
    for (const template of reviewTemplates) {
      await prisma.review.create({
        data: {
          ...template,
          productId: product.id,
          isFeatured: true,
          createdAt: new Date()
        }
      });
    }
  }

  console.log('Seeded all reviews as featured!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
