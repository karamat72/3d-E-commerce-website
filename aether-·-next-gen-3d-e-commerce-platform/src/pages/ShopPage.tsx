import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.js';
import { useWishlist } from '../context/WishlistContext.js';
import { sound } from '../utils/audio.js';
import { Product3DViewer } from '../components/3d/Product3DViewer.js';
import { Search, Filter, Heart, ArrowUpDown, X, Star } from 'lucide-react';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [sort, setSort] = useState('newest');
  const [previewProduct, setPreviewProduct] = useState<any | null>(null);

  const categories = [
    { id: 'all', label: 'All Instruments' },
    { id: 'audio', label: 'Neural Audio' },
    { id: 'wearables', label: 'Spatial Horology' },
    { id: 'drones', label: 'Recon Drones' },
    { id: 'computing', label: 'Terminals' },
    { id: 'accessories', label: 'Accessories' }
  ];

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== 'all') params.set('category', category);
    if (searchTerm) params.set('search', searchTerm);
    if (sort) params.set('sort', sort);

    fetch(`/api/products?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data.products) setProducts(data.products);
      })
      .catch(err => console.error('Error fetching catalog:', err))
      .finally(() => setLoading(false));
  }, [category, searchTerm, sort]);

  // Open customizer modal if query param is set
  useEffect(() => {
    if (searchParams.get('customizer') === 'true' && products.length > 0) {
      setPreviewProduct(products[0]);
    }
  }, [searchParams, products]);

  const handleCategorySelect = (catId: string) => {
    sound.playClick();
    setCategory(catId);
    const next = new URLSearchParams(searchParams);
    if (catId === 'all') next.delete('category');
    else next.set('category', catId);
    setSearchParams(next);
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Title */}
      <div className="mb-8">
        <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">Precision Hardware</span>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mt-1 font-display">Aether Instrument Catalog</h1>
        <p className="text-slate-400 text-sm mt-2 max-w-2xl">
          Browse revolutionary neuro-acoustic hardware, holographic spatial timepieces, and aerospace reconnaissance instruments.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Segmented Tabs (Functional Buttons, No Pills) */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                category === cat.id
                  ? 'bg-white text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search box */}
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search specifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={sort}
              onChange={(e) => {
                sound.playClick();
                setSort(e.target.value);
              }}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="newest" className="bg-slate-900">Newest</option>
              <option value="price-low" className="bg-slate-900">Price: Low to High</option>
              <option value="price-high" className="bg-slate-900">Price: High to Low</option>
              <option value="rating" className="bg-slate-900">Top Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 rounded-2xl bg-white/[0.03] animate-pulse border border-white/5" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl border border-white/10">
          <p className="text-slate-300 font-medium text-sm">No instruments matched your criteria.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setCategory('all');
            }}
            className="mt-3 text-xs text-cyan-400 hover:underline cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="group glass-panel rounded-2xl border border-white/10 hover:border-cyan-500/30 overflow-hidden transition-all duration-300 flex flex-col"
            >
              {/* Product Visual */}
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
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded text-slate-300 border border-white/5">
                    {product.category}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-mono bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded text-amber-400 border border-white/5">
                    <Star className="w-2.5 h-2.5 fill-current" />
                    <span>{product.rating}</span>
                  </span>
                </div>
              </div>

              {/* Information */}
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
                    <p className="text-[10px] text-slate-500 font-mono">
                      {product.stock > 0 ? `${product.stock} units available` : 'Backorder'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        sound.playWhoosh();
                        setPreviewProduct(product);
                      }}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                    >
                      3D View
                    </button>
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
      )}

      {/* 3D Quick-Inspect Modal */}
      {previewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-4xl bg-[#090b12] rounded-3xl border border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#07080d]">
              <div>
                <h3 className="text-base font-bold text-white font-display">{previewProduct.name}</h3>
                <p className="text-xs text-slate-400">Interactive 360° Inspection & Exploded View</p>
              </div>
              <button
                onClick={() => setPreviewProduct(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal 3D Body */}
            <div className="p-6 flex-1 overflow-y-auto">
              <Product3DViewer
                modelType={previewProduct.modelType || 'headset'}
                variants={previewProduct.variants}
                className="w-full h-[460px]"
              />

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
                <div>
                  <p className="text-lg font-bold font-mono text-white tabular-nums">
                    ${previewProduct.price.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-400">Includes global insured courier and titanium serial plate</p>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    to={`/product/${previewProduct.slug || previewProduct.id}`}
                    onClick={() => {
                      sound.playClick();
                      setPreviewProduct(null);
                    }}
                    className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white text-xs font-medium rounded-xl transition-colors"
                  >
                    Full Technical Specs
                  </Link>
                  <button
                    onClick={() => {
                      addToCart(previewProduct, previewProduct.variants?.[0]);
                      setPreviewProduct(null);
                    }}
                    className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-lg shadow-cyan-500/20 cursor-pointer"
                  >
                    Add to Bag
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
