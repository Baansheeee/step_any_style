/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState } from 'react';
import Navbar from '@/app/components/Navbar';

export default function AffiliateProgramPage() {
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationData, setApplicationData] = useState({
    email: '',
    channelLink1: '',
    channelLink2: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: 'idle', message: '' });

    try {
      const response = await fetch('/api/affiliate/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicationData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      setSubmitStatus({ type: 'success', message: 'Application submitted successfully! Check your email for login credentials.' });
      setApplicationData({ email: '', channelLink1: '', channelLink2: '' });
      setShowApplicationForm(false);
    } catch (error) {
      setSubmitStatus({ type: 'error', message: error instanceof Error ? error.message : 'Failed to submit application' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <Navbar />

      {/* ═══════════════════════════════════════════════════════ */}
      {/*                     HERO SECTION                       */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-[#A855F7]/10" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#A855F7]/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#6B21A8]/20 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3" />

        <div className="relative max-w-[1600px] mx-auto px-6 md:px-20 py-20 md:py-32">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-[2px] w-12 bg-[#A855F7]" />
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-[#A855F7]">
                Partner Program
              </span>
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] text-white mb-6">
              Earn With<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] to-[#E9D5FF]">
                Step & Styl
              </span>
            </h1>
            <p className="text-gray-400 text-sm md:text-lg font-medium leading-relaxed max-w-xl mb-10">
              Your Official Guide to Earning with Pakistan's #1 Premium Footwear Store.
              Turn your audience into a steady income source.
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              {!showApplicationForm && (
                <button
                  onClick={() => setShowApplicationForm(true)}
                  className="bg-[#E9D5FF] text-[#6B21A8] px-12 py-4 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-[#6B21A8] hover:text-white transition-all duration-300 shadow-xl"
                >
                  Apply Now
                </button>
              )}
              <div className="flex flex-col justify-center">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/50 mb-0.5">Up To</p>
                <p className="text-2xl md:text-3xl font-black text-[#A855F7] leading-none">18% Commission</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Application Form Modal */}
      {showApplicationForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 md:p-10 max-h-[90vh] overflow-y-auto border border-[#F5F3FF]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#A855F7] mb-1">Step & Styl</p>
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Apply for Affiliate</h2>
              </div>
              <button
                onClick={() => {
                  setShowApplicationForm(false);
                  setSubmitStatus({ type: 'idle', message: '' });
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#FAF9FF] text-gray-400 hover:text-gray-900 hover:bg-[#F5F3FF] transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {submitStatus.type !== 'idle' && (
              <div className={`mb-6 p-4 rounded-2xl text-sm font-bold ${submitStatus.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-100'
                : 'bg-red-50 text-red-800 border border-red-100'
                }`}>
                {submitStatus.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={applicationData.email}
                  onChange={(e) => setApplicationData({ ...applicationData, email: e.target.value })}
                  className="w-full px-5 py-3.5 border-2 border-[#F5F3FF] rounded-xl focus:ring-2 focus:ring-[#A855F7]/30 focus:border-[#A855F7] focus:outline-none text-gray-900 placeholder:text-gray-300 transition-all hover:border-[#E9D5FF] text-sm"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">
                  Channel Link 1 (Mandatory) <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={applicationData.channelLink1}
                  onChange={(e) => setApplicationData({ ...applicationData, channelLink1: e.target.value })}
                  className="w-full px-5 py-3.5 border-2 border-[#F5F3FF] rounded-xl focus:ring-2 focus:ring-[#A855F7]/30 focus:border-[#A855F7] focus:outline-none text-gray-900 placeholder:text-gray-300 transition-all hover:border-[#E9D5FF] text-sm"
                  placeholder="https://instagram.com/yourhandle"
                />
                <p className="text-[10px] text-gray-400 mt-2 font-medium uppercase tracking-widest">Instagram, TikTok, YouTube, or other channel</p>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">
                  Channel Link 2 (Optional)
                </label>
                <input
                  type="url"
                  value={applicationData.channelLink2}
                  onChange={(e) => setApplicationData({ ...applicationData, channelLink2: e.target.value })}
                  className="w-full px-5 py-3.5 border-2 border-[#F5F3FF] rounded-xl focus:ring-2 focus:ring-[#A855F7]/30 focus:border-[#A855F7] focus:outline-none text-gray-900 placeholder:text-gray-300 transition-all hover:border-[#E9D5FF] text-sm"
                  placeholder="https://youtube.com/@yourchannel"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#6B21A8] text-white px-8 py-4 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-black transition-all shadow-xl disabled:opacity-60 rounded-xl"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowApplicationForm(false);
                    setSubmitStatus({ type: 'idle', message: '' });
                  }}
                  className="px-8 py-4 border-2 border-[#F5F3FF] text-[11px] font-black uppercase tracking-[0.3em] text-gray-500 hover:bg-[#FAF9FF] hover:border-[#E9D5FF] transition-all rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/*                    MAIN CONTENT                        */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-20">

        {/* Welcome Section */}
        <section className="py-16 md:py-24 border-b border-[#F5F3FF] mx-auto">
          <div className="max-w-3xl">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#A855F7] mb-4">Welcome to the Family</p>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 uppercase tracking-tighter leading-[0.95] mb-8">
              We Are Excited<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] to-[#6B21A8]">To Have You</span>
            </h2>
            <p className="text-gray-500 text-sm md:text-lg font-medium leading-relaxed max-w-2xl">
              This program is designed to help you earn easily by promoting high-quality footwear and accessories in Pakistan.
              Whether you are an influencer, content creator, fashion expert, or just someone who loves sharing good products — this affiliate program can help you turn your audience into a steady income source.
            </p>
          </div>
        </section>

        {/* ─── SECTION 1 — Program Overview ─── */}
        <section className="py-16 md:py-24 border-b border-[#F5F3FF]">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-[2px] w-8 bg-[#A855F7]" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#A855F7]">Section 01</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-gray-900 uppercase tracking-tighter mb-12">
            Program Overview
          </h2>

          <p className="text-gray-500 text-sm md:text-base font-medium leading-relaxed max-w-2xl mb-10">
            Our affiliate program allows you to earn commission for every verified sale you refer using your unique affiliate link or discount coupon.
          </p>

          {/* Commission Table */}
          <div className="overflow-hidden rounded-2xl border border-[#F5F3FF] shadow-sm mb-10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF9FF]">
                  <th className="px-6 md:px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#A855F7]">Tier</th>
                  <th className="px-6 md:px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#A855F7]">Commission</th>
                  <th className="px-6 md:px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#A855F7]">For Whom</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F3FF]">
                <tr className="hover:bg-[#FAF9FF]/50 transition-colors">
                  <td className="px-6 md:px-8 py-5 text-sm font-bold text-gray-900 uppercase tracking-tight">Standard Affiliate</td>
                  <td className="px-6 md:px-8 py-5 text-sm font-black text-[#A855F7]">10% per sale</td>
                  <td className="px-6 md:px-8 py-5 text-sm text-gray-500 font-medium">All new affiliates</td>
                </tr>
                <tr className="hover:bg-[#FAF9FF]/50 transition-colors">
                  <td className="px-6 md:px-8 py-5 text-sm font-bold text-gray-900 uppercase tracking-tight">Content Creators</td>
                  <td className="px-6 md:px-8 py-5 text-sm font-black text-[#A855F7]">12–15%</td>
                  <td className="px-6 md:px-8 py-5 text-sm text-gray-500 font-medium">Influencers, fashion pages, TikTok reviewers</td>
                </tr>
                <tr className="hover:bg-[#FAF9FF]/50 transition-colors">
                  <td className="px-6 md:px-8 py-5 text-sm font-bold text-gray-900 uppercase tracking-tight">Salon & Bulk Partners</td>
                  <td className="px-6 md:px-8 py-5 text-sm font-black text-[#A855F7]">15–18%</td>
                  <td className="px-6 md:px-8 py-5 text-sm text-gray-500 font-medium">High-volume partners</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: 'Cookie Duration', value: '30 Days' },
              { label: 'Payment Frequency', value: 'Monthly' },
              { label: 'Minimum Payout', value: 'PKR 3,000' },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#FAF9FF] p-6 md:p-8 rounded-2xl border border-[#F5F3FF] hover:border-[#E9D5FF] transition-all group">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#A855F7] mb-2">{stat.label}</p>
                <p className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">{stat.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── SECTION 2 — How You Earn ─── */}
        <section className="py-16 md:py-24 border-b border-[#F5F3FF]">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-[2px] w-8 bg-[#A855F7]" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#A855F7]">Section 02</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-gray-900 uppercase tracking-tighter mb-12">
            How You Earn
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                step: '01',
                title: 'Link & Coupon',
                description: 'You will receive:',
                items: ['A unique affiliate link', 'A personal coupon code (e.g. BEAUTYBYASMA10)'],
              },
              {
                step: '02',
                title: 'Share',
                description: 'Promote your link or coupon on:',
                items: ['Instagram Stories', 'TikTok Reviews', 'Facebook', 'YouTube', 'WhatsApp Broadcast', 'Blog or Website'],
              },
              {
                step: '03',
                title: 'Customer Buys',
                description: 'When someone purchases using your link or coupon, you earn commission.',
                items: [],
              },
              {
                step: '04',
                title: 'Monthly Payout',
                description: 'Your earnings are paid every month through:',
                items: ['JazzCash', 'Easypaisa', 'Bank Transfer', 'Payoneer'],
              },
            ].map((card) => (
              <div key={card.step} className="bg-[#FAF9FF] p-8 md:p-10 rounded-2xl border border-[#F5F3FF] hover:border-[#E9D5FF] hover:shadow-lg hover:shadow-purple-100/50 transition-all group">
                <div className="flex items-center gap-4 mb-5">
                  <span className="text-3xl md:text-4xl font-black text-[#E9D5FF] tracking-tighter">
                    {card.step}
                  </span>
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#A855F7]">{card.title}</h3>
                </div>
                <p className="text-gray-500 text-sm font-medium mb-3">{card.description}</p>
                {card.items.length > 0 && (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {card.items.map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-[#A855F7] rounded-full shrink-0" />
                        <span className="text-gray-600 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ─── SECTION 3 — What You Get ─── */}
        <section className="py-16 md:py-24 border-b border-[#F5F3FF]">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-[2px] w-8 bg-[#A855F7]" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#A855F7]">Section 03</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-gray-900 uppercase tracking-tighter mb-12">
            What You Get
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '📊',
                title: 'Personal Dashboard',
                description: 'Track clicks, sales, payouts, and coupon performance in real-time.',
              },
              {
                icon: '🎨',
                title: 'Marketing Material Pack',
                description: 'Before/After pictures, product images, video clips, captions, hashtags, and more.',
              },
              {
                icon: '🎓',
                title: 'Creator Guidance',
                description: 'Weekly tips on viral videos, posting schedules, and best performing content.',
              },
            ].map((item) => (
              <div key={item.title} className="bg-[#FAF9FF] p-8 md:p-10 rounded-2xl border border-[#F5F3FF] hover:border-[#E9D5FF] hover:shadow-lg hover:shadow-purple-100/50 transition-all group">
                <div className="text-3xl mb-5">{item.icon}</div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 text-sm font-medium leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── SECTION 4 — Content Guidelines ─── */}
        <section className="py-16 md:py-24 border-b border-[#F5F3FF]">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-[2px] w-8 bg-[#A855F7]" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#A855F7]">Section 04</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-gray-900 uppercase tracking-tighter mb-12">
            Content Guidelines
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#FAF9FF] p-8 md:p-10 rounded-2xl border border-[#F5F3FF]">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#A855F7] mb-6">Content That Converts</h3>
              <div className="space-y-3">
                {[
                  'Unboxing videos',
                  'Before/After comparison',
                  'Footwear unboxing and styling',
                  '"Honest review" videos',
                  '15–30 second TikTok-style clips',
                  'Instagram Reel explaining benefits',
                  'WhatsApp testimonials & broadcasts',
                  'Carousel posts about "Footwear Trends"',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-[#A855F7] rounded-full shrink-0" />
                    <span className="text-gray-600 text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#FAF9FF] p-8 md:p-10 rounded-2xl border border-[#F5F3FF]">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#A855F7] mb-6">Good Content Rules</h3>
              <div className="space-y-3">
                {[
                  'Clean background',
                  'Real result-oriented videos',
                  'Clear demonstration',
                  'Speak naturally',
                  'Add subtitles for better engagement',
                  'Use our recommended hashtags',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <span className="w-5 h-5 bg-[#E9D5FF] rounded-full flex items-center justify-center shrink-0">
                      <span className="text-[#6B21A8] text-[10px] font-black">✓</span>
                    </span>
                    <span className="text-gray-600 text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── SECTION 5 — Program Rules ─── */}
        <section className="py-16 md:py-24 border-b border-[#F5F3FF]">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-[2px] w-8 bg-[#A855F7]" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#A855F7]">Section 05</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-gray-900 uppercase tracking-tighter mb-4">
            Program Rules
          </h2>
          <p className="text-gray-500 text-sm font-medium mb-12 max-w-xl">These rules protect your earnings and maintain program quality.</p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Not Allowed */}
            <div className="bg-red-50/50 p-8 md:p-10 rounded-2xl border border-red-100/60">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-sm font-black">✕</span>
                </span>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Not Allowed</h3>
              </div>
              <div className="space-y-3">
                {[
                  'Fake or self-orders',
                  'Misleading claims (e.g. "permanent in 1 use")',
                  'Running paid Google ads on Step & Styl brand keywords',
                  'Using copyrighted images not provided by us',
                  'Using abusive, false or medical claims',
                  'Creating multiple accounts',
                  'Sharing private customer data',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="w-1 h-1 bg-red-400 rounded-full shrink-0 mt-2" />
                    <span className="text-gray-600 text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Allowed */}
            <div className="bg-green-50/50 p-8 md:p-10 rounded-2xl border border-green-100/60">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm font-black">✓</span>
                </span>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-green-600">Allowed</h3>
              </div>
              <div className="space-y-3">
                {[
                  'Posting on social media platforms',
                  'Using WhatsApp broadcasts/lists',
                  'Making review videos',
                  'Creating tutorials',
                  'Adding your coupon to your stories',
                  'Promoting through friends/family (not self-purchase)',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="w-1 h-1 bg-green-400 rounded-full shrink-0 mt-2" />
                    <span className="text-gray-600 text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── SECTION 6 — Payout Policy ─── */}
        <section className="py-16 md:py-24 border-b border-[#F5F3FF]">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-[2px] w-8 bg-[#A855F7]" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#A855F7]">Section 06</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-gray-900 uppercase tracking-tighter mb-12">
            Payout Policy
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[#FAF9FF] p-8 md:p-10 rounded-2xl border border-[#F5F3FF] hover:border-[#E9D5FF] transition-all">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#A855F7] mb-5">Payout Methods</h3>
              <p className="text-gray-500 text-sm font-medium mb-4">Choose any:</p>
              <div className="space-y-2">
                {['Bank Transfer', 'JazzCash', 'Easypaisa', 'Payoneer'].map((method) => (
                  <div key={method} className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-[#A855F7] rounded-full shrink-0" />
                    <span className="text-gray-700 text-sm font-medium">{method}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#FAF9FF] p-8 md:p-10 rounded-2xl border border-[#F5F3FF] hover:border-[#E9D5FF] transition-all">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#A855F7] mb-5">Payout Cycle</h3>
              <div className="space-y-3">
                {[
                  'Payment is issued on the 10th of every month',
                  'Minimum payout = Rs 3,000',
                  'Payments for refunded or cancelled orders are reversed',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="w-5 h-5 bg-[#E9D5FF] rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[#6B21A8] text-[10px] font-black">✓</span>
                    </span>
                    <span className="text-gray-600 text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#FAF9FF] p-8 md:p-10 rounded-2xl border border-[#F5F3FF] hover:border-[#E9D5FF] transition-all">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#A855F7] mb-5">Reporting</h3>
              <p className="text-gray-500 text-sm font-medium mb-4">Your dashboard will show:</p>
              <div className="space-y-2">
                {['Approved earnings', 'Pending earnings', 'Completed payouts', 'Sale-by-sale breakdown'].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-[#A855F7] rounded-full shrink-0" />
                    <span className="text-gray-600 text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── SECTION 7 — Support & Community ─── */}
        <section className="py-16 md:py-24 border-b border-[#F5F3FF]">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-[2px] w-8 bg-[#A855F7]" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#A855F7]">Section 07</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-gray-900 uppercase tracking-tighter mb-12">
            Support & Community
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#FAF9FF] p-8 md:p-10 rounded-2xl border border-[#F5F3FF]">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#A855F7] mb-6">You Will Receive</h3>
              <div className="space-y-3">
                {[
                  '24/7 WhatsApp support',
                  'Tips to improve your earnings',
                  'Updates on best-performing posts',
                  'New content material',
                  'Opportunities to test new products',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <span className="w-5 h-5 bg-[#E9D5FF] rounded-full flex items-center justify-center shrink-0">
                      <span className="text-[#6B21A8] text-[10px] font-black">✓</span>
                    </span>
                    <span className="text-gray-600 text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#FAF9FF] p-8 md:p-10 rounded-2xl border border-[#F5F3FF]">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#A855F7] mb-6">We Also Run</h3>
              <div className="space-y-3">
                {[
                  'Monthly leaderboards',
                  'Top Affiliate of the Month Award',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <span className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-yellow-600 text-[10px] font-black">★</span>
                    </span>
                    <span className="text-gray-600 text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-600">Winner Gets</p>
                <p className="text-sm text-gray-700 font-medium mt-1">A FREE pair of shoes or bonus cash</p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── SECTION 8 — Tips To Win ─── */}
        <section className="py-16 md:py-24 border-b border-[#F5F3FF]">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-[2px] w-8 bg-[#A855F7]" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#A855F7]">Section 08</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-gray-900 uppercase tracking-tighter mb-12">
            Tips To Win
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              'Show your face in videos → converts 200% more',
              'Use your personal coupon in all stories',
              'Post consistently (3–4 reels/week)',
              'Show real before/after results',
              'Promote during peak days: Weekend nights, Salary days (1–5 of the month), Event sales (11.11, 12.12, Eid, Ramadan)',
              'Post on multiple platforms: Instagram, TikTok, WhatsApp, Facebook groups, Snapchat',
            ].map((tip) => (
              <div key={tip} className="flex items-start gap-4 bg-[#FAF9FF] p-5 rounded-xl border border-[#F5F3FF] hover:border-[#E9D5FF] transition-all">
                <span className="w-6 h-6 bg-[#E9D5FF] rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[#6B21A8] text-[10px] font-black">✓</span>
                </span>
                <p className="text-gray-600 text-sm font-medium">{tip}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
