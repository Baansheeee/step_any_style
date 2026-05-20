'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSaleStatus } from '../hooks/useSaleStatus';
import ScrollAnimate from './ScrollAnimate';

export default function SaleBanner() {
  const saleInfo = useSaleStatus();

  if (!saleInfo || !saleInfo.show) return null;

  const eventName = saleInfo.eventName || 'EXCLUSIVE SALE EVENT';
  const bannerText = saleInfo.bannerText || 'SPECIAL OFFERS LIVE NOW';

  return (
    <section className="w-full py-10 bg-gradient-to-b from-white via-[#FAF9FF] to-white overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-10">
        <ScrollAnimate animation="fade-in">
          <div className="relative rounded-3xl bg-gradient-to-r from-[#FAF9FF] via-[#F3E8FF] to-[#FAF9FF] border border-[#E9D5FF] shadow-2xl overflow-hidden md:grid md:grid-cols-12 md:items-center">
            
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-[#E9D5FF]/30 to-transparent rounded-full filter blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] bg-[#C084FC]/10 rounded-full filter blur-3xl pointer-events-none" />
            
            {/* Decorative Gold/Purple accents */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#A855F7]/30 to-transparent" />
            
            {/* Left Content Column */}
            <div className="relative z-10 p-8 sm:p-12 md:p-16 lg:p-20 md:col-span-7 flex flex-col justify-center space-y-6">
              
              {/* Animated Live Badge */}
              <div className="inline-flex items-center gap-2 self-start bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-[#E9D5FF]/60 shadow-sm">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A855F7] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#6B21A8]"></span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6B21A8]">
                  {eventName}
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-4">
                <h3 className="text-3xl sm:text-4xl lg:text-6xl font-black uppercase tracking-tighter text-gray-900 leading-none">
                  {bannerText.split(':')[0] || bannerText}
                </h3>
                {bannerText.includes(':') && (
                  <h4 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-[#6B21A8] to-[#A855F7] bg-clip-text text-transparent uppercase tracking-tight">
                    {bannerText.substring(bannerText.indexOf(':') + 1).trim()}
                  </h4>
                )}
                
                <p className="text-gray-600 text-sm sm:text-base font-light leading-relaxed max-w-lg">
                  Step into style and unmatched comfort. For a limited time, experience our premium handcrafted collections at exclusive promotional prices. Elevate your footwear wardrobe today.
                </p>
              </div>

              {/* Trust Indicators / Mini Features */}
              <div className="grid grid-cols-2 gap-4 py-2 border-t border-[#E9D5FF]/60 border-b max-w-lg">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#6B21A8]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Open Parcel Facility</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#6B21A8]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Fast Secure Delivery</span>
                </div>
              </div>

              {/* CTA Button */}
              <div className="pt-2">
                <Link
                  href="/products?onSale=true"
                  className="relative group inline-flex items-center justify-center bg-gradient-to-r from-[#6B21A8] to-[#581C87] text-white px-10 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 hover:shadow-[0_0_25px_rgba(107,33,168,0.4)] overflow-hidden rounded-lg"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#A855F7] to-[#6B21A8] opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out" />
                  <span className="relative z-10 flex items-center gap-2">
                    Shop The Sale Now
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                </Link>
              </div>
            </div>

            {/* Right Image Column */}
            <div className="relative h-[320px] sm:h-[400px] md:h-full min-h-[350px] md:col-span-5 w-full overflow-hidden border-t md:border-t-0 md:border-l border-[#E9D5FF]/60 bg-white">
              <Image
                src="/Banner/sale_banner.png"
                alt={eventName}
                fill
                priority
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
              {/* Glassy brand badge overlaid on the image */}
              <div className="absolute bottom-6 right-6 bg-white/35 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/20 shadow-lg pointer-events-none">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white drop-shadow-md">
                  Step & Style
                </span>
              </div>
            </div>

          </div>
        </ScrollAnimate>
      </div>
    </section>
  );
}
