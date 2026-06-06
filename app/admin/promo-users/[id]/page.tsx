'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function ViewPromoUserDashboard() {
  const params = useParams();
  const promoUserId = params.id as string;
  const [activeTab, setActiveTab] = useState('overview');

  // TODO: Fetch promo user data from API
  // const { data: promoUser } = await fetch(`/api/promo-users/${promoUserId}`);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="group flex items-center -ml-4 md:-ml-8 transition-transform hover:scale-105">
                <Image
                  src="/logo_main.png"
                  alt="Step & Styl"
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
                <p className="text-sm text-gray-500">Viewing: Promo User #{promoUserId}</p>
              </div>
            </div>
            <Link
              href="/admin"
              className="text-gray-600 hover:text-purple-600 font-medium transition-colors"
            >
              ← Back to Admin
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'sales', label: 'Sales' },
              { id: 'analytics', label: 'Analytics' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === tab.id
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
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Promo User Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                  <p className="text-gray-600 text-sm mb-2">Commission</p>
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

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="text-base font-medium text-gray-900">-</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-base font-medium text-gray-900">-</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Promo Code</p>
                    <p className="text-base font-medium text-purple-600">-</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="text-base font-medium text-gray-900">-</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sales' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Sales History</h2>
              <div className="border border-gray-200 rounded-lg p-8 text-center">
                <p className="text-gray-500">No sales found.</p>
                <p className="text-sm text-gray-400 mt-2">TODO: Connect to database and fetch sales data</p>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h2>
              <div className="border border-gray-200 rounded-lg p-8 text-center">
                <p className="text-gray-500">Analytics dashboard coming soon.</p>
                <p className="text-sm text-gray-400 mt-2">TODO: Implement analytics charts and reports</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


