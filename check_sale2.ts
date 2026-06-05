import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  try {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { collectionId: { in: [] } },
          { id: { in: [] } }
        ]
      }
    });
    console.log("Empty arrays test:", products.length);
  } catch (e) {
    console.error("Error with empty arrays:", e);
  }

  // Create a dummy sale event
  let coll = await prisma.collection.findFirst();
  if (!coll) {
    coll = await prisma.collection.create({
      data: {
        name: "Test Coll",
        slug: "test-coll",
      }
    });
  }

  let prod = await prisma.product.findFirst({
    where: { collectionId: coll.id }
  });
  if (!prod) {
    prod = await prisma.product.create({
      data: {
        name: "Test Prod",
        slug: "test-prod-" + Date.now(),
        description: "test",
        shortDescription: "test",
        price: 100,
        collectionId: coll.id,
      }
    });
  }

  const evt = await prisma.saleEvent.create({
    data: {
      name: "Test Event " + Date.now(),
      bannerText: "TEST",
      isActive: true,
      targetCollections: [coll.id],
      targetProducts: [],
      discountPercent: 10
    }
  });

  const activeEvent = await prisma.saleEvent.findFirst({
    where: { isActive: true }
  });

  if (activeEvent) {
    console.log("Active Event Target Collections:", activeEvent.targetCollections);
    console.log("Type of targetCollections:", typeof activeEvent.targetCollections, Array.isArray(activeEvent.targetCollections));
    
    // Test the exact logic
    const targetCollections = (activeEvent.targetCollections as string[]) || [];
    const targetProducts = (activeEvent.targetProducts as string[]) || [];

    const productsFound = await prisma.product.findMany({
      where: {
        OR: [
          { collectionId: { in: targetCollections } },
          { id: { in: targetProducts } }
        ]
      }
    });

    console.log("Products found length:", productsFound.length);
    console.log("First product found:", productsFound[0]);
  }

  // cleanup
  await prisma.saleEvent.delete({ where: { id: evt.id } });
}

check().catch(console.error).finally(() => prisma.$disconnect());
