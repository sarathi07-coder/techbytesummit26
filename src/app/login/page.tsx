'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import InstitutionalLoginGateway from '@/components/InstitutionalLoginGateway';
import { UserRole } from '@/types/chemical';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = (searchParams.get('role') as UserRole) || 'teacher';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-white">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-emerald-400 p-[1.5px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-cyan-300 via-slate-100 to-emerald-300 bg-clip-text text-transparent">
                  ReagentWatch AI
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  v2.4
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                TN School Chemical Degradation & Hazard Governance
              </p>
            </div>
          </Link>

          <Link
            href="/"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-900 transition flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Home Console
          </Link>
        </div>
      </header>

      {/* Main Login Component */}
      <main className="relative z-10 flex-1 flex flex-col justify-center">
        <InstitutionalLoginGateway 
          defaultRole={initialRole}
          onSuccess={() => {
            router.push('/');
          }}
        />
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950/80 px-6 py-4 text-center text-[11px] text-slate-500 font-mono">
        ReagentWatch AI Multi-Role Gateway • Supabase Cloud PostgreSQL: db.dwudshdnabfaqohlphoc.supabase.co
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-mono">Loading Login Portal...</div>}>
      <LoginContent />
    </Suspense>
  );
}
