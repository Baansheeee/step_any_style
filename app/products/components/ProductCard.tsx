'use client';

import Image from 'next/image';
import Link from 'next/link';
import { formatPKR } from '@/lib/currency';
import type { ProductDTO } from '@/types/product';

interface ProductCardProps {
  product: ProductDTO;
  index: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-purple-100 block group h-full flex flex-col"
    >
      <div className="h-64 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center overflow-hidden relative">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            width={300}
            height={300}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="text-4xl text-purple-200">{product.name.charAt(0)}</div>
        )}
        {!product.inStock && (
          <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
            Out of Stock
          </div>
        )}
        {product.originalPrice && product.originalPrice > product.price && (
          <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
            Sale
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/10 transition-all duration-300"></div>
      </div>
      <div className="p-6 flex-grow flex flex-col">
        <div className="mb-2">
          <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
            {product.collection?.name || 'Uncategorized'}
          </span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-purple-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-gray-600 mb-4 text-sm line-clamp-2 flex-grow">
          {product.shortDescription}
        </p>
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {formatPKR(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-400 line-through">
                {formatPKR(product.originalPrice)}
              </span>
            )}
          </div>
          <span className="w-full inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2.5 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all font-semibold text-center shadow-md group-hover:shadow-lg transform group-hover:-translate-y-0.5">
            View Details
          </span>
        </div>
      </div>
    </Link>
  );
}
