import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useWishlist } from '../context/WishlistContext.js';
import { useCart } from '../context/CartContext.js';
import { sound } from '../utils/audio.js';
import {
  User, Package, Heart, MapPin, Key, LogOut, ExternalLink,
  CheckCircle, Clock, ShieldCheck, AlertCircle, ShoppingBag, Eye
} from 'lucide-react';

export const CustomerDashboardPage: React.FC = () => {
  const { user, token, logout, updateProfile } = useAuth();
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses' | 'security' | 'wishlist'>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Profile Form
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; error: boolean } | null>(null);

  // Address Form
  const [addresses, setAddresses] = useState<any[]>(user?.addresses || [
    {
      id: 'addr_1',
      label: 'Primary Residence / Lab',
      recipient: user?.name || 'Alex Vance',
      street: '742 Cybernetic Way, Suite 400',
      city: 'San Francisco',
      state: 'CA',
      zip: '94107',
      country: 'United States',
      isDefault: true
    }
  ]);
  const [newAddrStreet, setNewAddrStreet] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('');
  const [newAddrState, setNewAddrState] = useState('');
  const [newAddrZip, setNewAddrZip] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    fetch('/api/orders', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.orders) setOrders(data.orders);
      })
      .catch(err => console.error('Failed to load orders:', err))
      .finally(() => setLoadingOrders(false));
  }, [token, navigate]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
      if (user.addresses && user.addresses.length > 0) {
        setAddresses(user.addresses);
      }
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await updateProfile({ name, phone });
    if (success) {
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'New passwords do not match', error: true });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ text: 'Password must be at least 6 characters', error: true });
      return;
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordMsg({ text: data.error || 'Failed to change password', error: true });
      } else {
        sound.playSuccess();
        setPasswordMsg({ text: 'Password successfully updated', error: false });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setPasswordMsg({ text: 'Network connection failed', error: true });
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrStreet || !newAddrCity) return;
    const newAddress = {
      id: `addr_${Date.now()}`,
      label: 'Secondary Vault Location',
      recipient: name || 'Aether Owner',
      street: newAddrStreet,
      city: newAddrCity,
      state: newAddrState,
      zip: newAddrZip,
      country: 'United States',
      isDefault: false
    };
    const updated = [...addresses, newAddress];
    setAddresses(updated);
    await updateProfile({ addresses: updated });
    setNewAddrStreet('');
    setNewAddrCity('');
    setNewAddrState('');
    setNewAddrZip('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30';
      case 'Shipped':
        return 'text-cyan-400 bg-cyan-950/40 border-cyan-500/30';
      case 'Neural Assembly':
      case 'Quality Check':
        return 'text-amber-400 bg-amber-950/40 border-amber-500/30';
      case 'Cancelled':
        return 'text-red-400 bg-red-950/40 border-red-500/30';
      default:
        return 'text-slate-400 bg-slate-900 border-white/10';
    }
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">Authenticated Portal</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1 font-display">
            Customer Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Logged in as <strong className="text-white">{user?.name}</strong> ({user?.email})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/shop"
            onClick={() => sound.playClick()}
            className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-medium rounded-xl transition-colors"
          >
            Browse Catalog
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-medium rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar Tabs */}
        <div className="lg:col-span-3 glass-panel p-3 rounded-2xl border border-white/10 space-y-1">
          <button
            onClick={() => { sound.playClick(); setActiveTab('orders'); }}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Orders & Tracking ({orders.length})</span>
          </button>

          <button
            onClick={() => { sound.playClick(); setActiveTab('wishlist'); }}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
              activeTab === 'wishlist'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Wishlist ({wishlist.length})</span>
          </button>

          <button
            onClick={() => { sound.playClick(); setActiveTab('profile'); }}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile Information</span>
          </button>

          <button
            onClick={() => { sound.playClick(); setActiveTab('addresses'); }}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
              activeTab === 'addresses'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Delivery Coordinates ({addresses.length})</span>
          </button>

          <button
            onClick={() => { sound.playClick(); setActiveTab('security'); }}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
              activeTab === 'security'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Security & Password</span>
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="lg:col-span-9">
          {/* 1. ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              {loadingOrders ? (
                <div className="glass-panel p-8 rounded-2xl animate-pulse text-center text-xs text-slate-400">
                  Querying order ledger...
                </div>
              ) : orders.length === 0 ? (
                <div className="glass-panel p-10 rounded-2xl border border-white/10 text-center">
                  <Package className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <h3 className="text-sm font-semibold text-white">No order allocations recorded yet</h3>
                  <p className="text-xs text-slate-400 mt-1 mb-4">You have not completed any hardware purchases.</p>
                  <Link
                    to="/shop"
                    className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold text-xs rounded-lg inline-block"
                  >
                    Explore Catalog
                  </Link>
                </div>
              ) : (
                orders.map((ord) => (
                  <div key={ord.id} className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10 text-xs">
                      <div>
                        <p className="text-slate-400">Order ID</p>
                        <p className="font-mono font-bold text-white mt-0.5">{ord.orderNumber}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Date</p>
                        <p className="font-mono text-slate-300 mt-0.5">{new Date(ord.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Total Settlement</p>
                        <p className="font-mono font-bold text-cyan-400 mt-0.5 tabular-nums">${ord.total.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-mono border ${getStatusColor(ord.orderStatus)}`}>
                          {ord.orderStatus}
                        </span>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-3">
                      {ord.items.map((item: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg bg-slate-900 border border-white/10" />
                            <div>
                              <p className="font-semibold text-white">{item.name}</p>
                              {item.variantName && <p className="text-[11px] text-slate-400">{item.variantName}</p>}
                              <p className="text-[11px] text-slate-500">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <p className="font-mono text-slate-200 tabular-nums">${(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>

                    {/* Tracking details */}
                    <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                      <span>Tracking: <strong className="text-cyan-400 font-mono">{ord.trackingNumber}</strong></span>
                      <Link
                        to={`/order-confirmation/${ord.id}`}
                        onClick={() => sound.playClick()}
                        className="text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Live Tracking Visualizer</span>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 2. WISHLIST TAB */}
          {activeTab === 'wishlist' && (
            <div className="space-y-4">
              {wishlist.length === 0 ? (
                <div className="glass-panel p-10 rounded-2xl border border-white/10 text-center text-xs text-slate-400">
                  <Heart className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  Your wishlist is empty. Tap the heart icon on any instrument to save it for later.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {wishlist.map((item) => (
                    <div key={item.id} className="glass-panel p-4 rounded-xl border border-white/10 flex gap-4 items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-lg bg-slate-900" />
                        <div>
                          <h4 className="text-xs font-bold text-white">{item.name}</h4>
                          <p className="text-xs font-mono text-cyan-400 font-semibold mt-0.5 tabular-nums">${item.price.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => addToCart(item, item.variants?.[0])}
                          className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                        >
                          Add to Bag
                        </button>
                        <button
                          onClick={() => toggleWishlist(item)}
                          className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10">
              <h3 className="text-base font-bold text-white font-display mb-4">Personal Information</h3>
              {profileSuccess && (
                <div className="p-3 mb-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Profile updated successfully</span>
                </div>
              )}
              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-slate-400 cursor-not-allowed"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Contact support to modify primary email.</p>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Secure Phone Contact</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </form>
            </div>
          )}

          {/* 4. ADDRESSES TAB */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div key={addr.id} className="glass-panel p-5 rounded-xl border border-white/10 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white font-mono">{addr.label}</span>
                      {addr.isDefault && (
                        <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded">Default</span>
                      )}
                    </div>
                    <p className="text-slate-300">{addr.recipient}</p>
                    <p className="text-slate-400">{addr.street}</p>
                    <p className="text-slate-400">{addr.city}, {addr.state} {addr.zip}</p>
                    <p className="text-slate-500 font-mono">{addr.country}</p>
                  </div>
                ))}
              </div>

              {/* Add New Address Form */}
              <div className="glass-panel p-6 rounded-2xl border border-white/10">
                <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider mb-3">Add Location Coordinates</h4>
                <form onSubmit={handleAddAddress} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Street Address"
                      value={newAddrStreet}
                      onChange={(e) => setNewAddrStreet(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="City"
                      value={newAddrCity}
                      onChange={(e) => setNewAddrCity(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="State"
                      value={newAddrState}
                      onChange={(e) => setNewAddrState(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                    />
                    <input
                      type="text"
                      placeholder="Zip"
                      value={newAddrZip}
                      onChange={(e) => setNewAddrZip(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors cursor-pointer"
                    >
                      Save Coordinates
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* 5. SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10">
              <h3 className="text-base font-bold text-white font-display mb-1">Access Credentials</h3>
              <p className="text-xs text-slate-400 mb-6">Change your quantum authentication key.</p>

              {passwordMsg && (
                <div className={`p-3 mb-4 rounded-xl text-xs flex items-center gap-2 ${
                  passwordMsg.error ? 'bg-red-950/40 border border-red-500/40 text-red-300' : 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
                }`}>
                  {passwordMsg.error ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  <span>{passwordMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">New Password (min 6 chars)</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Update Password Key
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
