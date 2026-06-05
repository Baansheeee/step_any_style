import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const activeEvent = await prisma.saleEvent.findFirst({
    where: { isActive: true }
  });
  console.log("Active Event:", JSON.stringify(activeEvent, null, 2));

  if (activeEvent) {
    const targetCollections = (activeEvent.targetCollections as string[]) || [];
    const targetProducts = (activeEvent.targetProducts as string[]) || [];

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { collectionId: { in: targetCollections } },
          { id: { in: targetProducts } }
        ]
      },
      select: {
        id: true,
        name: true,
        collectionId: true
      }
    });

    console.log("Matched Products Length:", products.length);
    console.log("Matched Products:", JSON.stringify(products, null, 2));
    
    // Check all products in those collections regardless of OR
    const productsInColl = await prisma.product.findMany({
      where: {
        collectionId: { in: targetCollections }
      },
      select: {
        id: true,
        name: true,
        collectionId: true
      }
    });
    console.log("Products directly in collections length:", productsInColl.length);
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
