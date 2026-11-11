import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { sound } from '../utils/audio.js';
import { CheckCircle2, Package, Truck, ArrowRight, Printer, Sparkles } from 'lucide-react';

export const OrderConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('aether_jwt_token');
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`/api/orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.order) setOrder(data.order);
      })
      .catch(err => console.error('Error fetching order:', err))
      .finally(() => setLoading(false));
  }, [id]);

  const stages = [
    { title: 'Order Placed', desc: 'Authorized' },
    { title: 'Neural Assembly', desc: 'Precision CNC' },
    { title: 'Quality Check', desc: 'Acoustic Calibrated' },
    { title: 'Shipped', desc: 'In Courier Transit' },
    { title: 'Delivered', desc: 'Confirmed Arrival' }
  ];

  const currentStageIndex = 1; // Neural Assembly

  return (
    <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4 text-cyan-400">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">Order Authorized & Confirmed</span>
        <h1 className="text-3xl font-bold text-white mt-1 font-display">
          Welcome to the Aether Pantheon.
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md mx-auto">
          Your instrument allocation has been etched to the quantum manufacturing ledger.
        </p>
      </div>

      {/* Main Order Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-8">
        {/* Order Meta Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10 text-xs">
          <div>
            <p className="text-slate-400">Order Reference</p>
            <p className="font-mono font-bold text-white text-sm mt-0.5">{order?.orderNumber || id}</p>
          </div>
          <div>
            <p className="text-slate-400">Insured Tracking Number</p>
            <p className="font-mono font-bold text-cyan-400 text-sm mt-0.5">
              {order?.trackingNumber || 'AETH-TRK-9812402'}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Estimated Dispatch</p>
            <p className="font-mono text-slate-200 mt-0.5">Within 24 Hours</p>
          </div>
          <div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
          </div>
        </div>

        {/* 5-Stage Live Visualizer */}
        <div>
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4 font-mono">
            Manufacturing & Logistics Progression
          </h3>
          <div className="grid grid-cols-5 gap-2 text-center">
            {stages.map((st, i) => {
              const isPast = i < currentStageIndex;
              const isCurrent = i === currentStageIndex;
              return (
                <div key={st.title} className="space-y-2">
                  <div
                    className={`h-1.5 rounded-full transition-colors ${
                      isPast || isCurrent ? 'bg-cyan-400' : 'bg-slate-800'
                    }`}
                  />
                  <p className={`text-[11px] font-bold ${isCurrent ? 'text-cyan-400' : 'text-slate-300'}`}>
                    {st.title}
                  </p>
                  <p className="text-[10px] text-slate-500 hidden sm:block">{st.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Itemized Order list */}
        {order?.items && (
          <div className="space-y-3 pt-4 border-t border-white/10">
            <h4 className="text-xs font-semibold text-white font-mono uppercase tracking-wider">Allocation Items</h4>
            {order.items.map((it: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-xs py-2 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <img src={it.image} alt={it.name} className="w-10 h-10 object-cover rounded-lg bg-slate-900 border border-white/10" />
                  <div>
                    <p className="font-semibold text-white">{it.name}</p>
                    <p className="text-[11px] text-slate-400">Qty: {it.quantity}</p>
                  </div>
                </div>
                <p className="font-mono text-white tabular-nums">${(it.price * it.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}

        {/* Financial Summary */}
        <div className="pt-4 border-t border-white/10 flex justify-between items-center text-sm font-bold text-white">
          <span>Settlement Authorized (Paid)</span>
          <span className="font-mono text-cyan-400 tabular-nums">${order?.total?.toLocaleString() || '---'}</span>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <Link
            to="/dashboard"
            onClick={() => sound.playClick()}
            className="w-full sm:w-auto px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-colors text-center cursor-pointer"
          >
            Track in Customer Dashboard
          </Link>
          <Link
            to="/shop"
            onClick={() => sound.playClick()}
            className="w-full sm:w-auto px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white text-xs font-medium rounded-xl transition-colors text-center cursor-pointer"
          >
            Continue Browsing Catalog
          </Link>
        </div>
      </div>
    </div>
  );
};
