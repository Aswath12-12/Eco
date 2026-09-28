import React, { useState } from 'react';
import {
  Lock,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Eye,
  EyeOff,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { changeStudentPassword } from '../../services/api';
import HouseBadge from '../../components/HouseBadge';
import { useToast } from '../../context/ToastContext';

export default function StudentResetPasswordPage() {
  const { profile, studentRecord, refreshProfile } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { success, error: toastError } = useToast();

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!studentRecord?.id) {
      setErrorMsg('No student record found for this session.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match. Please verify.');
      return;
    }

    try {
      setIsUpdating(true);
      await changeStudentPassword(studentRecord.id, newPassword);
      setSuccessMsg('Your password has been updated successfully! Use your new password the next time you sign in.');
      success('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
      await refreshProfile();
    } catch (err) {
      console.error('Password update error:', err);
      const msg = err.message || 'Failed to update password. Please try again.';
      setErrorMsg(msg);
      toastError(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetToDefault = async () => {
    if (!studentRecord?.id) return;
    setErrorMsg('');
    setSuccessMsg('');

    try {
      setIsUpdating(true);
      await changeStudentPassword(studentRecord.id, 'stud@sxcce');
      setSuccessMsg('Password has been reset back to default college password: stud@sxcce');
      success('Password successfully reset to default (stud@sxcce)!');
      setNewPassword('');
      setConfirmPassword('');
      await refreshProfile();
    } catch (err) {
      console.error('Password reset error:', err);
      const msg = err.message || 'Failed to reset password';
      setErrorMsg(msg);
      toastError(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <KeyRound className="w-7 h-7 text-eco-600" />
          Reset & Change Password
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your student account credentials for the Eco Club Portal
        </p>
      </div>

      {/* Account Info Pill */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-eco-50 border border-eco-200 flex items-center justify-center text-eco-700 font-extrabold text-lg">
            {studentRecord?.name?.charAt(0) || 'S'}
          </div>
          <div>
            <div className="font-extrabold text-slate-900 text-sm">
              {studentRecord?.name || profile?.name}
            </div>
            <div className="text-xs text-slate-500 font-mono mt-0.5">
              Roll Number: <span className="font-bold text-slate-800">{studentRecord?.roll_number}</span> • Dept: <span className="font-bold text-slate-800">{studentRecord?.department}</span>
            </div>
          </div>
        </div>
        {studentRecord?.house?.code && (
          <HouseBadge code={studentRecord.house.code} size="md" />
        )}
      </div>

      {/* Success banner */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-start gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed font-semibold">{successMsg}</div>
        </div>
      )}

      {/* Error banner */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">{errorMsg}</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Password Form */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-eco-600" />
              Set New Password
            </h2>
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              Min 6 chars
            </span>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                New Password *
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium text-sm focus:outline-hidden focus:ring-2 focus:ring-eco-500/20 focus:border-eco-600 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm New Password *
              </label>
              <input
                type={showPass ? 'text' : 'password'}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium text-sm focus:outline-hidden focus:ring-2 focus:ring-eco-500/20 focus:border-eco-600 transition"
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="submit"
                disabled={isUpdating}
                className="py-2.5 px-5 rounded-xl text-white font-bold bg-eco-600 hover:bg-eco-700 shadow-md shadow-eco-600/20 transition cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Update Password</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleResetToDefault}
                disabled={isUpdating}
                className="py-2.5 px-4 rounded-xl text-slate-700 font-bold bg-slate-100 hover:bg-slate-200 transition cursor-pointer flex items-center justify-center gap-2 text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset to Default (stud@sxcce)</span>
              </button>
            </div>
          </form>
        </div>

        {/* Info & Policy Card */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-eco-50 to-emerald-50/50 rounded-3xl p-5 border border-eco-200/80 text-xs text-slate-700 space-y-3">
            <div className="flex items-center gap-2 font-bold text-eco-900">
              <Sparkles className="w-4 h-4 text-eco-600" />
              Default College Password
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600">
              All students have the default credentials initialized to:
            </p>
            <div className="bg-white p-3 rounded-xl border border-eco-200 font-mono text-[11px] space-y-1">
              <div>Username: <strong className="text-slate-900">{studentRecord?.roll_number || 'Roll Number'}</strong></div>
              <div>Password: <strong className="text-eco-700">stud@sxcce</strong></div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              If you ever forget a custom password, you can always use the <strong>Forgot Password</strong> option on the login page or click the reset button above.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 text-xs text-slate-500 space-y-2">
            <span className="font-bold text-slate-800 block">Security Recommendations</span>
            <ul className="list-disc pl-4 space-y-1 text-[11px]">
              <li>Never share your credentials with others.</li>
              <li>Keep your password at least 6 characters long.</li>
              <li>You can reset back to default at any time.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
