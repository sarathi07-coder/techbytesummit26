'use client';

import React, { useState } from 'react';
import { 
  MapPin, 
  Truck, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Zap, 
  Droplets, 
  Calendar, 
  ExternalLink,
  Layers,
  Info,
  Building2,
  Navigation
} from 'lucide-react';
import { School, ChemicalBottle, AlertNotification } from '@/types/chemical';
import SchoolDetailsModal from './SchoolDetailsModal';

interface DistrictGisMapProps {
  schools: School[];
  bottles: ChemicalBottle[];
  alerts: AlertNotification[];
  selectedSchool: School;
  onSelectSchool: (school: School) => void;
}

export default function DistrictGisMap({
  schools,
  bottles,
  alerts,
  selectedSchool,
  onSelectSchool,
}: DistrictGisMapProps) {
  const [inspectedSchool, setInspectedSchool] = useState<School | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredSchool, setHoveredSchool] = useState<School | null>(null);

  // Geographic bounds of Coimbatore District for SVG projection
  // Lat: 10.55 to 11.35
  // Lng: 76.75 to 77.25
  const minLat = 10.55;
  const maxLat = 11.35;
  const minLng = 76.75;
  const maxLng = 77.25;

  const projectToSvg = (lat: number, lng: number) => {
    // Invert Y because SVG coordinates go top-to-bottom
    const x = ((lng - minLng) / (maxLng - minLng)) * 740 + 30;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 360 + 30;
    return { x, y };
  };

  // Grade colors
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return '#10B981';
      case 'B': return '#06B6D4';
      case 'C': return '#F59E0B';
      case 'D': return '#EF4444';
      default: return '#94A3B8';
    }
  };

  // Build Route Path
  // Order: Pollachi (school-1) -> Madukkarai (school-3) -> Thondamuthur (school-4) -> Sulur (school-2) -> Annur (school-5)
  const routeSchoolIds = ['school-1', 'school-3', 'school-4', 'school-2', 'school-5'];
  const routePoints = routeSchoolIds
    .map(id => schools.find(s => s.id === id))
    .filter((s): s is School => !!s)
    .map(s => projectToSvg(s.latitude, s.longitude));

  const pathD = routePoints.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const handleOpenDetails = (sch: School) => {
    setInspectedSchool(sch);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Visual Interactive GIS Map Viewport */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 relative overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white uppercase tracking-wider font-mono">
              Coimbatore Peri-Urban GIS Hazard Grid
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
              LIVE SATELLITE TELEMETRY
            </span>
          </div>
          <span className="text-[11px] text-slate-400">Click any School Node to Inspect Full Dossier</span>
        </div>

        {/* SVG Topographic Canvas */}
        <div className="relative w-full h-[400px] mt-2 rounded-xl bg-slate-950/90 border border-slate-800/80 overflow-hidden flex items-center justify-center">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />

          <svg className="w-full h-full" viewBox="0 0 800 420">
            {/* Coordinate Axis Lines */}
            <line x1="40" y1="210" x2="760" y2="210" stroke="#1e293b" strokeDasharray="4 4" strokeWidth="1" />
            <line x1="400" y1="20" x2="400" y2="400" stroke="#1e293b" strokeDasharray="4 4" strokeWidth="1" />
            
            {/* Compass Rose & Geographic Coordinates */}
            <text x="60" y="40" fill="#475569" fontSize="10" fontFamily="monospace">11.35°N (NORTH COIMBATORE)</text>
            <text x="60" y="395" fill="#475569" fontSize="10" fontFamily="monospace">10.55°N (SOUTH POLLACHI)</text>
            <text x="620" y="40" fill="#475569" fontSize="10" fontFamily="monospace">77.25°E</text>
            <text x="620" y="395" fill="#475569" fontSize="10" fontFamily="monospace">76.75°E</text>

            {/* Simulated Water Body: Noyyal River Basin */}
            <path
              d="M 50 260 Q 220 230 410 240 T 750 210"
              fill="none"
              stroke="#0284c7"
              strokeWidth="2.5"
              strokeOpacity="0.35"
              strokeDasharray="6 4"
            />
            <text x="440" y="235" fill="#0284c7" fontSize="9" opacity="0.6" fontStyle="italic">Noyyal River Basin</text>

            {/* Simulated Highway NH-544 & NH-83 Corridor */}
            <path
              d="M 120 380 L 260 270 L 410 180 L 680 80"
              fill="none"
              stroke="#334155"
              strokeWidth="3"
              strokeOpacity="0.5"
            />
            <text x="275" y="260" fill="#64748b" fontSize="8" opacity="0.7">NH-544 Hazmat Corridor</text>

            {/* Hazmat Cluster Disposal Route #01 (Green Animated Line) */}
            <path
              d={pathD}
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              strokeDasharray="8 6"
              className="animate-pulse"
              strokeOpacity="0.85"
            />

            {/* School Nodes & Animated Pulse Rings */}
            {schools.map((sch) => {
              const { x, y } = projectToSvg(sch.latitude, sch.longitude);
              const color = getGradeColor(sch.riskGrade);
              const isSelected = selectedSchool.id === sch.id;
              const isCritical = sch.riskGrade === 'D';

              return (
                <g 
                  key={sch.id}
                  onClick={() => handleOpenDetails(sch)}
                  onMouseEnter={() => setHoveredSchool(sch)}
                  onMouseLeave={() => setHoveredSchool(null)}
                  className="cursor-pointer transition-transform hover:scale-110"
                >
                  {/* Outer Pulsing Threat Radar Ring for High Risk */}
                  {(isCritical || sch.riskGrade === 'C') && (
                    <circle cx={x} cy={y} r="28" fill={color} opacity="0.15">
                      <animate attributeName="r" values="16;36;16" dur="2.4s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.3;0;0.3" dur="2.4s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Active Selection Ring */}
                  {isSelected && (
                    <circle cx={x} cy={y} r="22" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="3 3" />
                  )}

                  {/* Node Pin Circle */}
                  <circle
                    cx={x}
                    cy={y}
                    r="12"
                    fill="#0f172a"
                    stroke={color}
                    strokeWidth="3"
                  />
                  <circle cx={x} cy={y} r="5" fill={color} />

                  {/* School Code Badge & Name Tag */}
                  <rect
                    x={x - 45}
                    y={y + 16}
                    width="90"
                    height="18"
                    rx="4"
                    fill="#020617"
                    fillOpacity="0.9"
                    stroke={color}
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y={y + 28}
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="sans-serif"
                  >
                    {sch.code} (Grade {sch.riskGrade})
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Interactive Hover Card Overlay */}
          {hoveredSchool && (
            <div className="absolute top-4 left-4 p-3 rounded-xl bg-slate-900/95 border border-slate-700 shadow-2xl backdrop-blur-md pointer-events-none text-xs space-y-1 z-20 max-w-xs animate-in fade-in duration-150">
              <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-800">
                <span className="font-bold text-white text-xs">{hoveredSchool.name}</span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                  hoveredSchool.riskGrade === 'D' ? 'bg-rose-500 text-white' :
                  hoveredSchool.riskGrade === 'C' ? 'bg-amber-500 text-slate-950' :
                  'bg-emerald-500 text-slate-950'
                }`}>
                  Grade {hoveredSchool.riskGrade}
                </span>
              </div>
              <div className="text-[11px] text-slate-300">
                <span>Power Reliability: <b className="text-amber-400">{hoveredSchool.powerCutFrequencyWeekly} cuts/wk</b></span>
                <span className="ml-2">Humidity: <b className="text-cyan-400">{hoveredSchool.avgLabHumidityPct}%</b></span>
              </div>
              <div className="text-[10px] text-emerald-400 font-mono pt-1">
                ➔ Click to inspect full chemical inventory & compliance dossier
              </div>
            </div>
          )}

          {/* Legend Overlay at Bottom Right */}
          <div className="absolute bottom-3 right-3 p-2.5 rounded-xl bg-slate-950/90 border border-slate-800/90 backdrop-blur-sm text-[10px] space-y-1.5 z-10 text-slate-300">
            <span className="font-bold text-white block uppercase tracking-wider text-[9px]">Map Legend:</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Grade A</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" /> Grade B</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Grade C</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block animate-ping" /> Grade D (Hazard)</span>
            </div>
            <div className="text-[9px] text-emerald-400 font-mono">
              --- Active Hazmat Waste Pickup Route (100.2 km)
            </div>
          </div>
        </div>
      </div>

      {/* School Cards Grid (Clicking any card opens the detailed inspection modal) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {schools.map((sch) => {
          const isSelected = selectedSchool.id === sch.id;
          const color = getGradeColor(sch.riskGrade);

          return (
            <div
              key={sch.id}
              onClick={() => handleOpenDetails(sch)}
              className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 relative overflow-hidden group ${
                isSelected 
                  ? 'bg-slate-900 border-emerald-500 shadow-lg shadow-emerald-500/10' 
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 font-mono block">{sch.code}</span>
                  <h4 className="font-bold text-white text-xs group-hover:text-emerald-300 transition-colors">
                    {sch.name}
                  </h4>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black shrink-0 ${
                  sch.riskGrade === 'D' ? 'bg-rose-500 text-white animate-pulse' :
                  sch.riskGrade === 'C' ? 'bg-amber-500 text-slate-950' :
                  'bg-emerald-500 text-slate-950'
                }`}>
                  Grade {sch.riskGrade}
                </span>
              </div>

              <div className="text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center justify-between">
                  <span>GPS Coordinates:</span>
                  <span className="font-mono text-slate-300">{sch.latitude.toFixed(2)}°N, {sch.longitude.toFixed(2)}°E</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Power Outage Frequency:</span>
                  <span className="text-amber-400 font-semibold">{sch.powerCutFrequencyWeekly} cuts/wk</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Ambient Humidity:</span>
                  <span className="text-cyan-400 font-semibold">{sch.avgLabHumidityPct}% RH</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-emerald-400 font-semibold">
                <span>View Full School Dossier</span>
                <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* School Inspection Details Modal */}
      <SchoolDetailsModal
        school={inspectedSchool}
        bottles={bottles}
        alerts={alerts}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectSchoolForInspection={(sch) => {
          onSelectSchool(sch);
        }}
      />
    </div>
  );
}
