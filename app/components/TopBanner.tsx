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
        className="bg-[#111111] text-white overflow-hidden relative"
      >
        <div className="overflow-hidden whitespace-nowrap relative min-h-[36px] flex items-center w-full">
          <div className="animate-marquee flex items-center">
            {/* Repeat the item enough times to fill the screen seamlessly */}
            {[...Array(15)].map((_, i) => (
              <div key={i} className="flex items-center mx-4 gap-4 md:gap-8 shrink-0">
                <span className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-red-500">
                    Live Sale
                  </span>
                </span>
                <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-gray-200">
                  {saleInfo.bannerText}
                </p>
                <span className="text-[10px] text-gray-700 mx-2">•</span>
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
            animation: marquee 30s linear infinite;
            display: flex;
            width: max-content;
          }
        `}</style>

        {/* Decorative thin line at bottom */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-30" />
      </motion.div>
    </AnimatePresence>
  );
}
