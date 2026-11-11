import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.js';
import { useWishlist } from '../context/WishlistContext.js';
import { useAuth } from '../context/AuthContext.js';
import { sound } from '../utils/audio.js';
import { Product3DViewer } from '../components/3d/Product3DViewer.js';
import { Heart, Star, Shield, ArrowRight, Check, Sparkles, MessageSquare } from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();

  const [product, setProduct] = useState<any | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [related, setRelated] = useState<any[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Review form state
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.product) {
          setProduct(data.product);
          setReviews(data.reviews || []);
          setRelated(data.related || []);
          if (data.product.variants && data.product.variants.length > 0) {
            setSelectedVariant(data.product.variants[0]);
          }
        }
      })
      .catch(err => console.error('Error loading product details:', err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleVariantSelect = (v: any) => {
    sound.playClick();
    setSelectedVariant(v);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !product) return;
    const token = localStorage.getItem('aether_jwt_token');
    if (!token) {
      alert('Please sign in to submit a verified owner review.');
      return;
    }

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product.id,
          rating: newRating,
          title: newTitle || 'Verified Feedback',
          comment: newComment
        })
      });

      const resData = await res.json();
      if (res.ok && resData.review) {
        sound.playSuccess();
        setReviews([resData.review, ...reviews]);
        setProduct((prev: any) => ({ ...prev, rating: resData.rating, reviewCount: resData.reviewCount }));
        setNewComment('');
        setNewTitle('');
        setReviewSubmitted(true);
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 animate-pulse">
        <div className="h-96 rounded-2xl bg-white/[0.03] border border-white/5 mb-8" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white">Instrument not found</h2>
        <Link to="/shop" className="text-xs text-cyan-400 hover:underline mt-2 inline-block">
          Return to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb unboxed */}
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-8 font-mono">
        <Link to="/shop" className="hover:text-slate-300">Catalog</Link>
        <span aria-hidden="true">/</span>
        <span className="capitalize">{product.category}</span>
        <span aria-hidden="true">/</span>
        <span className="text-slate-300 truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main 2-Column Split: 3D Viewport on Left, Contiguous Purchase Module on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mb-20">
        {/* Left Column: 3D Interactive Viewer */}
        <div className="lg:col-span-7">
          <Product3DViewer
            modelType={product.modelType || 'headset'}
            initialColor={selectedVariant?.colorHex || '#1E293B'}
            variants={product.variants}
            onColorChange={(colorHex) => {
              const matched = product.variants?.find((v: any) => v.colorHex.toLowerCase() === colorHex.toLowerCase());
              if (matched) setSelectedVariant(matched);
            }}
            className="w-full h-[560px] shadow-2xl"
          />
        </div>

        {/* Right Column: Contiguous Purchase Module */}
        <div className="lg:col-span-5 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
                {product.category}
              </span>
              <button
                onClick={() => toggleWishlist(product)}
                className="p-2 rounded-full bg-slate-900/60 border border-white/10 text-white hover:text-cyan-400 transition-colors cursor-pointer"
                aria-label="Wishlist"
              >
                <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-cyan-400 text-cyan-400' : ''}`} />
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-display">
              {product.name}
            </h1>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Price & Rating */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tabular-nums">
                  ${product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="text-xs font-mono text-slate-500 line-through tabular-nums">
                    ${product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-emerald-400 font-medium">Free express courier included</p>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="font-bold text-white">{product.rating}</span>
              <span className="text-slate-500">({product.reviewCount} reviews)</span>
            </div>
          </div>

          {/* Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Select Specification / Finish</span>
                <span className="text-cyan-400 font-mono">{selectedVariant?.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {product.variants.map((v: any) => (
                  <button
                    key={v.id}
                    onClick={() => handleVariantSelect(v)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                      selectedVariant?.id === v.id
                        ? 'border-cyan-400 bg-cyan-950/20 text-white ring-1 ring-cyan-400/30'
                        : 'border-white/10 hover:border-white/20 bg-slate-900/50 text-slate-300'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                      style={{ backgroundColor: v.colorHex }}
                    />
                    <div className="truncate">
                      <p className="font-medium truncate">{v.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{v.finish}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Add to Cart Actions */}
          <div className="pt-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-white/10 rounded-xl bg-slate-900/60 p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-2.5 py-1 text-slate-400 hover:text-white"
                >
                  -
                </button>
                <span className="w-8 text-center text-xs font-mono font-bold text-white tabular-nums">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-2.5 py-1 text-slate-400 hover:text-white"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => addToCart(product, selectedVariant, quantity)}
                className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Add to Bag · ${(product.price * quantity).toLocaleString()}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <p className="text-center text-[11px] text-slate-500 font-mono">
              In Stock ({product.stock} units) · Ships within 24 hours from Zurich Vault
            </p>
          </div>
        </div>
      </div>

      {/* Technical Specifications Matrix */}
      {product.specs && Object.keys(product.specs).length > 0 && (
        <section className="mb-20 glass-panel p-8 rounded-3xl border border-white/10">
          <h2 className="text-lg font-bold text-white mb-6 font-display">Technical Caliber & Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(product.specs).map(([key, val]) => (
              <div key={key} className="border-b border-white/10 pb-3">
                <p className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">{key}</p>
                <p className="text-sm font-semibold text-white mt-0.5">{String(val)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Customer Reviews Section with Live Submission Form */}
      <section className="mb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-white font-display">Owner Impressions & Reviews</h2>
            <p className="text-xs text-slate-400 mt-1">
              Verified feedback from certified purchasers.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Reviews List */}
          <div className="lg:col-span-7 space-y-4">
            {reviews.length === 0 ? (
              <div className="glass-panel p-8 rounded-2xl border border-white/10 text-center text-slate-400 text-xs">
                No reviews yet. Be the first certified owner to leave an impression.
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white">{rev.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>
                  <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                    <span className="font-medium text-slate-200">{rev.userName}</span>
                    {rev.verifiedPurchase && (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Check className="w-3 h-3" />
                        <span>Verified Owner</span>
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Review Submission Form */}
          <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-white/10">
            <h3 className="text-sm font-bold text-white mb-1 font-display">Submit Owner Review</h3>
            <p className="text-xs text-slate-400 mb-4">Share your feedback regarding acoustic performance or craftsmanship.</p>

            {reviewSubmitted ? (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>Thank you. Your impression has been recorded into the permanent ledger.</span>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Rating</label>
                  <div className="flex gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewRating(star)}
                        className="p-1 cursor-pointer"
                      >
                        <Star className={`w-5 h-5 ${star <= newRating ? 'fill-current' : 'text-slate-700'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Headline</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Unbelievable spatial resolution"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Detailed Review</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe your acoustic testing or mechanical inspection..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Publish Impression
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="border-t border-white/10 pt-16">
          <h2 className="text-xl font-bold text-white mb-6 font-display">Complementary Instruments</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((p) => (
              <Link
                key={p.id}
                to={`/product/${p.slug || p.id}`}
                onClick={() => sound.playClick()}
                className="group glass-panel rounded-2xl border border-white/10 p-4 hover:border-cyan-500/40 transition-colors flex gap-4"
              >
                <img
                  src={p.image}
                  alt={p.name}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 object-cover rounded-xl bg-slate-900 border border-white/10 shrink-0"
                />
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">{p.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{p.tagline}</p>
                  <p className="text-xs font-mono font-bold text-cyan-400 mt-2 tabular-nums">${p.price.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
