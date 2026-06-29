'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  size?: string;
  color?: string;
}

interface CartContextValue {
  items: CartItem[];
  totalCount: number;
  subtotal: number;
  promoCode: string;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (id: string, size?: string, color?: string) => void;
  updateQuantity: (id: string, quantity: number, size?: string, color?: string) => void;
  clearCart: () => void;
  applyPromoCode: (code: string) => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const CART_STORAGE_KEY = 'stepstyle-cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setItems(parsed.items ?? []);
        setPromoCode(parsed.promoCode ?? '');
      }
    } catch (error) {
      console.warn('Failed to load cart from storage', error);
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify({
          items,
          promoCode,
        }),
      );
    } catch (error) {
      console.warn('Failed to persist cart to storage', error);
    }
  }, [items, promoCode]);

  const totalCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.quantity * item.price, 0), [items]);

  const addItem = (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (entry) =>
          entry.id === item.id && entry.size === item.size && entry.color === item.color,
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      }

      return [...prev, { ...item, quantity }];
    });
  };

  const removeItem = (id: string, size?: string, color?: string) => {
    setItems((prev) =>
      prev.filter((item) => !(item.id === id && item.size === size && item.color === color)),
    );
  };

  const updateQuantity = (id: string, quantity: number, size?: string, color?: string) => {
    const safeQuantity = Math.max(1, quantity);

    setItems((prev) =>
      prev.map((item) =>
        item.id === id && item.size === size && item.color === color
          ? { ...item, quantity: safeQuantity }
          : item,
      ),
    );
  };

  const clearCart = () => {
    setItems([]);
    setPromoCode('');
  };

  const applyPromoCode = (code: string) => {
    setPromoCode(code.toUpperCase());
  };

  const value: CartContextValue = {
    items,
    totalCount,
    subtotal,
    promoCode,
    isCartOpen,
    setIsCartOpen,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    applyPromoCode,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}


