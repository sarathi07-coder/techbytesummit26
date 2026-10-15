'use client';

import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  UserCheck, 
  Key, 
  Building, 
  Mail, 
  Lock, 
  User, 
  ChevronRight, 
  GraduationCap, 
  Sparkles,
  Award,
  Truck,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { useAuth, PRESET_USERS } from '@/lib/auth-context';
import { UserRole } from '@/types/chemical';
import { SEED_SCHOOLS } from '@/lib/seed-data';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { currentUser, loginAsRole, loginWithCredentials, signUp } = useAuth();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  
  // Sign in state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInRole, setSignInRole] = useState<UserRole>('teacher');
  const [signInSchoolId, setSignInSchoolId] = useState('school-1');

  // Sign up state
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpRole, setSignUpRole] = useState<UserRole>('teacher');
  const [signUpSchoolId, setSignUpSchoolId] = useState('school-1');

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;


  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail) {
      alert('Please enter your official institutional email.');
      return;
    }
    await loginWithCredentials(signInEmail, signInPassword, signInRole, signInSchoolId);
    setStatusMessage(`Welcome back! Authenticated as ${signInEmail}`);
    setTimeout(() => {
      onClose();
      setStatusMessage(null);
    }, 400);
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpName || !signUpEmail) {
      alert('Please fill in your name and institutional email.');
      return;
    }
    await signUp(signUpName, signUpEmail, signUpPassword, signUpRole, signUpSchoolId);
    setStatusMessage(`Account registered for ${signUpName} (${signUpRole})!`);
    setTimeout(() => {
      onClose();
      setStatusMessage(null);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Institutional Authentication & RBAC</span>
              </h2>
              <p className="text-xs text-slate-400">
                Multi-tier access control for Science Teachers, Principals, and District Officers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/40 px-5 pt-3 text-xs gap-2">
          <button
            onClick={() => setTab('signin')}
            className={`pb-3 px-3 font-bold border-b-2 transition-all cursor-pointer ${
              tab === 'signin'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🔑 Institutional Sign In
          </button>
          <button
            onClick={() => setTab('signup')}
            className={`pb-3 px-3 font-bold border-b-2 transition-all cursor-pointer ${
              tab === 'signup'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            📝 Register New Account
          </button>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">

          {/* TAB 2: INSTITUTIONAL SIGN IN */}
          {tab === 'signin' && (
            <form onSubmit={handleSignInSubmit} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Institutional Email / EMIS ID
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    id="modal-signin-email"
                    name="email"
                    autoComplete="username"
                    type="email"
                    required
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="e.g. teacher.chem@tnschools.gov.in"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="modal-signin-password" className="text-[11px] font-semibold text-slate-300 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    id="modal-signin-password"
                    name="password"
                    autoComplete="current-password"
                    type="password"
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="modal-signin-role" className="text-[11px] font-semibold text-slate-300 block mb-1">Role Type</label>
                  <select
                    id="modal-signin-role"
                    name="user_role"
                    value={signInRole}
                    onChange={(e) => setSignInRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="teacher">Science Teacher / Lab Custodian</option>
                    <option value="principal">Headmaster / Principal</option>
                    <option value="district_officer">District Hazmat Officer</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="modal-signin-school" className="text-[11px] font-semibold text-slate-300 block mb-1">Assigned School</label>
                  <select
                    id="modal-signin-school"
                    name="school_id"
                    value={signInSchoolId}
                    onChange={(e) => setSignInSchoolId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    {SEED_SCHOOLS.map(s => (
                      <option key={s.id} value={s.id}>{s.name.slice(0, 24)}...</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer mt-4"
              >
                <Key className="w-4 h-4" />
                <span>Authenticate Institutional Session</span>
              </button>
            </form>
          )}

          {/* TAB 3: REGISTER NEW ACCOUNT */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Full Legal Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    id="modal-signup-name"
                    name="name"
                    autoComplete="name"
                    type="text"
                    required
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    placeholder="e.g. S. Jayachandran, M.Sc."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="modal-signup-email" className="text-[11px] font-semibold text-slate-300 block mb-1">Govt Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    id="modal-signup-email"
                    name="email"
                    autoComplete="email"
                    type="email"
                    required
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="e.g. jaya.chem@tnschools.gov.in"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="modal-signup-role" className="text-[11px] font-semibold text-slate-300 block mb-1">Account Role</label>
                  <select
                    id="modal-signup-role"
                    name="role"
                    value={signUpRole}
                    onChange={(e) => setSignUpRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="teacher">Science Teacher / Assistant</option>
                    <option value="principal">Headmaster / Principal</option>
                    <option value="district_officer">District Hazmat Officer</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="modal-signup-school" className="text-[11px] font-semibold text-slate-300 block mb-1">Institution</label>
                  <select
                    id="modal-signup-school"
                    name="school_id"
                    value={signUpSchoolId}
                    onChange={(e) => setSignUpSchoolId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    {(SEED_SCHOOLS || []).map(s => (
                      <option key={s.id} value={s.id}>{s.name.slice(0, 24)}...</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="modal-signup-password" className="text-[11px] font-semibold text-slate-300 block mb-1">Create Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    id="modal-signup-password"
                    name="new_password"
                    autoComplete="new-password"
                    type="password"
                    required
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer mt-4"
              >
                <Sparkles className="w-4 h-4" />
                <span>Create Verified Institutional Profile</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
