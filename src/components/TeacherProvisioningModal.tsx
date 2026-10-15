'use client';

import React, { useState } from 'react';
import { useAuth, TeacherProfile } from '@/lib/auth-context';
import { School } from '@/types/chemical';
import { 
  UserPlus, 
  X, 
  Check, 
  Key, 
  Mail, 
  User, 
  Building2, 
  FlaskConical, 
  ShieldCheck, 
  Copy, 
  CheckCircle2 
} from 'lucide-react';

interface TeacherProvisioningModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSchool: School;
  onTeacherCreated?: (teacher: TeacherProfile) => void;
}

export function TeacherProvisioningModal({
  isOpen,
  onClose,
  currentSchool,
  onTeacherCreated,
}: TeacherProvisioningModalProps) {
  const { createTeacherByPrincipal, currentUser } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [labRoom, setLabRoom] = useState('Senior Chemistry Lab 102');
  const [password, setPassword] = useState('Teacher@2026');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTeacher, setCreatedTeacher] = useState<TeacherProfile | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await createTeacherByPrincipal({
        name,
        email,
        username: username || `TCH-${name.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
        password,
        schoolId: currentSchool.id,
        labRoom,
      });

      if (res.success && res.teacher) {
        setCreatedTeacher(res.teacher);
        if (onTeacherCreated) onTeacherCreated(res.teacher);
      } else {
        setError(res.error || 'Failed to create teacher account');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdTeacher) return;
    const creds = `ReagentWatch Teacher Login:\nName: ${createdTeacher.name}\nEmail: ${createdTeacher.email}\nLogin ID / Username: ${createdTeacher.username}\nTemporary Password: ${password}\nAssigned School: ${currentSchool.name}\nAssigned Lab: ${labRoom}`;
    navigator.clipboard.writeText(creds);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setUsername('');
    setLabRoom('Senior Chemistry Lab 102');
    setPassword('Teacher@2026');
    setCreatedTeacher(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-purple-500/30 bg-slate-950 p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                Provision Science Teacher Credentials
              </h2>
              <p className="text-[11px] text-slate-400">
                Institutional Authority: Headmaster / Principal Quorum
              </p>
            </div>
          </div>
          <button
            onClick={resetForm}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success View */}
        {createdTeacher ? (
          <div className="py-4 space-y-4 animate-in fade-in">
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>New Chemistry Teacher Provisioned Successfully!</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Account activated for <b>{createdTeacher.name}</b> at <b>{currentSchool.name}</b>. The teacher can now authenticate at the Institutional Login Gateway.
              </p>
            </div>

            {/* Generated Credentials Card */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Account Credentials</span>
                <span className="text-emerald-400 text-[10px]">ACTIVE FOR LOGIN</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Teacher Name:</span>
                <span className="text-white font-bold">{createdTeacher.name}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Login ID / Username:</span>
                <span className="text-cyan-400 font-bold">{createdTeacher.username}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Official Email:</span>
                <span className="text-slate-200">{createdTeacher.email}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Assigned Laboratory:</span>
                <span className="text-indigo-300">{createdTeacher.labRoom}</span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-slate-400">Temporary Password:</span>
                <span className="text-amber-400 font-bold">{password}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Credentials'}</span>
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit} className="py-4 space-y-3.5">
            {error && (
              <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-500/40 text-xs text-rose-300">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="teacher-prov-name" className="text-[11px] font-semibold text-slate-300 block mb-1">
                Teacher Full Name (with Title) *
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  id="teacher-prov-name"
                  name="teacher_name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mrs. Priya Sundaram, M.Sc."
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="teacher-prov-email" className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Institutional Email *
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    id="teacher-prov-email"
                    name="teacher_email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. priya.chem@tnschools.gov.in"
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="teacher-prov-username" className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Teacher Login ID / Code
                </label>
                <input
                  id="teacher-prov-username"
                  name="teacher_username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. TCH-CHE-105"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono uppercase focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="teacher-prov-lab" className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Assigned Chemistry Lab
                </label>
                <div className="relative">
                  <FlaskConical className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    id="teacher-prov-lab"
                    name="teacher_lab_room"
                    type="text"
                    value={labRoom}
                    onChange={(e) => setLabRoom(e.target.value)}
                    placeholder="e.g. Senior Chemistry Lab 102"
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="teacher-prov-password" className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Temporary Password *
                </label>
                <div className="relative">
                  <Key className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    id="teacher-prov-password"
                    name="teacher_password"
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 font-mono text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <span className="font-bold text-slate-300 block">Institutional Governance Binding:</span>
              <p>
                Authorizing Headmaster: <b className="text-white">{currentUser.name}</b> • School: <b className="text-white">{currentSchool.name}</b>.
                Newly provisioned teachers inherit classroom custodian permissions (bottle scanning, anomaly logging, CAS validation).
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isSubmitting ? 'Provisioning...' : 'Provision Teacher Account'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
