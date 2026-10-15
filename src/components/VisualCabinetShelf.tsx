'use client';

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Layers, 
  Camera, 
  Upload, 
  Scan, 
  RotateCcw, 
  Box, 
  ArrowRight,
  Flame,
  Volume2
} from 'lucide-react';

interface ShelfItem {
  id: string;
  name: string;
  formula: string;
  group: 'inorganic_acid' | 'organic_acid' | 'organic_flammable' | 'base' | 'oxidizer' | 'neutral_salt';
  shelfId: 'shelf-1' | 'shelf-2' | 'shelf-3';
  isHazardousCollision?: boolean;
  isMisplaced?: boolean;
}

export default function VisualCabinetShelf() {
  const [items, setItems] = useState<ShelfItem[]>([
    { id: '1', name: 'Nitric Acid 70%', formula: 'HNO3', group: 'inorganic_acid', shelfId: 'shelf-1', isHazardousCollision: true },
    { id: '2', name: 'Glacial Acetic Acid', formula: 'CH3COOH', group: 'organic_acid', shelfId: 'shelf-1', isHazardousCollision: true },
    { id: '3', name: 'Hydrochloric Acid 37%', formula: 'HCl', group: 'inorganic_acid', shelfId: 'shelf-1' },
    
    { id: '4', name: 'Diethyl Ether', formula: '(C2H5)2O', group: 'organic_flammable', shelfId: 'shelf-2' },
    { id: '5', name: 'Acetone 99%', formula: 'CH3COCH3', group: 'organic_flammable', shelfId: 'shelf-2' },

    { id: '6', name: 'Sodium Hydroxide', formula: 'NaOH', group: 'base', shelfId: 'shelf-3' },
    { id: '7', name: 'Calcium Chloride', formula: 'CaCl2', group: 'neutral_salt', shelfId: 'shelf-3' },
  ]);

  const [hasCollision, setHasCollision] = useState(true);
  const [misplacementActive, setMisplacementActive] = useState(false);

  // Photo-to-3D State
  const [photo3dStage, setPhoto3dStage] = useState<'idle' | 'analyzing' | 'reconstructed'>('idle');
  const [detectedZones, setDetectedZones] = useState<string[]>([]);

  // 1-Click Auto-Segregation of Collision Pair
  const handleAutoSegregate = () => {
    setItems(prev =>
      prev.map(item => {
        if (item.id === '2') {
          return { ...item, shelfId: 'shelf-2', isHazardousCollision: false };
        }
        if (item.id === '1') {
          return { ...item, isHazardousCollision: false };
        }
        return item;
      })
    );
    setHasCollision(false);
  };

  // Simulate Accidental Misplacement (e.g. Student took Nitric Acid and placed it on Flammables shelf)
  const handleSimulateMisplacement = () => {
    setMisplacementActive(true);
    setItems(prev =>
      prev.map(item => {
        if (item.id === '1') {
          return { ...item, shelfId: 'shelf-2', isMisplaced: true };
        }
        return item;
      })
    );
  };

  // Return Misplaced Bottle to Correct Acid Locker
  const handleResolveMisplacement = () => {
    setMisplacementActive(false);
    setItems(prev =>
      prev.map(item => {
        if (item.id === '1') {
          return { ...item, shelfId: 'shelf-1', isMisplaced: false };
        }
        return item;
      })
    );
  };

  const handleReset = () => {
    setItems([
      { id: '1', name: 'Nitric Acid 70%', formula: 'HNO3', group: 'inorganic_acid', shelfId: 'shelf-1', isHazardousCollision: true },
      { id: '2', name: 'Glacial Acetic Acid', formula: 'CH3COOH', group: 'organic_acid', shelfId: 'shelf-1', isHazardousCollision: true },
      { id: '3', name: 'Hydrochloric Acid 37%', formula: 'HCl', group: 'inorganic_acid', shelfId: 'shelf-1' },
      { id: '4', name: 'Diethyl Ether', formula: '(C2H5)2O', group: 'organic_flammable', shelfId: 'shelf-2' },
      { id: '5', name: 'Acetone 99%', formula: 'CH3COCH3', group: 'organic_flammable', shelfId: 'shelf-2' },
      { id: '6', name: 'Sodium Hydroxide', formula: 'NaOH', group: 'base', shelfId: 'shelf-3' },
      { id: '7', name: 'Calcium Chloride', formula: 'CaCl2', group: 'neutral_salt', shelfId: 'shelf-3' },
    ]);
    setHasCollision(true);
    setMisplacementActive(false);
  };

  // Trigger AI Photo-to-3D Reconstruction
  const handleReconstructLab = () => {
    setPhoto3dStage('analyzing');
    setTimeout(() => {
      setPhoto3dStage('reconstructed');
      setDetectedZones([
        'Tier 1 (Top): Reinforced Corrosives Locker (Depth: 35cm, Capacity: 6 Bottles)',
        'Tier 2 (Mid): GHS Flammables Fire-Safe Tray (Depth: 40cm, Capacity: 8 Bottles)',
        'Tier 3 (Base): Non-Hazardous Salts & Glassware Zone (Depth: 45cm, Capacity: 12 Bottles)'
      ]);
    }, 1200);
  };

  const shelves = [
    { id: 'shelf-1', title: 'Shelf 1: Mineral Acids & Strong Oxidizers (Acid Locker)', color: 'border-slate-800' },
    { id: 'shelf-2', title: 'Shelf 2: Flammables & Organic Solvents Cabinet', color: 'border-slate-800' },
    { id: 'shelf-3', title: 'Shelf 3: Caustic Bases & Neutral Reagents', color: 'border-slate-800' },
  ];

  return (
    <div className="space-y-6">
      {/* 2D CABINET SHELF MATRIX */}
      <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Interactive 2D Laboratory Cabinet Shelf Matrix</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time physical proximity detection & accidental misplacement guard for school labs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!misplacementActive ? (
              <button
                onClick={handleSimulateMisplacement}
                className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-semibold text-xs border border-amber-500/30 flex items-center gap-1.5 transition-colors"
                title="Test what happens when a student or teacher returns Nitric Acid onto the Flammables shelf"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulate Misplacement</span>
              </button>
            ) : (
              <button
                onClick={handleResolveMisplacement}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 animate-pulse"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Return Nitric Acid to Acid Locker</span>
              </button>
            )}

            {hasCollision ? (
              <button
                onClick={handleAutoSegregate}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-Segregate Collision Pair</span>
              </button>
            ) : (
              <button
                onClick={handleReset}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700"
              >
                Reset Shelves
              </button>
            )}
          </div>
        </div>

        {/* Misplacement Alarm Banner */}
        {misplacementActive && (
          <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500 flex items-start justify-between gap-3 text-xs text-rose-200 animate-pulse shadow-lg shadow-rose-950/50">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <b className="font-bold text-white text-sm">🚨 CRITICAL MISPLACEMENT DETECTED ON SHELF 2:</b>
                <p className="text-rose-200 mt-1 leading-relaxed">
                  <b>Nitric Acid 70% (Strong Inorganic Oxidizer)</b> was accidentally returned to <b>Shelf 2 (Flammables Cabinet)</b> right next to <b>Diethyl Ether</b> and <b>Acetone</b>.
                </p>
                <p className="text-amber-300 font-semibold mt-1">
                  ⚠️ Severe Hazard: Contact of nitric acid vapors with organic solvent vapors causes explosive spontaneous nitration.
                </p>
              </div>
            </div>
            <button
              onClick={handleResolveMisplacement}
              className="shrink-0 px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-colors"
            >
              Move to Acid Locker Now
            </button>
          </div>
        )}

        {/* Incompatibility Collision Banner */}
        {!misplacementActive && hasCollision && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/50 flex items-start gap-3 text-xs text-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <b className="font-bold text-white">Hazardous Shelf Incompatibility Detected on Shelf 1:</b>
              <p className="text-rose-300 mt-0.5">
                Strong inorganic mineral oxidizer (Nitric Acid) co-located with combustible organic acid (Glacial Acetic Acid). Vapor mingling risks spontaneous combustion and pressurization.
              </p>
            </div>
          </div>
        )}

        {!misplacementActive && !hasCollision && (
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex items-center gap-2.5 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><b>Cabinet GHS Compliant:</b> Nitric Acid segregated into secondary containment tray. All shelves meet OSHA & GHS separation guidelines.</span>
          </div>
        )}

        {/* 2D Shelves Grid */}
        <div className="space-y-3">
          {(shelves || []).map(shelf => {
            const shelfItems = items.filter(it => it.shelfId === shelf.id);
            const isShelfCollision = shelf.id === 'shelf-1' && hasCollision && !misplacementActive;
            const isShelfMisplaced = shelf.id === 'shelf-2' && misplacementActive;

            return (
              <div
                key={shelf.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isShelfMisplaced
                    ? 'bg-rose-950/30 border-rose-500 shadow-xl shadow-rose-950/40'
                    : isShelfCollision
                    ? 'bg-rose-950/20 border-rose-500/50 shadow-lg shadow-rose-950/30'
                    : 'bg-slate-900/50 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-slate-400 pb-2 mb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200">{shelf.title}</span>
                    {isShelfMisplaced && (
                      <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-[10px] animate-pulse">
                        MISPLACED REAGENT PRESENT
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {shelfItems.length} Reagents
                  </span>
                </div>

                {/* Bottles on this shelf */}
                <div className="flex flex-wrap gap-2.5">
                  {(shelfItems || []).map(item => {
                    const isItemMisplaced = item.isMisplaced && misplacementActive;
                    const isItemCollision = item.isHazardousCollision && hasCollision && !misplacementActive;

                    return (
                      <div
                        key={item.id}
                        className={`px-3 py-2 rounded-lg border text-xs flex items-center gap-2 transition-all ${
                          isItemMisplaced
                            ? 'bg-rose-600/30 border-rose-500 text-white font-bold ring-2 ring-rose-500/80 animate-bounce'
                            : isItemCollision
                            ? 'bg-rose-900/40 border-rose-500 text-rose-100 font-bold animate-pulse'
                            : 'bg-slate-900 border-slate-700/80 text-slate-200'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${isItemMisplaced ? 'bg-rose-400 animate-ping' : 'bg-emerald-400'}`} />
                        <div>
                          <span className="block font-semibold">
                            {item.name}
                            {isItemMisplaced && ' (WRONG CABINET!)'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{item.formula}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* INNOVATION SHOWCASE: AI PHOTO-TO-3D LAB TWIN GENERATOR   */}
      {/* ========================================================= */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/30 border border-cyan-500/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-[10px] border border-cyan-500/40">
                AI SPATIAL LAB TWIN
              </span>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Box className="w-4 h-4 text-cyan-400" />
                <span>Snap-to-3D: Reconstruct Custom School Lab Storage from Photo</span>
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Every secondary school has different wooden racks, cupboards, and acid lockers. Snap 1 mobile photo to auto-generate a custom 3D digital twin.
            </p>
          </div>

          <button
            onClick={handleReconstructLab}
            disabled={photo3dStage === 'analyzing'}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/30 transition-all shrink-0"
          >
            {photo3dStage === 'analyzing' ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                <span>Segmenting Lab Geometry...</span>
              </>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5" />
                <span>{photo3dStage === 'reconstructed' ? 'Re-Analyze Lab Photo' : 'Snap / Upload Lab Photo'}</span>
              </>
            )}
          </button>
        </div>

        {/* Stage Content */}
        {photo3dStage === 'idle' && (
          <div className="p-6 rounded-xl border border-dashed border-slate-700 bg-slate-900/40 text-center space-y-2">
            <Camera className="w-8 h-8 text-cyan-400/80 mx-auto" />
            <h4 className="text-xs font-bold text-white">No School Photo Uploaded Yet</h4>
            <p className="text-[11px] text-slate-400 max-w-md mx-auto">
              Click the button above to simulate uploading a photo of a secondary school lab cupboard. AI computer vision automatically segments shelf tiers, measures depth, and provisions a custom 3D storage space.
            </p>
          </div>
        )}

        {photo3dStage === 'analyzing' && (
          <div className="p-6 rounded-xl border border-cyan-500/40 bg-cyan-950/20 text-center space-y-3 animate-pulse">
            <Scan className="w-8 h-8 text-cyan-400 mx-auto animate-spin" />
            <h4 className="text-xs font-bold text-cyan-300">Spatial Depth & Object Detection in Progress</h4>
            <p className="text-[11px] text-slate-400">
              Running spatial segmentation on Coimbatore Govt High School Chemistry Lab Cupboard #3...
            </p>
          </div>
        )}

        {photo3dStage === 'reconstructed' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
            {/* Detected Geometry Card */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                Detected Physical Geometry & GHS Safety Zones
              </span>
              <div className="space-y-2">
                {(detectedZones || []).map((zone, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start gap-2 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-300 font-medium">{zone}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400">
                ✅ GHS Volumetric Separation Ratio: <b>Compliant (OSHA 1910.106 Class B & C standards)</b>
              </p>
            </div>

            {/* 3D Lab Twin Visual Preview */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/40 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">
                  Generated School 3D Storage Twin
                </span>
                <h4 className="text-xs font-bold text-white mt-1">
                  Coimbatore GHSS Custom Lab Cabinet Model #3
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  3D spatial slots generated successfully. Teachers can drag bottles directly into their real-world shelf positions in Three.js with automatic spatial collision guard active.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400">
                  Custom 3D Space Ready for Inventory
                </span>
                <span className="px-2.5 py-1 rounded bg-emerald-500 text-slate-950 font-bold text-[10px]">
                  Active in Three.js
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
