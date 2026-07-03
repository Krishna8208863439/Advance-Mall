import React, { useState } from 'react';
import { Lock, Mail, ShieldCheck, Sparkles, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

export const AdminLogin: React.FC = () => {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState('admin@amanoraplaza.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);
    if (result.success) {
      window.location.href = '/admin/dashboard';
      return;
    }
    setError(result.message);
  };

  return (
    <div className="min-h-screen bg-luxury-darkBg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-luxury-gold to-luxury-gold-dark text-black shadow-gold-glow mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-wider bg-gradient-to-r from-luxury-gold-light via-luxury-gold to-luxury-gold-dark bg-clip-text text-transparent uppercase">
            Admin Portal
          </h1>
          <p className="text-luxury-textMuted text-sm mt-2">Secure access for Amanora Plaza administrators only</p>
        </div>

        <div className="glass-panel rounded-2xl p-8 border border-luxury-darkBorder shadow-gold-glow">
          <div className="flex items-center space-x-2 mb-6">
            <ShieldCheck className="w-5 h-5 text-luxury-gold" />
            <h2 className="text-lg font-bold text-white">Admin Login</h2>
          </div>

          {error && (
            <div className="mb-4 flex items-start space-x-2 rounded-lg border border-luxury-rose/30 bg-luxury-rose/10 px-4 py-3 text-sm text-luxury-rose">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="admin-email" className="block text-xs font-semibold uppercase tracking-wider text-luxury-textMuted mb-2">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-luxury-gold/70" />
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-luxury-darkBg border border-luxury-darkBorder text-white placeholder:text-slate-500 focus:outline-none focus:border-luxury-gold/50 focus:ring-1 focus:ring-luxury-gold/30"
                  placeholder="admin@amanoraplaza.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-xs font-semibold uppercase tracking-wider text-luxury-textMuted mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-luxury-gold/70" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-luxury-darkBg border border-luxury-darkBorder text-white placeholder:text-slate-500 focus:outline-none focus:border-luxury-gold/50 focus:ring-1 focus:ring-luxury-gold/30"
                  placeholder="Enter admin password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-luxury-textMuted hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-black font-bold uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In to Admin'}
            </button>
          </form>

          <div className="mt-6 flex flex-col items-center space-y-3 text-sm">
            <a href="/admin/forgot-password" className="text-luxury-gold hover:text-luxury-gold-light transition-colors">
              Forgot password?
            </a>
            <a href="/" className="text-luxury-textMuted hover:text-white transition-colors">
              Back to Mall Website
            </a>
          </div>
        </div>

        <p className="text-center text-[11px] text-luxury-textMuted mt-6">
          Default credentials: admin@amanoraplaza.com / Admin@2026
        </p>
      </div>
    </div>
  );
};
