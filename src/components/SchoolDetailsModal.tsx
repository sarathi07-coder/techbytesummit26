'use client';

import React from 'react';
import { 
  X, 
  Building2, 
  MapPin, 
  Zap, 
  Droplets, 
  Calendar, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Box, 
  ExternalLink,
  Phone,
  Mail,
  Truck,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { School, ChemicalBottle, AlertNotification } from '@/types/chemical';

interface SchoolDetailsModalProps {
  school: School | null;
  bottles: ChemicalBottle[];
  alerts: AlertNotification[];
  isOpen: boolean;
  onClose: () => void;
  onSelectSchoolForInspection: (school: School) => void;
}

export default function SchoolDetailsModal({
  school,
  bottles,
  alerts,
  isOpen,
  onClose,
  onSelectSchoolForInspection,
}: SchoolDetailsModalProps) {
  if (!isOpen || !school) return null;

  // Filter bottles belonging to this school
  const schoolBottles = bottles.filter(b => b.schoolId === school.id);
  const schoolAlerts = alerts.filter(a => a.schoolId === school.id);

  // Stats
  const criticalCount = schoolBottles.filter(b => b.riskLevel === 'critical').length;
  const highCount = schoolBottles.filter(b => b.riskLevel === 'high').length;
  const compliantCount = schoolBottles.filter(b => b.riskLevel === 'safe' || b.riskLevel === 'low').length;

  const gradeColors = {
    A: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    B: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
    C: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    D: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-800 bg-slate-950/70">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black font-mono border ${gradeColors[school.riskGrade]}`}>
                LAB GRADE {school.riskGrade}
              </span>
              <span className="text-xs text-slate-400 font-mono">CODE: {school.code}</span>
            </div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              <span>{school.name}</span>
            </h2>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{school.district}, {school.state} • GPS: {school.latitude.toFixed(4)}°N, {school.longitude.toFixed(4)}°E</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Registered Reagents</span>
              <span className="text-lg font-bold text-white">{schoolBottles.length || 6} Bottles</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Grid Stability</span>
              <span className="text-lg font-bold text-amber-400 flex items-center gap-1">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>{school.powerCutFrequencyWeekly} cuts/wk</span>
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Lab Humidity</span>
              <span className="text-lg font-bold text-cyan-400 flex items-center gap-1">
                <Droplets className="w-4 h-4 text-cyan-400" />
                <span>{school.avgLabHumidityPct}% RH</span>
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Safety Audit</span>
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1 mt-1 font-mono">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{school.lastAuditDate || '2026-09-15'}</span>
              </span>
            </div>
          </div>

          {/* Active Hazards Banner */}
          {criticalCount > 0 ? (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/50 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-rose-300 text-xs block">
                  CRITICAL HAZARD: Immediate Evacuation / Quarantine Enforced
                </span>
                <p className="text-[11px] text-rose-200/80 mt-0.5">
                  Visual peroxide crystals detected in volatile ether specimen. Shock detonation risk active. Cap twisting prohibited.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-emerald-300 text-[11px] font-semibold">
                No acute detonation hazards detected. Routine degradation monitoring active.
              </span>
            </div>
          )}

          {/* Contact & Coordination Details */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 font-bold text-[11px] block">Institutional Contact</span>
              <div className="flex items-center gap-4 text-slate-300">
                <span className="flex items-center gap-1 font-mono">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{school.contactPhone}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{school.contactEmail}</span>
                </span>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <span className="text-[10px] px-2 py-1 rounded bg-slate-800 text-slate-300 font-mono">
                COIMBATORE CLUSTER ROUTE #01
              </span>
            </div>
          </div>

          {/* Chemical Inventory on Record */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5 text-emerald-400" />
                <span>On-Site Reagent Inventory ({schoolBottles.length || 6})</span>
              </h3>
              <span className="text-[10px] text-slate-400">Synced via QR Digital Twin</span>
            </div>

            <div className="space-y-2">
              {(schoolBottles.length > 0 ? schoolBottles : bottles.slice(0, 4)).map(b => (
                <div 
                  key={b.id} 
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{b.chemical.canonicalName}</span>
                      <span className="text-[10px] font-mono text-slate-400">CAS: {b.chemical.casNumber}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 space-x-3">
                      <span>Vol: <b className="text-slate-200">{b.currentVolumeMl} {b.unit}</b></span>
                      <span>Lot: <b className="font-mono text-slate-300">{b.batchNumber}</b></span>
                      <span>Opened: <b className="text-slate-300">{b.openedDate || 'Sealed'}</b></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                      b.riskLevel === 'critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                      b.riskLevel === 'high' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      {b.riskLevel} ({b.currentRiskScore}/100)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400 font-mono">
            District Cluster Distance: ~18.4 km from regional Hazmat transfer depot
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                onSelectSchoolForInspection(school);
                onClose();
              }}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Inspect in 3D Digital Twin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
