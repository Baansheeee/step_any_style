'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCart } from '@/app/context/CartContext';
import type { AuthUser } from './AccountModal';
import { formatPKR } from '@/lib/currency';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserRole?: AuthUser['role'] | null;
}

export default function CartDrawer({ isOpen, onClose, currentUserRole }: CartDrawerProps) {
  const { items, subtotal, totalCount, removeItem, updateQuantity, promoCode, applyPromoCode, clearCart } =
    useCart();
  const [promoInput, setPromoInput] = useState(promoCode);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const isAdmin = currentUserRole === 'ADMIN';

  useEffect(() => {
    setPromoInput(promoCode);
  }, [promoCode]);

  useEffect(() => {
    if (!statusMessage) return;
    const timeout = setTimeout(() => setStatusMessage(null), 2500);
    return () => clearTimeout(timeout);
  }, [statusMessage]);

  const handleApplyPromo = () => {
    applyPromoCode(promoInput.trim());
    setStatusMessage(
      promoInput.trim()
        ? `Promo code "${promoInput.trim().toUpperCase()}" saved`
        : 'Promo code cleared',
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Cart</p>
            <h3 className="text-xl font-semibold text-gray-900">Items ({totalCount})</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center"
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              <p className="text-lg font-semibold text-gray-800">Your cart is empty</p>
              <p className="text-sm">Add products to see them here.</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} width={80} height={80} className="object-cover" />
                  ) : (
                    <span className="text-gray-400 text-xs">No Image</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-900">{formatPKR(item.price)}</p>
                      {(item.size || item.color) && (
                        <div className="flex gap-2 mt-1">
                          {item.size && (
                            <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">
                              Size: {item.size}
                            </span>
                          )}
                          {item.color && (
                            <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">
                              Color: {item.color}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      className="text-sm text-red-500 hover:text-red-600"
                      onClick={() => removeItem(item.id, item.size, item.color)}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border rounded-full">
                      <button
                        className="w-9 h-9 text-lg text-gray-600 hover:text-purple-600 disabled:opacity-40"
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.size, item.color)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-semibold text-gray-900">{item.quantity}</span>
                      <button
                        className="w-9 h-9 text-lg text-gray-600 hover:text-purple-600"
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.size, item.color)}
                      >
                        +
                      </button>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {formatPKR(item.quantity * item.price)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t px-6 py-4 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-900">Promo Code (optional)</label>
              {promoCode && (
                <button className="text-xs text-gray-600 underline" onClick={() => setPromoInput('')}>
                  Clear
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                placeholder="Enter promo code"
                className="flex-1 border-2 border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all uppercase hover:border-gray-300"
              />
              <button
                onClick={handleApplyPromo}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition"
              >
                Apply
              </button>
            </div>
            {statusMessage && <p className="text-xs text-green-600 mt-1">{statusMessage}</p>}
          </div>

          <div className="flex items-center justify-between text-lg font-semibold text-gray-900">
            <span>Subtotal</span>
            <span>{formatPKR(subtotal)}</span>
          </div>

          <div className="flex gap-3">
            <button
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
              onClick={clearCart}
              disabled={items.length === 0}
            >
              Clear Cart
            </button>
            {isAdmin ? (
              <button
                className="flex-1 bg-gray-200 text-gray-500 py-3 rounded-lg font-semibold cursor-not-allowed"
                disabled
              >
                Admins cannot checkout
              </button>
            ) : (
              <Link
                href="/checkout"
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition text-center"
                onClick={onClose}
              >
                Proceed to Checkout
              </Link>
            )}
          </div>
          <p className="text-xs text-gray-500 text-center">
            Promo code discounts will be applied during checkout.
          </p>
          {isAdmin && (
            <p className="text-xs text-red-500 text-center mt-2">
              Administrators manage orders from the dashboard and cannot place new ones.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
