import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.js';
import { useWishlist } from '../context/WishlistContext.js';
import { sound } from '../utils/audio.js';
import { Product3DViewer } from '../components/3d/Product3DViewer.js';
import { ArrowRight, Sparkles, Shield, Cpu, Zap, Heart, Check, Star, Copy } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [products, setProducts] = useState<any[]>([]);
  const [selectedConfigFinish, setSelectedConfigFinish] = useState('#1E293B');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterCoupon, setNewsletterCoupon] = useState<string | null>(null);
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  useEffect(() => {
    fetch('/api/products?featured=true')
      .then(res => res.json())
      .then(data => {
        if (data.products) setProducts(data.products);
      })
      .catch(err => console.error('Failed to load featured products:', err));
  }, []);

  const heroProduct = products.find(p => p.id === 'prod_aether_x') || {
    id: 'prod_aether_x',
    name: 'AETHER-X Neural Headset',
    slug: 'aether-x-neural-headset',
    price: 899,
    modelType: 'headset',
    variants: [
      { id: 'v_titanium', name: 'Obsidian Titanium', colorHex: '#1E293B', finish: 'Brushed PVD' },
      { id: 'v_cyan', name: 'Cyber Cyan', colorHex: '#06B6D4', finish: 'Anodized Gloss' },
      { id: 'v_silver', name: 'Stellar Silver', colorHex: '#E2E8F0', finish: 'Satin Chrome' },
      { id: 'v_amber', name: 'Ionized Amber', colorHex: '#F59E0B', finish: 'Electro-Bronze' }
    ]
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    sound.playSuccess();
    setNewsletterCoupon('WELCOME10');
  };

  const copyCouponCode = () => {
    if (!newsletterCoupon) return;
    navigator.clipboard.writeText(newsletterCoupon);
    setCopiedCoupon(true);
    sound.playClick();
    setTimeout(() => setCopiedCoupon(false), 2500);
  };

  return (
    <div className="relative z-10 w-full overflow-hidden">
      {/* ---------------- 1. Cinematic Hero Section ---------------- */}
      <section className="relative min-h-[92vh] flex items-center justify-center pt-8 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-6 space-y-6 z-10">
            {/* Clean unboxed kicker */}
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <span>Flagship Acoustic Engineering</span>
              <span aria-hidden="true">·</span>
              <span>2026 Edition</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-display leading-[1.08] text-balance">
              Zero-Latency Neural Acoustic Precision.
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl">
              Constructed from grade-5 spring titanium and acoustic beryllium cavities. AETHER-X maps sound directly to neural pathways with zero perceptible latency.
            </p>

            {/* Spec strip */}
            <div className="grid grid-cols-3 gap-4 pt-2 border-y border-white/10 py-4 max-w-lg">
              <div>
                <p className="text-[11px] text-slate-400 uppercase tracking-wider">Acoustic Range</p>
                <p className="text-lg font-bold font-mono text-white tabular-nums">2 Hz – 52 kHz</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 uppercase tracking-wider">Transducer</p>
                <p className="text-lg font-bold font-mono text-white">50mm Beryllium</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 uppercase tracking-wider">Synaptic Lag</p>
                <p className="text-lg font-bold font-mono text-cyan-400 tabular-nums">0.2 ms</p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to={`/product/${heroProduct.slug || heroProduct.id}`}
                onClick={() => sound.playClick()}
                className="px-6 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer"
              >
                <span>Order AETHER-X · $899</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#architecture"
                onClick={() => sound.playWhoosh()}
                className="px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white font-semibold text-sm rounded-xl border border-white/10 transition-colors cursor-pointer"
              >
                3D Exploded Anatomy
              </a>
            </div>
          </div>

          {/* Right Column: Interactive 3D Hero Viewport */}
          <div className="lg:col-span-6 z-10">
            <div className="relative">
              <Product3DViewer
                modelType="headset"
                initialColor={selectedConfigFinish}
                variants={heroProduct.variants}
                onColorChange={(color) => setSelectedConfigFinish(color)}
                className="w-full h-[520px] shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 2. Architectural 3D Disassembly Showcase ---------------- */}
      <section id="architecture" className="relative py-24 border-t border-white/10 bg-[#07080e]/95 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">Architectural Disassembly</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2 font-display">
              Sub-Millimeter Structural Breakdown
            </h2>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              Every mechanical component is CNC-milled to 5-micron tolerance. Scroll or adjust the 3D controls to inspect inner transducer resonance chambers.
            </p>
          </div>

          {/* 4 Architectural Step Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-cyan-500/40 transition-colors">
              <span className="text-xs font-mono text-cyan-400 block mb-2">01. Chassis</span>
              <h3 className="text-base font-semibold text-white mb-2 font-display">Grade-5 Titanium Arch</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Seamless aerospace titanium spring band calibrated for uniform clamp pressure without ear fatigue over 12-hour continuous listening sessions.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-cyan-500/40 transition-colors">
              <span className="text-xs font-mono text-cyan-400 block mb-2">02. Computation</span>
              <h3 className="text-base font-semibold text-white mb-2 font-display">Neural DSP Processor</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                64-bit floating point hardware coprocessor running real-time 384kHz biometric phase correction and spatial room acoustic emulation.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-cyan-500/40 transition-colors">
              <span className="text-xs font-mono text-cyan-400 block mb-2">03. Transducer</span>
              <h3 className="text-base font-semibold text-white mb-2 font-display">Planar Beryllium Core</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                50mm laser-etched diaphragm suspended between double-sided push-pull neodymium magnets, delivering unprecedented transient response.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-cyan-500/40 transition-colors">
              <span className="text-xs font-mono text-cyan-400 block mb-2">04. Isolation</span>
              <h3 className="text-base font-semibold text-white mb-2 font-display">Bio-Adaptive Seal</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Magnetic memory foam encased in breathable antimicrobial protein leather with micro-perforations to eliminate low-frequency pressure buildup.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 3. Featured Flagship Products Grid ---------------- */}
      <section className="relative py-24 border-t border-white/10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">Current Collection</span>
              <h2 className="text-3xl font-bold text-white mt-1 font-display">Featured Innovations</h2>
            </div>
            <Link
              to="/shop"
              onClick={() => sound.playClick()}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group"
            >
              <span>View Complete Catalog ({products.length} instruments)</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="group glass-panel rounded-2xl border border-white/10 hover:border-cyan-500/30 overflow-hidden transition-all duration-300 flex flex-col"
              >
                {/* Image Container with Wishlist Trigger */}
                <div className="relative aspect-4/3 bg-slate-950 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <button
                    onClick={() => toggleWishlist(product)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/70 backdrop-blur-md border border-white/10 text-white hover:text-cyan-400 transition-colors cursor-pointer"
                  >
                    <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-cyan-400 text-cyan-400' : ''}`} />
                  </button>
                  <span className="absolute bottom-3 left-3 text-[10px] font-mono uppercase bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded text-slate-300 border border-white/5">
                    {product.category}
                  </span>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white font-display group-hover:text-cyan-300 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {product.tagline || product.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold font-mono text-white tabular-nums">
                        ${product.price.toLocaleString()}
                      </p>
                      {product.originalPrice && (
                        <p className="text-[11px] font-mono text-slate-500 line-through tabular-nums">
                          ${product.originalPrice.toLocaleString()}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/product/${product.slug || product.id}`}
                        onClick={() => sound.playClick()}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                      >
                        Inspect 3D
                      </Link>
                      <button
                        onClick={() => addToCart(product, product.variants?.[0])}
                        className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Add to Bag
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- 4. Customer Reviews & Accolades ---------------- */}
      <section className="relative py-20 border-t border-white/10 bg-[#06070a] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">Master Acousticians & Creators</span>
            <h2 className="text-3xl font-bold text-white mt-1 font-display">Verified Impressions</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                "The 3D exploded viewer convinced me of the mechanical caliber, but holding the actual titanium unit in Munich was astonishing. Sub-bass definition is unmatched."
              </p>
              <div className="text-xs">
                <p className="font-semibold text-white">Elena Rostova</p>
                <p className="text-slate-500 text-[11px]">Mastering Engineer, Berlin Studio 4</p>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                "The CHRONO-PULSE floating volumetric projection turns heads everywhere. The build quality rivals Swiss mechanical manufacture at half the expected price."
              </p>
              <div className="text-xs">
                <p className="font-semibold text-white">Kenji Takahashi</p>
                <p className="text-slate-500 text-[11px]">Spatial Architect, Tokyo Design Lab</p>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                "NEXUS Recon drone LiDAR scanning is game changing for cinematic set design. Zero latency transmission over 10km was flawless in alpine conditions."
              </p>
              <div className="text-xs">
                <p className="font-semibold text-white">Marcus Sterling</p>
                <p className="text-slate-500 text-[11px]">Cinematographer, Redline Studios</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 5. Newsletter with Instant Coupon Reward ---------------- */}
      <section className="relative py-16 border-t border-white/10 bg-gradient-to-b from-[#090b12] to-[#06070a] px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto glass-panel p-8 sm:p-12 rounded-3xl border border-white/10 text-center">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">Exclusive Insider Allocation</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1 font-display">
            Join the Aether Dispatch
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mt-2 mb-6">
            Receive private prototype release allocations and get an instant $50 welcome discount applied to your first instrument.
          </p>

          {newsletterCoupon ? (
            <div className="max-w-md mx-auto p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-between">
              <div className="text-left">
                <p className="text-[11px] text-cyan-300 font-mono">Welcome Code Unlocked:</p>
                <p className="text-base font-bold text-white font-mono">{newsletterCoupon}</p>
              </div>
              <button
                onClick={copyCouponCode}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                {copiedCoupon ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCoupon ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                placeholder="Enter email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 bg-slate-900/80 border border-white/15 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shrink-0 shadow-lg shadow-cyan-500/20 cursor-pointer"
              >
                Claim $50 Code
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
