'use client';

import React, { useState } from 'react';
import { PlusCircle, FlaskConical, MapPin, Calendar, QrCode, Check, X, ShieldAlert, Sparkles, Building2 } from 'lucide-react';
import { ChemicalBottle, ChemicalMaster, School } from '@/types/chemical';
import { SEED_CHEMICALS } from '@/lib/seed-data';
import { validateCasChecksum, calculateBottleRisk } from '@/lib/chemistry-engine';

interface NewBottleOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSchool: School;
  onBottleAdded: (bottle: ChemicalBottle) => void;
}

export default function NewBottleOnboardingModal({
  isOpen,
  onClose,
  selectedSchool,
  onBottleAdded,
}: NewBottleOnboardingModalProps) {
  const [selectedChemId, setSelectedChemId] = useState(SEED_CHEMICALS[0].id);
  const [qrCodeInput, setQrCodeInput] = useState(`QR-${selectedSchool.code}-${Date.now().toString().slice(-4)}`);
  const [roomName, setRoomName] = useState('Chemistry Lab #1');
  const [cabinetName, setCabinetName] = useState('Cabinet A (Acids & Mineral Reagents)');
  const [shelfNumber, setShelfNumber] = useState('Shelf 1 (Top)');
  const [initialVolume, setInitialVolume] = useState('500');
  const [unit, setUnit] = useState('ml');
  const [isOpenBottle, setIsOpenBottle] = useState(false);
  const [openedDate, setOpenedDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState('2027-12-31');
  const [batchNo, setBatchNo] = useState('BT-2026-LAB-01');
  const [manufacturer, setManufacturer] = useState('Merck / Loba Chemie');

  if (!isOpen) return null;

  const selectedChemical = SEED_CHEMICALS.find(c => c.id === selectedChemId) || SEED_CHEMICALS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newBottle: ChemicalBottle = {
      id: `bottle-${Date.now()}`,
      qrCode: qrCodeInput,
      schoolId: selectedSchool.id,
      locationId: `loc-${Date.now()}`,
      chemicalId: selectedChemical.id,
      chemical: selectedChemical,
      batchNumber: batchNo,
      manufacturer,
      initialVolumeMl: Number(initialVolume) || 500,
      currentVolumeMl: Number(initialVolume) || 500,
      unit,
      receivedDate: new Date().toISOString().split('T')[0],
      openedDate: isOpenBottle ? openedDate : undefined,
      expiryDate,
      status: isOpenBottle ? 'opened' : 'sealed',
      currentRiskScore: 10,
      riskLevel: 'safe',
      riskFactors: [
        `Newly onboarded to ${selectedSchool.name} (${roomName} ➔ ${cabinetName} ➔ ${shelfNumber})`,
      ],
      createdAt: new Date().toISOString(),
    };

    // Calculate baseline risk using deterministic engine
    const assessment = calculateBottleRisk(newBottle, selectedChemical);
    newBottle.currentRiskScore = assessment.score;
    newBottle.riskLevel = assessment.level;
    newBottle.riskFactors = [...newBottle.riskFactors, ...assessment.factors];

    onBottleAdded(newBottle);
    alert(`Bottle ${newBottle.qrCode} (${selectedChemical.canonicalName}) successfully onboarded to ${roomName} ➔ ${cabinetName}!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="glass-panel p-6 rounded-2xl border border-slate-700 w-full max-w-2xl space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-md">
            <PlusCircle className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-1.5">
              <span>New Reagent Onboarding & Laboratory Placement</span>
              <span className="text-[9px] uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                Teacher Fast-Track (30s)
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Registers new chemical bottle to <b className="text-slate-200">{selectedSchool.name}</b> with custom shelf placement.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Section 1: Chemical Selection */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
              1. Select Chemical Reagent
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="onboard-catalog-chemical" className="text-slate-400 block mb-1">Catalog Name</label>
                <select
                  id="onboard-catalog-chemical"
                  name="catalog_chemical_id"
                  value={selectedChemId}
                  onChange={(e) => setSelectedChemId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  {SEED_CHEMICALS.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.canonicalName} ({c.chemicalFormula})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="onboard-cas-number" className="text-slate-400 block mb-1">Authoritative CAS Number</label>
                <input
                  id="onboard-cas-number"
                  name="cas_number"
                  type="text"
                  disabled
                  value={selectedChemical.casNumber}
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-lg p-2 text-slate-300 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Laboratory Space & Shelf Hierarchy */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>2. School Laboratory Location Hierarchy (Where is it stored?)</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label htmlFor="onboard-room-name" className="text-slate-400 block mb-1">Laboratory / Room</label>
                <input
                  id="onboard-room-name"
                  name="room_name"
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="e.g. Lab Room 102"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label htmlFor="onboard-cabinet-name" className="text-slate-400 block mb-1">Cabinet / Cupboard</label>
                <select
                  id="onboard-cabinet-name"
                  name="cabinet_name"
                  value={cabinetName}
                  onChange={(e) => setCabinetName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Cabinet A (Acids & Mineral Reagents)">Cabinet A (Acids & Corrosives)</option>
                  <option value="Cabinet B (Flammables & Solvents)">Cabinet B (Flammables / Organics)</option>
                  <option value="Cabinet C (Bases & Neutral Salts)">Cabinet C (Bases & Salts)</option>
                  <option value="Dedicated Polyethylene Tray">Dedicated Secondary Acid Tray</option>
                </select>
              </div>

              <div>
                <label htmlFor="onboard-shelf-number" className="text-slate-400 block mb-1">Shelf Number</label>
                <select
                  id="onboard-shelf-number"
                  name="shelf_number"
                  value={shelfNumber}
                  onChange={(e) => setShelfNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Shelf 1 (Top)">Shelf 1 (Top Shelf)</option>
                  <option value="Shelf 2 (Middle)">Shelf 2 (Middle Shelf)</option>
                  <option value="Shelf 3 (Bottom Lip)">Shelf 3 (Bottom Spill Lip)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Bottle Status & Open Date */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
              3. Container Seal & Volume
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="onboard-initial-volume" className="text-slate-400 block mb-1">Initial Volume</label>
                <div className="flex gap-1">
                  <input
                    id="onboard-initial-volume"
                    name="initial_volume"
                    type="number"
                    value={initialVolume}
                    onChange={(e) => setInitialVolume(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500"
                  />
                  <select
                    id="onboard-volume-unit"
                    name="volume_unit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
                  >
                    <option value="ml">ml</option>
                    <option value="g">g</option>
                    <option value="L">L</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Seal Condition</label>
                <div className="flex rounded-lg border border-slate-700 bg-slate-950 p-1">
                  <button
                    type="button"
                    onClick={() => setIsOpenBottle(false)}
                    className={`flex-1 py-1 rounded text-xs font-semibold ${
                      !isOpenBottle ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'
                    }`}
                  >
                    Sealed
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpenBottle(true)}
                    className={`flex-1 py-1 rounded text-xs font-semibold ${
                      isOpenBottle ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                    }`}
                  >
                    Already Opened
                  </button>
                </div>
              </div>

              {isOpenBottle && (
                <div>
                  <label htmlFor="onboard-opened-date" className="text-slate-400 block mb-1">Date First Opened</label>
                  <input
                    id="onboard-opened-date"
                    name="opened_date"
                    type="date"
                    value={openedDate}
                    onChange={(e) => setOpenedDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Assigned QR Sticker */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              4. Assigned QR Code & Batch
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="onboard-qr-sticker" className="text-slate-400 block mb-1">Assigned QR Sticker ID</label>
                <input
                  id="onboard-qr-sticker"
                  name="qr_sticker_id"
                  type="text"
                  value={qrCodeInput}
                  onChange={(e) => setQrCodeInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>
              <div>
                <label htmlFor="onboard-expiry-date" className="text-slate-400 block mb-1">Manufacturer Expiry Date</label>
                <input
                  id="onboard-expiry-date"
                  name="expiry_date"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-500/20"
            >
              <Check className="w-4 h-4" />
              <span>Save & Onboard Reagent to Lab Shelf</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
