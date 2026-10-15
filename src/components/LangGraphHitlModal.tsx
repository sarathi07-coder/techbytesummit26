'use client';

import React, { useState } from 'react';
import { 
  GitBranch, 
  CheckCircle2, 
  AlertTriangle, 
  UserCheck, 
  X, 
  ArrowRight, 
  Clock, 
  FileText, 
  Sparkles,
  ShieldCheck,
  PauseCircle
} from 'lucide-react';
import { ChemicalBottle, AlertNotification } from '@/types/chemical';

interface LangGraphHitlModalProps {
  isOpen: boolean;
  onClose: () => void;
  bottle: ChemicalBottle;
  alert: AlertNotification;
  onApprove: (officerName: string, notes: string) => void;
  onOverride: (notes: string) => void;
}

export default function LangGraphHitlModal({
  isOpen,
  onClose,
  bottle,
  alert: alertItem,
  onApprove,
  onOverride,
}: LangGraphHitlModalProps) {
  const [officerName, setOfficerName] = useState('Dr. K. Senthil Kumar (Principal)');
  const [notes, setNotes] = useState('Quarantine approved. Reagent isolated in sand bucket secondary containment pending cluster hazmat collection.');
  const [currentState, setCurrentState] = useState<'paused' | 'approving' | 'approved'>('paused');

  if (!isOpen) return null;

  const handleConfirmApproval = () => {
    setCurrentState('approving');
    setTimeout(() => {
      setCurrentState('approved');
      setTimeout(() => {
        onApprove(officerName, notes);
        onClose();
      }, 700);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="glass-panel p-6 rounded-2xl border border-slate-700 w-full max-w-2xl space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">LangGraph Human-In-The-Loop (HITL) State Machine</h3>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Interrupted at Checkpoint
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Safety-critical governance: Reagents evaluated $\ge 70$ risk require human administrative sign-off before Hazmat destruction.
            </p>
          </div>
        </div>

        {/* Visual Workflow Graph State */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Execution Flow State Machine
          </span>
          <div className="flex items-center justify-between text-xs text-slate-300 overflow-x-auto pb-1 gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-semibold shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>1. Ingest Event</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-semibold shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>2. Chemistry Engine</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-950/50 border border-purple-500/60 text-purple-200 font-bold shrink-0 animate-pulse">
              <PauseCircle className="w-3.5 h-3.5 text-purple-400" />
              <span>3. HITL Sign-Off (Current)</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 font-semibold shrink-0">
              <Clock className="w-3.5 h-3.5" />
              <span>4. Cluster Hazmat Dispatch</span>
            </div>
          </div>
        </div>

        {/* Hazard Review Dossier */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
            <span className="text-slate-400 block font-semibold">Flagged Chemical Inventory Unit:</span>
            <div className="font-bold text-white text-sm">{bottle.chemical.canonicalName}</div>
            <div className="text-slate-300 font-mono text-[11px]">QR: {bottle.qrCode} • CAS: {bottle.chemical.casNumber}</div>
            <div className="text-slate-300">Volume: <b className="text-white">{bottle.currentVolumeMl} {bottle.unit}</b></div>
          </div>

          <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-1.5">
            <span className="text-rose-400 block font-semibold">Evaluated Severity:</span>
            <div className="text-rose-300 text-base font-black flex items-center gap-2">
              <span>{bottle.currentRiskScore}/100</span>
              <span className="text-xs uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                Critical Danger
              </span>
            </div>
            <div className="text-[11px] text-slate-300">
              Trigger: {bottle.riskFactors[0] || 'Peroxide former crystallization detected'}
            </div>
          </div>
        </div>

        {/* Decision & Electronic Signature Input */}
        <div className="space-y-3 pt-1">
          <div>
            <label htmlFor="hitl-reviewer-name" className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Authorized Reviewer (Principal / Head of Science)
            </label>
            <input
              id="hitl-reviewer-name"
              name="reviewer_name"
              type="text"
              value={officerName}
              onChange={(e) => setOfficerName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label htmlFor="hitl-audit-notes" className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Administrative Custody Directives & Audit Notes
            </label>
            <textarea
              id="hitl-audit-notes"
              name="audit_notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={() => {
              onOverride('Overridden by authority: Routine experiment conducted with verified peroxide strip test.');
              onClose();
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Override & De-escalate
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmApproval}
              disabled={currentState !== 'paused'}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{currentState === 'paused' ? 'Authorize Quarantine & Hazmat Pickup' : 'Signing Docket...'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
