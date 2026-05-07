import { PrismaClient } from '@prisma/client';

// Force Atlas URL
const DATABASE_URL = 'mongodb+srv://ipl_store:ipl_store@cluster0.kctgfao.mongodb.net/iplstore?retryWrites=true&w=majority';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
});

async function main() {
  const products = await prisma.product.findMany({
    select: {
      slug: true,
      name: true,
      image: true
    }
  });

  console.log(`Found ${products.length} products:`);
  products.forEach(p => console.log(`- ${p.slug}: ${p.name} (Image: ${p.image})`));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
