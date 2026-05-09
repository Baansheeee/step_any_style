'use client';

import React from 'react';
import Navbar from '../components/Navbar';
import ScrollAnimate from '../components/ScrollAnimate';
import Image from 'next/image';

export default function SustainabilityPage() {
  const pillars = [
    { title: "Ethical Sourcing", desc: "We partner only with suppliers who adhere to fair labor practices and safe working environments." },
    { title: "Eco-Materials", desc: "We are increasing our use of recycled materials and vegan leathers to reduce our environmental footprint." },
    { title: "Zero Waste", desc: "Our packaging is 100% recyclable, and we are working towards a circular manufacturing process." }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollAnimate animation="fade-in" className="text-center mb-24">
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-gray-900 mb-8">
              Sustain<span className="text-green-600">ability</span>
            </h1>
            <p className="text-gray-500 font-medium uppercase tracking-[0.3em] text-sm max-w-2xl mx-auto leading-loose">Steps toward a greener future. Luxury that respects the planet.</p>
          </ScrollAnimate>

          <div className="relative h-[60vh] rounded-[3rem] overflow-hidden mb-32 group shadow-2xl">
            <Image 
              src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1500" 
              alt="Nature" 
              fill 
              className="object-cover transition-transform duration-[3s] group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-10 text-center">
              <ScrollAnimate animation="fade-in">
                <h2 className="text-white text-3xl md:text-5xl font-black uppercase tracking-tighter max-w-2xl">
                  "We don't inherit the earth from our ancestors, we borrow it from our children."
                </h2>
              </ScrollAnimate>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-32">
            {pillars.map((pillar, i) => (
              <ScrollAnimate key={i} animation="fade-in" delay={`${i * 0.1}s`} className="p-10 rounded-3xl border-2 border-gray-50 bg-[#FAF9FF] hover:border-green-200 transition-all">
                <h3 className="text-lg font-black uppercase tracking-tight text-gray-900 mb-4">{pillar.title}</h3>
                <p className="text-gray-600 font-medium leading-relaxed text-sm">{pillar.desc}</p>
              </ScrollAnimate>
            ))}
          </div>

          <div className="bg-green-50 rounded-[3rem] p-12 md:p-24 border border-green-100">
            <ScrollAnimate animation="fade-in" className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-black uppercase tracking-tight text-gray-900 leading-none mb-6">Our <br /> Commitment</h2>
                <p className="text-gray-700 font-medium leading-relaxed mb-6">
                  By 2028, Step & Style aims to be a carbon-neutral brand. Every purchase you make supports our initiative to plant trees and invest in renewable energy for our manufacturing units.
                </p>
                <div className="w-24 h-1 bg-green-600 rounded-full" />
              </div>
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl">
                 <Image 
                   src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=1000" 
                   alt="Green commitment" 
                   fill 
                   className="object-cover"
                 />
              </div>
            </ScrollAnimate>
          </div>
        </div>
      </main>
    </div>
  );
}
