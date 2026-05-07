'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { products as seedProducts } from '@/app/data/products';

const buildBannerImages = (productList: typeof seedProducts | { image?: string | null; images?: string[] }[]) => {
  // Use static banner and collection images
  const bannerImages: string[] = [
    // Banner folder images (3)
    '/Banner/2fdf278209cfa0e127d35b95715c3b0e.jpg',
    '/Banner/a35fa3ba9b50175dbbf25b43e17fbefe.jpg',
    '/Banner/pair-black-flip-flops-asphalt.jpg',
  ];
  return bannerImages;
};

export default function BannerSlideshow() {
  const [bannerImages, setBannerImages] = useState<string[]>(() => buildBannerImages(seedProducts));
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const loadImages = async () => {
      try {
        const response = await fetch('/api/products', { cache: 'no-store' });
        const payload = await response.json();
        if (!response.ok || !Array.isArray(payload.data)) {
          throw new Error(payload.error || 'Failed to load products');
        }
        if (isMounted) {
          const images = buildBannerImages(payload.data);
          if (images.length) {
            setBannerImages(images);
            setCurrentIndex(0);
          }
        }
      } catch (error) {
        console.warn('Unable to load banner products', error);
      }
    };

    loadImages();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (bannerImages.length <= 1) {
      return;
    }
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bannerImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [bannerImages.length]);

  const goToSlide = (index: number) => {
    if (!bannerImages.length) return;
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    if (!bannerImages.length) return;
    setCurrentIndex((prev) => (prev + 1) % bannerImages.length);
  };

  const prevSlide = () => {
    if (!bannerImages.length) return;
    setCurrentIndex((prev) => (prev - 1 + bannerImages.length) % bannerImages.length);
  };

  if (bannerImages.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative h-48 md:h-64 lg:h-80 rounded-2xl overflow-hidden shadow-2xl group">
          {/* Banner Images */}
          <div className="relative w-full h-full">
            {bannerImages.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                <Image
                  src={image}
                  alt={`Banner ${index + 1}`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1280px"
                />
                {/* Overlay gradient for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 via-transparent to-pink-900/30"></div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/80 hover:bg-white backdrop-blur-sm flex items-center justify-center transition-all hover:shadow-lg group-hover:opacity-100 opacity-0 md:opacity-100"
            aria-label="Previous banner"
          >
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/80 hover:bg-white backdrop-blur-sm flex items-center justify-center transition-all hover:shadow-lg group-hover:opacity-100 opacity-0 md:opacity-100"
            aria-label="Next banner"
          >
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {bannerImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-white w-8 md:w-10'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

