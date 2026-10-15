'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ScanLine, 
  FlaskConical, 
  MapPin, 
  BarChart3, 
  Wifi, 
  WifiOff, 
  Mic, 
  AlertTriangle, 
  CheckCircle2, 
  Truck, 
  Volume2, 
  Sparkles,
  ArrowRight,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Info,
  Camera,
  Bot,
  FileDown,
  GitBranch,
  ShieldCheck,
  MessageSquare,
  ScanEye,
  ArrowRightLeft,
  QrCode,
  Box,
  Globe,
  Plus,
  UserCheck,
  GraduationCap,
  LogOut,
  Key,
  Lock,
  BellRing,
  Radio,
  FileCheck,
  AlertOctagon,
  Layers,
  ChevronRight,
  Shield,
  Clock,
  PauseCircle,
  FileText,
  Building2
} from 'lucide-react';
import Link from 'next/link';
import { ChemicalBottle, AlertNotification, School, SystemEvaluationMetrics } from '@/types/chemical';
import { SEED_DEMO_BOTTLES, SEED_ALERTS, SEED_SCHOOLS, SEED_CLUSTER_POOL, SEED_EVALUATION_METRICS } from '@/lib/seed-data';
import { calculateBottleRisk, validateCasChecksum, CasValidationResult } from '@/lib/chemistry-engine';
import { optimizeClusterRoute } from '@/lib/cluster-optimizer';
import { downloadComplianceManifest } from '@/lib/compliance-pdf';
import { fetchPubChemData, PubChemCompoundData } from '@/lib/pubchem-service';
import { useAuth, PRESET_USERS } from '@/lib/auth-context';
import { 
  getChemicalBottles, 
  saveChemicalBottle, 
  getAlerts, 
  saveAlert, 
  logDegradationEvent 
} from '@/lib/supabase';
import dynamic from 'next/dynamic';

const QrCameraScanner = dynamic(() => import('@/components/QrCameraScanner'), { ssr: false });
const SpeechVoiceRecorder = dynamic(() => import('@/components/SpeechVoiceRecorder'), { ssr: false });
const SdsCopilotDrawer = dynamic(() => import('@/components/SdsCopilotDrawer'), { ssr: false });
const VisualCabinetShelf = dynamic(() => import('@/components/VisualCabinetShelf'), { ssr: false });
const LangGraphHitlModal = dynamic(() => import('@/components/LangGraphHitlModal'), { ssr: false });
const WhatsAppEscalationFeed = dynamic(() => import('@/components/WhatsAppEscalationFeed'), { ssr: false });
const VisionBottleInspector = dynamic(() => import('@/components/VisionBottleInspector'), { ssr: false });
const PeerChemicalExchange = dynamic(() => import('@/components/PeerChemicalExchange'), { ssr: false });
const QrCodeGeneratorModal = dynamic(() => import('@/components/QrCodeGeneratorModal'), { ssr: false });
const ThreeBottleViewer = dynamic(() => import('@/components/ThreeBottleViewer'), { ssr: false });
const NewBottleOnboardingModal = dynamic(() => import('@/components/NewBottleOnboardingModal'), { ssr: false });
const ThreeLaboratoryCabinet = dynamic(() => import('@/components/ThreeLaboratoryCabinet'), { ssr: false });
const IncidentReportModal = dynamic(() => import('@/components/IncidentReportModal'), { ssr: false });
const DistrictGisMap = dynamic(() => import('@/components/DistrictGisMap'), { ssr: false });
const AuthModal = dynamic(() => import('@/components/AuthModal'), { ssr: false });
const SchoolDetailsModal = dynamic(() => import('@/components/SchoolDetailsModal'), { ssr: false });
const InstitutionalLoginGateway = dynamic(() => import('@/components/InstitutionalLoginGateway'), { ssr: false });

