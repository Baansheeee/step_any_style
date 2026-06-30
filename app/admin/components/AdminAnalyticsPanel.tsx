'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TrafficData {
  activeUsers: string;
  weeklyUsers: string;
  weeklyPageViews: string;
  chartData?: { date: string; users: number; views: number }[];
  status: string;
}

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
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null);
  const [trafficDays, setTrafficDays] = useState(7);
  const [isLoading, setIsLoading] = useState(true);
  const [isTrafficLoading, setIsTrafficLoading] = useState(true);
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

  useEffect(() => {
    const loadTraffic = async () => {
      try {
        setIsTrafficLoading(true);
        const response = await fetch(`/api/admin/analytics/traffic?days=${trafficDays}`, { cache: 'no-store' });
        const payload = await response.json();
        setTrafficData(payload);
      } catch (err) {
        console.error('Failed to load traffic:', err);
      } finally {
        setIsTrafficLoading(false);
      }
    };

    loadTraffic();
  }, [trafficDays]);

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
      {trafficData && (
        <section className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-2xl p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-purple-900">Live Website Traffic</h3>
              <p className="text-sm text-purple-700/80">
                Data provided by Google Analytics 4
              </p>
            </div>
            <div className="flex items-center gap-4">
              <select 
                value={trafficDays}
                onChange={(e) => setTrafficDays(Number(e.target.value))}
                className="bg-white border border-purple-200 text-purple-800 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block px-2.5 py-1.5 font-medium shadow-sm outline-none cursor-pointer"
              >
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 14 days</option>
                <option value={28}>Last 28 days</option>
                <option value={90}>Last 90 days</option>
              </select>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${trafficData.status === 'Connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                <span className="text-sm font-semibold text-purple-800">{trafficData.status}</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-white shadow-sm flex flex-col justify-center h-[140px]">
                <p className="text-xs text-purple-600 mb-2 font-bold uppercase tracking-wider">Active Users (Last 30m)</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-5xl font-black text-purple-900">{isTrafficLoading ? '...' : trafficData.activeUsers}</p>
                  <span className="text-sm font-semibold text-purple-700">online now</span>
                </div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-white shadow-sm flex flex-col justify-center h-[140px]">
                <p className="text-xs text-purple-600 mb-2 font-bold uppercase tracking-wider">Total Users (Last {trafficDays} Days)</p>
                <p className="text-4xl font-black text-purple-900">{isTrafficLoading ? '...' : trafficData.weeklyUsers}</p>
              </div>
            </div>
            
            <div className="lg:col-span-3 bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-white shadow-sm">
              <p className="text-xs text-purple-600 mb-4 font-bold uppercase tracking-wider">Traffic Over Time (Last {trafficDays} Days)</p>
              <div className="h-[250px] w-full">
                {isTrafficLoading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-purple-400 font-semibold animate-pulse">Loading chart data...</p>
                  </div>
                ) : trafficData.chartData && trafficData.chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trafficData.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9d5ff" opacity={0.5} />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#7e22ce' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#7e22ce' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="views" name="Page Views" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                      <Area type="monotone" dataKey="users" name="Users" stroke="#9333ea" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-purple-400 font-semibold">No data available for the last 7 days.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

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


