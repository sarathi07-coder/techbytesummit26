'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  FlaskConical, 
  GraduationCap, 
  Building2, 
  Key, 
  Mail, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Send, 
  RefreshCw,
  School as SchoolIcon,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Zap
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { sendOtpCode, getSchools } from '@/lib/supabase';
import { School, UserRole } from '@/types/chemical';

interface InstitutionalLoginGatewayProps {
  onSuccess?: () => void;
  onLoginSuccess?: () => void;
  defaultRole?: UserRole;
}

export default function InstitutionalLoginGateway({
  onSuccess,
  onLoginSuccess,
  defaultRole = 'teacher',
}: InstitutionalLoginGatewayProps) {
  const { loginAsRole, loginWithCredentials, loginWithOtp } = useAuth();

  const triggerSuccess = () => {
    if (onSuccess) onSuccess();
    if (onLoginSuccess) onLoginSuccess();
  };

  const [selectedRole, setSelectedRole] = useState<UserRole>(defaultRole);
  const [authMode, setAuthMode] = useState<'password' | 'otp'>('otp');
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('school-1');

  // Form Fields
  const [identifier, setIdentifier] = useState<string>('selvakumar.chem@tnschools.gov.in');
  const [password, setPassword] = useState<string>('teacher123');
  const [enteredOtp, setEnteredOtp] = useState<string>('');

  // Status & Feedback
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [otpDispatched, setOtpDispatched] = useState<boolean>(false);
  const [simulatedOtpNotice, setSimulatedOtpNotice] = useState<string | null>(null);

  // Pre-created automatic institutional accounts
  const PRESET_ACCOUNTS: Record<string, any> = {
    teacher: {
      name: 'R. Selvakumar, M.Sc.',
      designation: 'Senior PGT Chemistry & Lab Custodian',
      username: 'selvakumar_chem',
      email: 'selvakumar.chem@tnschools.gov.in',
      password: 'teacher123',
      otp: '123456',
      school: 'Govt Higher Secondary School, Pollachi West',
      schoolId: 'school-1',
      badge: 'Classroom Tier 1',
      badgeColor: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300',
    },
    principal: {
      name: 'Dr. K. Meenakshi, Ph.D.',
      designation: 'Headmistress & Institutional Safety Authority',
      username: 'meenakshi_phd',
      email: 'principal.madukkarai@tnschools.gov.in',
      password: 'principal123',
      otp: '123456',
      school: 'Madukkarai Community High School',
      schoolId: 'school-3',
      badge: 'Dual-Key Authority Tier 2',
      badgeColor: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300',
    },
    district_officer: {
      name: 'Er. S. Murugesan, M.Tech (Env)',
      designation: 'District Education Officer & Hazmat Incident Commander',
      username: 'murugesan_deo',
      email: 'deo.hazmat.cbe@tn.gov.in',
      password: 'deo123',
      otp: '123456',
      school: 'Coimbatore District Educational Directorate',
      schoolId: 'all',
      badge: 'District Command Tier 3',
      badgeColor: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    },
  };

  // Load available schools from Supabase / Seed
  useEffect(() => {
    getSchools().then(data => {
      if (data && data.length > 0) {
        setSchools(data);
      }
    });
  }, []);

  // Sync inputs with selected role
  useEffect(() => {
    const acc = PRESET_ACCOUNTS[selectedRole];
    if (acc) {
      setIdentifier(acc.email);
      setPassword(acc.password);
      setSelectedSchoolId(acc.schoolId);
    }
    setOtpDispatched(false);
    setSimulatedOtpNotice(null);
    setStatusMessage(null);
  }, [selectedRole]);

  // Handle Send OTP
  const handleSendOtp = async () => {
    if (!identifier) {
      setStatusMessage({ type: 'error', text: 'Please enter your institutional email or username first.' });
      return;
    }

    const email = identifier.includes('@') ? identifier : `${identifier}@tn.gov.in`;
    setIsLoading(true);
    setStatusMessage(null);

    try {
      const res = await sendOtpCode(email);
      setOtpDispatched(true);
      setSimulatedOtpNotice(res.otp);
      setStatusMessage({
        type: 'success',
        text: `6-Digit verification code dispatched to ${email}. (Evaluation Code: ${res.otp})`
      });
    } catch {
      setStatusMessage({ type: 'error', text: 'Failed to send verification code. Please check your network.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);

    const email = identifier.includes('@') ? identifier : `${identifier}@tn.gov.in`;

    try {
      if (authMode === 'otp') {
        if (!enteredOtp) {
          setStatusMessage({ type: 'error', text: 'Please enter the 6-digit OTP verification code.' });
          setIsLoading(false);
          return;
        }

        const otpRes = await loginWithOtp(email, enteredOtp, selectedRole, selectedSchoolId);
        if (!otpRes.success) {
          setStatusMessage({ type: 'error', text: otpRes.error || 'Invalid OTP code. Try demo code 123456.' });
          setIsLoading(false);
          return;
        }

        setStatusMessage({ type: 'success', text: 'Authentication successful! Loading dashboard...' });
        triggerSuccess();
      } else {
        await loginWithCredentials(email, password, selectedRole, selectedSchoolId);
        setStatusMessage({ type: 'success', text: 'Credentials verified! Redirecting to dashboard...' });
        triggerSuccess();
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Authentication error. Please retry.' });
    } finally {
      setIsLoading(false);
    }
  };

  // One-Click Fast Role Sign-in
  const handleQuickRoleSelect = (role: UserRole) => {
    loginAsRole(role as any);
    triggerSuccess();
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Top Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-medium mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Institutional Multi-Portal Gateway
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Laboratory Safety Governance Login
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto mt-2">
          Select your institutional role to enter your role-scoped laboratory console.
        </p>

        {/* 3-Tier Flow Indicator */}
        <div className="inline-flex items-center gap-2 px-4 py-2 mt-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 font-mono">
          <span className="text-cyan-400 font-bold">1. Teacher</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-indigo-400 font-bold">2. Headmaster</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-emerald-400 font-bold">3. DEO Officer</span>
        </div>
      </div>

      {/* 3 Separate Role Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* 1. Science Teacher Card */}
        <div
          onClick={() => setSelectedRole('teacher')}
          className={`p-5 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden cursor-pointer group ${
            selectedRole === 'teacher'
              ? 'bg-gradient-to-b from-cyan-950/80 to-slate-900 border-cyan-500/90 shadow-xl shadow-cyan-500/10 ring-2 ring-cyan-500/40'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition">
              <FlaskConical className="w-6 h-6" />
            </div>
            {selectedRole === 'teacher' && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                Active Portal
              </span>
            )}
          </div>
          <h3 className="font-bold text-white text-lg">Science Teacher</h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
            Laboratory Reagent Shelf, Onboard Reagent, 3D Bottles & 2D Cabinet Incompatibility.
          </p>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] font-mono text-cyan-400">R. Selvakumar, M.Sc.</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleQuickRoleSelect('teacher');
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 text-cyan-200 hover:text-slate-950 font-bold transition flex items-center gap-1"
            >
              <Zap className="w-3 h-3" />
              1-Click
            </button>
          </div>
        </div>

        {/* 2. Principal / Headmaster Card */}
        <div
          onClick={() => setSelectedRole('principal')}
          className={`p-5 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden cursor-pointer group ${
            selectedRole === 'principal'
              ? 'bg-gradient-to-b from-indigo-950/80 to-slate-900 border-indigo-500/90 shadow-xl shadow-indigo-500/10 ring-2 ring-indigo-500/40'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition">
              <GraduationCap className="w-6 h-6" />
            </div>
            {selectedRole === 'principal' && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                Active Portal
              </span>
            )}
          </div>
          <h3 className="font-bold text-white text-lg">Headmaster / Principal</h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
            LangGraph Dual-Key HITL Authorization, Evacuation Siren & 2D Cabinet Compliance.
          </p>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] font-mono text-indigo-400">Dr. K. Meenakshi, Ph.D.</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleQuickRoleSelect('principal');
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500 text-indigo-200 hover:text-white font-bold transition flex items-center gap-1"
            >
              <Zap className="w-3 h-3" />
              1-Click
            </button>
          </div>
        </div>

        {/* 3. District Officer (DEO) Card */}
        <div
          onClick={() => setSelectedRole('district_officer')}
          className={`p-5 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden cursor-pointer group ${
            selectedRole === 'district_officer'
              ? 'bg-gradient-to-b from-emerald-950/80 to-slate-900 border-emerald-500/90 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/40'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition">
              <Building2 className="w-6 h-6" />
            </div>
            {selectedRole === 'district_officer' && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Active Portal
              </span>
            )}
          </div>
          <h3 className="font-bold text-white text-lg">District Officer (DEO)</h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
            District GIS Route (100.2 km), Scientific Evaluation & Inter-School Exchange.
          </p>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] font-mono text-emerald-400">Er. S. Murugesan</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleQuickRoleSelect('district_officer');
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-200 hover:text-slate-950 font-bold transition flex items-center gap-1"
            >
              <Zap className="w-3 h-3" />
              1-Click
            </button>
          </div>
        </div>
      </div>

      {/* Main Form Box */}
      <div className="max-w-xl mx-auto w-full bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative">
        {/* Header of Auth Box */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-800">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
              Institutional Console Sign-In
            </span>
            <h2 className="text-xl font-bold text-white capitalize mt-0.5">
              {(selectedRole || 'teacher').replace(/_/g, ' ')} Portal
            </h2>
          </div>

          {/* Mode Switcher */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setAuthMode('otp')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                authMode === 'otp'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Email OTP
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('password')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                authMode === 'password'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Password
            </button>
          </div>
        </div>

        {/* Status Alert Banner */}
        {statusMessage && (
          <div
            className={`mt-4 p-3.5 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>{statusMessage.text}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* School Selector (for Teacher & Principal) */}
          {selectedRole !== 'district_officer' && (
            <div>
              <label htmlFor="login-school-select" className="block text-xs font-medium text-slate-300 mb-1.5">
                School Campus
              </label>
              <div className="relative">
                <select
                  id="login-school-select"
                  name="school_id"
                  autoComplete="organization"
                  value={selectedSchoolId}
                  onChange={(e) => setSelectedSchoolId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition appearance-none"
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

          {/* Identifier (Email / Username) */}
          <div>
            <label htmlFor="login-identifier-input" className="block text-xs font-medium text-slate-300 mb-1.5">
              Official Government Email or Username
            </label>
            <div className="relative">
              <input
                id="login-identifier-input"
                name="username"
                autoComplete="username"
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. selvakumar.chem@tnschools.gov.in"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 pl-10 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Mode A: OTP Login */}
          {authMode === 'otp' ? (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <label htmlFor="login-otp-input" className="block text-xs font-medium text-slate-300">
                  6-Digit Security OTP Code
                </label>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isLoading}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  {otpDispatched ? 'Resend Code' : 'Dispatch Email Code'}
                </button>
              </div>

              <div className="relative">
                <input
                  id="login-otp-input"
                  name="one-time-code"
                  autoComplete="one-time-code"
                  type="text"
                  maxLength={6}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                  placeholder="Enter 6-digit code (demo: 123456)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 pl-10 text-sm font-mono tracking-widest text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                />
                <Key className="w-4 h-4 text-cyan-500 absolute left-3.5 top-3.5" />
              </div>

              {simulatedOtpNotice && (
                <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800/50 flex items-center justify-between text-xs text-cyan-300">
                  <span>Dispatched Verification Code:</span>
                  <button
                    type="button"
                    onClick={() => setEnteredOtp(simulatedOtpNotice)}
                    className="font-mono font-bold bg-cyan-500/20 px-2 py-0.5 rounded hover:bg-cyan-500/30 transition text-cyan-200"
                  >
                    {simulatedOtpNotice} (Auto-Fill)
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Mode B: Password Login */
            <div>
              <label htmlFor="login-password-input" className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password-input"
                  name="password"
                  autoComplete="current-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter account password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 pl-10 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 py-3 px-4 rounded-xl font-semibold text-xs tracking-wide uppercase bg-gradient-to-r from-cyan-500 via-indigo-600 to-emerald-500 hover:from-cyan-400 hover:via-indigo-500 hover:to-emerald-400 text-white shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Verifying Credentials...
              </>
            ) : (
              <>
                <span>Enter as {(selectedRole || 'teacher').replace(/_/g, ' ')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </>
            )}
          </button>
        </form>

        {/* Fast 1-Click Launch Button */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => handleQuickRoleSelect(selectedRole)}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold transition flex items-center justify-center gap-2 border border-slate-700/60"
          >
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Launch Pre-Created Profile ({PRESET_ACCOUNTS[selectedRole].name})</span>
          </button>
        </div>
      </div>

      {/* Bottom Registration Links */}
      <div className="mt-8 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-center gap-4">
        <div>
          Need to onboard a new user?{' '}
          <Link href="/register" className="text-cyan-400 hover:underline font-semibold">
            Register User & Verify OTP
          </Link>
        </div>
        <span className="hidden sm:inline text-slate-600">•</span>
        <div>
          Need to onboard a school?{' '}
          <Link href="/register/school" className="text-emerald-400 hover:underline font-semibold">
            Register School Campus
          </Link>
        </div>
      </div>
    </div>
  );
}
