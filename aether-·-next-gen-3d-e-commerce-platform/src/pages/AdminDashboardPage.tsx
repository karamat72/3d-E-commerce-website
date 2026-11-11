import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { sound } from '../utils/audio.js';
import {
  Shield, DollarSign, ShoppingCart, Users, Box, TrendingUp,
  Plus, Edit, Trash2, CheckCircle, AlertCircle, RefreshCw, Key,
  Lock, Ban, ArrowUpRight, Search, FileText
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user, token, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'customers' | 'coupons' | 'security'>('overview');
  const [stats, setStats] = useState<any | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Product modal state
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [prodFormName, setProdFormName] = useState('');
  const [prodFormCategory, setProdFormCategory] = useState<'audio' | 'wearables' | 'drones' | 'computing' | 'accessories'>('audio');
  const [prodFormPrice, setProdFormPrice] = useState('');
  const [prodFormStock, setProdFormStock] = useState('15');
  const [prodFormTagline, setProdFormTagline] = useState('');
  const [prodFormDesc, setProdFormDesc] = useState('');
  const [prodFormModelType, setProdFormModelType] = useState('headset');

  // Coupon modal state
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponAmount, setNewCouponAmount] = useState('20');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed'>('percentage');

  // Change Admin Password state
  const [currAdminPass, setCurrAdminPass] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [adminPassMsg, setAdminPassMsg] = useState<{ text: string; error: boolean } | null>(null);

  // Status message
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const notify = (msg: string) => {
    setActionMsg(msg);
    sound.playSuccess();
    setTimeout(() => setActionMsg(null), 3000);
  };

  useEffect(() => {
    if (!token) {
      navigate('/login?redirect=admin');
      return;
    }
    if (user && !isAdmin) {
      navigate('/dashboard');
      return;
    }
    loadAdminData();
  }, [token, user, isAdmin, navigate]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, prodsRes, ordsRes, custsRes, coupsRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/products', { headers }),
        fetch('/api/orders', { headers }),
        fetch('/api/customers', { headers }),
        fetch('/api/coupons', { headers })
      ]);

      const [statsData, prodsData, ordsData, custsData, coupsData] = await Promise.all([
        statsRes.json(),
        prodsRes.json(),
        ordsRes.json(),
        custsRes.json(),
        coupsRes.json()
      ]);

      if (statsData) setStats(statsData);
      if (prodsData.products) setProducts(prodsData.products);
      if (ordsData.orders) setOrders(ordsData.orders);
      if (custsData.customers) setCustomers(custsData.customers);
      if (coupsData.coupons) setCoupons(coupsData.coupons);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  // ORDER MANAGEMENT
  const handleOrderStatusUpdate = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ orderStatus: status })
      });
      if (res.ok) {
        notify(`Order status transitioned to ${status}`);
        loadAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOrderRefund = async (orderId: string) => {
    if (!confirm('Are you sure you want to authorize a full refund for this order?')) return;
    try {
      const res = await fetch(`/api/orders/${orderId}/refund`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        notify('Order marked as refunded and status updated.');
        loadAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // CUSTOMER MANAGEMENT
  const handleToggleCustomerStatus = async (custId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/customers/${custId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      if (res.ok) {
        notify(`Customer account ${!currentStatus ? 'activated' : 'suspended'}`);
        loadAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // PRODUCT MANAGEMENT
  const openNewProductModal = () => {
    sound.playClick();
    setEditingProduct(null);
    setProdFormName('');
    setProdFormCategory('audio');
    setProdFormPrice('799');
    setProdFormStock('20');
    setProdFormTagline('');
    setProdFormDesc('');
    setProdFormModelType('headset');
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (p: any) => {
    sound.playClick();
    setEditingProduct(p);
    setProdFormName(p.name);
    setProdFormCategory(p.category);
    setProdFormPrice(String(p.price));
    setProdFormStock(String(p.stock));
    setProdFormTagline(p.tagline || '');
    setProdFormDesc(p.description || '');
    setProdFormModelType(p.modelType || 'headset');
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: prodFormName,
      category: prodFormCategory,
      price: Number(prodFormPrice),
      stock: Number(prodFormStock),
      tagline: prodFormTagline,
      description: prodFormDesc,
      modelType: prodFormModelType,
      image: editingProduct?.image || '/src/assets/images/hero_neural_headset_1794404342271.jpg'
    };

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsProductModalOpen(false);
        notify(editingProduct ? 'Instrument updated in catalog' : 'New instrument added to ledger');
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (pId: string) => {
    if (!confirm('Are you certain you wish to delete this instrument?')) return;
    try {
      const res = await fetch(`/api/products/${pId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        notify('Instrument removed from catalog');
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // COUPON CREATION
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode) return;
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          code: newCouponCode,
          amount: Number(newCouponAmount),
          type: newCouponType,
          minOrderValue: 100
        })
      });
      if (res.ok) {
        notify(`Coupon ${newCouponCode.toUpperCase()} activated`);
        setNewCouponCode('');
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCoupon = async (cId: string) => {
    try {
      const res = await fetch(`/api/coupons/${cId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        notify('Coupon deactivated');
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // CHANGE ADMIN PASSWORD
  const handleChangeAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newAdminPass.length < 6) {
      setAdminPassMsg({ text: 'New password must be at least 6 characters', error: true });
      return;
    }
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword: currAdminPass, newPassword: newAdminPass })
      });
      const data = await res.json();
      if (!res.ok) {
        setAdminPassMsg({ text: data.error || 'Failed to update credentials', error: true });
      } else {
        setAdminPassMsg({ text: 'Master admin password successfully updated in database hash', error: false });
        setCurrAdminPass('');
        setNewAdminPass('');
        sound.playSuccess();
      }
    } catch {
      setAdminPassMsg({ text: 'Connection failed', error: true });
    }
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Banner & Security Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold">
                Classified Command
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">
                Root Access
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">AETHER Administration Console</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadAdminData()}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 border border-white/10 text-slate-300 hover:text-white rounded-xl text-xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync DB</span>
          </button>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 rounded-xl text-xs font-medium transition-colors cursor-pointer"
          >
            Exit Console
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className="mb-6 p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Main Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Tabs */}
        <div className="lg:col-span-3 glass-panel p-3 rounded-2xl border border-white/10 space-y-1">
          <button
            onClick={() => { sound.playClick(); setActiveTab('overview'); }}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Analytics & Overview</span>
          </button>

          <button
            onClick={() => { sound.playClick(); setActiveTab('products'); }}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
              activeTab === 'products'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Box className="w-4 h-4" />
            <span>Inventory ({products.length})</span>
          </button>

          <button
            onClick={() => { sound.playClick(); setActiveTab('orders'); }}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Orders & Fulfillment ({orders.length})</span>
          </button>

          <button
            onClick={() => { sound.playClick(); setActiveTab('customers'); }}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
              activeTab === 'customers'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Registered Owners ({customers.length})</span>
          </button>

          <button
            onClick={() => { sound.playClick(); setActiveTab('coupons'); }}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
              activeTab === 'coupons'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Promotional Coupons</span>
          </button>

          <button
            onClick={() => { sound.playClick(); setActiveTab('security'); }}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
              activeTab === 'security'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Admin Credentials</span>
          </button>
        </div>

        {/* Tab Panels */}
        <div className="lg:col-span-9">
          {/* 1. OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="glass-panel p-5 rounded-2xl border border-white/10">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">Gross Revenue</p>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-cyan-400 mt-1 tabular-nums">
                    ${stats?.totalRevenue ? stats.totalRevenue.toLocaleString() : '---'}
                  </p>
                  <span className="text-[10px] text-emerald-400 font-medium">Real-time DB settlements</span>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-white/10">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">Total Orders</p>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-white mt-1 tabular-nums">
                    {stats?.totalOrders ?? '---'}
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono">{stats?.pendingOrders ?? 0} in manufacturing</span>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-white/10">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">Active Owners</p>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-white mt-1 tabular-nums">
                    {stats?.totalCustomers ?? '---'}
                  </p>
                  <span className="text-[10px] text-cyan-400 font-mono">Verified clients</span>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-white/10">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">Catalog Items</p>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-white mt-1 tabular-nums">
                    {stats?.totalProducts ?? '---'}
                  </p>
                  <span className="text-[10px] text-amber-400 font-mono">3D Models Loaded</span>
                </div>
              </div>

              {/* Monthly Sales Analytics Chart (Clean SVG visualizer) */}
              <div className="glass-panel p-6 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white font-display">Revenue Velocity (6 Months)</h3>
                  <span className="text-xs font-mono text-slate-400">Values in USD</span>
                </div>

                <div className="h-44 flex items-end justify-between gap-4 pt-4 border-b border-white/10">
                  {stats?.monthlyData && Object.entries(stats.monthlyData).map(([month, val]: any) => {
                    const maxVal = 45000;
                    const heightPct = Math.min(100, Math.max(15, (val / maxVal) * 100));
                    return (
                      <div key={month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                        <span className="text-[10px] font-mono text-cyan-400 tabular-nums">
                          ${(val / 1000).toFixed(1)}k
                        </span>
                        <div
                          style={{ height: `${heightPct}%` }}
                          className="w-full max-w-[42px] bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-lg transition-all"
                        />
                        <span className="text-xs font-mono text-slate-400">{month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Breakdown & Recent Activity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-2xl border border-white/10">
                  <h3 className="text-sm font-bold text-white font-display mb-4">Fulfillment Pipeline</h3>
                  <div className="space-y-3 text-xs">
                    {stats?.statusCounts && Object.entries(stats.statusCounts).map(([status, count]: any) => (
                      <div key={status} className="flex items-center justify-between py-1.5 border-b border-white/5">
                        <span className="text-slate-300">{status}</span>
                        <span className="font-mono font-bold text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-white/5 tabular-nums">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-white/10">
                  <h3 className="text-sm font-bold text-white font-display mb-4">Recent Allocations</h3>
                  <div className="space-y-3 text-xs">
                    {orders.slice(0, 4).map((o) => (
                      <div key={o.id} className="flex items-center justify-between py-1.5 border-b border-white/5">
                        <div>
                          <p className="font-bold text-white">{o.orderNumber}</p>
                          <p className="text-[10px] text-slate-400">{o.customerName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-cyan-400 font-bold">${o.total.toLocaleString()}</p>
                          <p className="text-[10px] text-slate-500">{o.orderStatus}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. PRODUCTS TAB (CRUD) */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white font-display">Instrument Inventory</h3>
                <button
                  onClick={openNewProductModal}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Instrument</span>
                </button>
              </div>

              <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900/60 border-b border-white/10 text-slate-400 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="p-3.5">Instrument</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Price</th>
                      <th className="p-3.5">Stock</th>
                      <th className="p-3.5">Model</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-white/[0.02]">
                        <td className="p-3.5 flex items-center gap-3">
                          <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg bg-slate-900 border border-white/10 shrink-0" />
                          <div>
                            <p className="font-semibold text-white">{p.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{p.slug}</p>
                          </div>
                        </td>
                        <td className="p-3.5 uppercase font-mono text-slate-300">{p.category}</td>
                        <td className="p-3.5 font-mono font-bold text-cyan-400 tabular-nums">${p.price.toLocaleString()}</td>
                        <td className="p-3.5 font-mono tabular-nums">
                          <span className={p.stock < 5 ? 'text-red-400 font-bold' : 'text-slate-300'}>
                            {p.stock} units
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-amber-300">{p.modelType}</td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => openEditProductModal(p)}
                            className="p-1.5 text-slate-400 hover:text-white transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white font-display">All Customer Orders ({orders.length})</h3>

              <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900/60 border-b border-white/10 text-slate-400 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="p-3.5">Order</th>
                      <th className="p-3.5">Customer</th>
                      <th className="p-3.5">Total</th>
                      <th className="p-3.5">Status Transition</th>
                      <th className="p-3.5 text-right">Refund</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-white/[0.02]">
                        <td className="p-3.5">
                          <p className="font-mono font-bold text-white">{o.orderNumber}</p>
                          <p className="text-[10px] text-slate-500">{new Date(o.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="p-3.5">
                          <p className="font-semibold text-slate-200">{o.customerName}</p>
                          <p className="text-[10px] text-slate-400">{o.customerEmail}</p>
                        </td>
                        <td className="p-3.5 font-mono text-cyan-400 font-bold tabular-nums">
                          ${o.total.toLocaleString()}
                        </td>
                        <td className="p-3.5">
                          <select
                            value={o.orderStatus}
                            onChange={(e) => handleOrderStatusUpdate(o.id, e.target.value)}
                            className="bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
                          >
                            <option value="Processing">Processing</option>
                            <option value="Neural Assembly">Neural Assembly</option>
                            <option value="Quality Check">Quality Check</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="p-3.5 text-right">
                          {o.paymentStatus === 'refunded' ? (
                            <span className="text-[10px] font-mono text-red-400">Refunded</span>
                          ) : (
                            <button
                              onClick={() => handleOrderRefund(o.id)}
                              className="text-[11px] text-slate-400 hover:text-red-400 underline cursor-pointer"
                            >
                              Issue Refund
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. CUSTOMERS TAB */}
          {activeTab === 'customers' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white font-display">Registered Client Ledger ({customers.length})</h3>

              <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900/60 border-b border-white/10 text-slate-400 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="p-3.5">Client</th>
                      <th className="p-3.5">Username</th>
                      <th className="p-3.5">Orders</th>
                      <th className="p-3.5">Lifetime Spend</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Access Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {customers.map((c) => (
                      <tr key={c.id} className="hover:bg-white/[0.02]">
                        <td className="p-3.5">
                          <p className="font-semibold text-white">{c.name}</p>
                          <p className="text-[10px] text-slate-400">{c.email}</p>
                        </td>
                        <td className="p-3.5 font-mono text-slate-300">@{c.username}</td>
                        <td className="p-3.5 font-mono tabular-nums">{c.orderCount}</td>
                        <td className="p-3.5 font-mono text-cyan-400 font-bold tabular-nums">
                          ${c.totalSpent.toLocaleString()}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                            c.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                          }`}>
                            {c.isActive ? 'Active' : 'Blocked'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleToggleCustomerStatus(c.id, c.isActive)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                              c.isActive
                                ? 'bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30'
                                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {c.isActive ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. COUPONS TAB */}
          {activeTab === 'coupons' && (
            <div className="space-y-6">
              {/* Creator */}
              <div className="glass-panel p-6 rounded-2xl border border-white/10">
                <h3 className="text-sm font-bold text-white font-display mb-3">Generate Promotional Coupon</h3>
                <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. TITANIUM25"
                      value={newCouponCode}
                      onChange={(e) => setNewCouponCode(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white uppercase font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Discount Amount</label>
                    <input
                      type="number"
                      required
                      value={newCouponAmount}
                      onChange={(e) => setNewCouponAmount(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Type</label>
                    <select
                      value={newCouponType}
                      onChange={(e: any) => setNewCouponType(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount ($)</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Issue Code
                    </button>
                  </div>
                </form>
              </div>

              {/* Coupons list */}
              <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900/60 border-b border-white/10 text-slate-400 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="p-3.5">Code</th>
                      <th className="p-3.5">Discount</th>
                      <th className="p-3.5">Redemptions</th>
                      <th className="p-3.5 text-right">Revoke</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {coupons.map((coup) => (
                      <tr key={coup.id} className="hover:bg-white/[0.02]">
                        <td className="p-3.5 font-mono font-bold text-amber-300">{coup.code}</td>
                        <td className="p-3.5 font-mono">
                          {coup.type === 'percentage' ? `${coup.amount}% Off` : `$${coup.amount} Fixed Off`}
                        </td>
                        <td className="p-3.5 font-mono tabular-nums">{coup.usageCount} applied</td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleDeleteCoupon(coup.id)}
                            className="text-slate-400 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. SECURITY / CREDENTIALS TAB */}
          {activeTab === 'security' && (
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6">
              <div>
                <h3 className="text-base font-bold text-white font-display">Administrator Security Key</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Change the initial development password (<code>karamat:12345678</code>) to a unique cryptographic key. All passwords are stored as bcrypt hashes in the database.
                </p>
              </div>

              {adminPassMsg && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  adminPassMsg.error ? 'bg-red-950/40 border border-red-500/40 text-red-300' : 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
                }`}>
                  {adminPassMsg.error ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  <span>{adminPassMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleChangeAdminPassword} className="space-y-4 max-w-md text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Current Master Password</label>
                  <input
                    type="password"
                    required
                    value={currAdminPass}
                    onChange={(e) => setCurrAdminPass(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">New Root Secret Key</label>
                  <input
                    type="password"
                    required
                    value={newAdminPass}
                    onChange={(e) => setNewAdminPass(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Update Root Password Hash
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Product Edit / Create Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-[#090b12] rounded-3xl border border-white/15 p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white font-display">
              {editingProduct ? 'Edit Catalog Instrument' : 'Add New 3D Instrument'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={prodFormName}
                  onChange={(e) => setProdFormName(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Category</label>
                  <select
                    value={prodFormCategory}
                    onChange={(e: any) => setProdFormCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="audio">Neural Audio</option>
                    <option value="wearables">Spatial Wearables</option>
                    <option value="drones">Recon Drones</option>
                    <option value="computing">Computing Terminals</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">3D Procedural Engine</label>
                  <select
                    value={prodFormModelType}
                    onChange={(e) => setProdFormModelType(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="headset">Neural Headset (Planar Core)</option>
                    <option value="watch">Spatial Timepiece (Holographic)</option>
                    <option value="drone">Autonomous Drone (Ducted)</option>
                    <option value="sphere">Levitation Sound Orb</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Price (USD)</label>
                  <input
                    type="number"
                    required
                    value={prodFormPrice}
                    onChange={(e) => setProdFormPrice(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Initial Stock Inventory</label>
                  <input
                    type="number"
                    required
                    value={prodFormStock}
                    onChange={(e) => setProdFormStock(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Tagline</label>
                <input
                  type="text"
                  value={prodFormTagline}
                  onChange={(e) => setProdFormTagline(e.target.value)}
                  placeholder="e.g. Zero-latency acoustic precision"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Full Description</label>
                <textarea
                  rows={3}
                  value={prodFormDesc}
                  onChange={(e) => setProdFormDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs"
                >
                  Save Instrument
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
