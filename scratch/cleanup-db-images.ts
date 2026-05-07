import { PrismaClient } from '@prisma/client';

const DATABASE_URL = 'mongodb+srv://ipl_store:ipl_store@cluster0.kctgfao.mongodb.net/iplstore?retryWrites=true&w=majority';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
});

async function main() {
  const products = await prisma.product.findMany();
  console.log(`Checking ${products.length} products for image path cleanup...`);

  for (const product of products) {
    let needsUpdate = false;
    let newImage = product.image;
    let newImages = product.images as any[];

    if (newImage && newImage.includes(' ')) {
      newImage = newImage.replace(/ /g, '');
      needsUpdate = true;
    }

    if (Array.isArray(newImages)) {
      const updatedImages = newImages.map(img => {
        if (typeof img === 'string' && img.includes(' ')) {
          needsUpdate = true;
          return img.replace(/ /g, '');
        }
        return img;
      });
      newImages = updatedImages;
    }

    if (needsUpdate) {
      console.log(`Updating product: ${product.name} (${product.slug})`);
      await prisma.product.update({
        where: { id: product.id },
        data: {
          image: newImage,
          images: newImages
        }
      });
    }
  }

  console.log('Cleanup complete!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
