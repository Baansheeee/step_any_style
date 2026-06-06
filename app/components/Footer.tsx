'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer suppressHydrationWarning className="bg-[#110C1F] text-white py-10 md:py-10">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-20">
        {/* Main Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-16 mb-12 md:mb-24">
          {/* Brand Column - Full width on mobile */}
          <div className="col-span-2 lg:col-span-1 flex flex-col gap-6 md:gap-10 items-center lg:items-start text-center lg:text-left">
            <div>
              <Link href="/" className="group flex items-center justify-center lg:justify-start h-4">
                <Image
                  src="/logo_main.png"
                  alt="Step & Styl"
                  width={180}
                  height={50}
                  className="object-contain h-14 md:h-16 w-auto transition-all duration-300 group-hover:scale-105"
                  priority
                />
                <div className="flex items-center -ml-4 md:-ml-5 mb-0 gap-1">
                  <span className="text-[13px] md:text-[15px] font-black uppercase tracking-[0.2em] text-[#A855F7] transition-all">
                    Step
                  </span>
                  <span className="text-[13px] md:text-[15px] font-black uppercase tracking-[0.2em] text-yellow-600 transition-all">
                    &
                  </span>
                  <span className="text-[13px] md:text-[15px] font-black uppercase tracking-[0.2em] text-[#A855F7] transition-all">
                    Style
                  </span>
                </div>
              </Link>
            </div>
            <p className="text-gray-400 text-[12px] md:text-[13px] font-medium leading-relaxed tracking-wide max-w-[300px] mx-auto lg:mx-0">
              Premium footwear for the modern individual. Designed for absolute comfort, crafted for timeless style.
            </p>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-black text-[10px] md:text-[11px] uppercase tracking-[0.3em] text-[#A855F7] mb-6 md:mb-10">Customer Service</h4>
            <ul className="space-y-3 md:space-y-4 text-gray-500 text-[10px] md:text-[11px] font-bold uppercase tracking-widest">
              <li><Link href="/help-center" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/shipping-delivery" className="hover:text-white transition-colors">Shipping & Delivery</Link></li>
              <li><Link href="/returns-exchanges" className="hover:text-white transition-colors">Returns & Exchanges</Link></li>
            </ul>
          </div>

          {/* About Us */}
          <div>
            <h4 className="font-black text-[10px] md:text-[11px] uppercase tracking-[0.3em] text-[#A855F7] mb-6 md:mb-10">About Us</h4>
            <ul className="space-y-3 md:space-y-4 text-gray-500 text-[10px] md:text-[11px] font-bold uppercase tracking-widest">
              <li><Link href="/our-story" className="hover:text-white transition-colors">Our Story</Link></li>
            </ul>
          </div>

          {/* Follow Us */}
          <div className="col-span-2 sm:col-span-1">
            <h4 className="font-black text-[10px] md:text-[11px] uppercase tracking-[0.3em] text-[#A855F7] mb-6 md:mb-10">Follow Us</h4>
            <div className="flex gap-4 md:gap-5">
              {[
                {
                  name: 'Facebook',
                  url: 'https://www.facebook.com/people/Step-and-style/61565848942129/?checkpoint_src=any',
                  path: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z',
                  hoverColor: 'hover:text-[#1877F2] hover:bg-[#1877F2]/10 hover:border-[#1877F2]/30'
                },
                {
                  name: 'Instagram',
                  url: 'https://www.instagram.com/stepandstylzone?igsh=aDltc29xbj3Zm8=',
                  path: 'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z M17.5 6.5h.01 M2 12c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12z',
                  hoverColor: 'hover:text-[#E4405F] hover:bg-[#E4405F]/10 hover:border-[#E4405F]/30'
                },
                {
                  name: 'Email',
                  url: 'mailto:hello@stepandstyl.com',
                  path: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
                  hoverColor: 'hover:text-[#EA4335] hover:bg-[#EA4335]/10 hover:border-[#EA4335]/30'
                }
              ].map((social, idx) => (
                <Link
                  key={idx}
                  href={social.url}
                  target={social.name !== 'Email' ? '_blank' : undefined}
                  rel={social.name !== 'Email' ? 'noopener noreferrer' : undefined}
                  className={`w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-full bg-white/5 text-gray-400 border border-white/10 transition-all duration-300 ${social.hoverColor} group`}
                  aria-label={social.name}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="md:w-5 md:h-5 transition-transform duration-300 group-hover:scale-110"
                  >
                    <path d={social.path} />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800/50 pt-8 md:pt-12">
          <p className="text-gray-600 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-center">&copy; 2026 Step & Styl. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
