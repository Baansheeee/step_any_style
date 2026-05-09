export type Gender = 'MEN' | 'WOMEN' | 'UNISEX';

export interface CollectionDTO {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  targetGender: Gender;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  color: string;
  size: string;
  stock: number;
}

export interface ProductDTO {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice: number | null;
  inStock: boolean;
  image: string | null;
  images: string[];
  videoUrl: string | null;
  advantages: string[];
  specifications: Record<string, unknown>;
  features: string[];
  variants: ProductVariant[];
  collectionId: string | null;
  collection?: CollectionDTO | null;
  rating: number;
  saleCount: number;
  isNew: boolean;
  isTrending: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductPayload {
  slug?: string;
  name?: string;
  description?: string;
  shortDescription?: string;
  price?: number;
  originalPrice?: number | null;
  inStock?: boolean;
  image?: string | null;
  images?: string[];
  videoUrl?: string | null;
  advantages?: string[];
  specifications?: Record<string, unknown>;
  features?: string[];
  variants?: ProductVariant[];
  collectionId?: string | null;
}
