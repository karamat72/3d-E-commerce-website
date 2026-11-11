import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { sound } from '../utils/audio.js';
import { Shield, User, Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, register, user, isAdmin } = useAuth();

  const isRegisterParam = searchParams.get('mode') === 'register';
  const [isRegister, setIsRegister] = useState(isRegisterParam);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect
  if (user) {
    if (isAdmin) navigate('/admin');
    else navigate('/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isRegister) {
      const res = await register(name, username, email, password);
      setLoading(false);
      if (!res.success) {
        setError(res.error || 'Registration failed');
      } else {
        navigate('/dashboard');
      }
    } else {
      const res = await login(username, password);
      setLoading(false);
      if (!res.success) {
        setError(res.error || 'Authentication rejected');
      } else {
        const redirect = searchParams.get('redirect');
        if (redirect === 'admin') navigate('/admin');
        else navigate('/dashboard');
      }
    }
  };

  const fillCredentials = (u: string, p: string) => {
    sound.playClick();
    setUsername(u);
    setPassword(p);
    setIsRegister(false);
  };

  return (
    <div className="relative z-10 min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-3xl border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block text-xl font-bold tracking-wider text-white font-display mb-2">
            AETHER
          </Link>
          <h1 className="text-2xl font-bold text-white font-display">
            {isRegister ? 'Owner Induction' : 'Command Sign In'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isRegister
              ? 'Register your account to manage hardware allocations'
              : 'Authenticate to access customer portal or admin dashboard'}
          </p>
        </div>

        {/* Quick Access Switcher Chips */}
        <div className="mb-6 p-2 rounded-xl bg-slate-900/80 border border-white/5 flex gap-1 text-xs">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setIsRegister(false);
              setError('');
            }}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              !isRegister ? 'bg-white text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setIsRegister(true);
              setError('');
            }}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              isRegister ? 'bg-white text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Register Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {isRegister && (
            <>
              <div>
                <label className="block text-slate-400 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Vance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="alex@aether.luxury"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-slate-400 mb-1">
              {isRegister ? 'Preferred Username' : 'Username or Email'}
            </label>
            <input
              type="text"
              required
              placeholder="e.g. karamat or alex_vance"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl pl-3.5 pr-10 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Authenticate'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Credential Quick-Fill Helpers for testing */}
        {!isRegister && (
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-[11px] text-slate-500 mb-2">Development Testing Credentials:</p>
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('karamat', '12345678')}
                className="px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-mono cursor-pointer"
              >
                Admin (karamat)
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('alex_vance', 'alex1234')}
                className="px-2.5 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono cursor-pointer"
              >
                Customer (alex_vance)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
