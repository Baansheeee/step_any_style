'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface DashboardData {
  profile: {
    id: string;
    defaultPrefix: string;
    commissionRate: string;
    status: string;
    user: {
      name: string | null;
      email: string;
    };
  };
  metrics: {
    totalOrders: number;
    grossSales: number;
    totalDiscount: number;
    estimatedCommission: number;
    promoCodeCount: number;
  };
  promoCodes: Array<{
    id: string;
    code: string;
    discountPercent: number;
    validUntil: string;
    usageCount: number;
    totalGrossSales: string;
    totalDiscount: string;
    _count: {
      orders: number;
    };
  }>;
  orders: Array<{
    id: string;
    subtotal: string;
    discountAmount: string;
    total: string;
    status: string;
    createdAt: string;
    promoCode: {
      code: string;
    } | null;
  }>;
}

export default function InfluencerDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await fetch('/api/influencer/dashboard', { cache: 'no-store' });
        const payload = await response.json();
        if (!response.ok || !payload.success) {
          throw new Error(payload.error || 'Failed to load dashboard');
        }
        setData(payload);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading your dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 space-y-4">
        <p className="text-lg font-semibold text-red-500">{error || 'Dashboard unavailable'}</p>
        <Link href="/" className="text-purple-600 hover:text-purple-700 font-medium">
          ← Back to Store
        </Link>
      </div>
    );
  }

  const { profile, metrics, promoCodes, orders } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Influencer Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="group flex items-center -ml-4 md:-ml-8 transition-transform hover:scale-105">
                <Image
                  src="/main_logo.png"
                  alt="Step & Style"
                  width={140}
                  height={45}
                  className="h-10 md:h-18 w-auto object-contain"
                />
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent -ml-10 mb-1">
                Influencer Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-gray-600 hover:text-purple-600 font-medium transition-colors text-sm"
              >
                ← Back to Store
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 text-gray-700">
          <MetricCard label="Total Orders" value={metrics.totalOrders.toString()} />
          <MetricCard label="Gross Sales" value={`Rs. ${metrics.grossSales.toFixed(2)}`} />
          <MetricCard label="Discount Given" value={`Rs. ${metrics.totalDiscount.toFixed(2)}`} />
          <MetricCard
            label="Estimated Commission"
            value={`Rs. ${metrics.estimatedCommission.toFixed(2)}`}
            accent
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Promo Codes</h2>
                <p className="text-sm text-gray-500">Codes created for your referral campaigns</p>
              </div>
              <span className="text-sm font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                {metrics.promoCodeCount} Codes
              </span>
            </div>

            {promoCodes.length === 0 ? (
              <p className="text-gray-500 text-sm">No promo codes assigned yet.</p>
            ) : (
              <div className="space-y-4">
                {promoCodes.map((code) => (
                  <div key={code.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-mono text-lg font-semibold text-purple-700">{code.code}</p>
                        <p className="text-sm text-gray-500">
                          Discount: {code.discountPercent}% • Uses: {code._count.orders}
                        </p>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <p>Valid until {new Date(code.validUntil).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
                <p className="text-sm text-gray-500">Latest 20 orders using your codes</p>
              </div>
            </div>

            {orders.length === 0 ? (
              <p className="text-gray-500 text-sm">No orders yet.</p>
            ) : (
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                {orders.map((order) => (
                  <div key={order.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleString()} • Code {order.promoCode?.code ?? '-'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">Rs. {Number(order.total).toFixed(2)}</p>
                        <p className="text-xs text-gray-500">Discount Rs. {Number(order.discountAmount).toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function MetricCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        accent ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent' : 'bg-white border-gray-100'
      }`}
    >
      <p className={`text-sm ${accent ? 'text-white/80' : 'text-gray-500'}`}>{label}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}




