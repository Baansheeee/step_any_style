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
      className="group block"
    >
      <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden mb-5">
        <Image
          src={product.image || '/final_logo.jpeg'}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 items-start">
          {!product.inStock && (
            <div className="bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-red-600 shadow-sm border border-gray-100">
              Sold Out
            </div>
          )}
          {product.isNew && (
            <div className="bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-black shadow-sm border border-gray-100">
              New
            </div>
          )}
          {product.isTrending && (
            <div className="bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-amber-600 shadow-sm border border-gray-100">
              Trending
            </div>
          )}
        </div>
        {product.originalPrice && product.originalPrice > product.price && (
          <div className="absolute top-4 right-4 bg-black text-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest shadow-lg">
            Sale
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-white/10 backdrop-blur-md p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="block text-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-900 bg-white py-3 shadow-lg">Quick View</span>
        </div>
      </div>
      <div className="space-y-1.5">
        <h3 className="font-medium text-[14px] text-gray-800 group-hover:text-black transition-colors">{product.name}</h3>
        <div className="flex items-center gap-3">
          <p className="font-bold text-[15px] text-[#6B21A8]">{formatPKR(product.price)}</p>
          {product.originalPrice && product.originalPrice > product.price && (
            <p className="text-gray-400 text-[12px] line-through font-medium">{formatPKR(product.originalPrice)}</p>
          )}
        </div>
        {/* Color Swatches */}
        {product.variants && product.variants.length > 0 && (
          <div className="flex items-center gap-1.5 pt-1">
            {Array.from(new Set(product.variants.map(v => v.color))).slice(0, 3).map((color, i) => {
              const colors: Record<string, string> = {
                golden: '#D4AF37',
                gold: '#FFD700',
                silver: '#C0C0C0',
                white: '#FFFFFF',
                black: '#000000',
                nude: '#E3BC9A',
                ivory: '#FFFFF0',
                champagne: '#F7E7CE',
                'rose gold': '#B76E79',
                pink: '#FFC0CB',
              };
              const hex = colors[color.toLowerCase()] || color.toLowerCase();
              
              return (
                <div 
                  key={i} 
                  className="w-3.5 h-3.5 rounded-full border border-gray-200 shadow-sm" 
                  style={{ backgroundColor: hex }}
                  title={color}
                />
              );
            })}
            {new Set(product.variants.map(v => v.color)).size > 3 && (
              <span className="text-[10px] text-gray-400 font-medium ml-0.5">+{new Set(product.variants.map(v => v.color)).size - 3}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
