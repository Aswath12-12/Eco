import React from 'react';
import { AlertCircle, KeyRound, ExternalLink } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

export default function ConfigBanner() {
  if (isSupabaseConfigured) return null;

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-900 px-4 py-3 text-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded-md bg-amber-500/20 text-amber-800">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          </div>
          <div>
            <span className="font-semibold text-amber-950">Supabase Connection Required:</span>{' '}
            Please configure your credentials in <code className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-mono text-xs">.env</code> (set <code className="font-mono text-xs">VITE_SUPABASE_URL</code> and <code className="font-mono text-xs">VITE_SUPABASE_ANON_KEY</code>).
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-200/60 px-2 py-1 rounded-md">
            <KeyRound className="w-3.5 h-3.5" /> Ready for Schema Setup
          </span>
        </div>
      </div>
    </div>
  );
}
