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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Apply Button */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div className="flex-1">
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-4 uppercase tracking-tighter">
              Affiliate <span className="text-[#A855F7]">Program</span>
            </h1>
            <p className="text-[12px] font-black uppercase tracking-[0.2em] text-gray-500 italic">
              Your Official Guide to Earning with Pakistan's #1 Premium Footwear Store
            </p>
          </div>
          {!showApplicationForm && (
            <button
              onClick={() => setShowApplicationForm(true)}
              className="bg-[#E9D5FF] text-[#6B21A8] px-12 py-4 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-[#6B21A8] hover:text-white transition-all shadow-xl"
            >
              Apply Now
            </button>
          )}
        </div>

        {/* Application Form Modal */}
        {showApplicationForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Apply for Affiliate Program</h2>
                <button
                  onClick={() => {
                    setShowApplicationForm(false);
                    setSubmitStatus({ type: 'idle', message: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {submitStatus.type !== 'idle' && (
                <div className={`mb-6 p-4 rounded-lg ${
                  submitStatus.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                  {submitStatus.message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={applicationData.email}
                    onChange={(e) => setApplicationData({ ...applicationData, email: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none text-gray-900 placeholder:text-gray-400 transition-all hover:border-gray-300"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Channel Link 1 (Mandatory) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={applicationData.channelLink1}
                    onChange={(e) => setApplicationData({ ...applicationData, channelLink1: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none text-gray-900 placeholder:text-gray-400 transition-all hover:border-gray-300"
                    placeholder="https://instagram.com/yourhandle"
                  />
                  <p className="text-xs text-gray-600 mt-2">Link to your Instagram, TikTok, YouTube, or other social media channel</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Channel Link 2 (Optional)
                  </label>
                  <input
                    type="url"
                    value={applicationData.channelLink2}
                    onChange={(e) => setApplicationData({ ...applicationData, channelLink2: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none text-gray-900 placeholder:text-gray-400 transition-all hover:border-gray-300"
                    placeholder="https://youtube.com/@yourchannel"
                  />
                  <p className="text-xs text-gray-600 mt-2">Additional channel link (optional)</p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-[#6B21A8] text-white px-8 py-4 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-black transition-all shadow-xl disabled:opacity-60"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowApplicationForm(false);
                      setSubmitStatus({ type: 'idle', message: '' });
                    }}
                    className="px-8 py-4 border-2 border-gray-200 text-[11px] font-black uppercase tracking-[0.3em] text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <section className="bg-[#FAF9FF] rounded-3xl p-10 mb-12 border border-[#F5F3FF]">
          <h2 className="text-3xl font-black text-gray-900 mb-6 uppercase tracking-tight">Welcome to the Family</h2>
          <p className="text-lg text-gray-700 mb-4">
            We are excited to have you on board!
          </p>
          <p className="text-gray-600">
            This program is designed to help you earn easily by promoting high-quality footwear and accessories in Pakistan.
            Whether you are an influencer, content creator, fashion expert, or just someone who loves sharing good products — this affiliate program can help you turn your audience into a steady income source.
          </p>
        </section>

        {/* Program Overview */}
        <section className="bg-white rounded-3xl p-10 mb-12 border border-gray-50">
          <h2 className="text-2xl font-black text-gray-900 mb-8 uppercase tracking-tight">1. Program Overview</h2>
          <p className="text-gray-700 mb-6">
            Our affiliate program allows you to earn commission for every verified sale you refer using your unique affiliate link or discount coupon.
          </p>
          
          <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm mb-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-purple-50/50">
                  <th className="px-6 py-4 text-sm font-bold text-gray-900">Tier</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-900">Commission</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-900">For Whom</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-700 font-medium">Standard Affiliate</td>
                  <td className="px-6 py-4 text-sm font-bold text-purple-600">10% per sale</td>
                  <td className="px-6 py-4 text-sm text-gray-600">All new affiliates</td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-700 font-medium">Content Creators</td>
                  <td className="px-6 py-4 text-sm font-bold text-purple-600">12–15%</td>
                  <td className="px-6 py-4 text-sm text-gray-600">Influencers, fashion pages, TikTok reviewers</td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-700 font-medium">Salon & Bulk Partners</td>
                  <td className="px-6 py-4 text-sm font-bold text-purple-600">15–18%</td>
                  <td className="px-6 py-4 text-sm text-gray-600">High-volume partners</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <p className="font-semibold text-purple-900 mb-1">Cookie Duration</p>
              <p className="text-gray-700">30 days</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <p className="font-semibold text-purple-900 mb-1">Payment Frequency</p>
              <p className="text-gray-700">Monthly</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <p className="font-semibold text-purple-900 mb-1">Minimum Payout</p>
              <p className="text-gray-700">PKR 3,000</p>
            </div>
          </div>
        </section>

        {/* How You Earn */}
        <section className="bg-white rounded-3xl p-10 mb-12 border border-gray-50">
          <h2 className="text-2xl font-black text-gray-900 mb-8 uppercase tracking-tight">2. How You Earn</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#FAF9FF] p-8 rounded-2xl border border-[#F5F3FF]">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#A855F7] mb-4">Step 1 – Link & Coupon</h3>
              <p className="text-gray-700 mb-2">You will receive:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                <li>A unique affiliate link</li>
                <li>A personal coupon code (example: BEAUTYBYASMA10)</li>
              </ul>
            </div>

            <div className="bg-[#FAF9FF] p-8 rounded-2xl border border-[#F5F3FF]">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#A855F7] mb-4">Step 2 – Share</h3>
              <p className="text-gray-700 mb-2">Promote your link or coupon on:</p>
              <div className="grid grid-cols-2 gap-2 text-gray-600 text-sm">
                <div>• Instagram Stories</div>
                <div>• TikTok Reviews</div>
                <div>• Facebook</div>
                <div>• YouTube</div>
                <div>• WhatsApp Broadcast</div>
                <div>• Blog or Website</div>
              </div>
            </div>

            <div className="bg-[#FAF9FF] p-8 rounded-2xl border border-[#F5F3FF]">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#A855F7] mb-4">Step 3 – Customer Buys</h3>
              <p className="text-gray-700">
                When someone purchases using your link or coupon, you earn commission.
              </p>
            </div>

            <div className="bg-[#FAF9FF] p-8 rounded-2xl border border-[#F5F3FF]">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#A855F7] mb-4">Step 4 – Monthly Payout</h3>
              <p className="text-gray-700 mb-2">Your earnings are paid every month through:</p>
              <div className="grid grid-cols-2 gap-2 text-gray-600 text-sm">
                <div>• JazzCash</div>
                <div>• Easypaisa</div>
                <div>• Bank Transfer</div>
                <div>• Payoneer</div>
              </div>
            </div>
          </div>
        </section>

        {/* What You Get */}
        <section className="bg-white rounded-3xl p-10 mb-12 border border-gray-50">
          <h2 className="text-2xl font-black text-gray-900 mb-8 uppercase tracking-tight">3. What You Get</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-green-50 p-6 rounded-lg border border-green-100">
              <div className="text-green-600 text-3xl mb-3">✔</div>
              <h3 className="font-semibold text-gray-900 mb-2">Personal Dashboard</h3>
              <p className="text-gray-600 text-sm">Track clicks, sales, payouts, and coupon performance.</p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg border border-green-100">
              <div className="text-green-600 text-3xl mb-3">✔</div>
              <h3 className="font-semibold text-gray-900 mb-2">Marketing Material Pack</h3>
              <p className="text-gray-600 text-sm">Before/After pictures, product images, video clips, captions, hashtags, and more.</p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg border border-green-100">
              <div className="text-green-600 text-3xl mb-3">✔</div>
              <h3 className="font-semibold text-gray-900 mb-2">Creator Guidance</h3>
              <p className="text-gray-600 text-sm">Weekly tips on viral videos, posting schedules, and best performing content.</p>
            </div>
          </div>
        </section>

        {/* Content Guidelines */}
        <section className="bg-white rounded-3xl p-10 mb-12 border border-gray-50">
          <h2 className="text-2xl font-black text-gray-900 mb-8 uppercase tracking-tight">4. Content Guidelines</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold text-purple-600 mb-3">✔ Types of content that convert:</h3>
              <div className="grid grid-cols-1 gap-2 text-gray-700">
                <div>• Unboxing videos</div>
                <div>• Before/After comparison</div>
                <div>• Footwear unboxing and styling</div>
                <div>• "Honest review" videos</div>
                <div>• 15–30 second TikTok-style clips</div>
                <div>• Instagram Reel explaining benefits</div>
                <div>• WhatsApp testimonials & broadcasts</div>
                <div>• Carousel posts about "Footwear Trends"</div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-purple-600 mb-3">Good Content Rules:</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Clean background</li>
                <li>Real result-oriented videos</li>
                <li>Clear demonstration</li>
                <li>Speak naturally</li>
                <li>Add subtitles for better engagement</li>
                <li>Use our recommended hashtags</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Program Rules */}
        <section className="bg-white rounded-3xl p-10 mb-12 border border-gray-50">
          <h2 className="text-2xl font-black text-gray-900 mb-8 uppercase tracking-tight">5. Program Rules</h2>
          <p className="text-gray-700 mb-6">These rules protect your earnings and maintain program quality.</p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-red-50 p-6 rounded-lg border border-red-100">
              <h3 className="text-xl font-semibold text-red-600 mb-3">Not Allowed</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Fake or self-orders</li>
                <li>Misleading claims (e.g. "permanent in 1 use")</li>
                <li>Running paid Google ads on Step & Style brand keywords</li>
                <li>Using copyrighted images not provided by us</li>
                <li>Using abusive, false or medical claims</li>
                <li>Creating multiple accounts</li>
                <li>Sharing private customer data</li>
              </ul>
            </div>
            <div className="bg-green-50 p-6 rounded-lg border border-green-100">
              <h3 className="text-xl font-semibold text-green-600 mb-3">✔ Allowed</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Posting on social media platforms</li>
                <li>Using WhatsApp broadcasts/lists</li>
                <li>Making review videos</li>
                <li>Creating tutorials</li>
                <li>Adding your coupon to your stories</li>
                <li>Promoting through friends/family (as long as it's not self-purchase)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Payout Policy */}
        <section className="bg-white rounded-3xl p-10 mb-12 border border-gray-50">
          <h2 className="text-2xl font-black text-gray-900 mb-8 uppercase tracking-tight">6. Payout Policy</h2>
          
          <div className="space-y-6">
            <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
              <h3 className="text-xl font-semibold text-purple-600 mb-3">✔ Payout Methods</h3>
              <p className="text-gray-700 mb-2">Choose any:</p>
              <div className="grid md:grid-cols-2 gap-2 text-gray-600">
                <div>• Bank Transfer</div>
                <div>• JazzCash</div>
                <div>• Easypaisa</div>
                <div>• Payoneer</div>
              </div>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
              <h3 className="text-xl font-semibold text-purple-600 mb-3">✔ Payout Cycle</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Payment is issued on the 10th of every month</li>
                <li>Minimum payout = Rs 3,000</li>
                <li>Payments for refunded or cancelled orders are reversed</li>
              </ul>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
              <h3 className="text-xl font-semibold text-purple-600 mb-3">✔ Reporting</h3>
              <p className="text-gray-700 mb-2">Your dashboard will show:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                <li>Approved earnings</li>
                <li>Pending earnings</li>
                <li>Completed payouts</li>
                <li>Sale-by-sale breakdown</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Support & Community */}
        <section className="bg-white rounded-3xl p-10 mb-12 border border-gray-50">
          <h2 className="text-2xl font-black text-gray-900 mb-8 uppercase tracking-tight">7. Support & Community</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
              <h3 className="text-xl font-semibold text-blue-600 mb-3">You will receive:</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>24/7 WhatsApp support</li>
                <li>Tips to improve your earnings</li>
                <li>Updates on best-performing posts</li>
                <li>New content material</li>
                <li>Opportunities to test new products</li>
              </ul>
            </div>
            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-100">
              <h3 className="text-xl font-semibold text-yellow-600 mb-3">We also run:</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Monthly leaderboards</li>
                <li>Top Affiliate of the Month Award</li>
                <li className="text-sm text-gray-600 mt-2">(Winner gets a FREE pair of shoes or bonus cash)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Tips to Increase Earnings */}
        <section className="bg-white rounded-3xl p-10 mb-12 border border-gray-50">
          <h2 className="text-2xl font-black text-gray-900 mb-8 uppercase tracking-tight">8. Tips To Win</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <span className="text-green-600 text-xl mr-3 mt-1">✔</span>
              <p className="text-gray-700">Show your face in videos → converts 200% more</p>
            </div>
            <div className="flex items-start">
              <span className="text-green-600 text-xl mr-3 mt-1">✔</span>
              <p className="text-gray-700">Use your personal coupon in all stories</p>
            </div>
            <div className="flex items-start">
              <span className="text-green-600 text-xl mr-3 mt-1">✔</span>
              <p className="text-gray-700">Post consistently (3–4 reels/week)</p>
            </div>
            <div className="flex items-start">
              <span className="text-green-600 text-xl mr-3 mt-1">✔</span>
              <p className="text-gray-700">Show real before/after results</p>
            </div>
            <div className="flex items-start">
              <span className="text-green-600 text-xl mr-3 mt-1">✔</span>
              <p className="text-gray-700">Promote during peak days: Weekend nights, Salary days (1–5 of the month), Event sales (11.11, 12.12, Eid, Ramadan)</p>
            </div>
            <div className="flex items-start">
              <span className="text-green-600 text-xl mr-3 mt-1">✔</span>
              <p className="text-gray-700">Post on multiple platforms: Instagram, TikTok, WhatsApp, Facebook groups, Snapchat</p>
            </div>
          </div>
        </section>

        {/* Contact & Support */}
        <section className="bg-gray-900 rounded-[3rem] p-12 md:p-20 text-center text-white">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-10 leading-none">Contact <span className="text-[#A855F7]">& Support</span></h2>
          
          <p className="mb-4 text-lg">For any questions or help:</p>
          <div className="bg-white/5 border border-white/10 backdrop-blur-sm p-10 rounded-3xl inline-block text-left">
            <p className="font-black text-lg uppercase tracking-[0.1em] mb-6 text-[#A855F7]">Affiliate Support – Step & Style</p>
            <div className="space-y-4 text-gray-400 font-medium uppercase tracking-widest text-xs">
              <p className="flex justify-between gap-20"><span>WhatsApp:</span> <span className="text-white">+92 333 4555282</span></p>
              <p className="flex justify-between gap-20"><span>Email:</span> <span className="text-white">stepnstyle007@gmail.com</span></p>
              <p className="flex justify-between gap-20"><span>Location:</span> <span className="text-white">Islamabad, Pakistan</span></p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
