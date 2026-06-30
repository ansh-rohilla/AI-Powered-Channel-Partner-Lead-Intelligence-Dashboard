import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShieldAlert, Sparkles, ArrowRight, Shield } from 'lucide-react';
import { authService } from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authService.login({ email, password });
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        // Redirect to dashboard
        navigate('/', { replace: true });
      } else {
        setError(response.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      const errMsg = err.response?.data?.message || 'Connection failed. Falling back to offline demo...';
      
      // Fallback offline login for presentation/demo safety
      if (email.trim().toLowerCase() === 'alex.chen@vyana.ai' && password === 'password123') {
        const mockUser = {
          id: 'u-mock-admin-2026',
          email: 'alex.chen@vyana.ai',
          name: 'Alex Chen',
          role: 'Sales Operations Director',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&q=80'
        };
        localStorage.setItem('token', 'mock-token-secret-2026');
        localStorage.setItem('user', JSON.stringify(mockUser));
        navigate('/', { replace: true });
      } else {
        setError(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#030712] font-sans antialiased relative overflow-hidden transition-colors duration-300">
      {/* Background ambient radial glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-brand-primary/10 dark:bg-brand-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md p-6 z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 dark:bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center shadow-lg shadow-brand-primary/10 mb-4 transition-transform hover:scale-105 duration-300">
            <Shield className="w-8 h-8 text-brand-primary" />
          </div>
          <h1 className="font-outfit font-black text-3xl text-slate-900 dark:text-white tracking-tight">Vyana AI</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-medium">Channel Partner & Lead Intelligence</p>
        </div>

        {/* Login Glass Card */}
        <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-2xl rounded-3xl p-8 relative overflow-hidden">
          {/* Top glowing top border */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-primary/50 to-transparent" />
          
          <h2 className="font-outfit font-bold text-xl text-slate-800 dark:text-slate-100 mb-6">Welcome Back</h2>

          {error && (
            <div className="mb-5 flex items-start gap-3 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 rounded-2xl text-xs animate-shake">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">Corporate Email</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors duration-200">
                  <Mail className="w-4.5 h-4.5" />
                </div>
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 focus:border-brand-primary dark:focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Security Key</label>
                <span className="text-[10px] font-medium text-slate-400 hover:text-brand-primary cursor-pointer transition-colors duration-200">Forgot?</span>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors duration-200">
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 focus:border-brand-primary dark:focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 rounded-2xl py-3 pl-12 pr-12 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-primary hover:bg-brand-primary/95 text-white font-outfit font-semibold text-sm rounded-2xl py-3.5 flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/35 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Access Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-400 mt-8 font-medium">
          Protected by Vyana Shield Security Protocol
        </p>
      </div>
    </div>
  );
};

export default Login;
