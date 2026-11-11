import React, { createContext, useContext, useState, useEffect } from 'react';
import { sound } from '../utils/audio.js';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variantId?: string;
  variantName?: string;
}

export interface AppliedCoupon {
  code: string;
  discountAmount: number;
  type: string;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  total: number;
  coupon: AppliedCoupon | null;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: any, variant?: any, quantity?: number) => void;
  updateQty: (productId: string, variantId: string | undefined, qty: number) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; error?: string }>;
  removeCoupon: () => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aether_cart_items');
      if (saved) {
        try { return JSON.parse(saved); } catch { return []; }
      }
    }
    return [];
  });

  const [coupon, setCoupon] = useState<AppliedCoupon | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aether_cart_coupon');
      if (saved) {
        try { return JSON.parse(saved); } catch { return null; }
      }
    }
    return null;
  });

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('aether_cart_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (coupon) {
      localStorage.setItem('aether_cart_coupon', JSON.stringify(coupon));
    } else {
      localStorage.removeItem('aether_cart_coupon');
    }
  }, [coupon]);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Recalculate discount based on current subtotal
  let discount = 0;
  if (coupon) {
    discount = Math.min(coupon.discountAmount, subtotal);
  }
  const total = Math.max(0, subtotal - discount);

  const addToCart = (product: any, variant?: any, quantity = 1) => {
    sound.playSuccess();
    setItems(prev => {
      const variantId = variant?.id;
      const variantName = variant?.name;
      const existingIndex = prev.findIndex(
        i => i.productId === product.id && i.variantId === variantId
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += quantity;
        return next;
      } else {
        return [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity,
            variantId,
            variantName
          }
        ];
      }
    });
    setIsCartOpen(true);
  };

  const updateQty = (productId: string, variantId: string | undefined, qty: number) => {
    sound.playClick();
    if (qty <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    setItems(prev =>
      prev.map(i => {
        if (i.productId === productId && i.variantId === variantId) {
          return { ...i, quantity: qty };
        }
        return i;
      })
    );
  };

  const removeFromCart = (productId: string, variantId?: string) => {
    sound.playClick();
    setItems(prev => prev.filter(i => !(i.productId === productId && i.variantId === variantId)));
  };

  const applyCoupon = async (code: string) => {
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, orderAmount: subtotal })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Invalid code' };
      }

      setCoupon({
        code: data.code,
        discountAmount: data.discountAmount,
        type: data.type
      });
      sound.playSuccess();
      return { success: true };
    } catch {
      return { success: false, error: 'Network validation error' };
    }
  };

  const removeCoupon = () => {
    sound.playClick();
    setCoupon(null);
  };

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        discount,
        total,
        coupon,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQty,
        removeFromCart,
        applyCoupon,
        removeCoupon,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
};
