const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');
  const products = await prisma.product.findMany();
  
  if (products.length === 0) {
    console.log('No products found in database. Please ensure you have products first.');
    return;
  }

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

  // Clear existing reviews first to avoid duplicates if run multiple times
  await prisma.review.deleteMany({});

  for (const product of products) {
    // Pick 3-5 random reviews for each product
    const numReviews = Math.floor(Math.random() * 3) + 3;
    const shuffled = [...reviewTemplates].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, numReviews);

    for (const review of selected) {
      await prisma.review.create({
        data: {
          ...review,
          productId: product.id,
          isFeatured: review.rating === 5 && Math.random() > 0.5,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30)) // Random date in last 30 days
        }
      });
    }
  }

  console.log('Seeded reviews successfully!');
}

main()
  .catch(e => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
