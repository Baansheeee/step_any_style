'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AffiliateBanner() {
  return (
    <section className="relative w-full py-16 overflow-hidden bg-white">
      <div className="max-w-[1600px] mx-auto px-6 md:px-20">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-[2rem] overflow-hidden shadow-[0_40px_80px_-20px_rgba(107,33,168,0.2)] border border-purple-50"
        >
          {/* Background Image Container */}
          <div className="relative h-[400px] md:h-[500px] w-full">
            <img 
              src="/Banner/affiliate.png" 
              alt="Join our Affiliate Program" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Premium Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 via-purple-900/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>

          {/* Content Overlay */}
          <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-20">
            <div className="max-w-2xl space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3"
              >
                <span className="h-[2px] w-12 bg-amber-400" />
                <span className="text-xs md:text-sm font-black uppercase tracking-[0.4em] text-amber-400">
                  Earn While You Share
                </span>
              </motion.div>

              <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-[0.9]"
              >
                Join the <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 italic font-serif normal-case tracking-normal">Elite</span> Affiliate <br />
                Network
              </motion.h2>

              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="text-base md:text-lg text-purple-100 max-w-lg font-medium leading-relaxed opacity-90"
              >
                Partner with Step & Style and earn premium commissions on every sale you refer. High conversion rates, dedicated support, and real-time tracking.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-4 pt-6"
              >
                <Link 
                  href="/affiliate"
                  className="px-10 py-5 bg-amber-400 text-black text-xs font-black uppercase tracking-[0.3em] rounded-full hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-2xl"
                >
                  Apply Now
                </Link>
                <div className="flex flex-col justify-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white mb-1">Up To</p>
                  <p className="text-2xl font-black text-amber-400 leading-none">15% Commission</p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Decorative Corner Element */}
          <div className="absolute top-0 right-0 p-12 hidden lg:block">
            <div className="w-24 h-24 border-t-2 border-r-2 border-white/20 rounded-tr-3xl" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
