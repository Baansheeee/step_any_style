'use client';

import React from 'react';
import Navbar from '../components/Navbar';
import ScrollAnimate from '../components/ScrollAnimate';

export default function ShippingDeliveryPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <ScrollAnimate animation="fade-in" className="text-center mb-20">
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-gray-900 mb-6">
              Shipping <br /> <span className="text-[#A855F7]">& Delivery</span>
            </h1>
            <p className="text-gray-500 font-medium uppercase tracking-[0.2em] text-sm">Fast, reliable, and transparent shipping across the nation.</p>
          </ScrollAnimate>

          <div className="grid md:grid-cols-2 gap-8 mb-20">
            <ScrollAnimate animation="fade-in" className="bg-[#FAF9FF] p-10 rounded-3xl border border-[#F5F3FF]">
              <h3 className="text-xl font-black uppercase tracking-tight text-gray-900 mb-4">Shipping Rates</h3>
              <ul className="space-y-4 text-gray-600 font-medium text-sm">
                <li className="flex justify-between border-b border-purple-100 pb-2">
                  <span>Cash on Delivery</span>
                  <span className="font-black text-gray-900">Rs. 300 - 350</span>
                </li>

              </ul>
            </ScrollAnimate>

            <ScrollAnimate animation="fade-in" delay="0.1s" className="bg-gray-900 p-10 rounded-3xl text-white">
              <h3 className="text-xl font-black uppercase tracking-tight mb-4">Delivery Times</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-[#A855F7] text-[10px] font-black uppercase tracking-widest mb-1">Major Cities</p>
                  <p className="text-lg font-bold">2 – 3 Working Days</p>
                </div>
                <div>
                  <p className="text-[#A855F7] text-[10px] font-black uppercase tracking-widest mb-1">Other Regions</p>
                  <p className="text-lg font-bold">4 – 6 Working Days</p>
                </div>
              </div>
            </ScrollAnimate>
          </div>

          <ScrollAnimate animation="fade-in" className="prose prose-purple max-w-none">
            <h3 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-6">Tracking Your Order</h3>
            <p className="text-gray-600 leading-relaxed font-medium mb-6">
              Once your order is dispatched, you will receive a confirmation message with a tracking number. You can use this number on our partner courier's website to see the real-time status of your delivery.
            </p>
            <h3 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-6">Delivery Policy</h3>
            <p className="text-gray-600 leading-relaxed font-medium">
              We strive to deliver every order with care. Please ensure someone is available at the provided address to receive the package. For COD orders, please have the exact amount ready to facilitate a smooth handover.
            </p>
          </ScrollAnimate>
        </div>
      </main>
    </div>
  );
}
