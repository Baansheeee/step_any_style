'use client';

import React from 'react';
import Navbar from '../components/Navbar';
import ScrollAnimate from '../components/ScrollAnimate';

export default function ReturnsExchangesPage() {
  const steps = [
    { title: "Request", desc: "Contact us within 7 days of receiving your order." },
    { title: "Review", desc: "We'll review your request and provide a return authorization." },
    { title: "Ship", desc: "Pack the items securely and ship them back to our warehouse." },
    { title: "Refund", desc: "Once inspected, we'll process your refund or exchange." }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <ScrollAnimate animation="fade-in" className="text-center mb-20">
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-gray-900 mb-6">
              Returns <span className="text-[#A855F7]">& Exchanges</span>
            </h1>
            <p className="text-gray-500 font-medium uppercase tracking-[0.2em] text-sm">Hassle-free returns for a perfect shopping experience.</p>
          </ScrollAnimate>

          <div className="grid md:grid-cols-4 gap-4 mb-20">
            {steps.map((step, i) => (
              <ScrollAnimate key={i} animation="fade-in" delay={`${i * 0.1}s`} className="bg-white p-6 rounded-2xl border-2 border-gray-50 text-center hover:border-purple-200 transition-all">
                <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-black mx-auto mb-4">{i + 1}</div>
                <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-2">{step.title}</h4>
                <p className="text-[11px] text-gray-500 font-medium leading-relaxed">{step.desc}</p>
              </ScrollAnimate>
            ))}
          </div>

          <div className="prose prose-purple max-w-none space-y-12">
            <section>
              <h3 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-6 underline decoration-[#A855F7] decoration-4 underline-offset-8">Return Policy</h3>
              <p className="text-gray-600 leading-relaxed font-medium">
                We take pride in the quality of our footwear. Returns and exchanges are only accepted in cases of **manufacturing faults, damaged items, or sizing issues**.
              </p>
              <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold uppercase tracking-wide">
                Important: We do not offer returns or exchanges if the customer simply changes their mind or intention after purchase.
              </div>
            </section>

            <section>
              <h3 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-6 underline decoration-[#A855F7] decoration-4 underline-offset-8">Non-Returnable Items</h3>
              <ul className="list-disc pl-5 text-gray-600 space-y-2 font-medium">
                <li>Items on final sale or clearance.</li>
                <li>Customized or personalized orders.</li>
                <li>Items without original packaging or tags.</li>
              </ul>
            </section>

            <section className="bg-gray-900 text-white p-10 rounded-3xl">
              <h3 className="text-xl font-black uppercase tracking-tight mb-4 text-[#A855F7]">Exchanges</h3>
              <p className="text-gray-400 font-medium leading-relaxed">
                Need a different size? We offer one free exchange per order. Simply follow the return process and specify the new size you'd like. We'll ship the replacement as soon as we receive your return.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
