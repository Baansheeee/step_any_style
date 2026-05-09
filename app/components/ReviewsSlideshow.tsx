'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { products as seedProducts } from '@/app/data/products';
import type { ProductDTO } from '@/types/product';

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  productId: string;
  productName: string;
  productImage?: string;
  date: string;
}

export default function ReviewsSlideshow() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    const fetchFeaturedReviews = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching featured reviews...');
        const response = await fetch('/api/reviews/featured', { cache: 'no-store' });
        const data = await response.json();
        console.log('Reviews API Response:', data);
        if (data.success && Array.isArray(data.reviews)) {
          setReviews(data.reviews);
        } else {
          console.warn('API returned success:false or no reviews array', data);
        }
      } catch (error) {
        console.error('Unable to load featured reviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedReviews();
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || reviews.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 5000); // Change review every 5 seconds

    return () => clearInterval(interval);
  }, [reviews.length, isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000); // Resume auto-play after 10 seconds
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!isMounted || (reviews.length === 0 && !isLoading)) {
    return (
      <section className="py-16 md:py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                What Our Customers Say
              </span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Real reviews from satisfied customers across Pakistan
            </p>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400 italic">
              No featured reviews available yet.
            </div>
          )}
        </div>
      </section>
    );
  }

  // Handle loading state while we have no reviews yet but are fetching
  if (isLoading && reviews.length === 0) {
    return (
      <section className="py-16 md:py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
           <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
              <div className="h-64 bg-gray-100 rounded-2xl w-full max-w-4xl mx-auto"></div>
           </div>
        </div>
      </section>
    );
  }

  const currentReview = reviews[currentIndex];

  return (
    <section className="py-16 md:py-20 bg-lavender-light/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 uppercase tracking-tighter">
            <span className="text-lavender-dark">
              What Our Customers Say
            </span>
          </h2>
          <p className="text-gray-500 text-sm uppercase tracking-widest font-bold">
            Real reviews from satisfied customers across Pakistan
          </p>
        </div>

        {/* Main Review Card */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-[2rem] shadow-xl p-8 md:p-12 border border-lavender-main relative overflow-hidden">
            {/* Decorative gradient background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-lavender-light rounded-full blur-3xl opacity-50 -z-0"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-lavender-main rounded-full blur-3xl opacity-50 -z-0"></div>
            
            <div className="relative z-10">
              {/* Stars */}
              <div className="flex items-center justify-center gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-6 h-6 ${
                      star <= currentReview.rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-lavender-main'
                    } transition-all duration-300`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>

              {/* Review Comment */}
              <p className="text-xl md:text-2xl text-gray-800 text-center mb-8 leading-relaxed italic font-medium">
                &quot;{currentReview.comment}&quot;
              </p>

              {/* Customer Info */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-lavender-main flex items-center justify-center text-lavender-dark font-black text-xl shadow-inner">
                  {currentReview.name.charAt(0)}
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-gray-900 text-lg uppercase tracking-tight">{currentReview.name}</h4>
                  <p className="text-gray-400 text-xs font-black uppercase tracking-widest">{currentReview.date}</p>
                </div>
              </div>

              {/* Product Info */}
              <div className="flex items-center justify-center gap-4 pt-6 border-t border-lavender-light">
                {currentReview.productImage && (
                  <Link href={`/products/${currentReview.productId}`} className="group">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-lavender-main group-hover:border-lavender-dark transition-all shadow-md group-hover:shadow-lg">
                      <Image
                        src={currentReview.productImage}
                        alt={currentReview.productName}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  </Link>
                )}
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Reviewed Product</p>
                  <Link 
                    href={`/products/${currentReview.productId}`}
                    className="font-bold text-lavender-dark hover:text-purple-900 transition-colors uppercase text-sm tracking-tight"
                  >
                    {currentReview.productName}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={prevSlide}
            className="w-12 h-12 rounded-full bg-white border-2 border-lavender-main hover:border-lavender-dark flex items-center justify-center transition-all hover:shadow-lg group"
            aria-label="Previous review"
          >
            <svg className="w-6 h-6 text-lavender-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Dots Indicator */}
          <div className="flex gap-2">
            {reviews.slice(0, 10).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-lavender-dark w-8'
                    : 'bg-lavender-main hover:bg-lavender-dark/50'
                }`}
                aria-label={`Go to review ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            className="w-12 h-12 rounded-full bg-white border-2 border-lavender-main hover:border-lavender-dark flex items-center justify-center transition-all hover:shadow-lg group"
            aria-label="Next review"
          >
            <svg className="w-6 h-6 text-lavender-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Review Stats */}
        <div className="text-center">
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest">
            <span className="text-lavender-dark">{reviews.length}+</span> Customer Reviews
          </p>
        </div>
      </div>
    </section>
  );
}

