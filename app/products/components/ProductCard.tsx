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
      <div className="relative aspect-square bg-gray-50 rounded-lg sm:rounded-xl overflow-hidden mb-3 sm:mb-5">
        <Image
          src={product.image || '/logo_main.png'}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex flex-col gap-1.5 sm:gap-2 z-10 items-start">
          {!product.inStock && (
            <div className="bg-white px-2 sm:px-3 py-1 sm:py-1.5 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-red-600 shadow-sm border border-gray-100">
              Sold Out
            </div>
          )}
          {product.isNew && (
            <div className="bg-white px-2.5 sm:px-4 py-1.5 sm:py-2 text-[9px] sm:text-[11px] font-bold uppercase tracking-widest text-black shadow-sm border border-gray-100">
              New
            </div>
          )}
          {product.isTrending && (
            <div className="bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-amber-600 shadow-sm border border-gray-100">
              Trending
            </div>
          )}
        </div>
        {product.discount && product.discount > 0 ? (
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-red-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 text-[8px] sm:text-[10px] font-black uppercase tracking-widest shadow-lg">
            {product.discount}% OFF
          </div>
        ) : product.originalPrice && product.originalPrice > product.price ? (
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-black text-white px-2 sm:px-3 py-1 sm:py-1.5 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest shadow-lg">
            Sale
          </div>
        ) : null}
        <div className="absolute inset-x-0 bottom-0 bg-white/10 backdrop-blur-md p-2 sm:p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block">
          <span className="block text-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-900 bg-white py-3 shadow-lg">Quick View</span>
        </div>
      </div>
      <div className="space-y-1.5 px-0.5 md:px-0">
        <h3 className="font-medium text-[11px] sm:text-[14px] text-gray-800 group-hover:text-black transition-colors line-clamp-1">{product.name}</h3>
        <div className="flex flex-col">
          <div className="flex items-center gap-2 md:gap-3">
            <p className="font-bold text-[13px] sm:text-[16px] text-[#6B21A8]">
              {formatPKR(product.discount && product.discount > 0 
                ? Math.round(product.price * (1 - product.discount / 100)) 
                : product.price)}
            </p>
            {(product.discount && product.discount > 0) || (product.originalPrice && product.originalPrice > product.price) ? (
              <p className="text-gray-400 text-[11px] sm:text-[13px] line-through font-medium">
                {formatPKR(product.originalPrice || product.price)}
              </p>
            ) : null}
          </div>
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
