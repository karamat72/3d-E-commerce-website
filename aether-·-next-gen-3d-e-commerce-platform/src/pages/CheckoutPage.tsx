import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { sound } from '../utils/audio.js';
import confetti from 'canvas-confetti';
import { ShieldCheck, CreditCard, Cpu, Coins, Lock, CheckCircle, ArrowRight } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { items, subtotal, discount, total, coupon, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [recipient, setRecipient] = useState(user?.name || 'Alex Vance');
  const [email, setEmail] = useState(user?.email || 'alex@aether.luxury');
  const [street, setStreet] = useState('742 Cybernetic Way, Suite 400');
  const [city, setCity] = useState('San Francisco');
  const [state, setState] = useState('CA');
  const [zip, setZip] = useState('94107');
  const [country, setCountry] = useState('United States');

  const [shippingMethod, setShippingMethod] = useState<'standard' | 'hyperloop'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'neural_pay' | 'credit_card' | 'crypto'>('neural_pay');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const shippingCost = shippingMethod === 'hyperloop' ? 35 : 0;
  const finalTotal = total + shippingCost;

  if (items.length === 0) {
    return (
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white">Your shopping bag is empty</h2>
        <button
          onClick={() => navigate('/shop')}
          className="mt-4 text-xs text-cyan-400 hover:underline cursor-pointer"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('aether_jwt_token');
      // If user isn't logged in, login or send order with demo user
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        // Fallback: use customer demo login for seamless checkout
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'alex_vance', password: 'alex1234' })
        });
        const loginData = await loginRes.json();
        if (loginData.token) {
          localStorage.setItem('aether_jwt_token', loginData.token);
          headers['Authorization'] = `Bearer ${loginData.token}`;
        }
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          items,
          shippingAddress: {
            recipient,
            street,
            city,
            state,
            zip,
            country
          },
          paymentMethod,
          couponCode: coupon?.code
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to authorize transaction');
      }

      // Order created successfully!
      sound.playSuccess();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      clearCart();
      navigate(`/order-confirmation/${data.order.id || data.order.orderNumber}`);
    } catch (err: any) {
      setError(err.message || 'Payment simulation failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">Secure Protocol</span>
        <h1 className="text-3xl font-bold text-white mt-1 font-display">Settlement & Delivery</h1>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Delivery & Payment Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Shipping Address */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
            <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
              <span>01. Delivery Coordinates</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Confirmation Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] text-slate-400 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">State / Prov</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Courier Speed */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
            <h2 className="text-base font-bold text-white font-display">02. Logistics Priority</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                onClick={() => setShippingMethod('standard')}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  shippingMethod === 'standard'
                    ? 'border-cyan-400 bg-cyan-950/20 text-white'
                    : 'border-white/10 bg-slate-900/50 text-slate-300'
                }`}
              >
                <div>
                  <p className="text-xs font-bold">Standard Insured Courier</p>
                  <p className="text-[11px] text-slate-400">2–4 business days · Tracking included</p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">FREE</span>
              </label>

              <label
                onClick={() => setShippingMethod('hyperloop')}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  shippingMethod === 'hyperloop'
                    ? 'border-cyan-400 bg-cyan-950/20 text-white'
                    : 'border-white/10 bg-slate-900/50 text-slate-300'
                }`}
              >
                <div>
                  <p className="text-xs font-bold">Sub-Orbital HyperLoop</p>
                  <p className="text-[11px] text-slate-400">Next-morning guaranteed delivery</p>
                </div>
                <span className="text-xs font-mono font-bold text-white">+$35</span>
              </label>
            </div>
          </div>

          {/* 3. Payment Gateway (Test Mode clearly labelled) */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white font-display">03. Settlement Method</h2>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded">
                Test Sandbox Active
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('neural_pay')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  paymentMethod === 'neural_pay'
                    ? 'border-cyan-400 bg-cyan-950/30 text-white ring-1 ring-cyan-400/40'
                    : 'border-white/10 bg-slate-900/40 text-slate-400 hover:text-white'
                }`}
              >
                <Cpu className="w-5 h-5 text-cyan-400" />
                <span className="text-[11px] font-semibold">NeuralPay 1-Click</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('credit_card')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  paymentMethod === 'credit_card'
                    ? 'border-cyan-400 bg-cyan-950/30 text-white ring-1 ring-cyan-400/40'
                    : 'border-white/10 bg-slate-900/40 text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-5 h-5 text-amber-400" />
                <span className="text-[11px] font-semibold">Test Credit Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('crypto')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  paymentMethod === 'crypto'
                    ? 'border-cyan-400 bg-cyan-950/30 text-white ring-1 ring-cyan-400/40'
                    : 'border-white/10 bg-slate-900/40 text-slate-400 hover:text-white'
                }`}
              >
                <Coins className="w-5 h-5 text-purple-400" />
                <span className="text-[11px] font-semibold">Web3 Crypto</span>
              </button>
            </div>

            {paymentMethod === 'credit_card' && (
              <div className="p-4 rounded-xl bg-slate-900/70 border border-white/5 space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Simulated Card Number</label>
                  <input
                    type="text"
                    disabled
                    value="•••• •••• •••• 4242 (Test Authorized)"
                    className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-slate-300 font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Expiry</label>
                    <input
                      type="text"
                      disabled
                      value="12/28"
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">CVV</label>
                    <input
                      type="text"
                      disabled
                      value="888"
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-slate-300 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'crypto' && (
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs space-y-1">
                <p className="font-semibold text-purple-300">Test Web3 Gateway Connected</p>
                <p className="text-[11px] text-slate-400 font-mono">Simulating instantaneous smart contract settlement on Ethereum mainnet.</p>
              </div>
            )}

            {paymentMethod === 'neural_pay' && (
              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs space-y-1">
                <p className="font-semibold text-cyan-300">Biometric Neural Authenticator Verified</p>
                <p className="text-[11px] text-slate-400">Direct synaptic authorization simulated with encrypted biometric tokens.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary & Placement */}
        <div className="lg:col-span-5 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <h2 className="text-base font-bold text-white font-display">Order Summary</h2>

          {/* Item Thumbnails */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={`${item.productId}-${item.variantId || 'default'}`} className="flex items-center gap-3 text-xs">
                <img
                  src={item.image}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 object-cover rounded-lg bg-slate-900 border border-white/10 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{item.name}</p>
                  <p className="text-[11px] text-slate-400">Qty: {item.quantity}</p>
                </div>
                <p className="font-mono text-slate-200 tabular-nums">
                  ${(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* Breakdown */}
          <div className="space-y-2 text-xs border-y border-white/10 py-4">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span className="font-mono text-slate-200 tabular-nums">${subtotal.toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Coupon ({coupon?.code})</span>
                <span className="font-mono tabular-nums">-${discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400">
              <span>Delivery Method</span>
              <span className="font-mono text-slate-200 tabular-nums">
                {shippingCost === 0 ? 'Free' : `$${shippingCost}`}
              </span>
            </div>
            <div className="pt-2 border-t border-white/5 flex justify-between text-base font-bold text-white">
              <span>Total Settlement</span>
              <span className="font-mono text-cyan-400 tabular-nums">${finalTotal.toLocaleString()}</span>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-950/30 border border-red-500/30 p-2.5 rounded-xl">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Broadcasting Order to Quantum Ledger...</span>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Confirm & Place Order · ${finalTotal.toLocaleString()}</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>256-Bit Encrypted Quantum Transaction Channel</span>
          </div>
        </div>
      </form>
    </div>
  );
};
