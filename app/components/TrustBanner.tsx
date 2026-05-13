'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Using the exact filenames as shown in the public/Banner directory
const trustItems = [
  {
    id: 1,
    imgSrc: "/Banner/Trust.jpg",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Open Parcel then Pay",
    description: "Inspect your order at your doorstep before making any payment. We believe in 100% transparency and customer trust.",
    badge: "Verified Trust",
    color: "from-emerald-600 to-teal-700"
  },
  {
    id: 2,
    imgSrc: "/Banner/Safe and Secure Payment.jpg",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Safe & Secure Payment",
    description: "Every transaction is protected by industry-standard SSL encryption. Your financial data is handled with maximum security.",
    badge: "SSL Encrypted",
    color: "from-blue-600 to-indigo-700"
  },
  {
    id: 3,
    imgSrc: "/Banner/Return Policy.jpg",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "7 Day Return Policy",
    description: "Not the perfect fit? No worries. We offer a hassle-free 7-day exchange and return policy for all our customers.",
    badge: "Easy Returns",
    color: "from-purple-600 to-violet-700"
  },
  {
    id: 4,
    imgSrc: "/Banner/Premium HandCraft.jpg",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4m5.618-4.016L12 10.744M12 3c7.2 0 9 1.8 9 9s-1.8 9-9 9-9-1.8-9-9 1.8-9 9-9z" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Premium Handcraft",
    description: "Our footwear is handcrafted by master artisans using the finest materials, ensuring luxury quality in every step.",
    badge: "Master Artisans",
    color: "from-amber-600 to-orange-700"
  }
];

export default function TrustBanner() {
  const [cards, setCards] = useState(trustItems);

  useEffect(() => {
    const interval = setInterval(() => {
      setCards((prevCards) => {
        const newCards = [...prevCards];
        const firstCard = newCards.shift();
        if (firstCard) newCards.push(firstCard);
        return newCards;
      });
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[#FAF9FF] py-16 overflow-hidden relative min-h-[600px] flex flex-col items-center justify-center">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(#6B21A8 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
      />
      
      <div className="text-center mb-12 px-6 relative z-10">
        <h2 className="text-xs font-black uppercase tracking-[0.5em] text-[#6B21A8] mb-4">Our Commitment</h2>
        <h3 className="text-2xl md:text-5xl font-black uppercase tracking-tight text-gray-900">Why Trust Step & Style?</h3>
      </div>

      <div className="relative w-full max-w-[1200px] h-[450px] md:h-[520px] px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={cards[0].id}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="absolute inset-0 px-6"
          >
            <div className="w-full h-full bg-white rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(107,33,168,0.12)] border border-purple-50 overflow-hidden flex flex-col md:flex-row group">
              {/* Left: Image Section */}
              <div className="md:w-3/5 h-64 md:h-full relative overflow-hidden bg-gray-50">
                <img 
                  src={cards[0].imgSrc} 
                  alt={cards[0].title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/main_logo.png";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />
              </div>

              {/* Right: Content Section */}
              <div className="md:w-2/5 p-8 md:p-12 flex flex-col justify-between relative bg-white">
                <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${cards[0].color} opacity-[0.04] rounded-bl-full blur-3xl`} />
                
                <div>
                  <div className={`w-16 h-16 bg-gradient-to-br ${cards[0].color} text-white rounded-2xl flex items-center justify-center mb-10 shadow-xl shadow-purple-100 transform -rotate-3 group-hover:rotate-0 transition-transform duration-500`}>
                    {cards[0].icon}
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <span className={`h-[2px] w-10 bg-gradient-to-r ${cards[0].color}`} />
                      <span className="text-xs font-black uppercase tracking-[0.4em] text-purple-600">
                        {cards[0].badge}
                      </span>
                    </div>
                    <h4 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-gray-900 leading-[0.95]">
                      {cards[0].title}
                    </h4>
                    <p className="text-base text-gray-500 font-medium leading-relaxed italic pr-6">
                      "{cards[0].description}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-10 border-t border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Step & Style Verified</span>
                  </div>
                  <div className="text-[10px] font-black text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-100">
                    PREMIUM
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Dots */}
      <div className="mt-16 flex items-center gap-5 relative z-10">
        {trustItems.map((_, i) => (
          <button 
            key={i}
            className={`h-2 transition-all duration-700 rounded-full ${
              cards[0].id === trustItems[i].id ? 'w-12 bg-purple-600 shadow-[0_0_15px_rgba(107,33,168,0.4)]' : 'w-2 bg-purple-200 hover:bg-purple-300'
            }`} 
          />
        ))}
      </div>
    </div>
  );
}
