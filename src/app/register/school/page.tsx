'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  MapPin, 
  Zap, 
  Droplets, 
  Phone, 
  Mail, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw,
  Sparkles,
  School as SchoolIcon,
  Compass,
  ArrowLeft
} from 'lucide-react';
import { registerNewSchool } from '@/lib/supabase';

export default function RegisterSchoolPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    district: 'Coimbatore Peri-Urban',
    state: 'Tamil Nadu',
    latitude: 11.0168,
    longitude: 76.9558,
    contactPhone: '+91 94420 11223',
    contactEmail: '',
    powerCutFrequencyWeekly: 3,
    avgLabHumidityPct: 75,
    riskGrade: 'B' as 'A' | 'B' | 'C' | 'D',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  // Quick Preset coordinates for Tamil Nadu Peri-urban Hubs
  const applyPreset = (preset: { name: string; lat: number; lng: number; hum: number; power: number }) => {
    setFormData(prev => ({
      ...prev,
      name: prev.name || preset.name,
      latitude: preset.lat,
      longitude: preset.lng,
      avgLabHumidityPct: preset.hum,
      powerCutFrequencyWeekly: preset.power,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.contactEmail) {
      setResult({ success: false, message: 'Please fill out all mandatory institutional fields.' });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const res = await registerNewSchool({
        code: formData.code.toUpperCase().trim(),
        name: formData.name.trim(),
        district: formData.district,
        state: formData.state,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        contactPhone: formData.contactPhone.trim(),
        contactEmail: formData.contactEmail.trim().toLowerCase(),
        powerCutFrequencyWeekly: Number(formData.powerCutFrequencyWeekly),
        avgLabHumidityPct: Number(formData.avgLabHumidityPct),
        riskGrade: formData.riskGrade,
      });

      if (res.success) {
        setResult({
          success: true,
          message: `Institution "${formData.name}" successfully registered in Supabase database! Ready for chemical onboarding.`
        });
        setTimeout(() => {
          router.push(`/login?role=teacher`);
        }, 1200);
      } else {
        setResult({ success: false, message: res.error || 'Failed to register institution in database.' });
      }
    } catch (err: any) {
      setResult({ success: false, message: err?.message || 'Network exception during registration.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/login" className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition">
            <ArrowLeft className="w-4 h-4" />
            Back to Role Login
          </Link>
          <div className="flex items-center gap-2">
            <SchoolIcon className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm tracking-tight text-white">
              Institutional School Onboarding
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Database Campus Registration
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Register Laboratory Campus
          </h1>
          <p className="text-slate-400 text-sm max-w-lg mx-auto mt-2">
            Add a new Government or Aided Secondary School to the ReagentWatch hazard network and database.
          </p>
        </div>

        {/* Quick GPS Location Presets */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Compass className="w-4 h-4 text-emerald-400" />
            <span className="font-medium">Quick Preset Geographic Clusters:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset({ name: 'Govt Model HSS, Kinathukadavu', lat: 10.8225, lng: 77.0195, hum: 74, power: 3 })}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition font-mono"
            >
              Kinathukadavu (South)
            </button>
            <button
              type="button"
              onClick={() => applyPreset({ name: 'Sirumugai Foothills HSS', lat: 11.3280, lng: 77.0012, hum: 70, power: 2 })}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition font-mono"
            >
              Sirumugai (North)
            </button>
            <button
              type="button"
              onClick={() => applyPreset({ name: 'Karamadai Tribal Model HSS', lat: 11.2435, lng: 76.9582, hum: 80, power: 4 })}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition font-mono"
            >
              Karamadai (West)
            </button>
          </div>
        </div>

        {/* Form Box */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          {result && (
            <div
              className={`mb-6 p-4 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${
                result.success
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-950/70 border-rose-500/50 text-rose-300'
              }`}
            >
              {result.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>{result.message}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Institutional Identification */}
            <div>
              <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                1. Institutional Identification
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="school-reg-name" className="block text-xs font-medium text-slate-300 mb-1.5">
                    Official School Name *
                  </label>
                  <input
                    id="school-reg-name"
                    name="school_name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Govt Higher Secondary School, Pollachi"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  />
                </div>

                <div>
                  <label htmlFor="school-reg-code" className="block text-xs font-medium text-slate-300 mb-1.5">
                    School U-DISE / Institutional Code *
                  </label>
                  <input
                    id="school-reg-code"
                    name="school_code"
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. GHSS-CBE-06"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 uppercase font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  />
                </div>

                <div>
                  <label htmlFor="school-reg-district" className="block text-xs font-medium text-slate-300 mb-1.5">
                    District
                  </label>
                  <input
                    id="school-reg-district"
                    name="district"
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label htmlFor="school-reg-state" className="block text-xs font-medium text-slate-300 mb-1.5">
                    State
                  </label>
                  <input
                    id="school-reg-state"
                    name="state"
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Geospatial Coordinates */}
            <div className="pt-4 border-t border-slate-800">
              <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                2. Geospatial GPS Coordinates (For Hazmat Route Sweep)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="school-reg-latitude" className="block text-xs font-medium text-slate-300 mb-1.5">
                    GPS Latitude (Decimal)
                  </label>
                  <input
                    id="school-reg-latitude"
                    name="latitude"
                    type="number"
                    step="0.0001"
                    required
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label htmlFor="school-reg-longitude" className="block text-xs font-medium text-slate-300 mb-1.5">
                    GPS Longitude (Decimal)
                  </label>
                  <input
                    id="school-reg-longitude"
                    name="longitude"
                    type="number"
                    step="0.0001"
                    required
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Laboratory Telemetry & Degradation Environment */}
            <div className="pt-4 border-t border-slate-800">
              <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Droplets className="w-4 h-4" />
                3. Laboratory Telemetry & Risk Profile
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="school-reg-humidity" className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                    Average Lab Humidity (%)
                  </label>
                  <input
                    id="school-reg-humidity"
                    name="avg_lab_humidity"
                    type="number"
                    min="30"
                    max="99"
                    required
                    value={formData.avgLabHumidityPct}
                    onChange={(e) => setFormData({ ...formData, avgLabHumidityPct: parseInt(e.target.value) || 65 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500 transition"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Higher humidity accelerates deliquescence.</span>
                </div>

                <div>
                  <label htmlFor="school-reg-powercut" className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Power Cuts (Weekly)
                  </label>
                  <input
                    id="school-reg-powercut"
                    name="power_cut_frequency"
                    type="number"
                    min="0"
                    max="14"
                    required
                    value={formData.powerCutFrequencyWeekly}
                    onChange={(e) => setFormData({ ...formData, powerCutFrequencyWeekly: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500 transition"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Affects cold storage ether & peroxide safety.</span>
                </div>

                <div>
                  <label htmlFor="school-reg-riskgrade" className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Initial Risk Grade
                  </label>
                  <select
                    id="school-reg-riskgrade"
                    name="risk_grade"
                    value={formData.riskGrade}
                    onChange={(e) => setFormData({ ...formData, riskGrade: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition"
                  >
                    <option value="A">Grade A (Pristine / Low Risk)</option>
                    <option value="B">Grade B (Standard Compliance)</option>
                    <option value="C">Grade C (Elevated Attention Needed)</option>
                    <option value="D">Grade D (High Hazard Priority)</option>
                  </select>
                  <span className="text-[10px] text-slate-500 mt-1 block">District Hazmat sweep priority tier.</span>
                </div>
              </div>
            </div>

            {/* Section 4: Contact & Custodian */}
            <div className="pt-4 border-t border-slate-800">
              <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                4. Lab Custodian & Emergency Contacts
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="school-reg-contact-email" className="block text-xs font-medium text-slate-300 mb-1.5">
                    Official Institutional Email *
                  </label>
                  <input
                    id="school-reg-contact-email"
                    name="contact_email"
                    autoComplete="email"
                    type="email"
                    required
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="e.g. principal.pollachi@tnschools.gov.in"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label htmlFor="school-reg-contact-phone" className="block text-xs font-medium text-slate-300 mb-1.5">
                    Emergency Hazmat Phone *
                  </label>
                  <input
                    id="school-reg-contact-phone"
                    name="contact_phone"
                    autoComplete="tel"
                    type="tel"
                    required
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl font-semibold text-xs tracking-wide uppercase bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-500 hover:from-emerald-400 hover:via-teal-500 hover:to-cyan-400 text-white shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Registering School in Supabase Database...
                  </>
                ) : (
                  <>
                    <span>Commit Institution to Supabase PostgreSQL</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950/80 px-6 py-4 text-center text-[11px] text-slate-500 font-mono">
        ReagentWatch AI School Governance Engine • Multi-Cluster Geospatial Integration
      </footer>
    </div>
  );
}
