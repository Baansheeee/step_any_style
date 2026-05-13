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
        <div className="max-w-[1400px] mx-auto px-4 py-2 flex items-center justify-center relative min-h-[36px]">
          {/* Animated Sale Badge */}
          <div className="absolute left-4 hidden md:flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-red-500">Live Sale</span>
          </div>

          <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-center">
            {saleInfo.bannerText}
          </p>

          <div className="absolute right-4 hidden md:block">
             <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest border border-gray-800 px-2 py-1 rounded">Limited Time</span>
          </div>
        </div>

        {/* Decorative thin line at bottom */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-30" />
      </motion.div>
    </AnimatePresence>
  );
}
