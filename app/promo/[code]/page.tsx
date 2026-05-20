'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function PromoUserDashboard() {
  const params = useParams();
  const promoCode = params.code as string;
  const [activeTab, setActiveTab] = useState('overview');

  // TODO: Fetch promo user data from API
  // const { data: promoUser } = await fetch(`/api/promo-users/${promoCode}`);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="group flex items-center -ml-4 md:-ml-8 transition-transform hover:scale-105">
                <Image
                  src="/logo_main.png"
                  alt="Step & Style"
                  width={140}
                  height={45}
                  className="h-10 md:h-12 w-auto object-contain"
                />
                <div className="flex items-center -ml-4 md:-ml-6 mb-0.5 gap-1">
                  <span className="text-[10px] md:text-[13px] font-black uppercase tracking-[0.2em] text-gray-900">
                    Step
                  </span>
                  <span className="text-[12px] md:text-[15px] font-black uppercase tracking-[0.2em] text-yellow-600">
                    &
                  </span>
                  <span className="text-[10px] md:text-[13px] font-black uppercase tracking-[0.2em] text-gray-900">
                    Style
                  </span>
                </div>
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Promo User Dashboard
                </h1>
                <p className="text-sm text-gray-500">Promo Code: <span className="font-semibold text-purple-600">{promoCode}</span></p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-gray-600 hover:text-purple-600 font-medium transition-colors"
              >
                ← Back to Store
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'sales', label: 'My Sales' },
              { id: 'links', label: 'Promo Links' },
              { id: 'analytics', label: 'Analytics' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-100">
                  <p className="text-gray-600 text-sm mb-2">Total Sales</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    $0
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-100">
                  <p className="text-gray-600 text-sm mb-2">Total Orders</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    0
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-100">
                  <p className="text-gray-600 text-sm mb-2">My Commission</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    $0
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-100">
                  <p className="text-gray-600 text-sm mb-2">Conversion Rate</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    0%
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Promo Code</h3>
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Share this code with your customers:</p>
                      <p className="text-3xl font-bold text-purple-700">{promoCode}</p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(promoCode);
                        alert('Promo code copied to clipboard!');
                      }}
                      className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-purple-50 transition-all border-2 border-purple-200"
                    >
                      Copy Code
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sales' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">My Sales</h2>
              <div className="border border-gray-200 rounded-lg p-8 text-center">
                <p className="text-gray-500">No sales found.</p>
                <p className="text-sm text-gray-400 mt-2">Sales made with your promo code will appear here.</p>
              </div>
            </div>
          )}

          {activeTab === 'links' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Promo Links</h2>
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Store Link with Promo Code</h3>
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      readOnly
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/?promo=${promoCode}`}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white"
                    />
                    <button
                      onClick={() => {
                        const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/?promo=${promoCode}`;
                        navigator.clipboard.writeText(link);
                        alert('Link copied to clipboard!');
                      }}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
                    >
                      Copy Link
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Share this link to track sales from your promotions</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h2>
              <div className="border border-gray-200 rounded-lg p-8 text-center">
                <p className="text-gray-500">Analytics dashboard coming soon.</p>
                <p className="text-sm text-gray-400 mt-2">Track your performance metrics here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


