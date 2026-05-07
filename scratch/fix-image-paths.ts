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
  
  for (const product of products) {
    let needsUpdate = false;
    let newImage = product.image;
    let newImages = product.images as any[];

    if (newImage && newImage.startsWith('/products/')) {
      newImage = newImage.replace('/products/', '/product/');
      needsUpdate = true;
    }

    if (Array.isArray(newImages)) {
      const updatedImages = newImages.map(img => {
        if (typeof img === 'string' && img.startsWith('/products/')) {
          needsUpdate = true;
          return img.replace('/products/', '/product/');
        }
        return img;
      });
      newImages = updatedImages;
    }

    if (needsUpdate) {
      console.log(`Fixing path for: ${product.name}`);
      await prisma.product.update({
        where: { id: product.id },
        data: {
          image: newImage,
          images: newImages
        }
      });
    }
  }

  console.log('Path fix complete!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
