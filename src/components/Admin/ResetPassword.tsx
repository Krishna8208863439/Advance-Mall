import React, { useMemo, useState } from 'react';
import { Lock, ShieldCheck, Sparkles, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { adminApi } from '../../services/adminApi';

export const ResetPassword: React.FC = () => {
  const token = useMemo(() => new URLSearchParams(window.location.search).get('token') || '', []);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Invalid reset link. Request a new password reset.');
      return;
    }

    setLoading(true);
    const result = await adminApi.resetPassword(token, newPassword, confirmPassword);
    setLoading(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    setSuccess(result.message);
    setTimeout(() => {
      window.location.href = '/admin/login';
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-luxury-darkBg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-luxury-gold to-luxury-gold-dark text-black shadow-gold-glow mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-wider bg-gradient-to-r from-luxury-gold-light via-luxury-gold to-luxury-gold-dark bg-clip-text text-transparent uppercase">
            New Password
          </h1>
          <p className="text-luxury-textMuted text-sm mt-2">Create a new admin password</p>
        </div>

        <div className="glass-panel rounded-2xl p-8 border border-luxury-darkBorder shadow-gold-glow">
          <div className="flex items-center space-x-2 mb-6">
            <ShieldCheck className="w-5 h-5 text-luxury-gold" />
            <h2 className="text-lg font-bold text-white">Reset Password</h2>
          </div>

          {error && (
            <div className="mb-4 flex items-start space-x-2 rounded-lg border border-luxury-rose/30 bg-luxury-rose/10 px-4 py-3 text-sm text-luxury-rose">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 flex items-start space-x-2 rounded-lg border border-luxury-emerald/30 bg-luxury-emerald/10 px-4 py-3 text-sm text-luxury-emerald">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="new-password" className="block text-xs font-semibold uppercase tracking-wider text-luxury-textMuted mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-luxury-gold/70" />
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                  minLength={8}
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-luxury-darkBg border border-luxury-darkBorder text-white placeholder:text-slate-500 focus:outline-none focus:border-luxury-gold/50 focus:ring-1 focus:ring-luxury-gold/30"
                  placeholder="Minimum 8 characters"
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

            <div>
              <label htmlFor="confirm-password" className="block text-xs font-semibold uppercase tracking-wider text-luxury-textMuted mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-luxury-gold/70" />
                <input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  minLength={8}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-luxury-darkBg border border-luxury-darkBorder text-white placeholder:text-slate-500 focus:outline-none focus:border-luxury-gold/50 focus:ring-1 focus:ring-luxury-gold/30"
                  placeholder="Re-enter new password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-black font-bold uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Updating password...' : 'Update Password'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/admin/login" className="inline-flex items-center space-x-2 text-sm text-luxury-textMuted hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Admin Login</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
