'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { CollectionDTO } from '@/types/product';

interface CollectionsCarouselProps {
  collections: CollectionDTO[];
  selectedCollectionId?: string;
  onCollectionSelect?: (collectionId: string) => void;
}

export default function CollectionsCarousel({
  collections,
  selectedCollectionId,
  onCollectionSelect,
}: CollectionsCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Infinite continuous auto-scroll effect
  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return;

    const container = containerRef.current;
    const content = contentRef.current;
    const scrollSpeed = 0.8; // pixels per frame for smooth scrolling
    let animationId: number;

    const scroll = () => {
      // Scroll smoothly
      container.scrollLeft += scrollSpeed;
      
      // When scroll reaches the end, smoothly return to start
      if (container.scrollLeft >= content.scrollWidth - container.clientWidth - 10) {
        // Use setTimeout to reset smoothly
        setTimeout(() => {
          container.scrollLeft = 0;
        }, 500);
      }
      
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationId);
  }, [collections]);

  if (collections.length === 0) return null;

  return (
    <div className="w-full py-8 md:py-12 bg-white">
      <div
        ref={containerRef}
        className="flex gap-6 md:gap-8 overflow-x-auto no-scrollbar px-4 sm:px-6 md:px-10 scroll-smooth"
        style={{
          scrollBehavior: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div ref={contentRef} className="flex gap-6 md:gap-8">
          {collections.map((collection) => (
            <button
              key={collection.id}
              onClick={() => onCollectionSelect?.(collection.id)}
              className="flex-shrink-0 flex flex-col items-center gap-3 md:gap-4 group cursor-pointer"
            >
              {/* Circular Image Container */}
              <div
                className={`relative w-40 h-40 sm:w-48 sm:h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-2 transition-all duration-300 transform group-hover:scale-105 ${
                  selectedCollectionId === collection.id
                    ? 'border-[#A855F7] shadow-lg shadow-[#A855F7]/20'
                    : 'border-gray-300 group-hover:border-[#A855F7]/50'
                }`}
              >
                {collection.image ? (
                  <Image
                    src={collection.image}
                    alt={collection.name}
                    fill
                    className="object-cover w-full h-full"
                    sizes="(max-width: 640px) 160px, (max-width: 768px) 192px, 256px"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                    <span className="text-4xl md:text-5xl">👟</span>
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
              </div>

              {/* Label */}
              <span
                className={`text-[11px] sm:text-[12px] md:text-[13px] font-black uppercase tracking-[0.15em] text-center whitespace-nowrap transition-colors duration-300 ${
                  selectedCollectionId === collection.id
                    ? 'text-[#A855F7]'
                    : 'text-gray-600 group-hover:text-[#A855F7]'
                }`}
              >
                {collection.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
