import { Prisma } from '@prisma/client';
import prisma from './prisma';
import type { Product } from '@prisma/client';
import type { ProductDTO } from '@/types/product';
import { products as seedProducts } from '@/app/data/products';

let seedPromise: Promise<void> | null = null;

const toArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0);
  }
  return [];
};

const toObject = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
};

const toJsonInput = (value: unknown) => value as Prisma.InputJsonValue;

export function serializeProduct(product: any): ProductDTO {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    shortDescription: product.shortDescription,
    price: Number(product.price),
    originalPrice: product.originalPrice === null ? null : Number(product.originalPrice),
    inStock: product.inStock,
    image: product.image ?? null,
    images: toArray(product.images),
    videoUrl: product.videoUrl ?? null,
    advantages: toArray(product.advantages),
    specifications: toObject(product.specifications),
    features: toArray(product.features),
    variants: Array.isArray(product.variants) ? product.variants : [],
    collectionId: product.collectionId ?? null,
    collection: product.collection ? {
      id: product.collection.id,
      name: product.collection.name,
      slug: product.collection.slug,
      description: product.collection.description,
      image: product.collection.image,
      targetGender: product.collection.targetGender ?? 'UNISEX',
      createdAt: product.collection.createdAt.toISOString(),
      updatedAt: product.collection.updatedAt.toISOString(),
    } : null,
    rating: Number(product.rating || 0),
    saleCount: Number(product.saleCount || 0),
    discount: product.discount ?? null,
    isNew: (new Date().getTime() - new Date(product.createdAt).getTime()) < 15 * 24 * 60 * 60 * 1000,
    isTrending: Number(product.rating || 0) > 4.0 && Number(product.saleCount || 0) > 20,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

export async function ensureProductsSeeded() {
  if (seedPromise) {
    return seedPromise;
  }

  seedPromise = (async () => {
    try {
      const count = await prisma.product.count();
      if (count > 0) {
        return;
      }

      // Pre-create collections from brands in seed data
      const brands = [...new Set(seedProducts.map(p => (p as any).brand).filter(Boolean))];
      const collectionMap: Record<string, string> = {};
      
      for (const brandName of brands) {
        try {
          const collection = await prisma.collection.upsert({
            where: { slug: brandName.toLowerCase() },
            update: {},
            create: {
              name: brandName,
              slug: brandName.toLowerCase(),
            },
          });
          collectionMap[brandName] = collection.id;
        } catch (e) {
          console.error(`Failed to upsert collection ${brandName}:`, e);
        }
      }

      // Create products sequentially
      for (const product of seedProducts) {
        try {
          await prisma.product.create({
            data: {
              slug: product.id,
              name: product.name,
              description: product.description,
              shortDescription: product.shortDescription,
              price: product.price,
              originalPrice: product.originalPrice ?? null,
              inStock: product.inStock,
              image: (product as any).image ?? product.images?.[0] ?? null,
              images: toJsonInput(product.images ?? []),
              advantages: toJsonInput(product.advantages ?? []),
              specifications: toJsonInput(product.specifications ?? {}),
              features: toJsonInput(product.features ?? []),
              collectionId: collectionMap[(product as any).brand] ?? null,
              discount: 0,
            },
          });
        } catch (err) {
          // Skip products that fail to create (e.g., duplicates)
          console.error('Failed to seed product:', err);
        }
      }
    } catch (err) {
      console.error('Product seeding error:', err);
      seedPromise = null;
    }
  })();

  return seedPromise;
}


