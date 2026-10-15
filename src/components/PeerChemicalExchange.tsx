'use client';

import React, { useState } from 'react';
import { RefreshCw, ArrowRightLeft, CheckCircle2, MapPin, Truck, Sparkles, FileText, ArrowRight } from 'lucide-react';

interface ExchangeMatch {
  id: string;
  chemicalName: string;
  sourceSchool: string;
  targetSchool: string;
  distanceKm: number;
  availableVolume: string;
  daysRemainingBeforeExpiry: number;
  costSavedInr: number;
  status: 'available' | 'matched' | 'transferred';
}

export default function PeerChemicalExchange() {
  const [matches, setMatches] = useState<ExchangeMatch[]>([
    {
      id: 'match-1',
      chemicalName: 'Sodium Hydroxide Pellets (AR Grade)',
      sourceSchool: 'Govt Higher Secondary School, Pollachi West',
      targetSchool: 'Sulur Rural Model Secondary School',
      distanceKm: 18.2,
      availableVolume: '340 g surplus',
      daysRemainingBeforeExpiry: 120,
      costSavedInr: 850,
      status: 'available',
    },
    {
      id: 'match-2',
      chemicalName: 'Hydrochloric Acid 37% (Fuming)',
      sourceSchool: 'Thondamuthur Foothills Secondary School',
      targetSchool: 'Madukkarai Community High School',
      distanceKm: 14.5,
      availableVolume: '450 ml surplus',
      daysRemainingBeforeExpiry: 180,
      costSavedInr: 1200,
      status: 'available',
    },
    {
      id: 'match-3',
      chemicalName: 'Copper(II) Sulfate Pentahydrate',
      sourceSchool: 'Annur Valley High School',
      targetSchool: 'Sulur Rural Model Secondary School',
      distanceKm: 21.0,
      availableVolume: '200 g surplus',
      daysRemainingBeforeExpiry: 240,
      costSavedInr: 650,
      status: 'available',
    },
  ]);

  const handleAuthorizeTransfer = (id: string) => {
    setMatches(prev =>
      prev.map(m => m.id === id ? { ...m, status: 'transferred' } : m)
    );
    alert('Inter-School Reagent Custody Transfer Docket electronically generated! Transferred via District Weekly Postal Logistics.');
  };

  const totalSavings = matches.reduce((sum, m) => sum + m.costSavedInr, 0);

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-teal-400" />
            <span>Peer Chemical Exchange & Waste Prevention Network</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Inter-school reagent lending algorithm: Connects schools with surplus reagents to neighboring schools in need, preventing premature disposal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 font-mono">
            District Waste Avoidance: ₹{totalSavings.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {matches.map(m => (
          <div
            key={m.id}
            className={`p-4 rounded-xl border transition-all ${
              m.status === 'transferred'
                ? 'bg-emerald-950/20 border-emerald-500/40'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
              <span className="text-xs font-bold text-white truncate max-w-[180px]">{m.chemicalName}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                m.status === 'transferred' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-teal-500/20 text-teal-300'
              }`}>
                {m.status === 'transferred' ? 'Transferred ✓' : `${m.distanceKm} km away`}
              </span>
            </div>

            <div className="space-y-1 text-xs text-slate-300">
              <div>From: <b className="text-slate-100">{m.sourceSchool}</b></div>
              <div>To: <b className="text-slate-100">{m.targetSchool}</b></div>
              <div className="text-slate-400 pt-1">
                Surplus: <span className="text-teal-400 font-semibold">{m.availableVolume}</span> • {m.daysRemainingBeforeExpiry}d shelf-life
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                Saves: ₹{m.costSavedInr}
              </span>
              {m.status === 'available' ? (
                <button
                  onClick={() => handleAuthorizeTransfer(m.id)}
                  className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-[11px] flex items-center gap-1 transition-colors"
                >
                  <span>Authorize Transfer</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              ) : (
                <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Permit Dispatched</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
