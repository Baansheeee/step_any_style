import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSaleStatus } from '../hooks/useSaleStatus';

export default function TopBanner() {
  const saleInfo = useSaleStatus();

  if (!saleInfo || !saleInfo.show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        className="bg-[#111111] text-white overflow-hidden relative border-b border-white/10"
      >
        <div className="relative overflow-hidden min-h-[36px] flex items-center">
          <div className="flex whitespace-nowrap animate-marquee">
            {/* We duplicate the items enough times to fill ultra-wide screens and ensure smooth looping */}
            {[...Array(15)].map((_, i) => (
              <div key={i} className="flex items-center space-x-6 mx-6 shrink-0">
                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em]">
                  {saleInfo.bannerText}
                </span>
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-red-500">
                    Live Sale
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <style jsx>{`
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 25s linear infinite;
            width: max-content;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
}
