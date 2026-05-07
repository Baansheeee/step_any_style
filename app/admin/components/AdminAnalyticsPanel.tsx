'use client';

import { useEffect, useState } from 'react';

interface AnalyticsSummary {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  grossRevenue: number;
  totalDiscounts: number;
  grossProfit: number;
  totalCommission: number;
  netRevenue: number;
  ordersToday: number;
  netProfitToday: number;
}

interface InfluencerStat {
  influencerId: string;
  name: string;
  email: string;
  promoCodes: string[];
  totalSales: number;
  grossSales: number;
  totalCommission: number;
}

interface AnalyticsPayload {
  summary: AnalyticsSummary;
  influencers: InfluencerStat[];
}

const currencyFormatter = new Intl.NumberFormat('en-PK', {
  style: 'currency',
  currency: 'PKR',
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('en-US');

export default function AdminAnalyticsPanel() {
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/admin/analytics', { cache: 'no-store' });
        const payload = await response.json();
        if (!response.ok || !payload.data) {
          throw new Error(payload.error || 'Failed to load analytics.');
        }
        setData(payload.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics.');
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (isLoading) {
    return <p className="text-gray-500">Loading analytics...</p>;
  }

  if (error) {
    return <p className="text-red-600 text-sm">{error}</p>;
  }

  if (!data) {
    return <p className="text-gray-500">Analytics data is not available.</p>;
  }

  const { summary, influencers } = data;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnalyticsStatCard title="Total Sales (Delivered)" value={numberFormatter.format(summary.completedOrders)} />
        <AnalyticsStatCard title="Pending Orders" value={numberFormatter.format(summary.pendingOrders)} />
        <AnalyticsStatCard title="Orders Today" value={numberFormatter.format(summary.ordersToday)} />
        <AnalyticsStatCard title="Gross Revenue" value={currencyFormatter.format(summary.grossRevenue)} />
        <AnalyticsStatCard title="Gross Profit" value={currencyFormatter.format(summary.grossProfit)} />
        <AnalyticsStatCard title="Net Revenue" value={currencyFormatter.format(summary.netRevenue)} />
        <AnalyticsStatCard title="Discounts Given" value={currencyFormatter.format(summary.totalDiscounts)} />
        <AnalyticsStatCard title="Influencer Commissions" value={currencyFormatter.format(summary.totalCommission)} />
        <AnalyticsStatCard title="Net Profit Today" value={currencyFormatter.format(summary.netProfitToday)} />
      </div>

      <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Influencer Commissions</h3>
            <p className="text-sm text-gray-500">
              Overview of all influencer-driven sales, promo codes, and commission owed.
            </p>
          </div>
          <span className="text-sm font-semibold text-gray-500">{influencers.length} influencers</span>
        </div>

        {influencers.length === 0 ? (
          <p className="text-sm text-gray-500">No influencer-driven sales yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Influencer</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Promo Codes</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Sales</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Gross Sales</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Commission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {influencers.map((influencer) => (
                  <tr key={influencer.influencerId}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{influencer.name}</p>
                      <p className="text-xs text-gray-500">{influencer.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {influencer.promoCodes.length > 0 ? influencer.promoCodes.join(', ') : '—'}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {numberFormatter.format(influencer.totalSales)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {currencyFormatter.format(influencer.grossSales)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {currencyFormatter.format(influencer.totalCommission)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function AnalyticsStatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}


