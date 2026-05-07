'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import type { Stripe, StripeElements } from '@stripe/stripe-js';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import { useCart } from '@/app/context/CartContext';
import type { AuthUser } from '@/app/components/AccountModal';

type PaymentMethod = 'card' | 'direct' | 'cod';
type DirectAccount = 'meezan' | 'easypaisa';

interface PromoCodeData {
  id: string;
  code: string;
  discountPercent: number;
}

const accountDetails: Record<DirectAccount, { name: string; accountNo: string; accountTitle: string }> = {
  meezan: {
    name: 'Meezan Bank',
    accountNo: '08120108038833',
    accountTitle: 'Muhammad Saad Saleem',
  },
  easypaisa: {
    name: 'Easypaisa',
    accountNo: '03340562205',
    accountTitle: 'Muhammad Saad Saleem',
  },
};

const DIRECT_ADVANCE = 1000;
const COD_ADVANCE = 1000;

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

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;
const stripeAvailable = Boolean(stripePublishableKey);

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {stripePromise ? (
        <Elements stripe={stripePromise}>
          <CheckoutWithStripe />
        </Elements>
      ) : (
        <CheckoutWithoutStripe />
      )}
    </div>
  );
}

function CheckoutWithStripe() {
  const stripe = useStripe();
  const elements = useElements();

  return <CheckoutContent stripe={stripe} elements={elements} stripeAvailable />;
}

function CheckoutWithoutStripe() {
  return <CheckoutContent stripe={null} elements={null} stripeAvailable={false} />;
}