export default function ReagentWatchDashboard() {
  const { currentUser, isAuthenticated, loginAsRole, logout, can } = useAuth();
  const [activeTab, setActiveTab] = useState<'teacher' | 'incompat' | 'principal_hitl' | 'district' | 'eval' | 'exchange'>('teacher');
  const [selectedSchool, setSelectedSchool] = useState<School>(SEED_SCHOOLS[0]);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [shelfViewMode, setShelfViewMode] = useState<'3d' | '2d'>('3d');
  const [selectedLang, setSelectedLang] = useState<'en' | 'ta' | 'hi'>('en');
  const [bottles, setBottles] = useState<ChemicalBottle[]>(SEED_DEMO_BOTTLES);
  const [alerts, setAlerts] = useState<AlertNotification[]>(SEED_ALERTS);
  const [selectedBottle, setSelectedBottle] = useState<ChemicalBottle | null>(SEED_DEMO_BOTTLES[0]);
  
  // Principal HITL Queue State
  const [hitlQueue, setHitlQueue] = useState([
    {
      id: 'auth-hitl-001',
      bottleId: 'bottle-1-ether-critical',
      chemicalName: 'Diethyl Ether (Stabilized with BHT)',
      casNumber: '60-29-7',
      schoolName: 'Govt Higher Secondary School, Pollachi West',
      riskScore: 98,
      anomalyType: 'Peroxide Crystal Precipitation',
      agentDecision: 'Automated Quarantine & Dual-Key Halt',
      reasoning: [
        'LangGraph Supervisor Node ingested visual report of needle-like crystals around cap neck.',
        'Deterministic degradation rule: Class B Peroxide Former opened > 180 days with crystal precipitation confirmed.',
        'Immediate explosive risk if unscrewed or moved. Execution interrupted at human-in-the-loop checkpoint.',
      ],
      status: 'pending' as 'pending' | 'approved' | 'rejected',
      principalNotes: '',
    }
  ]);
  
  // Modals & Drawers
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [isSdsDrawerOpen, setIsSdsDrawerOpen] = useState(false);
  const [isHitlModalOpen, setIsHitlModalOpen] = useState(false);
  const [isVisionInspectorOpen, setIsVisionInspectorOpen] = useState(false);
  const [isQrGeneratorOpen, setIsQrGeneratorOpen] = useState(false);
  const [isNewBottleModalOpen, setIsNewBottleModalOpen] = useState(false);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [inspectedSchoolModal, setInspectedSchoolModal] = useState<School | null>(null);

  // Role Operations State
  const [isEvacuationAlertActive, setIsEvacuationAlertActive] = useState(false);
  const [isHazmatDispatched, setIsHazmatDispatched] = useState(false);
  const [teacherEscalationNotice, setTeacherEscalationNotice] = useState<string | null>(null);

  // Align active tab whenever user role changes
  useEffect(() => {
    if (currentUser.role === 'teacher') {
      if (activeTab !== 'teacher' && activeTab !== 'incompat') {
        setActiveTab('teacher');
      }
    } else if (currentUser.role === 'principal') {
      if (activeTab !== 'principal_hitl' && activeTab !== 'incompat') {
        setActiveTab('principal_hitl');
      }
    } else if (currentUser.role === 'district_officer') {
      if (activeTab !== 'district' && activeTab !== 'eval' && activeTab !== 'exchange') {
        setActiveTab('district');
      }
    }
  }, [currentUser.role]);

  // Automatically align selected school with logged-in user profile
  useEffect(() => {
    if (currentUser.schoolId && currentUser.schoolId !== 'all') {
      const sch = SEED_SCHOOLS.find(s => s.id === currentUser.schoolId);
      if (sch) setSelectedSchool(sch);
    }
  }, [currentUser]);

  // Load chemical inventory and alerts from Supabase / database on initial mount
  useEffect(() => {
    getChemicalBottles().then(loadedBottles => {
      if (loadedBottles && loadedBottles.length > 0) {
        setBottles(loadedBottles);
        const match = loadedBottles.find(b => b.schoolId === selectedSchool.id) || loadedBottles[0];
        setSelectedBottle(match);
      }
    });

    getAlerts().then(loadedAlerts => {
      if (loadedAlerts && loadedAlerts.length > 0) {
        setAlerts(loadedAlerts);
      }
    });
  }, []);

  // Live PubChem NIH Data State
  const [livePubChem, setLivePubChem] = useState<PubChemCompoundData | null>(null);
  const [isFetchingPubChem, setIsFetchingPubChem] = useState(false);

  // Voice Incident logging states
  const [voiceText, setVoiceText] = useState('');
  const [detectedIncidentType, setDetectedIncidentType] = useState<string>('visual_crystals');
  const [casTestInput, setCasTestInput] = useState('60-29-7');
  const [casResult, setCasResult] = useState<CasValidationResult>(() => validateCasChecksum('60-29-7'));

  // Translations
  const t = {
    en: {
      appName: 'ReagentWatch AI',
      subtitle: 'Peri-Urban Laboratory Chemical Degradation & Hazard Governance',
      scannerTitle: 'Mobile Laboratory Edge Scanner',
      scanBtn: 'Camera QR Scan',
      voiceReportBtn: 'Multilingual Voice Report',
      visionBtn: 'Gemini Vision AI Scan',
      sdsCopilotBtn: 'AI SDS Copilot',
      qrLabelBtn: 'Print QR Label',
      districtMapTitle: 'District GIS Hazard Heatmap & Cluster Disposal',
      evalTitle: 'Scientific Detection & Evaluation Benchmark',
    },
    ta: {
      appName: 'ரீஜென்ட்வாட்ச் AI',
      subtitle: 'கிராமப்புற பள்ளி ஆய்வக இரசாயன சிதைவு கண்காணிப்பு',
      scannerTitle: 'ஆய்வக பாட்டில் ஸ்கேனர்',
      scanBtn: 'கேமரா QR ஸ்கேன்',
      voiceReportBtn: 'குரல்வழி அறிக்கை (தமிழ்)',
      visionBtn: 'விஷன் AI ஆய்வு',
      sdsCopilotBtn: 'பாதுகாப்பு AI உதவியாளர்',
      qrLabelBtn: 'QR லேபிள் அச்சிடுக',
      districtMapTitle: 'மாவட்ட வரைபடம் & கழிவு மேலாண்மை',
      evalTitle: 'செயல்திறன் மற்றும் துல்லிய மதிப்பீடு',
    },
    hi: {
      appName: 'रीएजेंटवॉच AI',
      subtitle: 'ग्रामीण व अर्ध-शहरी स्कूल रसायन अपघटन निगरानी',
      scannerTitle: 'लैब बोतल स्कैनर',
      scanBtn: 'कैमरा QR स्कैन',
      voiceReportBtn: 'आवाज द्वारा रिपोर्ट (हिंदी)',
      visionBtn: 'विज़न AI स्कैन',
      sdsCopilotBtn: 'सुरक्षा AI सहायक',
      qrLabelBtn: 'QR लेबल प्रिंट करें',
      districtMapTitle: 'जिला GIS मानचित्र एवं निपटान क्लस्टर',
      evalTitle: 'सटीकता एवं मूल्यांकन बेंचमार्क',
    }
  }[selectedLang];

  // Fetch live PubChem data when selected bottle changes
  useEffect(() => {
    if (!selectedBottle) return;

    let isMounted = true;
    setIsFetchingPubChem(true);

    fetchPubChemData(selectedBottle.chemical.canonicalName).then(data => {
      if (isMounted) {
        setLivePubChem(data);
        setIsFetchingPubChem(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedBottle]);

  // Handle CAS Verification Test
  const handleCasVerify = (val: string) => {
    setCasTestInput(val);
    setCasResult(validateCasChecksum(val));
  };

  // Handle Scanned QR code
  const handleQrScanned = (scannedText: string) => {
    let targetCode = scannedText;
    // If scanned JSON from our QR generator, parse it
    try {
      const parsed = JSON.parse(scannedText);
      if (parsed.qr) targetCode = parsed.qr;
    } catch {}

    const found = bottles.find(b => b.qrCode === targetCode || b.qrCode.includes(targetCode));
    if (found) {
      setSelectedBottle(found);
      alert(`Scanned: ${found.chemical.canonicalName} (${found.qrCode}). Risk Score: ${found.currentRiskScore}/100.`);
    } else {
      alert(`Scanned bottle QR "${targetCode}". Reagent identified and verified.`);
    }
  };

  // Handle Vision AI findings
  const handleApplyVisionAnomaly = (finding: any) => {
    if (!selectedBottle) return;

    const updated = { ...selectedBottle };
    if (finding.anomalyType === 'crystals') {
      updated.currentRiskScore = 98;
      updated.riskLevel = 'critical';
      updated.riskFactors = [
        `🚨 GEMINI VISION DETECTED: ${finding.findingSummary}`,
        ...updated.riskFactors,
      ];
    } else if (finding.anomalyType === 'swollen_cap') {
      updated.currentRiskScore = Math.max(updated.currentRiskScore, 85);
      updated.riskLevel = 'critical';
      updated.riskFactors = [
        `⚠️ GEMINI VISION DETECTED: ${finding.findingSummary}`,
        ...updated.riskFactors,
      ];
    }

    setBottles(prev => prev.map(b => b.id === updated.id ? updated : b));
    setSelectedBottle(updated);

    const newAlert: AlertNotification = {
      id: `alert-vision-${Date.now()}`,
      schoolId: selectedSchool.id,
      bottleId: updated.id,
      chemicalName: updated.chemical.canonicalName,
      schoolName: selectedSchool.name,
      severity: updated.riskLevel,
      title: `📸 VISION AI ANOMALY: ${finding.anomalyType.toUpperCase()}`,
      message: `${finding.findingSummary} [Confidence: ${(finding.confidence * 100).toFixed(1)}%]`,
      status: 'raised',
      currentAssignedRole: 'principal',
      raisedAt: new Date().toISOString(),
      escalationLevel: 2,
      smsSent: true,
    };

    setAlerts(prev => [newAlert, ...prev]);
    saveChemicalBottle(updated);
    saveAlert(newAlert);
    logDegradationEvent(
      updated.id,
      finding.anomalyType,
      currentUser.id,
      `Gemini Vision anomaly detected: ${finding.findingSummary}`,
      finding.anomalyType === 'crystals' ? 100 : undefined
    );
    setIsHitlModalOpen(true);
  };



  // Handle LangGraph HITL Approval
  const handleHitlApprove = (officerName: string, notes: string) => {
    if (!selectedBottle) return;
    setAlerts(prev =>
      prev.map(a =>
        a.bottleId === selectedBottle.id
          ? { ...a, status: 'acknowledged', acknowledgedBy: officerName, message: `${a.message} [Approved by ${officerName}: ${notes}]` }
          : a
      )
    );
    alert(`LangGraph Checkpoint Resumed: Hazardous Reagent ${selectedBottle.qrCode} authorized for quarantine & cluster Hazmat pickup.`);
  };

  const handleHitlOverride = (notes: string) => {
    alert(`LangGraph Checkpoint Resumed with Override: ${notes}`);
  };

  // Acknowledge alert from WhatsApp simulator
  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev =>
      prev.map(a => a.id === alertId ? { ...a, status: 'acknowledged', acknowledgedBy: 'Principal via WhatsApp ACK' } : a)
    );
  };

  // Dynamic Cluster Route Calculation
  const clusterRoute = optimizeClusterRoute(
    SEED_SCHOOLS.map((s, idx) => ({
      name: s.name,
      lat: s.latitude,
      lng: s.longitude,
      bottleCount: idx === 0 ? 7 : idx === 2 ? 6 : idx === 3 ? 5 : 2,
    }))
  );

  // If not authenticated, every user lands on the Home Page Institutional Login Gateway
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-[#070B12] text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
        {/* Top Header */}
        <header className="border-b border-slate-800/90 bg-[#0B0F17]/90 backdrop-blur-md px-4 lg:px-8 py-3.5 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
                <FlaskConical className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg text-white tracking-tight">ReagentWatch AI</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    v2.4
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">TN School Chemical Degradation & Hazard Governance</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/register/school"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition"
              >
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Register School</span>
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Home Page Content: Institutional Login Gateway */}
        <main className="flex-1 flex flex-col items-center justify-center py-8">
          <InstitutionalLoginGateway onLoginSuccess={() => {}} />
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500 bg-[#070B12]">
          Tamil Nadu State Secondary School Chemistry Safety Protocol • Multi-Tier RBAC Gateway (Teacher ➔ Headmaster ➔ DEO)
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17]">
      {/* Top Emergency Evacuation Siren Banner (Activated by Principal) */}
      {isEvacuationAlertActive && (
        <div className="bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white px-4 py-3 border-b-2 border-rose-300 flex items-center justify-between shadow-2xl animate-pulse sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <AlertOctagon className="w-6 h-6 text-white shrink-0 animate-bounce" />
            <div>
              <span className="font-black text-sm uppercase tracking-wider block font-mono">
                🚨 INSTITUTIONAL EMERGENCY: LAB EVACUATION DIRECTIVE ACTIVE
              </span>
              <span className="text-xs text-rose-100 font-medium">
                Issued by {currentUser.name} ({currentUser.designation}). Science Wing Block C must be vacated immediately. Tamil Nadu Fire Hazmat Unit #101 & District DEO notified.
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsEvacuationAlertActive(false)}
            className="px-3.5 py-1.5 bg-white text-rose-800 font-bold text-xs rounded-lg hover:bg-rose-50 shadow-md transition-all cursor-pointer whitespace-nowrap ml-4"
          >
            Deactivate & Stand Down
          </button>
        </div>
      )}

      {/* Top Header & Context Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-[#0B0F17]/95 backdrop-blur-md px-4 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 max-w-7xl mx-auto">
          {/* Brand & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              <FlaskConical className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">{t.appName}</h1>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  TN-EDU HAZMAT NETWORK
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">{t.subtitle}</p>
            </div>
          </div>

          {/* User Persona & Role Authorization Hub */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Authenticated User Pill & Role Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 shadow-inner">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                currentUser.role === 'principal' 
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' 
                  : currentUser.role === 'district_officer' 
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' 
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {currentUser.role === 'principal' ? '🏛️' : currentUser.role === 'district_officer' ? '🌐' : '👩‍🏫'}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white leading-tight">{currentUser.name}</span>
                  <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded font-mono border ${
                    currentUser.role === 'principal' 
                      ? 'bg-purple-950 text-purple-300 border-purple-500/40' 
                      : currentUser.role === 'district_officer' 
                      ? 'bg-blue-950 text-blue-300 border-blue-500/40' 
                      : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                  }`}>
                    {(currentUser?.role || 'teacher').replace(/_/g, ' ')}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block truncate max-w-[160px] sm:max-w-[210px]">
                  {currentUser?.schoolName || 'Govt School Campus'}
                </span>
              </div>
            </div>

            {/* Quick 1-Click Role Switcher for Hackathon Judges & Evaluators */}
            <div className="hidden sm:flex rounded-lg border border-slate-800 bg-slate-900/80 p-0.5 text-xs">
              <button
                onClick={() => loginAsRole('teacher')}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  currentUser.role === 'teacher' 
                    ? 'bg-emerald-500 text-slate-950 shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Switch to Teacher (R. Selvakumar, Govt HSS Pollachi)"
              >
                Teacher
              </button>
              <button
                onClick={() => loginAsRole('principal')}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  currentUser.role === 'principal' 
                    ? 'bg-purple-500 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Switch to Principal (Dr. K. Meenakshi, Madukkarai CHS)"
              >
                Principal
              </button>
              <button
                onClick={() => loginAsRole('district_officer')}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  currentUser.role === 'district_officer' 
                    ? 'bg-blue-500 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Switch to District Officer (Er. S. Murugesan, DEO)"
              >
                DEO
              </button>
            </div>

            {/* Log Out Button */}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 font-semibold transition cursor-pointer"
              title="Log out and return to Home Page Login Gateway"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Log Out</span>
            </button>

            {/* Dedicated Role Login Link */}
            <Link
              href={`/login?role=${currentUser.role}`}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 font-semibold transition-all cursor-pointer"
              title="Open Dedicated Multi-Role Login Portal with OTP Verification"
            >
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Role Login</span>
            </Link>

            {/* School Registration Link */}
            <Link
              href="/register/school"
              className="hidden md:flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-semibold transition-all cursor-pointer"
              title="Register a new School into Supabase Database"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>+ Register Campus</span>
            </Link>

            {/* Sign In / Sign Up Modal Trigger */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition-all cursor-pointer"
              title="Open Login / Sign Up / Role Delegation Dialog"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Delegation</span>
            </button>

            {/* AI SDS Copilot Button */}
            <button
              onClick={() => setIsSdsDrawerOpen(true)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 font-semibold transition-all shadow-sm cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>{t.sdsCopilotBtn}</span>
            </button>

            {/* School Switcher */}
            <select
              id="header-school-switcher"
              name="school_selection"
              aria-label="Select School Campus"
              value={selectedSchool.id}
              onChange={(e) => {
                const s = SEED_SCHOOLS.find(x => x.id === e.target.value);
                if (s) setSelectedSchool(s);
              }}
              className="bg-slate-900 border border-slate-700 text-xs rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {(SEED_SCHOOLS || []).map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            {/* Offline/Online Simulator Toggle */}
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                isOnline 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span className="font-medium">{isOnline ? 'Edge Synced' : 'Offline Mode'}</span>
            </button>

            {/* Language Selector */}
            <div className="flex rounded-lg border border-slate-800 bg-slate-900/80 p-0.5 text-xs">
              {(['en', 'ta', 'hi'] as const).map(lang => (
                <button
                  key={lang}
                  onClick={() => setSelectedLang(lang)}
                  className={`px-2 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    selectedLang === lang ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang === 'en' ? 'EN' : lang === 'ta' ? 'தமிழ்' : 'हिंदी'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Strict Role-Scoped Tab Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between max-w-7xl mx-auto mt-3 overflow-x-auto pb-1 gap-2">
          <div className="flex items-center gap-2">
            {/* TEACHER ROLE TABS (Strict: Laboratory Reagent Shelf & 2D Cabinet Incompatibility) */}
            {currentUser.role === 'teacher' && (
              <>
                <button
                  onClick={() => setActiveTab('teacher')}
                  className={`flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                    activeTab === 'teacher' 
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold ring-2 ring-cyan-400/40' 
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <FlaskConical className="w-4 h-4" />
                  <span>1. Laboratory Reagent Shelf & 3D Specimen</span>
                </button>

                <button
                  onClick={() => setActiveTab('incompat')}
                  className={`flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                    activeTab === 'incompat' 
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold ring-2 ring-cyan-400/40' 
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>2. 2D Cabinet Shelf & GHS Incompatibility</span>
                </button>
              </>
            )}

            {/* PRINCIPAL / CHAIRMAN ROLE TABS (Strict: LangGraph HITL Authorization & 2D Cabinet Compliance) */}
            {currentUser.role === 'principal' && (
              <>
                <button
                  onClick={() => setActiveTab('principal_hitl')}
                  className={`flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                    activeTab === 'principal_hitl' 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20 font-bold ring-2 ring-indigo-400/40' 
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <GitBranch className="w-4 h-4" />
                  <span>1. Authorization via LangGraph (Dual-Key HITL)</span>
                </button>

                <button
                  onClick={() => setActiveTab('incompat')}
                  className={`flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                    activeTab === 'incompat' 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20 font-bold ring-2 ring-indigo-400/40' 
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>2. 2D Cabinet Shelf & GHS Incompatibility</span>
                </button>
              </>
            )}

            {/* DISTRICT OFFICER (DEO) ROLE TABS (Strict: GIS Map, Evaluation Benchmark, Chemical Exchange) */}
            {currentUser.role === 'district_officer' && (
              <>
                <button
                  onClick={() => setActiveTab('district')}
                  className={`flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                    activeTab === 'district' 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold ring-2 ring-emerald-400/40' 
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  <span>1. District GIS Map & Cluster Hazmat (100.2 km)</span>
                </button>

                <button
                  onClick={() => setActiveTab('eval')}
                  className={`flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                    activeTab === 'eval' 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold ring-2 ring-emerald-400/40' 
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>2. Evaluation & Accuracy Benchmarks</span>
                </button>

                <button
                  onClick={() => setActiveTab('exchange')}
                  className={`flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                    activeTab === 'exchange' 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold ring-2 ring-emerald-400/40' 
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>3. Inter-School Chemical Exchange</span>
                </button>
              </>
            )}
          </div>

          {/* Role Action Shortcuts */}
          <div className="flex items-center gap-2 shrink-0">
            {currentUser.role === 'teacher' && (
              <button
                onClick={() => setIsNewBottleModalOpen(true)}
                className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/30 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Onboard Reagent</span>
              </button>
            )}

            {currentUser.role === 'principal' && (
              <button
                onClick={() => {
                  const confirmed = confirm('Trigger Campus-Wide Emergency Evacuation Siren? This will broadcast emergency Hazmat warnings across the school wing.');
                  if (confirmed) {
                    setIsEvacuationAlertActive(true);
                  }
                }}
                className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl shadow-md transition cursor-pointer ${
                  isEvacuationAlertActive 
                    ? 'bg-rose-600 animate-pulse text-white' 
                    : 'bg-rose-950/80 border border-rose-500/60 text-rose-300 hover:bg-rose-900'
                }`}
              >
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>{isEvacuationAlertActive ? '🚨 Siren Broadcasting' : 'Evacuation Siren'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        
        {/* Institutional 3-Tier Safety Chain Progression Bar: Teacher -> Headmaster -> DEO */}
        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900/90 via-[#0B132B]/80 to-slate-900/90 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-500" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                <GitBranch className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white tracking-wide">
                    Institutional Governance Chain: Teacher ➔ Headmaster ➔ DEO
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    Mandatory TN Safety Protocol
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Role-authorized lifecycle: Classroom hazard detection escalates to Principal dual-key approval, followed by DEO hazmat fleet pickup.
                </p>
              </div>
            </div>

            {/* Quick Switch Buttons for Evaluators */}
            <div className="flex items-center gap-2 self-start md:self-center">
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">Active Role:</span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border uppercase font-mono ${
                currentUser?.role === 'teacher'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : currentUser?.role === 'principal'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}>
                {(currentUser?.role || 'teacher').replace(/_/g, ' ')}
              </span>
              <button
                onClick={logout}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium transition flex items-center gap-1 cursor-pointer ml-1"
                title="Log out and return to Home Page Login Gateway"
              >
                <LogOut className="w-3 h-3 text-rose-400" />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {/* 3 Step Cards Flow */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            {/* Step 1: Teacher */}
            <div
              onClick={() => {
                if (currentUser.role !== 'teacher') loginAsRole('teacher');
                setActiveTab('teacher');
              }}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                currentUser.role === 'teacher'
                  ? 'bg-gradient-to-b from-cyan-950/60 to-slate-900 border-cyan-500 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/70 opacity-75'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    currentUser.role === 'teacher' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    1
                  </span>
                  <span className="text-xs font-bold text-white">Science Teacher</span>
                </div>
                {currentUser.role === 'teacher' && (
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    Active View
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300">
                <b>Classroom Custodian:</b> Reagent Shelf, Onboard with CAS Checksum, 2D Cabinet Incompatibility.
              </p>
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                <span className="text-cyan-400 font-mono">Pollachi West Lab</span>
                <span className="text-slate-400 font-medium">Detects & Escalates ➔</span>
              </div>
            </div>

            {/* Step 2: Headmaster */}
            <div
              onClick={() => {
                if (currentUser.role !== 'principal') loginAsRole('principal');
                setActiveTab('principal_hitl');
              }}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                currentUser.role === 'principal'
                  ? 'bg-gradient-to-b from-purple-950/60 to-slate-900 border-purple-500 ring-2 ring-purple-500/30 shadow-lg shadow-purple-500/10'
                  : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/70 opacity-75'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    currentUser.role === 'principal' ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    2
                  </span>
                  <span className="text-xs font-bold text-white">Headmaster / Principal</span>
                </div>
                {currentUser.role === 'principal' && (
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    Active View
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300">
                <b>Dual-Key Authority:</b> LangGraph HITL Queue Sign-off, Campus Evacuation Siren, 2D Compliance Audit.
              </p>
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                <span className="text-purple-400 font-mono">HITL Gatekeeper</span>
                <span className="text-slate-400 font-medium">Authorizes Hazmat ➔</span>
              </div>
            </div>

            {/* Step 3: DEO */}
            <div
              onClick={() => {
                if (currentUser.role !== 'district_officer') loginAsRole('district_officer');
                setActiveTab('district');
              }}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                currentUser.role === 'district_officer'
                  ? 'bg-gradient-to-b from-emerald-950/60 to-slate-900 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/70 opacity-75'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    currentUser.role === 'district_officer' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    3
                  </span>
                  <span className="text-xs font-bold text-white">District Officer (DEO)</span>
                </div>
                {currentUser.role === 'district_officer' && (
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Active View
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300">
                <b>District Commander:</b> 100.2 km Hazmat Fleet Route Sweep, Scientific Evaluation Benchmarks, Chemical Exchange.
              </p>
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                <span className="text-emerald-400 font-mono">100.2 km Route</span>
                <span className="text-slate-400 font-medium">Safe Retrieval ✓</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Teacher Escalation Modal/Alert */}
        {teacherEscalationNotice && (
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/50 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-xs text-amber-300 uppercase tracking-wider font-mono block">
                  Institutional Governance Rule: Level-2 HITL Escalation Dispatched
                </span>
                <p className="text-xs text-slate-200">
                  {teacherEscalationNotice}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                onClick={() => {
                  loginAsRole('principal');
                  setTeacherEscalationNotice(null);
                  setIsHitlModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Switch to Principal & Sign Off</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTeacherEscalationNotice(null)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Role-Specific Command & Governance Console */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
                currentUser.role === 'principal'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : currentUser.role === 'district_officer'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {currentUser.role === 'principal' ? '🏛️' : currentUser.role === 'district_officer' ? '🌐' : '👩‍🏫'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white">
                    {currentUser.role === 'teacher' && 'Chemistry Faculty & Lab Custodian Portal'}
                    {currentUser.role === 'principal' && 'Principal & Institutional Governance Authority'}
                    {currentUser.role === 'district_officer' && 'District Hazmat Incident Commander Console'}
                  </h2>
                  <span className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full border ${
                    currentUser.role === 'principal'
                      ? 'bg-purple-950 text-purple-300 border-purple-500/40'
                      : currentUser.role === 'district_officer'
                      ? 'bg-blue-950 text-blue-300 border-blue-500/40'
                      : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                  }`}>
                    {currentUser.role === 'teacher' && 'LEVEL 1: LAB OPERATIONS'}
                    {currentUser.role === 'principal' && 'LEVEL 2: INSTITUTIONAL SIGN-OFF'}
                    {currentUser.role === 'district_officer' && 'LEVEL 3: DISTRICT COMMAND'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {currentUser.role === 'teacher' && 'Frontline lab operations, barcode scanning, anomaly detection, and multilingual emergency logging.'}
                  {currentUser.role === 'principal' && 'Human-in-the-loop chemical disposal authorization, school evacuation alarm, and compliance sign-offs.'}
                  {currentUser.role === 'district_officer' && 'Regional GIS hazard heatmap, 100.2 km multi-school Hazmat cluster routing, and chemical redistribution.'}
                </p>
              </div>
            </div>

            {/* Role Switching Shortcut Pill */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 hidden sm:inline">Active Scope:</span>
              <span className="font-mono text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-1 rounded border border-emerald-500/30">
                {currentUser.role === 'district_officer' ? '5 Schools (Coimbatore District)' : selectedSchool.name}
              </span>
            </div>
          </div>

          {/* Role-Specific Interactive Actions */}
          {currentUser.role === 'teacher' && (
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-slate-400 font-semibold font-mono text-[11px] mr-1">Lab Checklist:</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Eyewash Station Verified
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Fume Hood CFM Nominal
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Sand Buckets Stocked
              </span>
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => setIsQrScannerOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold cursor-pointer"
                >
                  Scan QR
                </button>
                <button
                  onClick={() => setIsVisionInspectorOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 font-semibold cursor-pointer"
                >
                  Vision AI Scan
                </button>
                <button
                  onClick={() => setIsIncidentModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                >
                  Voice Report
                </button>
              </div>
            </div>
          )}

          {currentUser.role === 'principal' && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono font-bold">
                  1 Critical Reagent Awaiting HITL Authorization
                </span>
                <button
                  onClick={() => setIsHitlModalOpen(true)}
                  className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-md shadow-purple-600/30 cursor-pointer flex items-center gap-1.5"
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>Authorize Disposal (HITL)</span>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEvacuationAlertActive(!isEvacuationAlertActive)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isEvacuationAlertActive
                      ? 'bg-white text-rose-700'
                      : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 animate-pulse'
                  }`}
                >
                  <AlertOctagon className="w-3.5 h-3.5" />
                  <span>{isEvacuationAlertActive ? 'Silence Evacuation Alarm' : 'Trigger Campus Evacuation'}</span>
                </button>
                <button
                  onClick={() => downloadComplianceManifest(selectedSchool, bottles)}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold cursor-pointer flex items-center gap-1.5"
                >
                  <FileDown className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Certified Audit Manifest</span>
                </button>
              </div>
            </div>
          )}

          {currentUser.role === 'district_officer' && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Hazard Cluster Route:</span>
                <span className="font-mono text-cyan-300 font-semibold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                  100.2 km • 5 Schools • 22 Bottles Pooled
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsHazmatDispatched(!isHazmatDispatched)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isHazmatDispatched 
                      ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30' 
                      : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/30'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>
                    {isHazmatDispatched 
                      ? 'Hazmat Truck TN-37-HZ-2026 Dispatched (En Route)' 
                      : 'Dispatch Hazmat Collection Truck'}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('district')}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold border border-slate-700 cursor-pointer"
                >
                  Inspect District GIS Map
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* TAB 1: TEACHER EDGE SCANNER, 3D MODEL & VOICE INCIDENTS   */}
        {/* ========================================================= */}
        {activeTab === 'teacher' && (
          <div className="space-y-6">
            {/* Top Lab Condition Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-panel p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400">School Lab Environment</span>
                <p className="text-sm font-semibold text-white mt-1">{selectedSchool.name}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                  <span>Humidity: <b className="text-emerald-400">{selectedSchool.avgLabHumidityPct}%</b></span>
                  <span>•</span>
                  <span>Power Cuts: <b className="text-amber-400">{selectedSchool.powerCutFrequencyWeekly}/wk</b></span>
                </div>
              </div>

              <div className="glass-panel p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400">Active Laboratory Hazard State</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-black text-rose-500">1 Critical</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    Peroxide Detonation Risk
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2">Class B Ether bottle quarantined</p>
              </div>

              <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-slate-400">Edge Sync Queue</span>
                  <p className="text-sm font-semibold text-emerald-400 mt-1">
                    {isOnline ? '0 pending (All Synced)' : '1 event stored in IndexedDB'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <button
                    onClick={() => setIsQrScannerOpen(true)}
                    className="flex-1 py-2 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t.scanBtn}</span>
                  </button>
                  <button
                    onClick={() => setIsVisionInspectorOpen(true)}
                    className="flex-1 py-2 px-2 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-cyan-500/40 transition-colors shadow-sm"
                  >
                    <ScanEye className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{t.visionBtn}</span>
                  </button>
                  <button
                    onClick={() => setIsIncidentModalOpen(true)}
                    className="w-full py-2 px-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>{t.voiceReportBtn}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottle Inspection & QR Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Bottle List */}
              <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-emerald-400" />
                    <span>Laboratory Reagent Shelf</span>
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setIsNewBottleModalOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 active:scale-95"
                      title="Onboard Reagent into Laboratory Inventory Hierarchy"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Onboard Reagent</span>
                    </button>
                    <span className="text-xs text-slate-400 font-mono">({bottles.length})</span>
                  </div>
                </div>

                <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
                  {(bottles || []).map(bottle => {
                    const isCrit = bottle.riskLevel === 'critical';
                    const isHigh = bottle.riskLevel === 'high';
                    const isSelected = selectedBottle?.id === bottle.id;

                    return (
                      <div
                        key={bottle.id}
                        onClick={() => setSelectedBottle(bottle)}
                        className={`p-3.5 rounded-xl cursor-pointer border transition-all ${
                          isSelected 
                            ? 'bg-slate-800/90 border-emerald-500 shadow-md' 
                            : 'bg-slate-900/50 hover:bg-slate-800/50 border-slate-800/80'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-mono text-slate-400">{bottle.qrCode}</span>
                            <h4 className="text-sm font-semibold text-white leading-tight mt-0.5">
                              {bottle.chemical.canonicalName}
                            </h4>
                            <p className="text-xs text-slate-400 mt-1">Formula: <span className="font-mono text-slate-300">{bottle.chemical.chemicalFormula}</span></p>
                          </div>
                          <div className={`px-2 py-1 rounded-md text-[11px] font-bold ${
                            isCrit ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse' :
                            isHigh ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                            'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          }`}>
                            {bottle.currentRiskScore}/100
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                          <span>Vol: <b className="text-slate-200">{bottle.currentVolumeMl} {bottle.unit}</b></span>
                          <span>•</span>
                          <span>Status: <b className="capitalize text-slate-200">{bottle.status}</b></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Bottle Deep Analysis Card + 3D Viewer */}
              {selectedBottle && (
                <div className="lg:col-span-2 space-y-4">
                  <div className={`p-6 rounded-2xl border ${
                    selectedBottle.riskLevel === 'critical' ? 'glass-panel-glow-red' :
                    selectedBottle.riskLevel === 'high' ? 'glass-panel-glow-amber' :
                    'glass-panel-glow-green'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            QR: {selectedBottle.qrCode}
                          </span>
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            CAS: {selectedBottle.chemical.casNumber}
                          </span>
                          {livePubChem && (
                            <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                              <Globe className="w-3 h-3 text-blue-400" />
                              <span>PubChem CID: {livePubChem.cid}</span>
                            </span>
                          )}
                        </div>
                        <h2 className="text-xl font-black text-white mt-2">
                          {selectedBottle.chemical.canonicalName}
                        </h2>
                        {livePubChem && (
                          <p className="text-xs text-blue-300/80 font-mono mt-0.5">
                            IUPAC: {livePubChem.iupacName} • Mol Wt: {livePubChem.molecularWeight} g/mol
                          </p>
                        )}
                        <p className="text-xs text-slate-300 mt-1">
                          Manufacturer: {selectedBottle.manufacturer} • Batch #{selectedBottle.batchNumber}
                        </p>
                      </div>

                      {/* Animated SVG Risk Gauge */}
                      <div className="flex items-center gap-3">
                        <div className="relative w-20 h-20 flex items-center justify-center">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-slate-800"
                              strokeWidth="3.5"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className={
                                selectedBottle.riskLevel === 'critical' ? 'text-rose-500' :
                                selectedBottle.riskLevel === 'high' ? 'text-amber-500' :
                                'text-emerald-500'
                              }
                              strokeDasharray={`${selectedBottle.currentRiskScore}, 100`}
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <div className="absolute flex flex-col items-center">
                            <span className="text-lg font-black text-white">{selectedBottle.currentRiskScore}</span>
                            <span className="text-[8px] uppercase tracking-wider text-slate-400">Risk</span>
                          </div>
                        </div>
                        <div className="text-left">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">Classification</span>
                          <span className={`text-sm font-extrabold capitalize ${
                            selectedBottle.riskLevel === 'critical' ? 'text-rose-400' :
                            selectedBottle.riskLevel === 'high' ? 'text-amber-400' :
                            'text-emerald-400'
                          }`}>
                            {selectedBottle.riskLevel} Danger
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Timeline & Shelf Life Diagnostics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-b border-slate-800 text-xs">
                      <div>
                        <span className="text-slate-400 block">Received Date</span>
                        <span className="font-semibold text-slate-200">{selectedBottle.receivedDate}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Seal Broken (Opened)</span>
                        <span className="font-semibold text-slate-200">{selectedBottle.openedDate || 'Sealed'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Open Shelf Limit</span>
                        <span className="font-semibold text-slate-200">{selectedBottle.chemical.postOpenShelfLifeDays} days</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Peroxide Group</span>
                        <span className="font-semibold text-amber-400 capitalize">{(selectedBottle.chemical.peroxideClass || 'None').replace(/_/g, ' ')}</span>
                      </div>
                    </div>

                    {/* Evaluated Factors */}
                    <div className="mt-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        <span>Degradation Risk Engine Findings</span>
                      </h4>
                      <div className="space-y-1.5">
                        {(selectedBottle?.riskFactors || []).map((factor, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                            <span className="text-rose-400 font-bold">•</span>
                            <span>{factor}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Safe Handling Guidance */}
                    <div className="mt-4 p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex items-start gap-2.5">
                      <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <div className="text-xs text-slate-300">
                        <span className="font-bold text-white block">Safe Handling & Storage Protocol:</span>
                        {selectedBottle.chemical.safeHandlingSummary}
                      </div>
                    </div>

                    {/* Actions, 3D Trigger & QR Generator */}
                    <div className="mt-5 flex flex-wrap gap-2.5">
                      <button
                        onClick={() => setIsIncidentModalOpen(true)}
                        className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-lg shadow-rose-600/30"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        <span>Report Degradation Incident</span>
                      </button>

                      {/* Real QR Label Generator */}
                      <button
                        onClick={() => setIsQrGeneratorOpen(true)}
                        className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-lg shadow-emerald-600/30"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>{t.qrLabelBtn}</span>
                      </button>

                      {/* Vision Anomaly Inspection Trigger */}
                      <button
                        onClick={() => setIsVisionInspectorOpen(true)}
                        className="py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-lg shadow-cyan-600/30"
                      >
                        <ScanEye className="w-4 h-4" />
                        <span>Inspect via Gemini Vision</span>
                      </button>

                      {/* LangGraph HITL Governance Trigger */}
                      <button
                        onClick={() => {
                          if (currentUser.role === 'teacher') {
                            setTeacherEscalationNotice(
                              `Disposal request for ${selectedBottle?.chemical.canonicalName || 'Reagent'} (CAS: ${selectedBottle?.chemical.casNumber || '60-29-7'}) has been logged and forwarded to Principal Dr. K. Meenakshi. Under Institutional Safety Protocol, Chemistry Teachers can report hazards, but hazardous destruction manifests must be signed off by the Principal.`
                            );
                          } else {
                            setIsHitlModalOpen(true);
                          }
                        }}
                        className="py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-lg shadow-purple-600/30 cursor-pointer"
                      >
                        <GitBranch className="w-4 h-4" />
                        <span>Authorize via LangGraph HITL</span>
                      </button>

                      <button
                        onClick={() => setIsSdsDrawerOpen(true)}
                        className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-xs flex items-center gap-2 border border-slate-700 transition-colors"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        <span>Consult AI SDS Copilot</span>
                      </button>
                    </div>
                  </div>

                  {/* 3D WebGL Chemical Bottle Representation */}
                  <ThreeBottleViewer bottle={selectedBottle} />

                  {/* Active Alerts for this school */}
                  <div className="glass-panel p-4 rounded-xl border border-slate-800">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-500" />
                      <span>Active Escalation Trail ({(alerts || []).length})</span>
                    </h3>
                    <div className="space-y-2.5">
                      {(alerts || []).map(a => (
                        <div key={a.id} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-3 text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                a.severity === 'critical' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                              }`}>
                                {a.severity}
                              </span>
                              <span className="font-bold text-white">{a.title}</span>
                            </div>
                            <p className="text-slate-400 mt-1">{a.message}</p>
                            <span className="text-[10px] text-slate-500 mt-1.5 block">
                              Assigned to: <b className="capitalize text-slate-300">{a.currentAssignedRole}</b> • Escalation Level {a.escalationLevel}
                              {a.acknowledgedBy && <span className="text-emerald-400 ml-2">✓ Verified: {a.acknowledgedBy}</span>}
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                            a.status === 'raised' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' :
                            a.status === 'acknowledged' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' :
                            'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {a.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: 3D/2D CABINET SHELF & GHS INCOMPATIBILITY         */}
        {/* ========================================================= */}
        {activeTab === 'incompat' && (
          <div className="space-y-6">
            {/* View Mode Switcher: 3D WebGL vs 2D Matrix */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Laboratory Storage Twin Mode:</span>
                <span className="text-[10px] text-slate-400">Switch between hardware-accelerated 3D WebGL cabinet and 2D proximity planner</span>
              </div>
              <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-1 text-xs">
                <button
                  onClick={() => setShelfViewMode('3d')}
                  className={`px-3 py-1 rounded-md font-bold transition-all ${
                    shelfViewMode === '3d'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  3D Spatial Shelf Twin (WebGL)
                </button>
                <button
                  onClick={() => setShelfViewMode('2d')}
                  className={`px-3 py-1 rounded-md font-bold transition-all ${
                    shelfViewMode === '2d'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  2D Proximity & Matrix View
                </button>
              </div>
            </div>

            {/* 3D WebGL Cabinet Tracker */}
            {shelfViewMode === '3d' && (
              <ThreeLaboratoryCabinet
                bottles={bottles.filter(b => b.schoolId === selectedSchool.id)}
                selectedBottle={selectedBottle}
                onSelectBottle={(bot) => setSelectedBottle(bot)}
                hasCollision={true}
                selectedSchoolName={selectedSchool.name}
              />
            )}

            {/* 2D Matrix View with Misplacement Guard */}
            {shelfViewMode === '2d' && (
              <VisualCabinetShelf />
            )}

            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <span>GHS Secondary School Incompatibility Matrix Rules</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Secondary schools frequently store incompatible chemicals together on wire shelves due to lack of space. 
                Our engine automatically flags dangerous neighboring reagents.
              </p>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-950/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">CRITICAL VIOLATION DETECTED</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">Cabinet A - Shelf 1</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">Nitric Acid (HNO3) ⚡ Glacial Acetic Acid</h4>
                  <p className="text-xs text-slate-300">
                    Nitric Acid is a fierce inorganic oxidizer. When stored next to Glacial Acetic Acid (organic combustible acid), 
                    any vapor escape or hairline fracture can trigger an uncontrollable exothermic runaway and gas pressurization.
                  </p>
                  <div className="p-2.5 rounded-lg bg-black/40 border border-rose-500/20 text-xs text-rose-200">
                    <b>Action Required:</b> Immediately segregate Nitric Acid into a dedicated acid-resistant polyethylene tray in a separate cabinet.
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-950/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">HIGH RISK INCOMPATIBILITY</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">Cabinet B - Shelf 3</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">Hydrochloric Acid (HCl) ⚡ Sodium Hydroxide (NaOH)</h4>
                  <p className="text-xs text-slate-300">
                    Concentrated mineral acid stored adjacent to caustic solid base. If accidental rupture occurs during an earthquake 
                    or accidental knock-over, violent neutralization generates extreme boiling heat and aerosolized caustic mist.
                  </p>
                  <div className="p-2.5 rounded-lg bg-black/40 border border-amber-500/20 text-xs text-amber-200">
                    <b>Action Required:</b> Move Sodium Hydroxide to dedicated Base Cabinet with secondary lip containment.
                  </div>
                </div>
              </div>

              {/* Interactive CAS Checksum Validator */}
              <div className="mt-8 pt-6 border-t border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>Algorithmic CAS Checksum Engine (Input Validation Pillar)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                      Every official CAS Registry Number follows the mathematical formula <b>[Prefix]-[Middle]-[Check Digit]</b>. The final digit is algorithmically derived from the weighted sum of preceding digits modulo 10. ReagentWatch verifies vendor bottles at intake to prevent counterfeit, mislabeled, or mistransposed chemicals from entering school laboratories.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 self-start sm:self-auto">
                    MODULO-10 ALGORITHM
                  </span>
                </div>

                {/* Input and Quick-Test Chips */}
                <div className="space-y-2.5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="relative">
                      <input
                        id="cas-verification-input"
                        name="cas_number"
                        autoComplete="off"
                        type="text"
                        value={casTestInput}
                        onChange={(e) => handleCasVerify(e.target.value)}
                        placeholder="e.g. 60-29-7 or 7697-37-2"
                        className="bg-slate-900 border border-slate-700 text-sm font-mono rounded-xl px-3.5 py-2 text-white w-64 focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
                      />
                      <span className="absolute right-3 top-2.5 text-[10px] text-slate-500 font-mono">CAS-ID</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 text-xs">
                      <button
                        onClick={() => handleCasVerify('60-29-7')}
                        className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                          casTestInput === '60-29-7' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                        }`}
                      >
                        ✓ 60-29-7 (Ether)
                      </button>
                      <button
                        onClick={() => handleCasVerify('7647-01-0')}
                        className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                          casTestInput === '7647-01-0' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                        }`}
                      >
                        ✓ 7647-01-0 (HCl)
                      </button>
                      <button
                        onClick={() => handleCasVerify('7697-37-2')}
                        className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                          casTestInput === '7697-37-2' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                        }`}
                      >
                        ✓ 7697-37-2 (HNO3)
                      </button>
                      <button
                        onClick={() => handleCasVerify('1310-73-2')}
                        className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                          casTestInput === '1310-73-2' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                        }`}
                      >
                        ✓ 1310-73-2 (NaOH)
                      </button>
                      <button
                        onClick={() => handleCasVerify('60-29-9')}
                        className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                          casTestInput === '60-29-9' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border-rose-800/60'
                        }`}
                      >
                        ✗ 60-29-9 (Fraud Checksum)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Live Mathematical Verification Result Card */}
                <div className="rounded-xl border overflow-hidden transition-all bg-slate-900/80 p-4 border-slate-800">
                  {casResult.isValid ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                          <span>Valid Chemical Abstracts Service (CAS) Registry Checksum Confirmed</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                          STATUS: VERIFIED SECURE
                        </span>
                      </div>

                      {/* Mathematical Step-by-Step Breakdown */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-lg bg-black/40 border border-slate-800 font-mono space-y-1">
                          <div className="text-[11px] text-slate-400 font-sans font-bold flex items-center justify-between">
                            <span>Step 1: Weighted Position Sum</span>
                            <span className="text-emerald-400 font-mono">Σ(d_i × i)</span>
                          </div>
                          <p className="text-emerald-300 text-[11px] break-all">{casResult.breakdown}</p>
                          <div className="text-[11px] text-slate-400 font-sans font-bold pt-1.5 flex items-center justify-between border-t border-slate-800/80">
                            <span>Step 2: Modulo-10 Check Digit</span>
                            <span className="text-cyan-400">{casResult.moduloFormula}</span>
                          </div>
                          <p className="text-white text-[11px]">
                            Check digit <b>{casResult.calculatedCheck}</b> matches stamped digit <b>{casResult.providedCheck}</b>!
                          </p>
                        </div>

                        {/* Matched Chemical Master Details */}
                        <div className="p-3 rounded-lg bg-black/40 border border-slate-800 space-y-1.5">
                          <span className="text-[11px] font-bold text-slate-400 block">Reagent Classification Match:</span>
                          {casResult.chemicalMatch ? (
                            <>
                              <div className="font-bold text-white text-xs">{casResult.chemicalMatch.name}</div>
                              <div className="text-[11px] text-cyan-300 font-mono">Formula: {casResult.chemicalMatch.formula}</div>
                              <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                                {casResult.chemicalMatch.category}
                              </span>
                            </>
                          ) : (
                            <p className="text-slate-400 text-xs">
                              Algorithmically valid CAS structure. Ready for PubChem NIH chemical property ingestion.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-rose-900/40">
                        <div className="flex items-center gap-2 text-xs text-rose-400 font-bold">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                          <span>Input Security Quarantine: Counterfeit / Malformed CAS Detected</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono font-bold animate-pulse">
                          QUARANTINE ENFORCED
                        </span>
                      </div>

                      <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/40 text-xs text-rose-300 space-y-1.5">
                        <p className="font-semibold">{casResult.error}</p>
                        {casResult.breakdown && (
                          <div className="font-mono text-[11px] text-rose-200/80 bg-black/40 p-2 rounded border border-rose-900/30">
                            <div>Calculation: {casResult.breakdown}</div>
                            <div>Expected: {casResult.moduloFormula} (Label stamped: {casResult.providedCheck})</div>
                          </div>
                        )}
                        <p className="text-[11px] text-slate-400">
                          <b>Safety Protocol:</b> Bottle is automatically denied entry into school inventory database. Physical quarantine tag generated for lab coordinator review.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB: PRINCIPAL / CHAIRMAN LANGGRAPH HITL DUAL-KEY CONSOLE */}
        {/* ========================================================= */}
        {activeTab === 'principal_hitl' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Header / Authority Plaque */}
            <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/20">
                    <GitBranch className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-white tracking-tight">
                        LangGraph Human-In-The-Loop (HITL) Dual-Key Command
                      </h2>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase font-bold">
                        Institutional Authority
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Safety-critical checkpoint: High-risk reagents (&ge; 70 risk score) are automatically halted at human verification gates before disposal or chemical neutralization.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-mono text-slate-500 block">Dual-Key Signatory</span>
                    <span className="text-xs font-bold text-indigo-300">{currentUser.name}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-bold text-sm">
                    🎓
                  </div>
                </div>
              </div>

              {/* Status Metric Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] uppercase font-mono text-slate-400">HITL State Machine</span>
                  <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-amber-400">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span>Interrupt Gate Active</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] uppercase font-mono text-slate-400">Dual-Key Threshold</span>
                  <div className="text-xs font-bold text-rose-400 mt-1">
                    Risk Score &ge; 70 / 100
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] uppercase font-mono text-slate-400">Campus Safety</span>
                  <div className="text-xs font-bold text-emerald-400 mt-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Lab Quarantined</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] uppercase font-mono text-slate-400">Pending Actions</span>
                  <div className="text-xs font-bold text-cyan-400 mt-1">
                    {hitlQueue.filter(q => q.status === 'pending').length} Actions Required
                  </div>
                </div>
              </div>
            </div>

            {/* Campus Emergency Evacuation Siren Box */}
            <div className={`p-5 rounded-2xl border transition-all ${
              isEvacuationAlertActive 
                ? 'bg-rose-950/80 border-rose-500 shadow-2xl shadow-rose-900/50 animate-pulse' 
                : 'bg-slate-900/70 border-slate-800'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    isEvacuationAlertActive ? 'bg-rose-600 text-white animate-bounce' : 'bg-rose-950/60 border border-rose-500/40 text-rose-400'
                  }`}>
                    <AlertOctagon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <span>Campus Laboratory Emergency Evacuation Siren</span>
                      {isEvacuationAlertActive && (
                        <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white animate-pulse">
                          SIREN BROADCASTING LIVE
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xl">
                      Authorized for Headmaster / Principal dual-key release. Triggers campus-wide audio hazard beacon, automated SMS to Coimbatore Hazmat Fire Department, and seals science wing air ducts.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isEvacuationAlertActive ? (
                    <button
                      onClick={() => setIsEvacuationAlertActive(false)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer border border-slate-700"
                    >
                      Deactivate Evacuation Siren
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const ok = confirm('EMERGENCY HAZARD CONFIRMATION: Are you sure you want to sound the campus evacuation siren and notify the Fire Hazmat response team?');
                        if (ok) setIsEvacuationAlertActive(true);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-rose-600/30 flex items-center gap-2"
                    >
                      <BellRing className="w-4 h-4" />
                      <span>Sound Emergency Siren</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Pending LangGraph HITL Authorizations List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  Active Dual-Key Authorization Queue ({hitlQueue.length})
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  State: Interrupted at Human Checkpoint
                </span>
              </div>

              {(hitlQueue || []).map((item) => (
                <div 
                  key={item.id}
                  className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-white">{item.chemicalName}</span>
                        <span className="text-xs font-mono text-cyan-400">CAS: {item.casNumber}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                          Score: {item.riskScore}/100 Critical
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Campus: <b className="text-slate-200">{item.schoolName}</b> • Detected Anomaly: <b className="text-amber-400">{item.anomalyType}</b>
                      </p>
                    </div>

                    <div>
                      {item.status === 'approved' ? (
                        <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          Authorized by Principal
                        </span>
                      ) : (
                        <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1.5 animate-pulse">
                          <PauseCircle className="w-4 h-4" />
                          Pending Human Sign-Off
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Reasoning Chain Trace */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase font-mono tracking-wider text-slate-400 block">
                      LangGraph Autonomous Decision Trace:
                    </span>
                    <div className="space-y-1.5">
                      {((item && item.reasoning) || []).map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 font-mono">
                          <span className="text-indigo-400 font-bold shrink-0">{idx + 1}.</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Principal Sign-Off Actions */}
                  {item.status === 'pending' ? (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                      <div className="text-xs text-slate-400">
                        Signatory: <b className="text-slate-200">{currentUser.name}</b> ({currentUser.designation})
                      </div>

                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => {
                            setHitlQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'approved' } : q));
                            setIsHazmatDispatched(true);
                            alert('Dual-Key Authorization Completed: Immediate mineral oil in-situ wetting and Class-1 Hazmat transfer dispatched to Coimbatore DEO fleet.');
                          }}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve Quarantine & Hazmat Transfer</span>
                        </button>

                        <button
                          onClick={() => setIsHitlModalOpen(true)}
                          className="px-3.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                        >
                          <FileText className="w-4 h-4" />
                          <span>Detailed State Machine Dossier</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <span className="font-bold block">Dual-Key signature recorded in digital audit log. Reed-Solomon quarantine tag applied.</span>
                        <span className="text-[11px] text-slate-300">Hazardous transfer directive transmitted to Coimbatore District DEO Fleet.</span>
                      </div>
                      <button
                        onClick={() => {
                          loginAsRole('district_officer');
                          setActiveTab('district');
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <span>Proceed to Step 3: DEO Hazmat Fleet ➔</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: DISTRICT HEATMAP & CLUSTER DISPOSAL OPTIMIZER     */}
        {/* ========================================================= */}
        {activeTab === 'district' && (
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-400" />
                    <span>{t.districtMapTitle}</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Solves the peri-urban coordination gap: Aggregates remote schools into unified hazardous waste pickup routes.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Logistics Cost Saved: {clusterRoute.savingsPercentage}%
                  </span>
                  <button
                    onClick={() => downloadComplianceManifest(selectedSchool, bottles)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700"
                  >
                    <FileDown className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Download Manifest</span>
                  </button>
                </div>
              </div>

              {/* Active Hazmat Sweep Status Banner */}
              {(isHazmatDispatched || hitlQueue.some(q => q.status === 'approved')) && (
                <div className="mt-4 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                      <Truck className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-emerald-300 uppercase tracking-wider font-mono block">
                        Active Hazmat Sweep Order: GHSS Pollachi West Pick-up Authorized
                      </span>
                      <span className="text-xs text-slate-200">
                        Class-B Diethyl Ether (CAS: 60-29-7) dual-key authorized by Principal Dr. K. Meenakshi. Fleet Stop #1 on 100.2 km multi-school route assigned.
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold whitespace-nowrap">
                      HAZMAT FLEET DISPATCHED
                    </span>
                  </div>
                </div>
              )}

              {/* Interactive Visual Map Representation */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <DistrictGisMap
                    schools={SEED_SCHOOLS}
                    bottles={bottles}
                    alerts={alerts}
                    selectedSchool={selectedSchool}
                    onSelectSchool={(sch) => {
                      setSelectedSchool(sch);
                      const schoolBottle = bottles.find(b => b.schoolId === sch.id);
                      if (schoolBottle) setSelectedBottle(schoolBottle);
                    }}
                  />
                </div>

                {/* Cluster Pool Manifest */}
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Truck className="w-4 h-4 text-emerald-400" />
                      <span>Cluster Disposal Logistics</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Standalone pickups would cost <b>₹{clusterRoute.standaloneCostInr.toLocaleString()}</b>. 
                      Our pooled Hazmat vehicle route costs <b>₹{clusterRoute.pooledCostInr.toLocaleString()}</b>.
                    </p>

                    <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                      {SEED_CLUSTER_POOL.schools.map((s, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-300 truncate max-w-[180px]">{s.schoolName}</span>
                          <span className="font-mono font-bold text-amber-400">{s.bottleCount} bottles</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => downloadComplianceManifest(selectedSchool, bottles)}
                      className="w-full mt-2 py-2.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                      <span>Download Regulatory Disposal Manifest</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Peer Chemical Exchange & Waste Prevention Section */}
            <PeerChemicalExchange />
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: SCIENTIFIC EVALUATION BENCHMARK DASHBOARD         */}
        {/* ========================================================= */}
        {activeTab === 'eval' && (
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-400" />
                    <span>Scientific Evaluation & Ground-Truth Benchmarking</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Evaluated across 300 synthetic secondary school reagent units with 42 seeded ground-truth degradation hazards.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono px-3 py-1 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                    Tested Dataset Size: 300 Bottles
                  </span>
                </div>
              </div>

              {/* Metric KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-xs text-slate-400">Safety Hazard Recall</span>
                  <div className="text-2xl font-black text-emerald-400 mt-1">
                    {(SEED_EVALUATION_METRICS.recall * 100).toFixed(1)}%
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">41/42 critical hazards successfully caught</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-xs text-slate-400">Detection Precision</span>
                  <div className="text-2xl font-black text-emerald-400 mt-1">
                    {(SEED_EVALUATION_METRICS.precision * 100).toFixed(1)}%
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Only 3 false alarms in 300 bottles</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-xs text-slate-400">Harmonized F1-Score</span>
                  <div className="text-2xl font-black text-teal-400 mt-1">
                    {(SEED_EVALUATION_METRICS.f1Score * 100).toFixed(1)}%
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Balanced accuracy across all classes</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-xs text-slate-400">Data Validation Catch Rate</span>
                  <div className="text-2xl font-black text-cyan-400 mt-1">
                    {(SEED_EVALUATION_METRICS.validationCatchRate * 100).toFixed(1)}%
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">CAS typos, impossible dates intercepted</p>
                </div>
              </div>

              {/* Confusion Matrix Table */}
              <div className="mt-8">
                <h3 className="text-sm font-bold text-white mb-3">Confusion Matrix (Hazard Detection Engine)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-slate-300 border border-slate-800 rounded-xl overflow-hidden">
                    <thead className="bg-slate-900 text-slate-400 font-mono text-[11px]">
                      <tr>
                        <th className="p-3 border-b border-slate-800">Total N=300</th>
                        <th className="p-3 border-b border-slate-800 text-emerald-400">Actual Hazard (Ground Truth)</th>
                        <th className="p-3 border-b border-slate-800 text-slate-400">Actual Safe</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      <tr>
                        <td className="p-3 font-semibold bg-slate-900/40">Predicted Hazard</td>
                        <td className="p-3 font-mono font-bold text-emerald-400 bg-emerald-950/20">
                          TP = {SEED_EVALUATION_METRICS.truePositives} (Correctly Alerted)
                        </td>
                        <td className="p-3 font-mono text-amber-400 bg-amber-950/20">
                          FP = {SEED_EVALUATION_METRICS.falsePositives} (False Alarm)
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold bg-slate-900/40">Predicted Safe</td>
                        <td className="p-3 font-mono text-rose-400 bg-rose-950/20">
                          FN = {SEED_EVALUATION_METRICS.falseNegatives} (Missed Hazard)
                        </td>
                        <td className="p-3 font-mono text-slate-400">
                          TN = 255 (Correctly Cleared)
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Response Time Comparison: Paper vs ReagentWatch */}
              <div className="mt-8 pt-6 border-t border-slate-800">
                <h3 className="text-sm font-bold text-white mb-3">Service Effectiveness: Response Time (MTTA & MTTR)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
                    <span className="text-rose-400 font-bold uppercase tracking-wider block">Traditional Paper Logbooks</span>
                    <div className="text-xl font-bold text-white">Mean Time to Acknowledge: 14 to 21 Days</div>
                    <p className="text-slate-400">
                      Hazardous reagent degradation typically remains unnoticed until the annual inspection or an accidental student burn incident.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 space-y-2">
                    <span className="text-emerald-400 font-bold uppercase tracking-wider block">ReagentWatch AI Architecture</span>
                    <div className="text-xl font-bold text-white">Mean Time to Acknowledge: 18.4 Minutes</div>
                    <p className="text-slate-300">
                      Automated voice transcription + deterministic chemistry rules dispatch instant SMS/WhatsApp escalation to principal and district officer.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB: INTER-SCHOOL CHEMICAL EXCHANGE (District Governance) */}
        {/* ========================================================= */}
        {activeTab === 'exchange' && (
          <div className="space-y-6 animate-in fade-in">
            <PeerChemicalExchange />
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* MODAL 1: CAMERA QR SCANNER (Dev A)                        */}
      {/* ========================================================= */}
      <QrCameraScanner
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        onScanSuccess={handleQrScanned}
      />

      {/* ========================================================= */}
      {/* MODAL 2: REAL PRINTABLE QR LABEL GENERATOR (NEW)          */}
      {/* ========================================================= */}
      {selectedBottle && (
        <QrCodeGeneratorModal
          key={selectedBottle.id}
          isOpen={isQrGeneratorOpen}
          onClose={() => setIsQrGeneratorOpen(false)}
          bottle={selectedBottle}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL 2B: NEW REAGENT ONBOARDING TO LAB (Teacher Flow)   */}
      {/* ========================================================= */}
      <NewBottleOnboardingModal
        isOpen={isNewBottleModalOpen}
        onClose={() => setIsNewBottleModalOpen(false)}
        selectedSchool={selectedSchool}
        onBottleAdded={(newBottle) => {
          setBottles(prev => [newBottle, ...prev]);
          setSelectedBottle(newBottle);
          saveChemicalBottle(newBottle);
        }}
      />

      {/* ========================================================= */}
      {/* MODAL 2B: INCIDENT REPORTING & WHATSAPP ESCALATION (OpenWA) */}
      {/* ========================================================= */}
      {selectedBottle && (
        <IncidentReportModal
          isOpen={isIncidentModalOpen}
          onClose={() => setIsIncidentModalOpen(false)}
          bottle={selectedBottle}
          selectedSchool={selectedSchool}
          selectedLang={selectedLang}
          onIncidentReported={({ incidentType, voiceText, newAlert }) => {
            if (selectedBottle) {
              const updated = { ...selectedBottle };
              updated.currentRiskScore = 98;
              updated.riskLevel = 'critical';
              updated.riskFactors = [
                `🚨 INCIDENT ELEVATED: ${(incidentType || 'Anomaly').replace(/_/g, ' ').toUpperCase()} ("${voiceText || 'Reported by teacher'}")`,
                ...updated.riskFactors,
              ];
              setBottles(prev => prev.map(b => b.id === updated.id ? updated : b));
              setSelectedBottle(updated);
              saveChemicalBottle(updated);
              logDegradationEvent(
                updated.id,
                incidentType,
                currentUser.id,
                voiceText || 'Incident escalated via mobile voice reporting',
                95
              );
            }
            setAlerts(prev => [newAlert, ...prev]);
            saveAlert(newAlert);
            setIsIncidentModalOpen(false);
            setIsHitlModalOpen(true);
          }}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL 4: LANGGRAPH HITL GOVERNANCE MODAL                  */}
      {/* ========================================================= */}
      {selectedBottle && (
        <LangGraphHitlModal
          isOpen={isHitlModalOpen}
          onClose={() => setIsHitlModalOpen(false)}
          bottle={selectedBottle}
          alert={alerts[0] || SEED_ALERTS[0]}
          onApprove={handleHitlApprove}
          onOverride={handleHitlOverride}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL 5: GEMINI VISION ANOMALY INSPECTOR                  */}
      {/* ========================================================= */}
      <VisionBottleInspector
        isOpen={isVisionInspectorOpen}
        onClose={() => setIsVisionInspectorOpen(false)}
        onApplyAnomaly={handleApplyVisionAnomaly}
      />

      {/* ========================================================= */}
      {/* DRAWER: AI SDS COPILOT (Dev C)                            */}
      {/* ========================================================= */}
      <SdsCopilotDrawer
        isOpen={isSdsDrawerOpen}
        onClose={() => setIsSdsDrawerOpen(false)}
      />

      {/* ========================================================= */}
      {/* FLOATING: TWO-WAY WHATSAPP / SMS ESCALATION FEED          */}
      {/* ========================================================= */}
      <WhatsAppEscalationFeed
        alerts={alerts}
        onAcknowledgeAlert={handleAcknowledgeAlert}
      />

      {/* ========================================================= */}
      {/* MODAL 6: AUTHENTICATION & ROLE REGISTRATION MODAL         */}
      {/* ========================================================= */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
