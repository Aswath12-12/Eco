import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Phone,
  Mail,
  GraduationCap,
  Lock,
  CheckCircle2,
  AlertCircle,
  Building,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { updateStudentContact, changeStudentPassword } from '../../services/api';
import HouseBadge from '../../components/HouseBadge';
import { useToast } from '../../context/ToastContext';

export default function StudentProfilePage() {
  const { user, profile, studentRecord, refreshProfile } = useAuth();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [updating, setUpdating] = useState(false);

  // Sync state when studentRecord updates
  useEffect(() => {
    if (studentRecord) {
      const currentEmail = studentRecord.email || '';
      setEmail(currentEmail.includes('@student.ecoclub.local') ? '' : currentEmail);
      setPhone(studentRecord.phone || '');
    }
  }, [studentRecord]);

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  const { success, error: toastError } = useToast();

  const handleUpdateContact = async (e) => {
    e.preventDefault();
    if (!studentRecord?.id) {
      toastError('Student record not found.');
      return;
    }

    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toastError('Please enter a valid Gmail / Email address (e.g. name@gmail.com).');
      return;
    }

    try {
      setUpdating(true);
      await updateStudentContact(studentRecord.id, {
        email: trimmedEmail || null,
        phone: trimmedPhone || null,
      });
      await refreshProfile();
      success('Personal Gmail and contact phone number updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      toastError(err.message || 'Failed to update contact info');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!studentRecord?.id) {
      toastError('Student record not found.');
      return;
    }

    if (newPassword.length < 6) {
      toastError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toastError('New passwords do not match. Please verify.');
      return;
    }

    try {
      setPasswordUpdating(true);
      await changeStudentPassword(studentRecord.id, newPassword);
      success('Password updated successfully! You can use your new password next time you sign in.');
      setNewPassword('');
      setConfirmPassword('');
      await refreshProfile();
    } catch (err) {
      console.error('Error changing password:', err);
      toastError(err.message || 'Failed to change password');
    } finally {
      setPasswordUpdating(false);
    }
  };

  const handleRevertDefaultPassword = async () => {
    if (!studentRecord?.id) return;
    try {
      setPasswordUpdating(true);
      await changeStudentPassword(studentRecord.id, 'stud@sxcce');
      success('Password reset back to default college password (stud@sxcce)!');
      setNewPassword('');
      setConfirmPassword('');
      await refreshProfile();
    } catch (err) {
      console.error('Error resetting password:', err);
      toastError('Failed to reset password');
    } finally {
      setPasswordUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Student Member Profile
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review your enrolled House credentials and college registration details
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card & Avatar */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs text-center flex flex-col items-center">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-eco-700 via-eco-600 to-emerald-400 text-white text-3xl font-black flex items-center justify-center shadow-lg shadow-eco-600/20 border-4 border-white">
              {studentRecord?.name?.charAt(0)?.toUpperCase() || profile?.name?.charAt(0)?.toUpperCase() || 'S'}
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-xs">
              ✓
            </div>
          </div>

          <h2 className="text-lg font-black text-slate-900">{studentRecord?.name || profile?.name}</h2>
          <p className="text-xs font-mono font-bold text-slate-500 mt-0.5">
            Roll: {studentRecord?.roll_number || 'N/A'}
          </p>

          <div className="mt-3">
            <HouseBadge code={studentRecord?.house?.code} size="lg" />
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 w-full text-xs text-slate-500 space-y-1.5 text-left">
            <div className="flex items-center justify-between">
              <span>Department:</span>
              <span className="font-bold text-slate-800">{studentRecord?.department}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Class Year:</span>
              <span className="font-bold text-slate-800">{studentRecord?.year}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Status:</span>
              <span className="font-bold text-emerald-700">{studentRecord?.status || 'ACTIVE'}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <span>Email / Gmail:</span>
              <span className="font-semibold text-slate-800 truncate max-w-[130px]" title={studentRecord?.email}>
                {studentRecord?.email || <span className="text-amber-600 font-bold">Add below</span>}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Phone:</span>
              <span className="font-semibold text-slate-800">
                {studentRecord?.phone || <span className="text-amber-600 font-bold">Add below</span>}
              </span>
            </div>
          </div>
        </div>

        {/* Details & Allowed Updates */}
        <div className="md:col-span-2 space-y-6">
          {/* Read-Only Academic Attributes */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-eco-600" />
                Academic & House Allocation Record
              </h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                <Lock className="w-3 h-3" /> Managed by Admin
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Student Name</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{studentRecord?.name}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">College Roll Number</span>
                <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">
                  {studentRecord?.roll_number}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Department</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {studentRecord?.department}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Year of Study</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{studentRecord?.year}</span>
              </div>

              <div className="sm:col-span-2 p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Allocated House</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                    {studentRecord?.house?.name} ({studentRecord?.house?.code})
                  </span>
                </div>
                <HouseBadge code={studentRecord?.house?.code} size="md" />
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-4">
              Note: House allocation, roll number, and academic year are maintained by Eco Club administrators to maintain competition integrity.
            </p>
          </div>

          {/* Permitted Profile Info Form: Personal Gmail & Phone */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Phone className="w-4 h-4 text-eco-600" />
                Update Contact Information
              </h3>
              {(!studentRecord?.email || studentRecord.email.includes('@ecoclub.org') || studentRecord.email.includes('@student.ecoclub.local')) ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  First Time Setup
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Verified
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Students can add and update their personal Gmail address and contact phone number below.
            </p>

            {(!studentRecord?.email || studentRecord.email.includes('@ecoclub.org') || studentRecord.email.includes('@student.ecoclub.local')) && (
              <div className="mb-4 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="block font-bold">First Time Profile Setup</strong>
                  Please enter your personal Gmail and mobile phone number so your House coordinators can reach you for drives and mark certificates.
                </div>
              </div>
            )}

            <form onSubmit={handleUpdateContact} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Personal Email / Gmail Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4 text-eco-600" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your personal Gmail (e.g. name@gmail.com)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-eco-500/20 focus:border-eco-600 transition"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Every student can link and update their personal Gmail at any time.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Contact Phone / WhatsApp Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4 text-eco-600" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-eco-500/20 focus:border-eco-600 transition"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Used for urgent House activities, reminders, and certificates.
                </p>
              </div>

              <button
                type="submit"
                disabled={updating}
                className="px-6 py-2.5 rounded-xl text-white font-bold bg-eco-600 hover:bg-eco-700 shadow-md shadow-eco-600/20 transition cursor-pointer disabled:opacity-60 flex items-center gap-2"
              >
                {updating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving Contact Info...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Contact Info</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Reset / Change Password Section */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-eco-600" />
                Reset & Change Password
              </h3>
              <span className="text-[11px] font-semibold text-eco-700 bg-eco-50 px-2 py-0.5 rounded-md border border-eco-200">
                Default: stud@sxcce
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Change your password from the default college password to a personal one
            </p>

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  New Password (min 6 characters) *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium focus:outline-hidden focus:border-eco-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium focus:outline-hidden focus:border-eco-600"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={passwordUpdating}
                  className="px-5 py-2.5 rounded-xl text-white font-bold bg-eco-600 hover:bg-eco-700 shadow-xs transition cursor-pointer disabled:opacity-60"
                >
                  {passwordUpdating ? 'Updating...' : 'Update Password'}
                </button>
                <button
                  type="button"
                  onClick={handleRevertDefaultPassword}
                  disabled={passwordUpdating}
                  className="px-3.5 py-2.5 rounded-xl text-slate-700 font-bold bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                >
                  Reset to Default (stud@sxcce)
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
