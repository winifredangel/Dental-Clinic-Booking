import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { Shield, Lock, Mail, AlertCircle, ArrowLeft, KeyRound, Database, Check } from 'lucide-react';

interface AdminLoginProps {
  onBackToWebsite: () => void;
  onOpenSqlModal: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToWebsite, onOpenSqlModal }) => {
  const { signIn, loading, authError, user, isAdmin, adminCheckCompleted } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email.trim() || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    const result = await signIn(email, password);
    setSubmitting(false);

    if (!result.success && result.error) {
      setLocalError(result.error);
    }
  };

  const displayError = localError || authError;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Back Link */}
        <button
          onClick={onBackToWebsite}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Public Clinic Website
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-teal-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Clinic Management Portal
          </h2>
          <p className="text-xs text-slate-400">
            Secure administration for office managers and dental staff.
          </p>
        </div>

        {/* Login Box */}
        <div className="mt-8 bg-slate-800/90 backdrop-blur-md py-8 px-6 sm:px-10 rounded-3xl border border-slate-700 shadow-2xl">
          {!isSupabaseConfigured && (
            <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <Database className="w-4 h-4 shrink-0" />
                <span>Supabase Configuration Notice</span>
              </div>
              <p className="text-amber-200/90 leading-relaxed">
                To sign in with real Supabase Auth, add your project credentials to <code className="bg-slate-900/60 px-1 py-0.5 rounded text-[11px]">.env</code> and run the database setup script.
              </p>
              <button
                type="button"
                onClick={onOpenSqlModal}
                className="text-xs font-semibold text-amber-300 underline hover:text-amber-100 cursor-pointer"
              >
                View SQL Setup Script
              </button>
            </div>
          )}

          {displayError && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div className="space-y-1">
                <span className="font-semibold block">Authentication Error</span>
                <span className="text-rose-200/90">{displayError}</span>
              </div>
            </div>
          )}

          {/* User signed in but unauthorized state */}
          {user && !isAdmin && adminCheckCompleted && (
            <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <KeyRound className="w-4 h-4" />
                <span>Unauthorized Admin User</span>
              </div>
              <p>
                Signed in as <strong className="text-white">{user.email}</strong>, but this user ID is not registered in the <code className="bg-slate-900 px-1 py-0.5 rounded font-mono">admin_users</code> table.
              </p>
              <p className="font-mono text-[11px] bg-slate-950 p-2 rounded text-teal-300 select-all overflow-x-auto">
                INSERT INTO public.admin_users (user_id) VALUES ('{user.id}');
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-300">
                Staff Email Address
              </label>
              <div className="mt-1 relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="admin@luminadentalstudio.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-300">
                Password
              </label>
              <div className="mt-1 relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting || loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-teal-600 hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all shadow-md shadow-teal-600/20 disabled:opacity-50 cursor-pointer"
              >
                {submitting || loading ? (
                  <span>Verifying Admin Credentials...</span>
                ) : (
                  <span>Sign In to Dashboard</span>
                )}
              </button>
            </div>
          </form>

          {/* Quick instructions */}
          <div className="mt-6 pt-6 border-t border-slate-700 text-[11px] text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">Admin Security Note:</p>
            <p>
              Admin privileges are enforced by matching <code className="text-teal-400 font-mono">auth.user.id</code> with the <code className="text-teal-400 font-mono">admin_users.user_id</code> database table.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
