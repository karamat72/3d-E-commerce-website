import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext.js';
import { sound } from '../../utils/audio.js';
import { X, Trash2, Plus, Minus, ArrowRight, Tag, Check, AlertCircle } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    items,
    itemCount,
    subtotal,
    discount,
    total,
    coupon,
    isCartOpen,
    setIsCartOpen,
    updateQty,
    removeFromCart,
    applyCoupon,
    removeCoupon
  } = useCart();

  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplying(true);
    setCouponError('');
    const res = await applyCoupon(couponInput.trim());
    setIsApplying(false);
    if (!res.success) {
      setCouponError(res.error || 'Invalid coupon');
    } else {
      setCouponInput('');
    }
  };

  const handleCheckout = () => {
    sound.playClick();
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => {
          sound.playClick();
          setIsCartOpen(false);
        }}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#090b12] border-l border-white/10 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-white font-display">Shopping Bag</h2>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded-full tabular-nums">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                setIsCartOpen(false);
              }}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 text-slate-500">
                  <Tag className="w-8 h-8 stroke-1" />
                </div>
                <h3 className="text-sm font-semibold text-slate-200 mb-1">Your bag is empty</h3>
                <p className="text-xs text-slate-400 max-w-xs mb-6">
                  Experience futuristic neural audio and spatial hardware in our catalog.
                </p>
                <button
                  onClick={() => {
                    sound.playClick();
                    setIsCartOpen(false);
                    navigate('/shop');
                  }}
                  className="px-4 py-2 bg-white text-slate-950 hover:bg-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Explore Innovations
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId || 'default'}`}
                  className="flex gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/5"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-18 h-18 object-cover rounded-lg bg-slate-900 border border-white/10 shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-semibold text-slate-100 truncate">{item.name}</h4>
                        <button
                          onClick={() => removeFromCart(item.productId, item.variantId)}
                          className="text-slate-500 hover:text-red-400 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {item.variantName && (
                        <p className="text-[11px] text-slate-400">{item.variantName}</p>
                      )}
                      <p className="text-xs font-mono text-cyan-400 font-medium tabular-nums mt-0.5">
                        ${item.price.toLocaleString()}
                      </p>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-white/10 rounded-lg bg-slate-900/50">
                        <button
                          onClick={() => updateQty(item.productId, item.variantId, item.quantity - 1)}
                          className="p-1 hover:text-cyan-400 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-mono tabular-nums text-slate-200">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.productId, item.variantId, item.quantity + 1)}
                          className="p-1 hover:text-cyan-400 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-[11px] text-slate-500 ml-auto font-mono tabular-nums">
                        Total: ${(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Calculations */}
          {items.length > 0 && (
            <div className="p-5 border-t border-white/10 bg-[#07080d]/90 space-y-4">
              {/* Coupon input */}
              <div>
                {coupon ? (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs">
                    <div className="flex items-center gap-2 text-emerald-400 font-mono">
                      <Check className="w-3.5 h-3.5" />
                      <span>Code applied: <strong>{coupon.code}</strong> (-${coupon.discountAmount})</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-slate-400 hover:text-white text-[11px] underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon code (try CYBER20)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 uppercase font-mono"
                    />
                    <button
                      type="submit"
                      disabled={isApplying}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors shrink-0 disabled:opacity-50"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponError && (
                  <p className="flex items-center gap-1 text-[11px] text-red-400 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{couponError}</span>
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums text-slate-200">${subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span>
                    <span className="font-mono tabular-nums">-${discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Insured Global Shipping</span>
                  <span className="text-emerald-400 font-medium">Free</span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-semibold text-white">
                  <span>Estimated Total</span>
                  <span className="font-mono text-cyan-400 tabular-nums">${total.toLocaleString()}</span>
                </div>
              </div>

              {/* Action */}
              <button
                onClick={handleCheckout}
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-cyan-500/20 cursor-pointer"
              >
                <span>Proceed to Secure Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
