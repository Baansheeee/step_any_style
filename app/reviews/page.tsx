'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import ScrollAnimate from '../components/ScrollAnimate';

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  images: string[] | null;
  videoUrl: string | null;
  product: {
    id: string;
    slug: string;
    name: string;
    image: string;
  };
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('/api/reviews', { cache: 'no-store' });
        const data = await response.json();
        if (data.success) {
          setReviews(data.reviews);
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <Navbar />

      {/* Header Section */}
      <section className="pt-32 pb-20 px-6 bg-[#FAF9FF] border-b border-[#F5F3FF]">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollAnimate animation="fade-in">
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase text-gray-900">
              Community <br /> <span className="text-[#A855F7]">Voices</span>
            </h1>
            <p className="text-gray-500 text-lg md:text-xl font-medium tracking-wide uppercase max-w-2xl mx-auto">
              Real experiences from our global community. Discover why Step & Style is the destination for luxury footwear.
            </p>
          </ScrollAnimate>
        </div>
      </section>

      {/* Reviews Content */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#A855F7] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Loading Testimonials...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 bg-[#FAF9FF] rounded-3xl border border-[#F5F3FF]">
            <p className="text-gray-400 font-bold uppercase tracking-widest">No reviews shared yet. Be the first!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <ScrollAnimate 
                key={review.id} 
                animation="fade-in" 
                delay={`${index * 0.05}s`}
                className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col group"
              >
                {/* Product Reference */}
                <Link href={`/products/${review.product.slug}`} className="flex items-center gap-4 mb-8 p-3 bg-gray-50 rounded-2xl hover:bg-[#F5F3FF] transition-colors">
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-white border border-gray-200">
                    <Image 
                      src={review.product.image || '/logo_main.png'} 
                      alt={review.product.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#A855F7] mb-0.5">Purchased</p>
                    <h4 className="text-[11px] font-black uppercase tracking-tight text-gray-900 truncate">{review.product.name}</h4>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-[#A855F7] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                {/* Rating & User */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <h3 className="font-black text-gray-900 mb-4 uppercase tracking-tight">{review.userName}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-8 italic">"{review.comment}"</p>

                {/* Media Section */}
                {(review.images && review.images.length > 0) || review.videoUrl ? (
                  <div className="mt-auto pt-6 border-t border-gray-50 grid grid-cols-4 gap-2">
                    {review.images?.map((img, idx) => (
                      <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-gray-100 relative group/media">
                        <Image src={img} alt="User photo" fill className="object-cover transition-transform duration-500 group-hover/media:scale-110" />
                      </div>
                    ))}
                    {review.videoUrl && (
                      <div className="aspect-square rounded-xl overflow-hidden bg-black relative flex items-center justify-center group/vid cursor-pointer">
                        {review.videoUrl.includes('youtube.com') || review.videoUrl.includes('youtu.be') ? (
                          <Image 
                            src={`https://img.youtube.com/vi/${review.videoUrl.split('/').pop()?.split('=')[1] || review.videoUrl.split('/').pop()}/mqdefault.jpg`}
                            alt="Video"
                            fill
                            className="object-cover opacity-60"
                          />
                        ) : (
                          <video 
                            src={review.videoUrl} 
                            className="w-full h-full object-cover opacity-60" 
                            muted 
                            loop 
                            onMouseOver={e => e.currentTarget.play()} 
                            onMouseOut={e => e.currentTarget.pause()} 
                          />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg className="w-6 h-6 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </ScrollAnimate>
            ))}
          </div>
        )}
      </section>

      {/* Footer CTA */}
      <section className="py-20 bg-gray-900 text-center">
        <ScrollAnimate animation="fade-in">
          <h2 className="text-white text-3xl md:text-5xl font-black mb-8 uppercase tracking-tighter">Share Your Story</h2>
          <p className="text-gray-400 mb-10 uppercase tracking-widest text-[11px] font-bold">Bought something recently? We'd love to see it in action.</p>
          <Link href="/products">
            <button className="bg-white text-black px-12 py-4 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-[#A855F7] hover:text-white transition-all shadow-2xl">
              Find Your Pair
            </button>
          </Link>
        </ScrollAnimate>
      </section>
    </div>
  );
}
