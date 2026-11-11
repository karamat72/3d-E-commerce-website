import React from 'react';
import { Link } from 'react-router-dom';
import { sound } from '../../utils/audio.js';

export const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-[#06070a] text-slate-400 text-xs py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand info */}
          <div className="space-y-3">
            <Link to="/" onClick={() => sound.playClick()} className="inline-block text-lg font-bold tracking-wider text-white font-display">
              AETHER LABS
            </Link>
            <p className="text-slate-400 leading-relaxed text-xs max-w-xs">
              Pioneering quantum acoustic engineering, spatial computing, and physical neural interfaces for humanity's next era.
            </p>
          </div>

          {/* Catalog */}
          <div>
            <h4 className="font-semibold text-slate-200 mb-3 text-xs uppercase tracking-wider">Catalog</h4>
            <ul className="space-y-2">
              <li><Link to="/shop?category=audio" onClick={() => sound.playClick()} className="hover:text-cyan-400 transition-colors">Neural Audio Systems</Link></li>
              <li><Link to="/shop?category=wearables" onClick={() => sound.playClick()} className="hover:text-cyan-400 transition-colors">Spatial Wearables</Link></li>
              <li><Link to="/shop?category=drones" onClick={() => sound.playClick()} className="hover:text-cyan-400 transition-colors">Autonomous Recon Drones</Link></li>
              <li><Link to="/shop?category=computing" onClick={() => sound.playClick()} className="hover:text-cyan-400 transition-colors">Tactile Terminals</Link></li>
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h4 className="font-semibold text-slate-200 mb-3 text-xs uppercase tracking-wider">Customer & Portals</h4>
            <ul className="space-y-2">
              <li><Link to="/dashboard" onClick={() => sound.playClick()} className="hover:text-cyan-400 transition-colors">Customer Dashboard</Link></li>
              <li><Link to="/dashboard" onClick={() => sound.playClick()} className="hover:text-cyan-400 transition-colors">Order Tracking</Link></li>
              <li><Link to="/admin" onClick={() => sound.playClick()} className="hover:text-amber-400 transition-colors">Admin Console</Link></li>
              <li><Link to="/cart" onClick={() => sound.playClick()} className="hover:text-cyan-400 transition-colors">Express Checkout</Link></li>
            </ul>
          </div>

          {/* Precision Support */}
          <div>
            <h4 className="font-semibold text-slate-200 mb-3 text-xs uppercase tracking-wider">Engineering Guarantees</h4>
            <p className="leading-relaxed mb-3">
              Every Aether instrument is precision calibrated with lifetime firmware support and worldwide insured courier delivery.
            </p>
            <div className="text-[11px] text-slate-500 font-mono">
              Munich · Tokyo · San Francisco
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} AETHER Technologies, Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Charter</span>
            <span>·</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span>·</span>
            <span className="hover:text-slate-400 cursor-pointer">Hardware Warranty</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