function CheckoutContent({
  stripe,
  elements,
  stripeAvailable = true,
}: {
  stripe: Stripe | null;
  elements: StripeElements | null;
  stripeAvailable?: boolean;
}) {
  const router = useRouter();
  const { items, subtotal, promoCode, clearCart } = useCart();

  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(stripeAvailable ? 'card' : 'direct');
  const [directAccount, setDirectAccount] = useState<DirectAccount>('meezan');
  const [promoInput, setPromoInput] = useState(promoCode);
  const [validatedPromo, setValidatedPromo] = useState<PromoCodeData | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [receiptStatus, setReceiptStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const receiptInputRef = useRef<HTMLInputElement | null>(null);
  const [cardError, setCardError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRole, setUserRole] = useState<AuthUser['role'] | null>(null);
  
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
          if (data.user?.role === 'ADMIN') {
            router.replace('/admin');
          }
        }
      } catch {
        setUserRole(null);
      }
    };

    loadUser();
  }, [router]);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setIsRegionsLoading(true);
        const response = await fetch('/api/shipping');
        const data = await response.json();
        if (response.ok) {
          setRegions(data.data || []);
        }
      } catch (error) {
        console.error('Failed to load shipping regions', error);
      } finally {
        setIsRegionsLoading(false);
      }
    };
    fetchRegions();
  }, []);

  useEffect(() => {
    if (items.length === 0) {
      router.push('/');
    }
  }, [items, router]);

  useEffect(() => {
    if (paymentMethod === 'card') {
      setReceiptUrl(null);
      setReceiptStatus('idle');
      setReceiptError(null);
    }
  }, [paymentMethod]);

  const { promoDiscount, directTransferDiscount, shippingCost, finalTotal } = useMemo(() => {
    const promoAmount = validatedPromo ? (subtotal * validatedPromo.discountPercent) / 100 : 0;
    const afterPromo = subtotal - promoAmount;
    const transferDiscount = paymentMethod === 'direct' ? afterPromo * 0.05 : 0;
    
    const selectedRegion = regions.find(r => r.id === selectedRegionId);
    const sCost = selectedRegion ? selectedRegion.shippingCost : 0;
    
    const final = Math.max(0, afterPromo - transferDiscount + sCost);
    return {
      promoDiscount: promoAmount,
      directTransferDiscount: transferDiscount,
      shippingCost: sCost,
      finalTotal: final,
    };
  }, [subtotal, validatedPromo, paymentMethod, regions, selectedRegionId]);

  const handleValidatePromo = async () => {
    if (!promoInput.trim()) {
      setValidatedPromo(null);
      setPromoError(null);
      return;
    }

    try {
      const response = await fetch('/api/promo-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoInput.trim() }),
      });
      const data = await response.json();

      if (!response.ok || !data.code) {
        throw new Error(data.error || 'Invalid promo code');
      }

      setValidatedPromo(data.code);
      setPromoError(null);
    } catch (error) {
      setValidatedPromo(null);
      setPromoError(error instanceof Error ? error.message : 'Unable to validate code');
    }
  };

  const handleReceiptUpload = async (file: File) => {
    setReceiptError(null);
    setReceiptStatus('uploading');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/uploads/receipt', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok || !data.url) {
        throw new Error(data.error || 'Upload failed');
      }
      setReceiptUrl(data.url);
      setReceiptStatus('done');
    } catch (error) {
      setReceiptStatus('error');
      setReceiptError(error instanceof Error ? error.message : 'Failed to upload receipt');
    }
  };

  const handleReceiptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setReceiptError('Please upload PNG or JPG images.');
      return;
    }
    handleReceiptUpload(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (userRole === 'ADMIN') return;

    setIsSubmitting(true);
    setStatusMessage(null);
    setCardError(null);
    setReceiptError(null);

    try {
      let paymentIntentId: string | null = null;

      if (paymentMethod === 'card' && !stripeAvailable) {
        setStatusMessage('Card payments are currently unavailable. Please choose another payment method.');
        setIsSubmitting(false);
        return;
      }

      if (paymentMethod === 'card') {
        if (!stripe || !elements) {
          setCardError('Card form is not ready yet.');
          setIsSubmitting(false);
          return;
        }

        const intentResponse = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: finalTotal }),
        });
        const intentData = await intentResponse.json();
        if (!intentResponse.ok || !intentData.clientSecret) {
          throw new Error(intentData.error || 'Unable to initiate payment.');
        }

        const cardNumberElement = elements.getElement(CardNumberElement);
        if (!cardNumberElement) {
          setCardError('Card number field is not ready yet.');
          setIsSubmitting(false);
          return;
        }

        const confirmation = await stripe.confirmCardPayment(intentData.clientSecret, {
          payment_method: {
            card: cardNumberElement,
            billing_details: {
              name: shippingInfo.fullName,
              email: shippingInfo.email,
            },
          },
        });
        if (confirmation.error) {
          setCardError(confirmation.error.message || 'Payment failed.');
          setIsSubmitting(false);
          return;
        }

        paymentIntentId = confirmation.paymentIntent?.id ?? null;
      } else if (paymentMethod === 'direct') {
        if (!receiptUrl) {
          setReceiptError('Please upload your payment receipt.');
          setIsSubmitting(false);
          return;
        }
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          shippingAddress: shippingInfo,
          shippingRegion: regions.find(r => r.id === selectedRegionId)?.name,
          shippingCity: regions.find(r => r.id === selectedRegionId)?.cities.find(c => c.id === selectedCityId)?.name,
          paymentMethod,
          directAccount: paymentMethod === 'card' ? null : directAccount,
          promoCodeId: validatedPromo?.id ?? null,
          subtotal,
          promoDiscount,
          directTransferDiscount,
          shippingCost,
          total: finalTotal,
          receiptUrl: paymentMethod === 'card' ? null : receiptUrl,
          paymentIntentId,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      clearCart();
      router.push('/order-success');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Failed to place order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  const requiresReceipt = paymentMethod === 'direct';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Information</h2>
            <div className="space-y-4">
              {[
                { label: 'Full Name *', key: 'fullName', type: 'text', placeholder: 'John Ahmed' },
                { label: 'Email *', key: 'email', type: 'email', placeholder: 'john@example.com' },
                { label: 'Phone *', key: 'phone', type: 'tel', placeholder: '+92 3XX XXXXXXX' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-900 mb-2">{field.label}</label>
                  <input
                    type={field.type}
                    required
                    value={shippingInfo[field.key as keyof typeof shippingInfo]}
                    onChange={(e) =>
                      setShippingInfo((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all hover:border-gray-300"
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Address *</label>
                <textarea
                  required
                  value={shippingInfo.address}
                  onChange={(e) => setShippingInfo((prev) => ({ ...prev, address: e.target.value }))}
                  rows={3}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all hover:border-gray-300 resize-none"
                  placeholder="Enter your complete street address (e.g., House 123, Street ABC)"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Region / Province *</label>
                  <select
                    required
                    value={selectedRegionId}
                    onChange={(e) => {
                      const rid = e.target.value;
                      setSelectedRegionId(rid);
                      const region = regions.find(r => r.id === rid);
                      setShippingInfo(prev => ({ ...prev, region: region?.name || '' }));
                      setSelectedCityId(''); // Reset city when region changes
                    }}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all hover:border-gray-300"
                  >
                    <option value="" className="text-gray-400">Select Region</option>
                    {regions.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">City *</label>
                  <select
                    required
                    value={selectedCityId}
                    disabled={!selectedRegionId}
                    onChange={(e) => {
                      const cid = e.target.value;
                      setSelectedCityId(cid);
                      const region = regions.find(r => r.id === selectedRegionId);
                      const city = region?.cities.find(c => c.id === cid);
                      setShippingInfo(prev => ({ ...prev, city: city?.name || '' }));
                    }}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all hover:border-gray-300 disabled:bg-gray-100 disabled:border-gray-300"
                  >
                    <option value="" className="text-gray-400">Select City</option>
                    {regions.find(r => r.id === selectedRegionId)?.cities.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Postal Code (Optional)</label>
                <input
                  type="text"
                  value={shippingInfo.postalCode}
                  onChange={(e) =>
                    setShippingInfo((prev) => ({ ...prev, postalCode: e.target.value }))
                  }
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all hover:border-gray-300"
                  placeholder="12345"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Method</h2>
            {['card', 'direct', 'cod'].map((method) => (
              <label
                key={method}
                className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-purple-300 transition"
              >
                <input
                  type="radio"
                  name="payment"
                  value={method}
                  checked={paymentMethod === method}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="mr-3"
                  disabled={method === 'card' && !stripeAvailable}
                />
                <div className="flex-1">
                  <span className="font-semibold text-gray-900 capitalize">
                    {method === 'card'
                      ? 'Credit / Debit Card'
                      : method === 'direct'
                        ? 'Direct Bank Transfer'
                        : 'Cash on Delivery'}
                  </span>
                  <p className="text-sm text-gray-500">
                    {method === 'card'
                      ? stripeAvailable
                        ? 'Pay securely via Stripe'
                        : 'Card payments unavailable until Stripe is configured'
                      : method === 'direct'
                        ? `Upload receipt to unlock 5% direct-transfer discount (Rs. ${DIRECT_ADVANCE.toLocaleString()} advance required)`
                        : 'Pay in cash when your order is delivered'}
                  </p>
                </div>
              </label>
            ))}
            {!stripeAvailable && (
              <p className="text-sm text-red-600">
                Configure <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> to enable card payments.
              </p>
            )}

            {paymentMethod === 'direct' && (
              <div className="ml-8 space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-700 font-medium">
                    Direct bank transfers require an advance deposit of Rs. ${DIRECT_ADVANCE.toLocaleString()}.
                    Please send the advance to the selected account and upload the receipt below to secure your 5% discount.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account used for transfer
                    </label>
                    <select
                      value={directAccount}
                      onChange={(e) => setDirectAccount(e.target.value as DirectAccount)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700"
                    >
                      <option value="meezan">Meezan Bank - 08120108038833</option>
                      <option value="easypaisa">Easypaisa - 03340562205</option>
                    </select>
                  </div>

                  <div>
                    <p className="block text-sm font-medium text-gray-700 mb-2">
                      Upload payment receipt (PNG / JPG) *
                    </p>
                    <input
                      ref={receiptInputRef}
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={handleReceiptChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => receiptInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-dashed border-purple-300 text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition"
                    >
                      Choose Receipt
                    </button>
                    {receiptStatus === 'uploading' && (
                      <p className="text-xs text-gray-500 mt-1">Uploading receipt...</p>
                    )}
                    {receiptStatus === 'done' && receiptUrl && (
                      <p className="text-xs text-green-600 mt-1">Receipt uploaded successfully.</p>
                    )}
                    {receiptError && <p className="text-xs text-red-600 mt-1">{receiptError}</p>}
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-purple-900 mb-2">
                      {accountDetails[directAccount].name}
                    </p>
                    <p className="text-sm text-gray-700">
                      Account No: {accountDetails[directAccount].accountNo}
                    </p>
                    <p className="text-sm text-gray-700">
                      Account Title: {accountDetails[directAccount].accountTitle}
                    </p>
                    <p className="text-xs text-purple-700 mt-2 font-medium">
                      Transfer the amount and upload your receipt to proceed.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'card' && stripeAvailable && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Card Details</label>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-1">Card Number</p>
                    <div className="border border-gray-300 rounded-lg px-4 py-3">
                      <CardNumberElement
                        options={{
                          style: {
                            base: {
                              fontSize: '16px',
                              color: '#1f2937',
                              '::placeholder': { color: '#9ca3af' },
                            },
                            invalid: { color: '#ef4444' },
                          },
                          placeholder: '1234 5678 9012 3456',
                        }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">Expiry (MM/YY)</p>
                      <div className="border border-gray-300 rounded-lg px-4 py-3">
                        <CardExpiryElement
                          options={{
                            style: {
                              base: {
                                fontSize: '16px',
                                color: '#1f2937',
                                '::placeholder': { color: '#9ca3af' },
                              },
                              invalid: { color: '#ef4444' },
                            },
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">CVV</p>
                      <div className="border border-gray-300 rounded-lg px-4 py-3">
                        <CardCvcElement
                          options={{
                            style: {
                              base: {
                                fontSize: '16px',
                                color: '#1f2937',
                                '::placeholder': { color: '#9ca3af' },
                              },
                              invalid: { color: '#ef4444' },
                            },
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Stripe securely encrypts your card number, expiration date, and CVV.
                </p>
                {cardError && <p className="text-xs text-red-600">{cardError}</p>}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Promo Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  placeholder="Enter promo code"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm uppercase focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                />
                <button
                  type="button"
                  onClick={handleValidatePromo}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition"
                >
                  Apply
                </button>
              </div>
              {promoError && <p className="text-xs text-red-600 mt-1">{promoError}</p>}
              {validatedPromo && (
                <p className="text-xs text-green-600 mt-1">
                  {validatedPromo.discountPercent}% discount applied!
                </p>
              )}
            </div>

            <div className="space-y-3 mb-4 border-b pb-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-semibold text-gray-600">Rs. {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold text-gray-600">Rs. {subtotal.toFixed(2)}</span>
              </div>
              {validatedPromo && (
                <div className="flex justify-between text-sm bg-green-50 p-2 rounded-lg border border-green-200">
                  <span className="text-green-700 font-medium">
                    Promo Discount ({validatedPromo.discountPercent}%)
                  </span>
                  <span className="text-green-700 font-bold">-Rs. {promoDiscount.toFixed(2)}</span>
                </div>
              )}
              {paymentMethod === 'direct' && (
                <div className="flex justify-between text-sm bg-green-50 p-2 rounded-lg border border-green-200">
                  <span className="text-green-700 font-medium">Direct Transfer Discount (5%)</span>
                  <span className="text-green-700 font-bold">
                    -Rs. {directTransferDiscount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold text-gray-600">
                  {shippingCost > 0 ? `Rs. ${shippingCost.toFixed(2)}` : 'Select Region'}
                </span>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-600">Total</span>
                <span className="text-purple-600">Rs. {finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {statusMessage && (
              <p className="text-sm text-red-600 mt-3">{statusMessage}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || userRole === 'ADMIN' || (requiresReceipt && !receiptUrl)}
              className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : 'Place Order'}
            </button>
            {requiresReceipt && !receiptUrl && (
              <p className="text-xs text-red-500 text-center mt-2">
                Upload your payment receipt to continue.
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

