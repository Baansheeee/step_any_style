'use client';

import Link from 'next/link';
import Navbar from '@/app/components/Navbar';

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />
      <div className="max-w-[1440px] mx-auto px-4 md:px-10 py-10 md:py-20 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
        
        {/* Success Card */}
        <div className="bg-white rounded-[40px] border border-gray-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] p-8 md:p-8 max-w-2xl w-full flex flex-col items-center text-center space-y-8 mt-[-50px]" >
          
          {/* Success Icon */}
          <div className="relative mt-[10px]">
            <div className="absolute inset-0 bg-purple-200 blur-3xl opacity-30 rounded-full scale-150 animate-pulse" />
            <div className="relative w-20 h-20 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-full flex items-center justify-center shadow-xl shadow-purple-100">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <div className="space-y-4">
            <header>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-purple-600 mb-3">Step & Style Confirmation</p>
              <h1 className="text-3xl md:text-5xl font-black text-gray-900 uppercase tracking-tighter leading-tight">
                Order Placed <br /> Successfully
              </h1>
            </header>

            <p className="text-sm text-gray-400 font-medium leading-relaxed max-w-md mx-auto">
              Thank you for your order. We've received it and are preparing it for priority dispatch. A confirmation email is on its way to you.
            </p>
          </div>

          <div className="pt-6 w-full max-w-xs mx-auto">
            <Link
              href="/"
              className="block w-full px-12 py-5 bg-purple-600 text-white text-[11px] font-black uppercase tracking-[0.4em] rounded-full hover:bg-purple-700 shadow-xl shadow-purple-100 transition-all active:scale-95"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Brand Decoration */}
        <div className="mt-12 opacity-10 flex gap-8 grayscale select-none">
           <img src="/IPL logo Main JPG.png" alt="Stylo Logo" className="h-8 w-auto" />
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 1s ease-out forwards; }
      `}</style>
    </div>
  );
}
