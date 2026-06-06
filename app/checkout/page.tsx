'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/app/context/CartContext';
import AccountModal, { AuthUser, AuthMode } from '@/app/components/AccountModal';
import { formatPKR } from '@/lib/currency';
import Link from 'next/link';
import Image from 'next/image';

type PaymentMethod = 'cod';

interface PromoCodeData {
  id: string;
  code: string;
  discountPercent: number;
}


interface ShippingRegion {
  id: string;
  name: string;
  shippingCost: number;
  cities: ShippingCity[];
}

interface ShippingCity {
  id: string;
  name: string;
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Mini Header */}
      <header className="border-b border-gray-100 py-3 md:py-4 px-4 md:px-10 flex justify-between items-center bg-white sticky top-0 z-[100]">
        <Link href="/" className="group flex items-center -ml-4 md:-ml-8 transition-transform hover:scale-105">
          <Image
            src="/logo_main.png"
            alt="Step & Styl"
            width={180}
            height={60}
            className="h-12 md:h-16 w-auto object-contain"
          />
          <div className="flex items-center -ml-4 md:-ml-7 gap-1">
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
        <Link href="/products" className="text-gray-400 hover:text-purple-600 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </Link>
      </header>

      <CheckoutContent />
    </div>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const { items, subtotal, promoCode, clearCart } = useCart();

  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    postalCode: '',
    saveInfo: false,
    newsletters: true
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [promoInput, setPromoInput] = useState(promoCode);
  const [validatedPromo, setValidatedPromo] = useState<PromoCodeData | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRole, setUserRole] = useState<AuthUser['role'] | null>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountModalMode, setAccountModalMode] = useState<AuthMode>('login');
  const [regions, setRegions] = useState<ShippingRegion[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<string>('');
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [isRegionsLoading, setIsRegionsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch('/api/auth/me', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          setUserRole(data.user?.role ?? null);
        }
      } catch {
        setUserRole(null);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setIsRegionsLoading(true);
        const response = await fetch('/api/shipping');
        const data = await response.json();
        if (response.ok) setRegions(data.data || []);
      } catch (error) { console.error('Failed to load shipping regions', error); }
      finally { setIsRegionsLoading(false); }
    };
    fetchRegions();
  }, []);

  const { promoDiscount, shippingCost, finalTotal } = useMemo(() => {
    const promoAmount = validatedPromo ? (subtotal * validatedPromo.discountPercent) / 100 : 0;
    const afterPromo = subtotal - promoAmount;

    const selectedRegion = regions.find(r => r.id === selectedRegionId);
    const sCost = selectedRegion ? selectedRegion.shippingCost : 350;

    return {
      promoDiscount: promoAmount,
      shippingCost: sCost,
      finalTotal: Math.max(0, afterPromo + sCost),
    };
  }, [subtotal, validatedPromo, regions, selectedRegionId]);

  const handleValidatePromo = async () => {
    if (!promoInput.trim()) return;
    try {
      const response = await fetch('/api/promo-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoInput.trim() }),
      });
      const data = await response.json();
      if (!response.ok || !data.code) throw new Error(data.error || 'Invalid code');
      setValidatedPromo(data.code);
      setPromoError(null);
    } catch (error) {
      setValidatedPromo(null);
      setPromoError(error instanceof Error ? error.message : 'Error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          shippingAddress: { ...shippingInfo, fullName: `${shippingInfo.firstName} ${shippingInfo.lastName}`.trim() },
          shippingRegion: regions.find(r => r.id === selectedRegionId)?.name,
          shippingCity: regions.find(r => r.id === selectedRegionId)?.cities.find(c => c.id === selectedCityId)?.name,
          paymentMethod: 'cod',
          promoCodeId: validatedPromo?.id ?? null,
          subtotal,
          promoDiscount,
          shippingCost,
          total: finalTotal,
        }),
      });
      if (!response.ok) throw new Error('Failed to place order');
      clearCart();
      router.push('/order-success');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Error');
    } finally { setIsSubmitting(false); }
  };

  if (items.length === 0) return null;

  return (
    <div className="max-w-[1440px] mx-auto flex flex-col lg:grid lg:grid-cols-[1.2fr_0.8fr] min-h-[calc(100vh-80px)]">
      {/* Left Column: Form */}
      <div className="p-4 sm:p-8 lg:p-20 lg:pr-10">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-12">

          {/* Contact Section */}
          <section className="space-y-4">
            <div className="flex justify-between items-end">
              <h2 className="text-xl font-medium tracking-tight">Contact</h2>
              {!userRole && (
                <button
                  type="button"
                  className="text-sm text-purple-600 underline font-medium"
                  onClick={() => {
                    setAccountModalMode('login');
                    setIsAccountModalOpen(true);
                  }}
                >
                  Sign in
                </button>
              )}
            </div>
            <input
              type="email" required placeholder="Email"
              value={shippingInfo.email}
              onChange={(e) => setShippingInfo(p => ({ ...p, email: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-4 py-3.5 outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-600 transition-all"
            />
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox" checked={shippingInfo.newsletters}
                onChange={(e) => setShippingInfo(p => ({ ...p, newsletters: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Email me with news and offers</span>
            </label>
          </section>

          {/* Delivery Section */}
          <section className="space-y-6">
            <h2 className="text-xl font-medium tracking-tight">Delivery</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Region Select */}
              <div className="md:col-span-2 space-y-4">
                <select
                  required value={selectedRegionId}
                  onChange={(e) => setSelectedRegionId(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3.5 bg-white outline-none focus:border-purple-600"
                >
                  <option value="">Select Region / Province</option>
                  {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>

                <select
                  required disabled={!selectedRegionId} value={selectedCityId}
                  onChange={(e) => setSelectedCityId(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3.5 bg-white outline-none focus:border-purple-600 disabled:bg-gray-50"
                >
                  <option value="">Select City</option>
                  {regions.find(r => r.id === selectedRegionId)?.cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <input
                type="text" required placeholder="First name"
                value={shippingInfo.firstName}
                onChange={(e) => setShippingInfo(p => ({ ...p, firstName: e.target.value }))}
                className="border border-gray-200 rounded-lg px-4 py-3.5 outline-none focus:border-purple-600"
              />
              <input
                type="text" required placeholder="Last name"
                value={shippingInfo.lastName}
                onChange={(e) => setShippingInfo(p => ({ ...p, lastName: e.target.value }))}
                className="border border-gray-200 rounded-lg px-4 py-3.5 outline-none focus:border-purple-600"
              />
              <input
                type="text" required placeholder="Address"
                value={shippingInfo.address}
                onChange={(e) => setShippingInfo(p => ({ ...p, address: e.target.value }))}
                className="md:col-span-2 border border-gray-200 rounded-lg px-4 py-3.5 outline-none focus:border-purple-600"
              />
              <input
                type="text" placeholder="Apartment, suite, etc. (optional)"
                value={shippingInfo.apartment}
                onChange={(e) => setShippingInfo(p => ({ ...p, apartment: e.target.value }))}
                className="md:col-span-2 border border-gray-200 rounded-lg px-4 py-3.5 outline-none focus:border-purple-600"
              />
              <input
                type="tel" required placeholder="Phone"
                value={shippingInfo.phone}
                onChange={(e) => setShippingInfo(p => ({ ...p, phone: e.target.value }))}
                className="md:col-span-2 border border-gray-200 rounded-lg px-4 py-3.5 outline-none focus:border-purple-600"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-purple-600" />
                <span className="text-sm text-gray-600">Save this information for next time</span>
              </label>
            </div>
          </section>

          {/* Shipping Method Section */}
          <section className="space-y-4">
            <h2 className="text-xl font-medium tracking-tight">Shipping method</h2>
            <div className="border border-gray-200 rounded-xl p-5 bg-purple-50/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 rounded-full bg-purple-600"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Cash on Delivery</p>
                    <p className="text-xs text-gray-400">Standard delivery</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-900">{formatPKR(shippingCost)}</span>
              </div>
            </div>
          </section>

          {/* Payment Info Section */}
          <section className="space-y-4 bg-blue-50 border border-blue-200 rounded-xl p-5">
            <p className="text-sm font-medium text-blue-900">Payment Method: Cash on Delivery</p>
            <p className="text-xs text-blue-700">Please have the exact amount ready when the package is delivered.</p>
          </section>

          {/* Action Button */}
          <div className="pt-6">
            <button
              type="submit" disabled={isSubmitting}
              className="w-full bg-[#E91E63] text-white py-5 rounded-lg text-sm font-black uppercase tracking-[0.3em] shadow-xl shadow-pink-100 hover:bg-[#D81B60] hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : 'Complete Order'}
            </button>
            {statusMessage && <p className="text-xs text-red-500 font-bold text-center mt-4">{statusMessage}</p>}
          </div>
        </form>
      </div>

      {/* Right Column: Order Summary */}
      <aside className="bg-purple-50/30 p-4 sm:p-8 lg:p-20 lg:pl-10 border-t lg:border-t-0 lg:border-l border-gray-100 flex flex-col items-center">
        <div className="w-full max-w-sm space-y-10">

          {/* Item List */}
          <div className="space-y-6">
            {items.map((item) => (
              <div key={`${item.id}-${item.size}`} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 shrink-0">
                    <div className="w-full h-full bg-white rounded-xl border border-gray-100 overflow-hidden">
                      {item.image && <img src={item.image} alt={item.name} className="object-cover w-full h-full" />}
                    </div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-gray-800/90 text-white text-[11px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-md z-10">
                      {item.quantity}
                    </span>
                  </div>
                  <div>
                    <p className="text-[12px] font-black text-gray-900 uppercase tracking-tight line-clamp-1">{item.name}</p>
                    {(item.color || item.size) && (
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.color} / {item.size}</p>
                    )}
                  </div>
                </div>
                <p className="text-[12px] font-black text-gray-900">{formatPKR(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          {/* Discount Section */}
          <div className="space-y-2 relative">
            <div className="flex gap-3">
              <input
                type="text" value={promoInput}
                onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(null); }}
                placeholder="Discount code"
                className={`flex-1 bg-white border rounded-lg px-4 py-3 text-sm outline-none transition-colors ${promoError ? 'border-red-300 focus:border-red-400' : validatedPromo ? 'border-green-300 focus:border-green-400' : 'border-gray-200 focus:border-purple-400'}`}
              />
              <button
                type="button" onClick={handleValidatePromo}
                className="px-6 py-3 bg-purple-500 text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-purple-600 hover:text-white transition-all active:scale-95"
              >
                Apply
              </button>
            </div>
            {promoError && (
              <p className="text-xs font-bold text-red-500 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {promoError}
              </p>
            )}
            {validatedPromo && (
              <p className="text-xs font-bold text-green-600 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Code &quot;{validatedPromo.code}&quot; applied — {validatedPromo.discountPercent}% off!
              </p>
            )}
          </div>

          {/* Pricing Summary */}
          <div className="space-y-3 pt-6 border-t border-gray-100">
            <div className="flex justify-between items-center text-sm font-medium text-gray-600">
              <span>Subtotal</span>
              <span>{formatPKR(subtotal)}</span>
            </div>

            {validatedPromo && (
              <div className="flex justify-between items-center text-sm font-bold text-green-600">
                <span>Discount</span>
                <span>-{formatPKR(promoDiscount)}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-sm font-medium text-gray-600">
              <span>Shipping</span>
              <span className={shippingCost === 0 ? 'text-green-600 font-bold' : ''}>{shippingCost === 0 ? 'FREE' : formatPKR(shippingCost)}</span>
            </div>

            <div className="flex justify-between items-center pt-6 text-gray-900">
              <span className="text-xl font-black uppercase tracking-tight">Total</span>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mr-2">PKR</span>
                <span className="text-2xl font-black tracking-tighter">{formatPKR(finalTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <AccountModal
        isOpen={isAccountModalOpen}
        mode={accountModalMode}
        onClose={() => setIsAccountModalOpen(false)}
        onModeChange={setAccountModalMode}
        onAuthSuccess={(user) => {
          setUserRole(user.role);
          setShippingInfo(p => ({ ...p, email: user.email }));
        }}
      />
    </div>
  );
}
