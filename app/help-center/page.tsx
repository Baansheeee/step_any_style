'use client';

import React from 'react';
import Navbar from '../components/Navbar';
import ScrollAnimate from '../components/ScrollAnimate';

export default function HelpCenterPage() {
  const faqs = [
    {
      q: "How do I place an order?",
      a: "Simply browse our collection, select your size and color, and click 'Add to Cart'. Once you're ready, proceed to checkout where you can enter your shipping details and choose a payment method."
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept Cash on Delivery (COD), Direct Bank Transfers, and all major Credit/Debit Cards. Please note that Bank Transfers and Online Payments qualify for free delivery!"
    },
    {
      q: "Can I change or cancel my order?",
      a: "If your order has not been shipped yet, we can help you modify or cancel it. Please contact our support team immediately via WhatsApp or Email."
    },
    {
      q: "Do you offer international shipping?",
      a: "Currently, we specialize in deliveries within Pakistan. However, we are working on expanding our reach soon!"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-20 md:pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <ScrollAnimate animation="fade-in" className="text-center mb-20">
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter text-gray-900 mb-4 md:mb-6">
              Help <span className="text-[#A855F7]">Center</span>
            </h1>
            <p className="text-gray-500 font-medium uppercase tracking-[0.15em] sm:tracking-[0.2em] text-xs sm:text-sm">Everything you need to know about shopping with us.</p>
          </ScrollAnimate>

          <div className="space-y-12">
            {faqs.map((faq, i) => (
              <ScrollAnimate key={i} animation="fade-in" delay={`${i * 0.1}s`} className="border-b border-gray-100 pb-8">
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-gray-900 mb-3 sm:mb-4">{faq.q}</h3>
                <p className="text-gray-600 leading-relaxed font-medium">{faq.a}</p>
              </ScrollAnimate>
            ))}
          </div>

          <div className="mt-12 md:mt-20 p-6 sm:p-10 bg-[#FAF9FF] rounded-2xl sm:rounded-3xl border border-[#F5F3FF] text-center">
            <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-4">Still have questions?</h2>
            <p className="text-gray-500 mb-8 uppercase tracking-widest text-xs font-bold">Our support team is here to help you 24/7.</p>
            <a 
              href="https://wa.me/message/BTBNGKTP3BWGO1" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block bg-[#6B21A8] text-white px-12 py-4 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-black transition-all shadow-xl"
            >
              Contact Support
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
