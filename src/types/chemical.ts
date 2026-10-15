/**
 * ReagentWatch AI - Unified Domain Data Types & Contracts
 */

export type UserRole = 'teacher' | 'principal' | 'district_officer' | 'auditor';

export type BottleStatus = 'sealed' | 'opened' | 'degraded' | 'quarantined' | 'disposed' | 'transferred';

export type RiskLevel = 'safe' | 'low' | 'medium' | 'high' | 'critical';

export type AlertStatus = 'raised' | 'acknowledged' | 'in_progress' | 'resolved';

export type PeroxideFormerClass = 
  | 'none' 
  | 'class_a_severe'                // Forms peroxides without concentration (e.g. Diisopropyl ether, Potassium)
  | 'class_b_concentration_hazard'  // Forms peroxides on evaporation (e.g. Diethyl ether, THF, 2-Propanol)
  | 'class_c_polymerizers';         // Polymerization hazards (e.g. Styrene, Vinyl acetate)

export type DegradationEventType =
  | 'routine_inspection'
  | 'visual_crystals'
  | 'swollen_cap'
  | 'color_change'
  | 'precipitation'
  | 'container_crack_leak'
  | 'pungent_odor'
  | 'humidity_caking'
  | 'fridge_power_cut'
  | 'quantity_anomaly';

export interface StorageLocation {
  id: string;
  schoolId: string;
  roomName: string;
  cabinetName: string;
  shelfNumber: string;
  isVentilated: boolean;
  isColdStorage: boolean;
  tempCelsius: number;
  humidityPct: number;
}

export interface ChemicalMaster {
  id: string;
  casNumber: string;
  canonicalName: string;
  iupacName?: string;
  chemicalFormula: string;
  pubchemCid?: number;
  ghsClasses: string[]; // e.g. ['GHS02_FLAMMABLE', 'GHS07_HARMFUL']
  peroxideClass: PeroxideFormerClass;
  isHygroscopic: boolean;
  isLightSensitive: boolean;
  maxShelfLifeDays: number;
  postOpenShelfLifeDays: number;
  storageGroup: string; // 'inorganic_acid', 'organic_acid', 'base', 'oxidizer', 'organic_flammable'
  safeHandlingSummary: string;
}

export interface ChemicalBottle {
  id: string;
  qrCode: string;
  schoolId: string;
  locationId: string;
  chemicalId: string;
  chemical: ChemicalMaster;
  batchNumber: string;
  manufacturer: string;
  initialVolumeMl: number;
  currentVolumeMl: number;
  unit: string;
  receivedDate: string; // YYYY-MM-DD
  openedDate?: string;   // YYYY-MM-DD
  expiryDate: string;   // YYYY-MM-DD
  status: BottleStatus;
  currentRiskScore: number; // 0 to 100
  riskLevel: RiskLevel;
  riskFactors: string[];
  lastInspectedAt?: string;
  createdAt: string;
}

export interface DegradationEvent {
  id: string;
  bottleId: string;
  reportedByUserId?: string;
  eventType: DegradationEventType;
  voiceNoteText?: string;
  voiceLang?: 'en' | 'ta' | 'hi';
  photoUrl?: string;
  visionAiFindings?: {
    crystalsDetected?: boolean;
    swollenCapDetected?: boolean;
    colorDiscoloration?: boolean;
    confidenceScore?: number;
  };
  reportedOffline: boolean;
  riskDelta: number;
  createdAt: string;
}

export interface StorageIncompatibilityViolation {
  id: string;
  schoolId: string;
  locationId: string;
  bottleAId: string;
  bottleBId: string;
  bottleAName: string;
  bottleBName: string;
  hazardCode: string;
  severity: 'medium' | 'high' | 'critical';
  remedyInstruction: string;
  isResolved: boolean;
  detectedAt: string;
}

export interface AlertNotification {
  id: string;
  schoolId: string;
  bottleId?: string;
  chemicalName?: string;
  schoolName?: string;
  severity: RiskLevel;
  title: string;
  message: string;
  status: AlertStatus;
  currentAssignedRole: UserRole;
  raisedAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  escalationLevel: number;
  smsSent: boolean;
}

export interface School {
  id: string;
  code: string;
  name: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  contactPhone: string;
  contactEmail: string;
  powerCutFrequencyWeekly: number;
  avgLabHumidityPct: number;
  lastAuditDate?: string;
  riskGrade: 'A' | 'B' | 'C' | 'D';
}

export interface ClusterDisposalPool {
  id: string;
  district: string;
  poolName: string;
  status: 'forming' | 'scheduled' | 'in_transit' | 'completed';
  scheduledPickupDate?: string;
  leadSchoolName: string;
  totalBottlesCount: number;
  schools: Array<{
    schoolId: string;
    schoolName: string;
    latitude: number;
    longitude: number;
    bottleCount: number;
  }>;
  optimizedRouteDistanceKm: number;
  estimatedCostSavedPct: number;
}

export interface SystemEvaluationMetrics {
  totalEvaluated: number;
  groundTruthHazards: number;
  detectedHazards: number;
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  precision: number;
  recall: number;
  f1Score: number;
  validationCatchRate: number;
  meanTimeToAckMinutes: number;
  meanTimeToResolveHours: number;
  paperRegisterMttrDays: number;
}
