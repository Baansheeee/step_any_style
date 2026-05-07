import { prisma } from '../lib/prisma';
import { ensureProductsSeeded } from '../lib/products';

async function main() {
  console.log('Ensuring products are seeded...');
  await ensureProductsSeeded();
  
  const products = await prisma.product.findMany();
  console.log(`Found ${products.length} products. Seeding reviews...`);

  const reviewTemplates = [
    { rating: 5, comment: "Amazing product! Works exactly as described. Very satisfied with my purchase.", userName: "Ayesha Khan" },
    { rating: 5, comment: "Best purchase I've ever made. Results are visible within weeks. Highly recommend!", userName: "Fatima Ali" },
    { rating: 4, comment: "Excellent quality and fast shipping. The item is exactly as pictured.", userName: "Zainab Ahmed" },
    { rating: 5, comment: "Love this! It's gentle and the results are fantastic. Worth every penny.", userName: "Hira Malik" },
    { rating: 5, comment: "Great value for money. Professional quality. Very happy with my purchase.", userName: "Sana Sheikh" },
    { rating: 4, comment: "Outstanding service! The delivery was quick and packaging was premium.", userName: "Mariam Hassan" },
    { rating: 5, comment: "Highly effective and safe. I can see results already. Best in the market!", userName: "Amina Raza" },
    { rating: 5, comment: "Perfect for daily use. Easy to handle and very efficient. Great investment!", userName: "Sara Iqbal" }
  ];

  await prisma.review.deleteMany({});

  for (const product of products) {
    const numReviews = Math.floor(Math.random() * 3) + 3;
    const shuffled = [...reviewTemplates].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, numReviews);

    for (const review of selected) {
      await prisma.review.create({
        data: {
          ...review,
          productId: product.id,
          isFeatured: review.rating === 5 && Math.random() > 0.5,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30))
        }
      });
    }
  }

  console.log('Seeded reviews successfully!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
