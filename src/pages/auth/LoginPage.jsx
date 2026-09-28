import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Leaf,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  CheckCircle2,
  Shield,
  GraduationCap,
  Info,
  X,
  KeyRound,
  Search,
  RotateCcw,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { resetStudentPassword } from '../../services/api';
import { supabase } from '../../lib/supabase';
import HouseBadge from '../../components/HouseBadge';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [activeRoleHint, setActiveRoleHint] = useState('STUDENT'); // 'ALL', 'ADMIN', 'STUDENT'

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotRoll, setForgotRoll] = useState('');
  const [foundStudent, setFoundStudent] = useState(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [resetNewPass, setResetNewPass] = useState('');
  const [resetConfirmPass, setResetConfirmPass] = useState('');
  const [resetting, setResetting] = useState(false);
  const [forgotError, setForgotError] = useState('');

  const { login, user, role, isConfigured } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLookupStudent = async (e) => {
    if (e) e.preventDefault();
    if (!forgotRoll.trim()) {
      setForgotError('Please enter your College Roll Number.');
      return;
    }
    setLookingUp(true);
    setForgotError('');
    setFoundStudent(null);
    try {
      const cleanRoll = forgotRoll.trim();
      const { data, error } = await supabase
        .from('students')
        .select('*, house:houses(*)')
        .ilike('roll_number', cleanRoll)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        setForgotError(`No student found with Roll Number "${cleanRoll}". Please check your roll number or contact Eco Club administrator.`);
        return;
      }
      setFoundStudent(data);
    } catch (err) {
      console.error('Error finding student:', err);
      setForgotError(err.message || 'Error looking up student record.');
    } finally {
      setLookingUp(false);
    }
  };

  const handleQuickResetDefault = async () => {
    if (!foundStudent?.roll_number) return;
    try {
      setResetting(true);
      setForgotError('');
      await resetStudentPassword(foundStudent.roll_number, 'stud@sxcce');
      success(`Password reset to default (stud@sxcce) for ${foundStudent.name}!`);
      setIdentifier(foundStudent.roll_number);
      setPassword('stud@sxcce');
      setIsForgotModalOpen(false);
    } catch (err) {
      console.error('Reset error:', err);
      setForgotError(err.message || 'Failed to reset password');
    } finally {
      setResetting(false);
    }
  };

  const handleSetCustomPassword = async (e) => {
    e.preventDefault();
    if (!foundStudent?.roll_number) return;
    if (resetNewPass.length < 6) {
      setForgotError('Password must be at least 6 characters long.');
      return;
    }
    if (resetNewPass !== resetConfirmPass) {
      setForgotError('New passwords do not match. Please verify.');
      return;
    }
    try {
      setResetting(true);
      setForgotError('');
      await resetStudentPassword(foundStudent.roll_number, resetNewPass);
      success(`Password reset successfully for ${foundStudent.name}! Credentials filled.`);
      setIdentifier(foundStudent.roll_number);
      setPassword(resetNewPass);
      setIsForgotModalOpen(false);
    } catch (err) {
      console.error('Reset error:', err);
      setForgotError(err.message || 'Failed to reset password');
    } finally {
      setResetting(false);
    }
  };

  // Redirect if already logged in
  useEffect(() => {
    if (user && role) {
      if (role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/student', { replace: true });
      }
    }
  }, [user, role, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);

    if (!identifier.trim() || !password) {
      setAuthError('Please enter both your Roll Number / Email and password.');
      return;
    }

    if (!isConfigured) {
      setAuthError('Supabase is not configured yet. Please configure your .env credentials with your Supabase Project URL and Anon Key.');
      return;
    }

    try {
      setIsSubmitting(true);
      const data = await login(identifier, password);

      success('Welcome back! Successfully authenticated.');

      // Wait a moment for profile to populate or navigate based on state
      const redirectPath = location.state?.from?.pathname;
      if (redirectPath) {
        navigate(redirectPath, { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      let msg = err.message || 'Failed to sign in. Please verify your credentials.';
      if (msg.toLowerCase().includes('invalid login credentials') || msg.toLowerCase().includes('invalid credentials')) {
        msg = activeRoleHint === 'STUDENT'
          ? 'Invalid Roll Number or password. Please verify your credentials and try again.'
          : 'Invalid email or password. Please verify your admin credentials and try again.';
      }
      setAuthError(msg);
      toastError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50 relative overflow-hidden">
      {/* Decorative nature gradient circles */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-eco-200/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-emerald-200/40 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header brand card */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 group mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-eco-700 via-eco-600 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-eco-600/30 group-hover:scale-105 transition">
              <Leaf className="w-6 h-6" />
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Eco Club Portal
          </h1>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            Sign in to access your House dashboard & records
          </p>
        </div>

        {/* Login Form Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 backdrop-blur-md">
          {/* Quick role tabs / guide */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setActiveRoleHint('STUDENT');
                setAuthError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeRoleHint === 'STUDENT'
                  ? 'bg-white text-eco-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              Student Portal
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveRoleHint('ADMIN');
                setAuthError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeRoleHint === 'ADMIN'
                  ? 'bg-white text-eco-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Admin Portal
            </button>
          </div>

          {authError && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{authError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username / Roll Number / Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {activeRoleHint === 'STUDENT' ? 'Student Roll Number' : 'Administrator Email'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  {activeRoleHint === 'STUDENT' ? (
                    <GraduationCap className="w-4 h-4 text-eco-600" />
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                </div>
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    activeRoleHint === 'STUDENT'
                      ? 'Enter your Roll Number (e.g. 502433)'
                      : 'admin@ecoclub.org'
                  }
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-eco-500/20 focus:border-eco-600 transition placeholder:text-slate-400 bg-slate-50/50 font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotRoll(identifier.includes('@') ? '' : identifier);
                    setFoundStudent(null);
                    setForgotError('');
                    setResetNewPass('');
                    setResetConfirmPass('');
                    setIsForgotModalOpen(true);
                  }}
                  className="text-xs text-eco-700 hover:text-eco-800 font-semibold cursor-pointer transition hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-eco-500/20 focus:border-eco-600 transition placeholder:text-slate-400 bg-slate-50/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm bg-eco-600 hover:bg-eco-700 focus:ring-4 focus:ring-eco-500/20 shadow-md shadow-eco-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          <Link to="/" className="text-eco-700 hover:underline font-semibold">
            ← Return to Public Home
          </Link>
          <span className="mx-2">•</span>
          <Link to="/leaderboard" className="text-eco-700 hover:underline font-semibold">
            View Live Leaderboard
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-eco-900 via-eco-800 to-emerald-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-emerald-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base leading-tight">Student Password Recovery</h3>
                  <p className="text-[11px] text-eco-200">Reset your Eco Club Portal access</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              {forgotError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed font-medium">{forgotError}</div>
                </div>
              )}

              {!foundStudent ? (
                /* Step 1: Look up by Roll Number */
                <form onSubmit={handleLookupStudent} className="space-y-4">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Enter Your College Roll Number *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <GraduationCap className="w-4 h-4 text-eco-600" />
                      </div>
                      <input
                        type="text"
                        required
                        value={forgotRoll}
                        onChange={(e) => setForgotRoll(e.target.value)}
                        placeholder="e.g. 502433 or 502411"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-eco-500/20 focus:border-eco-600 transition"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      Your Eco Club account is registered under your college Roll Number.
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsForgotModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={lookingUp}
                      className="px-5 py-2.5 rounded-xl text-white font-bold bg-eco-600 hover:bg-eco-700 shadow-md shadow-eco-600/20 transition cursor-pointer disabled:opacity-60 flex items-center gap-2"
                    >
                      {lookingUp ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Searching...</span>
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4" />
                          <span>Find Student</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* Step 2: Student Found - Choose Reset Option */
                <div className="space-y-4">
                  {/* Student Identity Card */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-eco-50/50 border border-slate-200 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-600" />
                        {foundStudent.name}
                      </div>
                      <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                        Roll: <strong className="text-slate-800">{foundStudent.roll_number}</strong> • Dept: {foundStudent.department}
                      </div>
                    </div>
                    {foundStudent.house?.code && (
                      <HouseBadge code={foundStudent.house.code} size="md" />
                    )}
                  </div>

                  {/* Option 1: Quick Reset to Default */}
                  <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-blue-950 text-xs">
                        Option 1: Quick Reset to Default
                      </span>
                      <span className="text-[10px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                        Recommended
                      </span>
                    </div>
                    <p className="text-[11px] text-blue-900 leading-relaxed">
                      Resets your password to the standard college default: <strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-200 text-blue-800">stud@sxcce</strong>
                    </p>
                    <button
                      type="button"
                      disabled={resetting}
                      onClick={handleQuickResetDefault}
                      className="w-full mt-1 py-2 px-3 rounded-lg text-white font-bold bg-blue-600 hover:bg-blue-700 transition cursor-pointer shadow-xs disabled:opacity-60 flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{resetting ? 'Resetting...' : 'Reset to Default (stud@sxcce)'}</span>
                    </button>
                  </div>

                  {/* Option 2: Set New Custom Password */}
                  <div className="pt-2 border-t border-slate-100">
                    <span className="block font-extrabold text-slate-800 text-xs mb-2">
                      Option 2: Or Set a New Password
                    </span>
                    <form onSubmit={handleSetCustomPassword} className="space-y-3">
                      <div>
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={resetNewPass}
                          onChange={(e) => setResetNewPass(e.target.value)}
                          placeholder="New password (min 6 chars)"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-xs font-medium focus:outline-hidden focus:border-eco-600"
                        />
                      </div>
                      <div>
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={resetConfirmPass}
                          onChange={(e) => setResetConfirmPass(e.target.value)}
                          placeholder="Confirm new password"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-xs font-medium focus:outline-hidden focus:border-eco-600"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setFoundStudent(null);
                            setForgotError('');
                          }}
                          className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold cursor-pointer underline"
                        >
                          ← Search other roll
                        </button>
                        <button
                          type="submit"
                          disabled={resetting}
                          className="py-2 px-4 rounded-lg text-white font-bold bg-eco-600 hover:bg-eco-700 shadow-xs transition cursor-pointer disabled:opacity-60 text-xs"
                        >
                          {resetting ? 'Saving...' : 'Set New Password'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer note */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Need help? Contact Eco Club House Coordinator</span>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
