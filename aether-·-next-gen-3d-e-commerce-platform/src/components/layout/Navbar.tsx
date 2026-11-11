import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useCart } from '../../context/CartContext.js';
import { sound } from '../../utils/audio.js';
import { ShoppingBag, Volume2, VolumeX, User, Shield, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const location = useLocation();

  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSound = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  const navLinks = [
    { name: 'Featured', path: '/' },
    { name: 'Catalog', path: '/shop' },
    { name: 'Architecture', path: '/#architecture' },
    { name: 'Customizer', path: '/shop?customizer=true' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#07080d]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <Link
          to="/"
          onClick={() => sound.playClick()}
          className="flex items-center gap-2 group whitespace-nowrap shrink-0"
        >
          <span className="text-xl font-bold tracking-wider text-white font-display">
            AETHER
          </span>
          <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-semibold">
            LABS
          </span>
        </Link>

        {/* Zone 2: Primary Nav Links (Single line, subtle hover) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => sound.playClick()}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                location.pathname === link.path && !location.hash
                  ? 'text-cyan-400 font-semibold'
                  : ''
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Zone 3: Functional Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Web Audio Mute Toggle */}
          <button
            onClick={toggleSound}
            title={isMuted ? 'Unmute Audio Feedback' : 'Mute Audio Feedback'}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Cart Trigger */}
          <button
            onClick={() => {
              sound.playClick();
              setIsCartOpen(true);
            }}
            className="relative p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Open Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-5 h-5 px-1 bg-cyan-500 text-[#07080d] font-bold text-[11px] rounded-full shadow-lg tabular-nums">
                {itemCount}
              </span>
            )}
          </button>

          {/* User Account / Admin Badge */}
          {user ? (
            <Link
              to={isAdmin ? '/admin' : '/dashboard'}
              onClick={() => sound.playClick()}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 transition-colors"
            >
              {isAdmin ? <Shield className="w-3.5 h-3.5 text-amber-400" /> : <User className="w-3.5 h-3.5 text-cyan-400" />}
              <span className="hidden sm:inline truncate max-w-[100px]">{user.name.split(' ')[0]}</span>
              {isAdmin && <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">Admin</span>}
            </Link>
          ) : (
            <Link
              to="/login"
              onClick={() => sound.playClick()}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-white hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-md"
            >
              Sign In
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#090b12] px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => {
                sound.playClick();
                setMobileMenuOpen(false);
              }}
              className="block text-sm font-medium text-slate-300 hover:text-white py-2"
            >
              {link.name}
            </Link>
          ))}
          {user ? (
            <Link
              to={isAdmin ? '/admin' : '/dashboard'}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-cyan-400 py-2 border-t border-white/5"
            >
              {isAdmin ? 'Admin Dashboard' : 'Customer Dashboard'}
            </Link>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center py-2.5 rounded-lg bg-white text-slate-900 font-semibold text-xs mt-2"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
