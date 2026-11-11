import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.js';
import { sound } from '../utils/audio.js';
import { Trash2, Plus, Minus, ArrowRight, Tag, Check, AlertCircle, ShoppingBag } from 'lucide-react';

export const CartPage: React.FC = () => {
  const {
    items,
    itemCount,
    subtotal,
    discount,
    total,
    coupon,
    updateQty,
    removeFromCart,
    applyCoupon,
    removeCoupon
  } = useCart();

  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplying(true);
    setCouponError('');
    const res = await applyCoupon(couponInput.trim());
    setIsApplying(false);
    if (!res.success) {
      setCouponError(res.error || 'Invalid coupon code');
    } else {
      setCouponInput('');
    }
  };

  if (items.length === 0) {
    return (
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center mx-auto mb-6 text-slate-500">
          <ShoppingBag className="w-10 h-10 stroke-1 text-cyan-400" />
        </div>
        <h1 className="text-2xl font-bold text-white font-display">Your bag is empty</h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto mt-2 mb-8 leading-relaxed">
          Explore our collection of neural acoustic instruments, spatial timepieces, and aerospace drones.
        </p>
        <Link
          to="/shop"
          onClick={() => sound.playClick()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-lg shadow-cyan-500/20"
        >
          <span>Explore Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">Order Manifest</span>
        <h1 className="text-3xl font-bold text-white mt-1 font-display">Shopping Bag ({itemCount} items)</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.variantId || 'default'}`}
              className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col sm:flex-row gap-5 items-center justify-between"
            >
              <div className="flex items-center gap-5 w-full sm:w-auto">
                <img
                  src={item.image}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 object-cover rounded-xl bg-slate-900 border border-white/10 shrink-0"
                />
                <div>
                  <h3 className="text-sm font-bold text-white">{item.name}</h3>
                  {item.variantName && (
                    <p className="text-xs text-slate-400 mt-0.5">{item.variantName}</p>
                  )}
                  <p className="text-xs font-mono text-cyan-400 font-bold tabular-nums mt-1">
                    ${item.price.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Quantity and Actions */}
              <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                <div className="flex items-center border border-white/10 rounded-xl bg-slate-900/60 p-1">
                  <button
                    onClick={() => updateQty(item.productId, item.variantId, item.quantity - 1)}
                    className="p-1.5 text-slate-400 hover:text-white"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-mono font-bold text-white tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQty(item.productId, item.variantId, item.quantity + 1)}
                    className="p-1.5 text-slate-400 hover:text-white"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold font-mono text-white tabular-nums">
                    ${(item.price * item.quantity).toLocaleString()}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.productId, item.variantId)}
                    className="text-[11px] text-slate-500 hover:text-red-400 transition-colors mt-1 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary & Coupon */}
        <div className="lg:col-span-4 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <h2 className="text-base font-bold text-white font-display">Summary & Settlement</h2>

          {/* Coupon */}
          <div>
            {coupon ? (
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-mono">
                  <Check className="w-3.5 h-3.5" />
                  <span><strong>{coupon.code}</strong> (-${coupon.discountAmount})</span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-slate-400 hover:text-white text-[11px] underline cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Coupon code (CYBER20)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono uppercase"
                />
                <button
                  type="submit"
                  disabled={isApplying}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  Apply
                </button>
              </form>
            )}
            {couponError && (
              <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{couponError}</span>
              </p>
            )}
          </div>

          {/* Price Breakdown */}
          <div className="space-y-2.5 text-xs border-y border-white/10 py-4">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span className="font-mono text-slate-200 tabular-nums">${subtotal.toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Promotional Discount</span>
                <span className="font-mono tabular-nums">-${discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400">
              <span>Insured Courier Shipping</span>
              <span className="text-emerald-400 font-medium">Free</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Estimated Tax</span>
              <span className="font-mono text-slate-200 tabular-nums">$0.00</span>
            </div>
            <div className="pt-2 border-t border-white/5 flex justify-between text-base font-bold text-white">
              <span>Total Balance</span>
              <span className="font-mono text-cyan-400 tabular-nums">${total.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              navigate('/checkout');
            }}
            className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
