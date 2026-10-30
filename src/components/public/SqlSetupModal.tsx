import React, { useState } from 'react';
import { SUPABASE_SETUP_SQL, RLS_FIX_SQL } from '../../lib/sqlSchema';
import { isSupabaseConfigured, supabaseUrl } from '../../lib/supabase';
import { X, Copy, Check, Database, ShieldAlert, Sparkles, Code2 } from 'lucide-react';

interface SqlSetupModalProps {
  onClose: () => void;
  defaultTab?: 'rls' | 'full';
}

export const SqlSetupModal: React.FC<SqlSetupModalProps> = ({ onClose, defaultTab = 'rls' }) => {
  const [activeTab, setActiveTab] = useState<'rls' | 'full'>(defaultTab);
  const [copied, setCopied] = useState<boolean>(false);

  const currentSql = activeTab === 'rls' ? RLS_FIX_SQL : SUPABASE_SETUP_SQL;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-slate-900 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-8 max-h-[92vh] flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Supabase SQL Scripts & RLS Fix</h3>
            <p className="text-xs text-slate-400">
              Run in your Supabase dashboard at: <strong>Dashboard &gt; SQL Editor</strong>
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 mt-4 shrink-0">
          <button
            onClick={() => setActiveTab('rls')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'rls'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>1-Click RLS Fix (Appointments)</span>
          </button>

          <button
            onClick={() => setActiveTab('full')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'full'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent'
            }`}
          >
            <Code2 className="w-4 h-4 text-teal-400" />
            <span>Full Database Schema & Seed</span>
          </button>
        </div>

        {/* Action & Explanation Banner */}
        <div className="my-3 p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="text-slate-300 space-y-0.5">
            {activeTab === 'rls' ? (
              <p>
                Fixes <code className="text-amber-300 font-mono">new row violates row-level security policy</code> by granting public insert and read permissions on <code className="text-amber-300 font-mono">appointments</code>.
              </p>
            ) : (
              <p>
                Creates all 6 tables (<code className="text-teal-300 font-mono">services</code>, <code className="text-teal-300 font-mono">appointments</code>, etc.) with initial seed data and security rules.
              </p>
            )}
          </div>

          <button
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied to Clipboard!' : 'Copy SQL Script'}
          </button>
        </div>

        {/* Code Editor View */}
        <div className="flex-1 overflow-y-auto bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs text-teal-300/90 leading-relaxed select-all">
          <pre>{currentSql}</pre>
        </div>

        {/* Quick steps */}
        <div className="pt-3 mt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2 text-[11px]">
            <span className="font-semibold text-slate-300">How to run:</span>
            <span>1. Click &quot;Copy SQL Script&quot;</span>
            <span>&rarr;</span>
            <span>2. Open Supabase SQL Editor</span>
            <span>&rarr;</span>
            <span>3. Paste and click &quot;Run&quot;</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
