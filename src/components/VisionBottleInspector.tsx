'use client';

import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Upload, 
  ScanEye, 
  RefreshCw, 
  Layers,
  ShieldAlert,
  Loader2,
  Crosshair,
  ExternalLink,
  Cpu
} from 'lucide-react';

export interface VisionAnomalyResult {
  chemicalName?: string;
  anomalyType: 'crystals' | 'swollen_cap' | 'discoloration' | 'clean';
  confidence: number;
  riskScore?: number;
  severity?: string;
  findingSummary: string;
  recommendedAction: string;
  boundingArea: string;
  opticalSignatures?: string;
  boxCoords: { top: number; left: number; width: number; height: number };
  ghsClassifications?: string[];
}

interface VisionBottleInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyAnomaly: (finding: VisionAnomalyResult) => void;
}

export default function VisionBottleInspector({ isOpen, onClose, onApplyAnomaly }: VisionBottleInspectorProps) {
  const [selectedPreset, setSelectedPreset] = useState<'ether_crystals' | 'bulging_cap' | 'normal'>('ether_crystals');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<VisionAnomalyResult | null>(null);
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCustomPhotoUrl(dataUrl);
      setAnalysisResult(null);
      triggerGeminiAnalysis(dataUrl, selectedPreset);
    };
    reader.readAsDataURL(file);
  };

  const triggerGeminiAnalysis = async (imgData?: string, presetKey = selectedPreset) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const res = await fetch('/api/inspect-bottle-vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imgData,
          specimenType: presetKey,
        }),
      });

      const data = await res.json();
      if (data.success && data.result) {
        setAnalysisResult(data.result);
      } else {
        throw new Error(data.error || 'Vision analysis failed');
      }
    } catch (err) {
      console.warn('Vision inspection fallback applied:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const currentResult = analysisResult;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/50 w-full max-w-2xl space-y-4 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <ScanEye className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-[10px] border border-cyan-500/30 flex items-center gap-1">
                <Cpu className="w-3 h-3 text-cyan-400" />
                <span>GEMINI 3.5 FLASH VISION</span>
              </span>
              <h3 className="text-base font-bold text-white">
                Multimodal AI Bottle Anomaly Inspector
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Inspects bottle images for white peroxide crystals, swollen cap bulging, and photolytic liquid degradation.
            </p>
          </div>
        </div>

        {/* Specimen Switcher & Upload */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex gap-1.5 overflow-x-auto">
            {(['ether_crystals', 'bulging_cap', 'normal'] as const).map(p => (
              <button
                key={p}
                onClick={() => {
                  setSelectedPreset(p);
                  setCustomPhotoUrl(null);
                  setAnalysisResult(null);
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  selectedPreset === p && !customPhotoUrl
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 font-bold shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {p === 'ether_crystals' ? '💎 Peroxide Crystals' : p === 'bulging_cap' ? '🎈 Swollen Cap' : '✅ Clean Bottle'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <input
              id="vision-bottle-file-upload"
              name="bottle_inspection_photo"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Custom Photo</span>
            </button>
          </div>
        </div>

        {/* Visual Inspection Viewport */}
        <div className="relative rounded-2xl bg-slate-950 border border-slate-800 h-64 overflow-hidden flex items-center justify-center">
          {/* Custom Uploaded Photo or Synthetic Visual Specimen */}
          {customPhotoUrl ? (
            <img
              src={customPhotoUrl}
              alt="Custom Specimen"
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center relative p-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
              {/* Chemical Bottle Graphic */}
              <div className="relative flex flex-col items-center">
                {/* Cap */}
                <div className={`w-14 h-8 rounded-t-lg border-2 transition-all ${
                  selectedPreset === 'bulging_cap'
                    ? 'bg-amber-600 border-amber-300 rounded-t-full scale-y-125 shadow-lg shadow-amber-500/40'
                    : selectedPreset === 'ether_crystals'
                    ? 'bg-rose-900 border-rose-500 relative'
                    : 'bg-slate-700 border-slate-500'
                }`}>
                  {/* Peroxide Crystals Representation on threads */}
                  {selectedPreset === 'ether_crystals' && (
                    <div className="absolute -bottom-1 -inset-x-2 flex justify-between px-1">
                      <span className="w-2.5 h-2.5 bg-white rounded-full shadow-md shadow-white animate-pulse" />
                      <span className="w-2 h-2 bg-white rounded-sm shadow-md shadow-white" />
                      <span className="w-2.5 h-2.5 bg-white rounded-full shadow-md shadow-white animate-pulse" />
                    </div>
                  )}
                </div>

                {/* Neck */}
                <div className="w-8 h-4 bg-amber-900/90 border-x-2 border-amber-800" />

                {/* Body */}
                <div className="w-28 h-36 rounded-b-2xl bg-gradient-to-b from-amber-950 via-amber-900 to-amber-950 border-2 border-amber-700/80 shadow-2xl relative flex flex-col items-center justify-center p-2">
                  <div className="w-full bg-slate-100 rounded p-1.5 text-center text-slate-950 shadow-inner">
                    <span className="text-[9px] font-black uppercase tracking-tight block">
                      {selectedPreset === 'ether_crystals' ? 'DIETHYL ETHER' : selectedPreset === 'bulging_cap' ? 'NITRIC ACID' : 'CHEMICAL REAGENT'}
                    </span>
                    <span className="text-[7px] font-mono block text-slate-700">
                      {selectedPreset === 'ether_crystals' ? 'CAS: 60-29-7' : selectedPreset === 'bulging_cap' ? 'CAS: 7697-37-2' : 'CAS: 7647-01-0'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Bounding Box & Crosshairs Overlay */}
          {currentResult && (
            <div
              style={{
                top: `${currentResult.boxCoords.top}%`,
                left: `${currentResult.boxCoords.left}%`,
                width: `${currentResult.boxCoords.width}%`,
                height: `${currentResult.boxCoords.height}%`,
              }}
              className="absolute border-2 border-dashed border-rose-500 bg-rose-500/15 rounded-lg pointer-events-none animate-in zoom-in-95 flex flex-col justify-between p-1 z-20 shadow-lg shadow-rose-500/20"
            >
              <div className="flex items-center justify-between text-[8px] font-mono bg-rose-950/90 text-rose-300 px-1 rounded border border-rose-500/40">
                <span className="flex items-center gap-0.5 font-bold">
                  <Crosshair className="w-2.5 h-2.5 text-rose-400" />
                  <span>GEMINI VISION DETECTED</span>
                </span>
                <span>{(currentResult.confidence * 100).toFixed(1)}%</span>
              </div>
              <div className="text-[8px] text-center font-bold text-white bg-black/60 px-1 rounded backdrop-blur-sm">
                {currentResult.boundingArea}
              </div>
            </div>
          )}

          {/* Analyzing State Overlay */}
          {isAnalyzing && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-2 z-30 animate-in fade-in">
              <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
              <p className="text-xs font-bold text-cyan-300">
                Gemini 3.5 Flash Vision analyzing bottle pixels...
              </p>
              <p className="text-[10px] text-slate-400">Evaluating crystal luminescence and cap curvature geometry</p>
            </div>
          )}
        </div>

        {/* Trigger Analysis Button */}
        {!currentResult && (
          <button
            onClick={() => triggerGeminiAnalysis(customPhotoUrl || undefined)}
            disabled={isAnalyzing}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 transition-all cursor-pointer active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>{isAnalyzing ? 'Inspecting Bottle Geometry...' : '✨ Run Gemini 3.5 Vision Anomaly Inspection'}</span>
          </button>
        )}

        {/* Structured Inspection Result Card */}
        {currentResult && (
          <div className="p-4 rounded-xl bg-slate-900 border border-rose-500/40 space-y-2.5 text-xs animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                <span>GEMINI VISION: {currentResult.anomalyType.toUpperCase()} ({currentResult.chemicalName || 'Reagent'})</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono font-bold text-[10px] border border-rose-500/30">
                  {(currentResult.confidence * 100).toFixed(1)}% Confidence
                </span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold text-[10px] border border-cyan-500/30">
                  Risk: {currentResult.riskScore || 98}/100
                </span>
              </div>
            </div>

            <p className="text-slate-200 leading-relaxed text-[11px]">
              {currentResult.findingSummary}
            </p>

            {currentResult.opticalSignatures && (
              <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-cyan-300">
                🔍 <b>Optical Signature:</b> {currentResult.opticalSignatures}
              </div>
            )}

            <div className="p-2.5 rounded-lg bg-black/40 border border-rose-500/30 text-[11px] text-amber-300 font-semibold">
              🚨 <b>Mandatory Action:</b> {currentResult.recommendedAction}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setAnalysisResult(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-Inspect</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onApplyAnomaly(currentResult);
                  onClose();
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30 cursor-pointer transition-all active:scale-95"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Apply Findings & Trigger Principal HITL Approval</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
