import React, { useState } from 'react';
import { Mail, ArrowLeft, ShieldCheck, Sparkles, AlertCircle, CheckCircle2, Copy } from 'lucide-react';
import { adminApi } from '../../services/adminApi';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('admin@amanoraplaza.com');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetPath, setResetPath] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    setResetPath('');
    setLoading(true);

    const result = await adminApi.forgotPassword(email.trim());
    setLoading(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    setSuccessMessage(result.message);
    if (result.reset_path) {
      setResetPath(result.reset_path);
    }
  };

  const copyResetLink = async () => {
    const fullLink = `${window.location.origin}${resetPath}`;
    await navigator.clipboard.writeText(fullLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-luxury-darkBg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-luxury-gold to-luxury-gold-dark text-black shadow-gold-glow mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-wider bg-gradient-to-r from-luxury-gold-light via-luxury-gold to-luxury-gold-dark bg-clip-text text-transparent uppercase">
            Reset Password
          </h1>
          <p className="text-luxury-textMuted text-sm mt-2">Admin account password recovery</p>
        </div>

        <div className="glass-panel rounded-2xl p-8 border border-luxury-darkBorder shadow-gold-glow">
          <div className="flex items-center space-x-2 mb-6">
            <ShieldCheck className="w-5 h-5 text-luxury-gold" />
            <h2 className="text-lg font-bold text-white">Forgot Password</h2>
          </div>

          {error && (
            <div className="mb-4 flex items-start space-x-2 rounded-lg border border-luxury-rose/30 bg-luxury-rose/10 px-4 py-3 text-sm text-luxury-rose">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 flex items-start space-x-2 rounded-lg border border-luxury-emerald/30 bg-luxury-emerald/10 px-4 py-3 text-sm text-luxury-emerald">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {!resetPath ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="forgot-email" className="block text-xs font-semibold uppercase tracking-wider text-luxury-textMuted mb-2">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-luxury-gold/70" />
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-luxury-darkBg border border-luxury-darkBorder text-white placeholder:text-slate-500 focus:outline-none focus:border-luxury-gold/50 focus:ring-1 focus:ring-luxury-gold/30"
                    placeholder="admin@amanoraplaza.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-black font-bold uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Generating reset link...' : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-300">
                Use this secure reset link within 60 minutes. In production, this would be emailed to the admin account.
              </p>
              <div className="rounded-xl bg-luxury-darkBg border border-luxury-darkBorder p-4">
                <p className="text-xs text-luxury-textMuted mb-2 uppercase tracking-wider">Reset Link</p>
                <p className="text-sm text-luxury-gold break-all">{window.location.origin}{resetPath}</p>
              </div>
              <div className="flex gap-3">
                <a
                  href={resetPath}
                  className="flex-1 text-center py-3 rounded-xl bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-black font-bold uppercase tracking-wider text-sm"
                >
                  Open Reset Page
                </a>
                <button
                  type="button"
                  onClick={copyResetLink}
                  className="px-4 py-3 rounded-xl border border-luxury-darkBorder text-luxury-gold hover:bg-luxury-gold/10"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              {copied && <p className="text-xs text-luxury-emerald text-center">Link copied to clipboard</p>}
            </div>
          )}

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
