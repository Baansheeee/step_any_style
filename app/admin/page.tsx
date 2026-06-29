'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PromoUsersManagement from './components/PromoUsersManagement';
import AdminOrdersPanel from './components/AdminOrdersPanel';
import AdminAnalyticsPanel from './components/AdminAnalyticsPanel';
import AffiliateApplicationsPanel from './components/AffiliateApplicationsPanel';
import AdminProductsPanel from './components/AdminProductsPanel';
import AdminCollectionsPanel from './components/AdminCollectionsPanel';
import AdminShippingPanel from './components/AdminShippingPanel';
import AdminSalePanel from './components/AdminSalePanel';
import AdminBannerPanel from './components/AdminBannerPanel';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleVideoPlay = () => {
    if (audioRef.current && videoRef.current) {
      audioRef.current.currentTime = videoRef.current.currentTime;
      audioRef.current.play().catch(e => console.warn('Audio play blocked:', e));
    }
  };

  const handleVideoPause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const handleVideoSeeked = () => {
    if (audioRef.current && videoRef.current) {
      audioRef.current.currentTime = videoRef.current.currentTime;
    }
  };

  const handleVideoVolumeChange = () => {
    if (audioRef.current && videoRef.current) {
      audioRef.current.volume = videoRef.current.volume;
      audioRef.current.muted = videoRef.current.muted;
    }
  };
  const [productsCount, setProductsCount] = useState(0);
  const [overviewStats, setOverviewStats] = useState({
    totalOrders: 0,
    approvedPayments: 0,
    totalRevenue: 0,
    pendingDelivery: 0,
    uniqueCustomers: 0,
  });
  const [isOverviewLoading, setIsOverviewLoading] = useState(true);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setIsLoggingOut(false);
      window.location.href = '/';
    }
  };

  useEffect(() => {
    const loadOverview = async () => {
      try {
        setIsOverviewLoading(true);
        const response = await fetch('/api/orders?scope=all', { cache: 'no-store' });
        const data = await response.json();
        if (!response.ok || !data.data) {
          throw new Error(data.error || 'Failed to load orders');
        }
        const orders = data.data as Array<{
          id: string;
          total: string | number;
          paymentStatus: string;
          status: string;
          shippingEmail: string;
        }>;
        const totalOrders = orders.length;
        const approvedPayments = orders.filter((order) => order.paymentStatus === 'APPROVED').length;
        const totalRevenue = orders
          .filter((order) => order.status === 'COMPLETED')
          .reduce((sum, order) => sum + Number(order.total ?? 0), 0);
        const pendingDelivery = orders.filter(
          (order) => order.status === 'PENDING' || order.status === 'SHIPPED',
        ).length;
        const uniqueCustomers = new Set(orders.map((order) => order.shippingEmail)).size;

        setOverviewStats({
          totalOrders,
          approvedPayments,
          totalRevenue,
          pendingDelivery,
          uniqueCustomers,
        });
      } catch (error) {
        console.warn('Failed to load overview stats', error);
      } finally {
        setIsOverviewLoading(false);
      }
    };

    loadOverview();
  }, []);

  useEffect(() => {
    const fetchProductCount = async () => {
      try {
        const response = await fetch('/api/products', { cache: 'no-store' });
        const data = await response.json();
        if (response.ok) {
          setProductsCount(data.count ?? data.data?.length ?? 0);
        }
      } catch (error) {
        console.warn('Failed to load product count', error);
      }
    };

    fetchProductCount();
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(value);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-[#A855F7] shadow-lg shadow-purple-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="group flex items-center -ml-4 md:-ml-8 transition-transform hover:scale-105">
                <Image
                  src="/logo_main.png"
                  alt="Step & Styl"
                  width={140}
                  height={45}
                  className="h-10 md:h-18 w-auto object-contain brightness-0 invert"
                />
              </Link>
              <h1 className="text-2xl font-black uppercase tracking-wide text-white/90 -ml-10">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsTutorialOpen(true)}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-sm font-semibold text-white hover:bg-white hover:text-[#A855F7] transition"
              >
                Tutorial
              </button>
              <Link
                href="/?preview=true"
                className="text-white/80 hover:text-white font-medium transition-colors"
              >
                ← Back to Store
              </Link>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-4 py-2 rounded-lg border border-white/20 text-sm font-semibold text-white hover:bg-white/10 transition disabled:opacity-60"
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
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
              { id: 'products', label: 'Products' },
              { id: 'collections', label: 'Collections' }, { id: 'shipping', label: 'Shipping' }, { id: 'orders', label: 'Orders' },
              { id: 'promo-users', label: 'Promo Users' },
              { id: 'affiliate-applications', label: 'Affiliate Applications' },
              { id: 'analytics', label: 'Analytics' },
              { id: 'sales', label: 'Sale Events' },
              { id: 'appearance', label: 'Appearance' },
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
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-100">
                  <p className="text-gray-600 text-sm mb-2">Total Products</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {productsCount}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-100">
                  <p className="text-gray-600 text-sm mb-2">Total Orders</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {isOverviewLoading ? '…' : overviewStats.totalOrders}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-100">
                  <p className="text-gray-600 text-sm mb-2">Approved Payments</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {isOverviewLoading ? '…' : overviewStats.approvedPayments}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-100">
                  <p className="text-gray-600 text-sm mb-2">Pending Deliveries</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {isOverviewLoading ? '…' : overviewStats.pendingDelivery}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <p className="text-gray-600 text-sm mb-2">Total Revenue (delivered)</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {isOverviewLoading ? '…' : formatCurrency(overviewStats.totalRevenue)}
                  </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <p className="text-gray-600 text-sm mb-2">Unique Customers</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {isOverviewLoading ? '…' : overviewStats.uniqueCustomers}
                  </p>
                </div>
              </div>
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <button
                    onClick={() => setActiveTab('products')}
                    className="bg-white border-2 border-purple-600 text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-all"
                  >
                    View Products
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="bg-white border-2 border-purple-600 text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-all"
                  >
                    View Orders
                  </button>
                  <button
                    onClick={() => setActiveTab('promo-users')}
                    className="bg-white border-2 border-purple-600 text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-all"
                  >
                    Manage Promo Users
                  </button>
                  <Link
                    href="/admin/blogs"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center"
                  >
                    Manage Blogs
                  </Link>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <AdminProductsPanel onProductsCountChange={setProductsCount} />
          )}

          {activeTab === 'collections' && (
            <AdminCollectionsPanel />
          )}

          {activeTab === 'shipping' && (
            <AdminShippingPanel />
          )}

          {activeTab === 'orders' && <AdminOrdersPanel />}

          {activeTab === 'promo-users' && (
            <PromoUsersManagement />
          )}

          {activeTab === 'affiliate-applications' && (
            <AffiliateApplicationsPanel />
          )}

          { activeTab === 'analytics' && <AdminAnalyticsPanel /> }

          { activeTab === 'sales' && <AdminSalePanel /> }

          { activeTab === 'appearance' && <AdminBannerPanel /> }
        </div>

      </div>

      {/* Tutorial Video Modal */}
      {isTutorialOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl overflow-hidden max-w-5xl w-full shadow-2xl relative">
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Admin Dashboard Tutorial</h3>
              <button onClick={() => setIsTutorialOpen(false)} className="text-gray-500 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="aspect-video bg-black w-full relative">
              <video
                ref={videoRef}
                src="/Tutorial/video1699022999.mp4"
                controls
                muted
                autoPlay
                onPlay={handleVideoPlay}
                onPause={handleVideoPause}
                onSeeked={handleVideoSeeked}
                onVolumeChange={handleVideoVolumeChange}
                className="w-full h-full object-contain"
              />
              <audio
                ref={audioRef}
                src="/Tutorial/audio1699022999.m4a"
                muted
                autoPlay
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
