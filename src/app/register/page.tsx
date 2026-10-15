'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldAlert, 
  FlaskConical, 
  GraduationCap, 
  Building2, 
  User, 
  Mail, 
  Lock, 
  Key, 
  Phone, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Send,
  School as SchoolIcon,
  Sparkles,
  ArrowLeft,
  AtSign
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getSchools, sendOtpCode, verifyOtpCode } from '@/lib/supabase';
import { School, UserRole } from '@/types/chemical';

export default function RegisterUserPage() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [role, setRole] = useState<UserRole>('teacher');
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('school-1');

  // Form Fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // OTP State
  const [enteredOtp, setEnteredOtp] = useState('');
  const [dispatchedOtp, setDispatchedOtp] = useState<string | null>(null);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    getSchools().then(data => {
      if (data && data.length > 0) {
        setSchools(data);
        setSelectedSchoolId(data[0].id);
      }
    });
  }, []);

  // Step 1: Dispatch OTP
  const handleInitiateRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !username) {
      setFeedback({ type: 'error', message: 'Please fill in all mandatory institutional fields.' });
      return;
    }

    if (password !== confirmPassword) {
      setFeedback({ type: 'error', message: 'Passwords do not match. Please re-enter.' });
      return;
    }

    if (password.length < 6) {
      setFeedback({ type: 'error', message: 'Password must be at least 6 characters long.' });
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    try {
      const res = await sendOtpCode(email);
      setDispatchedOtp(res.otp);
      setStep('otp');
      setFeedback({
        type: 'success',
        message: `Verification code generated and dispatched to ${email}. (Evaluation Code: ${res.otp})`
      });
    } catch {
      setFeedback({ type: 'error', message: 'Failed to dispatch verification email. Please check connectivity.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP and commit user to database
  const handleVerifyAndFinalize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredOtp) {
      setFeedback({ type: 'error', message: 'Please enter the 6-digit OTP verification code.' });
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    try {
      const otpRes = await verifyOtpCode(email, enteredOtp);
      if (!otpRes.success) {
        setFeedback({ type: 'error', message: otpRes.error || 'Invalid OTP code. Use 123456 or the dispatched code.' });
        setIsLoading(false);
        return;
      }

      // Register and sign in with Supabase
      await signUp(name, email, password, role, selectedSchoolId, username);

      setFeedback({
        type: 'success',
        message: 'Registration verified and committed to Supabase! Launching console...'
      });

      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Error creating account.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-white">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/login" className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition">
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            <span className="font-bold text-sm tracking-tight text-white">
              Institutional User Registration
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-2xl mx-auto px-4 py-8 w-full">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Supabase RBAC & Email OTP Verification
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Create Institutional Account
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto mt-1">
            Register as an authorized Teacher, Principal, or District Hazmat Officer.
          </p>
        </div>

        {/* Form Box */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          {feedback && (
            <div
              className={`mb-6 p-4 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${
                feedback.type === 'success'
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-950/70 border-rose-500/50 text-rose-300'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>{feedback.message}</div>
            </div>
          )}

          {step === 'details' ? (
            <form onSubmit={handleInitiateRegistration} className="space-y-4">
              {/* Role Picker */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Select Institutional Role *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('teacher')}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                      role === 'teacher'
                        ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <FlaskConical className="w-5 h-5" />
                    <span className="text-[11px] font-bold">Teacher</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('principal')}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                      role === 'principal'
                        ? 'bg-indigo-950/80 border-indigo-500 text-indigo-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <GraduationCap className="w-5 h-5" />
                    <span className="text-[11px] font-bold">Principal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('district_officer')}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                      role === 'district_officer'
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Building2 className="w-5 h-5" />
                    <span className="text-[11px] font-bold">DEO Officer</span>
                  </button>
                </div>
              </div>

              {/* School Picker (if not DEO) */}
              {role !== 'district_officer' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-slate-300">
                      Affiliated Secondary School *
                    </label>
                    <Link href="/register/school" className="text-[11px] text-cyan-400 hover:underline">
                      + Add New School
                    </Link>
                  </div>
                  <div className="relative">
                    <select
                      id="register-school-select"
                      name="school_id"
                      autoComplete="organization"
                      value={selectedSchoolId}
                      onChange={(e) => setSelectedSchoolId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition appearance-none"
                    >
                      {(schools || []).map((sch) => (
                        <option key={sch.id} value={sch.id}>
                          {sch.name} ({sch.district})
                        </option>
                      ))}
                    </select>
                    <SchoolIcon className="w-4 h-4 text-slate-500 absolute right-3.5 top-3 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Name & Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="register-name-input" className="block text-xs font-medium text-slate-300 mb-1.5">
                    Full Legal Name *
                  </label>
                  <div className="relative">
                    <input
                      id="register-name-input"
                      name="name"
                      autoComplete="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. R. Selvakumar, M.Sc."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 pl-10 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                    />
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  </div>
                </div>

                <div>
                  <label htmlFor="register-username-input" className="block text-xs font-medium text-slate-300 mb-1.5">
                    Username *
                  </label>
                  <div className="relative">
                    <input
                      id="register-username-input"
                      name="username"
                      autoComplete="username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. selvakumar_pgt"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 pl-10 text-xs text-slate-200 font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                    />
                    <AtSign className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  </div>
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="register-email-input" className="block text-xs font-medium text-slate-300 mb-1.5">
                    Institutional Email *
                  </label>
                  <div className="relative">
                    <input
                      id="register-email-input"
                      name="email"
                      autoComplete="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="selvakumar@tn.gov.in"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 pl-10 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                    />
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  </div>
                </div>

                <div>
                  <label htmlFor="register-phone-input" className="block text-xs font-medium text-slate-300 mb-1.5">
                    Contact Phone *
                  </label>
                  <div className="relative">
                    <input
                      id="register-phone-input"
                      name="tel"
                      autoComplete="tel"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 94421 88301"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 pl-10 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                    />
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  </div>
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="register-password-input" className="block text-xs font-medium text-slate-300 mb-1.5">
                    Create Password *
                  </label>
                  <div className="relative">
                    <input
                      id="register-password-input"
                      name="password"
                      autoComplete="new-password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 pl-10 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                    />
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  </div>
                </div>

                <div>
                  <label htmlFor="register-confirm-password-input" className="block text-xs font-medium text-slate-300 mb-1.5">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      id="register-confirm-password-input"
                      name="confirm_password"
                      autoComplete="new-password"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 pl-10 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                    />
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  </div>
                </div>
              </div>

              {/* Submit Step 1 Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 py-3 px-4 rounded-xl font-semibold text-xs tracking-wide uppercase bg-gradient-to-r from-cyan-500 via-indigo-600 to-emerald-500 hover:from-cyan-400 hover:via-indigo-500 text-white shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating 6-Digit Email OTP...
                  </>
                ) : (
                  <>
                    <span>Proceed to Email OTP Verification</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Step 2: OTP Entry */
            <form onSubmit={handleVerifyAndFinalize} className="space-y-5">
              <div className="text-center py-2">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 mx-auto flex items-center justify-center mb-2">
                  <Key className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-base">Enter Verification Code</h3>
                <p className="text-xs text-slate-400 mt-1">
                  We sent a 6-digit verification code to <span className="text-cyan-300 font-mono">{email}</span>.
                </p>
              </div>

              {dispatchedOtp && (
                <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/50 flex items-center justify-between text-xs text-cyan-300">
                  <span>Dispatched OTP Code:</span>
                  <button
                    type="button"
                    onClick={() => setEnteredOtp(dispatchedOtp)}
                    className="font-mono font-bold bg-cyan-500/20 px-2.5 py-1 rounded-lg hover:bg-cyan-500/30 transition text-cyan-200 border border-cyan-500/30"
                  >
                    {dispatchedOtp} (Auto-Fill)
                  </button>
                </div>
              )}

              <div>
                <label htmlFor="register-otp-input" className="block text-xs font-medium text-slate-300 mb-1.5 text-center">
                  6-Digit OTP Security Code
                </label>
                <input
                  id="register-otp-input"
                  name="one-time-code"
                  autoComplete="one-time-code"
                  type="text"
                  maxLength={6}
                  required
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                  placeholder="e.g. 123456"
                  className="w-full text-center bg-slate-950 border border-slate-800 rounded-xl py-3 text-lg font-mono tracking-widest text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="w-1/3 py-2.5 px-3 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold transition"
                >
                  Edit Details
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 rounded-xl font-semibold text-xs tracking-wide uppercase bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Verifying with Supabase...
                    </>
                  ) : (
                    <>
                      <span>Activate & Launch Dashboard</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="text-cyan-400 hover:underline font-semibold">
              Sign In Here
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950/80 px-6 py-4 text-center text-[11px] text-slate-500 font-mono">
        ReagentWatch AI Multi-Role Authentication Protocol • Supabase Cloud PostgreSQL
      </footer>
    </div>
  );
}
