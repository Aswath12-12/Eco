import React, { useState } from 'react';
import {
  User,
  Shield,
  Mail,
  KeyRound,
  CheckCircle2,
  Clock,
  Sparkles,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';

export default function AdminProfilePage() {
  const { user, profile } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updating, setUpdating] = useState(false);
  const { success, error: toastError } = useToast();

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toastError('Password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toastError('Passwords do not match');
      return;
    }

    try {
      setUpdating(true);
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      success('Admin password updated successfully in Supabase!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Error changing password:', err);
      toastError(err.message || 'Failed to update password');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Administrator Account
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review executive privileges, account security, and active credentials
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-eco-700 to-eco-500 text-white text-2xl font-black flex items-center justify-center mb-3 shadow-lg shadow-eco-600/20">
            {profile?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <h2 className="text-lg font-black text-slate-900">{profile?.name || 'Administrator'}</h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">{user?.email}</p>
          <div className="mt-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-eco-100 text-eco-800 border border-eco-200">
              <Shield className="w-3.5 h-3.5" />
              FULL ADMIN ACCESS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-4 leading-relaxed">
            Authorized to manage house configurations, student rosters, bulk imports, and weekly score audits.
          </p>
        </div>

        {/* Account Details & Change Password */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-eco-600" />
              Account Metadata
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Administrator Name</span>
                <span className="font-bold text-slate-800">{profile?.name || 'Admin'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Registered Email</span>
                <span className="font-bold text-slate-800 font-mono">{user?.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400 font-medium">User Role</span>
                <span className="font-bold text-eco-700">ADMIN (Superuser)</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400 font-medium">Supabase Auth UID</span>
                <span className="font-mono text-slate-500 text-[11px] truncate max-w-xs">{user?.id}</span>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-eco-600" />
              Update Administrator Password
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Securely updates your password using Supabase Auth
            </p>

            <form onSubmit={handlePasswordChange} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  New Password (min 6 characters)
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium focus:outline-hidden focus:border-eco-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium focus:outline-hidden focus:border-eco-600"
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="px-5 py-2.5 rounded-xl text-white font-bold bg-eco-600 hover:bg-eco-700 shadow-xs transition cursor-pointer disabled:opacity-60"
              >
                {updating ? 'Updating Password...' : 'Save New Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
