'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { CollectionDTO } from '@/types/product';

interface HomeCollectionsCarouselProps {
  collections: CollectionDTO[];
  title: string;
  subtitle: string;
  viewAllLink: string;
  accentColor?: string;
}

export default function HomeCollectionsCarousel({
  collections,
  title,
  subtitle,
  viewAllLink,
  accentColor = '#A855F7',
}: HomeCollectionsCarouselProps) {
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
    <section className="w-full py-12 md:py-20 bg-white">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 md:mb-16">
          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.4em] mb-3" style={{ color: accentColor }}>
              {subtitle}
            </h2>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter text-gray-900">
              {title}
            </h3>
          </div>
          <Link
            href={viewAllLink}
            className="inline-block text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-gray-600 hover:text-gray-900 transition-colors mt-6 md:mt-0"
          >
            VIEW ALL
          </Link>
        </div>

        {/* Carousel */}
        <div className="w-full py-4">
          <div
            ref={containerRef}
            className="flex gap-8 md:gap-10 overflow-x-auto no-scrollbar px-2 scroll-smooth"
            style={{
              scrollBehavior: 'auto',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <div ref={contentRef} className="flex gap-8 md:gap-10">
              {collections.map((collection) => (
                <Link
                  key={collection.id}
                  href={`/products?collectionId=${collection.id}`}
                  className="flex-shrink-0 flex flex-col items-center gap-4 md:gap-5 group cursor-pointer"
                >
                  {/* Circular Image Container */}
                  <div
                    className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-72 md:h-72 rounded-full overflow-hidden border-4 transition-all duration-300 transform group-hover:scale-105"
                    style={{
                      borderColor: accentColor,
                      boxShadow: `0 0 0 0 ${accentColor}20`,
                    }}
                  >
                    {collection.image ? (
                      <Image
                        src={collection.image}
                        alt={collection.name}
                        fill
                        className="object-cover w-full h-full"
                        sizes="(max-width: 640px) 192px, (max-width: 768px) 224px, 288px"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                        <span className="text-6xl md:text-7xl">👟</span>
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-all duration-300" />
                  </div>

                  {/* Label */}
                  <span
                    className="text-[12px] md:text-[14px] font-black uppercase tracking-[0.2em] text-center whitespace-nowrap transition-colors duration-300 group-hover:opacity-70"
                    style={{ color: accentColor }}
                  >
                    {collection.name}
                  </span>
                </Link>
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
      </div>
    </section>
  );
}
