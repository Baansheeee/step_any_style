'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-[#110C1F] text-white py-24">
      <div className="max-w-[1600px] mx-auto px-6 md:px-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          <div className="lg:col-span-1">
            <Image
              src="/IPL logo Main JPG.png"
              alt="Logo"
              width={120}
              height={40}
              className="brightness-0 invert mb-8 opacity-90"
            />
            <p className="text-gray-400 text-[13px] font-medium leading-relaxed tracking-wide uppercase">
              Premium footwear for the modern individual. Designed for comfort, crafted for style.
            </p>
          </div>
          <div>
            <h4 className="font-black text-[11px] uppercase tracking-[0.3em] text-[#A855F7] mb-10">Customer Service</h4>
            <ul className="space-y-4 text-gray-500 text-[11px] font-bold uppercase tracking-widest">
              <li><Link href="/help-center" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="/shipping-delivery" className="hover:text-white transition-colors">Shipping & Delivery</Link></li>
              <li><Link href="/returns-exchanges" className="hover:text-white transition-colors">Returns & Exchanges</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-[11px] uppercase tracking-[0.3em] text-[#A855F7] mb-10">About Us</h4>
            <ul className="space-y-4 text-gray-500 text-[11px] font-bold uppercase tracking-widest">
              <li><Link href="/our-story" className="hover:text-white transition-colors">Our Story</Link></li>
              <li><Link href="/sustainability" className="hover:text-white transition-colors">Sustainability</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-[11px] uppercase tracking-[0.3em] text-[#A855F7] mb-10">Follow Us</h4>
            <div className="flex gap-5">
              {[
                { 
                  name: 'Facebook', 
                  path: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z',
                  hoverColor: 'hover:text-[#1877F2] hover:bg-[#1877F2]/10 hover:border-[#1877F2]/30'
                },
                { 
                  name: 'Instagram', 
                  path: 'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z M17.5 6.5h.01 M2 12c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12z',
                  hoverColor: 'hover:text-[#E4405F] hover:bg-[#E4405F]/10 hover:border-[#E4405F]/30'
                },
                { 
                  name: 'Twitter', 
                  path: 'M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z',
                  hoverColor: 'hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/10 hover:border-[#1DA1F2]/30'
                },
                { 
                  name: 'YouTube', 
                  path: 'M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2C5.12 19.5 12 19.5 12 19.5s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z',
                  extra: <path d="m9.75 15.02 5.75-3.27-5.75-3.27v6.54z" fill="currentColor" stroke="none" />,
                  hoverColor: 'hover:text-[#FF0000] hover:bg-[#FF0000]/10 hover:border-[#FF0000]/30'
                }
              ].map((social, idx) => (
                <Link 
                  key={idx} 
                  href="#" 
                  className={`w-11 h-11 flex items-center justify-center rounded-full bg-white/5 text-gray-400 border border-white/10 transition-all duration-300 ${social.hoverColor} group`}
                  aria-label={social.name}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-transform duration-300 group-hover:scale-110"
                  >
                    <path d={social.path} />
                    {social.extra}
                  </svg>
                </Link>
              ))}
            </div>
          </div>

        </div>
        <div className="border-t border-gray-900 pt-12 flex flex-col md:row justify-between items-center gap-8">
          <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">&copy; 2026 Step & Style. All rights reserved.</p>
          <div className="flex gap-10 text-gray-600 text-[10px] font-black uppercase tracking-[0.2em]">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
