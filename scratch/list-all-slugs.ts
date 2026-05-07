import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: {
      slug: true,
      name: true
    }
  });

  console.log(`Found ${products.length} products:`);
  products.forEach(p => console.log(`- ${p.slug}: ${p.name}`));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
