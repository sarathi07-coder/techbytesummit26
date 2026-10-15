/**
 * REAGENTWATCH AI - DETERMINISTIC CHEMISTRY RULE ENGINE
 * Domain safety rules for degradation detection, CAS validation, and GHS incompatibility.
 */

import { ChemicalBottle, ChemicalMaster, RiskLevel, DegradationEventType } from '@/types/chemical';

/**
 * Validates a CAS Registry Number using the official CAS checksum algorithm.
 * Format: AAAAAAA-BB-C
 * Checksum: (1*last_digit_of_B + 2*first_digit_of_B + 3*last_digit_of_A + ...) mod 10 === C
 */
export interface CasValidationResult {
  isValid: boolean;
  error?: string;
  sum?: number;
  calculatedCheck?: number;
  providedCheck?: number;
  breakdown?: string;
  moduloFormula?: string;
  chemicalMatch?: {
    name: string;
    formula: string;
    category: string;
  };
}

const KNOWN_SCHOOL_REAGENTS: Record<string, { name: string; formula: string; category: string }> = {
  '60-29-7': { name: 'Diethyl Ether (Stabilized with BHT)', formula: 'C4H10O', category: 'Class B Peroxide Former / Flammable' },
  '7647-01-0': { name: 'Hydrochloric Acid (37% Analytical Reagent)', formula: 'HCl', category: 'Strong Mineral Acid / Corrosive' },
  '7697-37-2': { name: 'Nitric Acid (70% Fuming Technical)', formula: 'HNO3', category: 'Strong Mineral Acid & Strong Oxidizer' },
  '1310-73-2': { name: 'Sodium Hydroxide (Anhydrous Pellets)', formula: 'NaOH', category: 'Strong Caustic Alkali / Deliquescent' },
  '67-64-1': { name: 'Acetone (ACS Reagent Grade)', formula: 'C3H6O', category: 'Volatile Flammable Ketone Solvent' },
  '7664-93-9': { name: 'Sulfuric Acid (98% Concentrated)', formula: 'H2SO4', category: 'Dehydrating Mineral Acid' },
  '50-00-0': { name: 'Formaldehyde (37% Formalin Solution)', formula: 'CH2O', category: 'Carcinogenic Preservative' },
  '7722-84-1': { name: 'Hydrogen Peroxide (30% Lab Grade)', formula: 'H2O2', category: 'Class A Oxidizer / Gas Forming' },
};

/**
 * Validates a CAS Registry Number using the official CAS checksum algorithm.
 * Format: AAAAAAA-BB-C
 * Formula: (1*last_digit_of_B + 2*first_digit_of_B + 3*last_digit_of_A + ...) mod 10 === C
 */
export function validateCasChecksum(cas: string): CasValidationResult {
  const cleaned = cas.trim();
  const match = cleaned.match(/^(\d{2,7})-(\d{2})-(\d{1})$/);
  if (!match) {
    return { 
      isValid: false, 
      error: 'Malformed CAS format. Expected format: XXXXXXX-YY-Z (e.g. 60-29-7)' 
    };
  }

  const prefix = match[1];
  const middle = match[2];
  const checkDigit = parseInt(match[3], 10);

  const digits = (prefix + middle).split('').map(d => parseInt(d, 10));
  let sum = 0;
  const len = digits.length;
  const breakdownParts: string[] = [];

  for (let i = 0; i < len; i++) {
    const weight = len - i;
    const term = digits[i] * weight;
    sum += term;
    breakdownParts.push(`(${digits[i]} × ${weight})`);
  }

  const calculatedCheck = sum % 10;
  const breakdownStr = `${breakdownParts.join(' + ')} = ${sum}`;
  const moduloStr = `${sum} mod 10 = ${calculatedCheck}`;
  const chemicalMatch = KNOWN_SCHOOL_REAGENTS[cleaned];

  if (calculatedCheck !== checkDigit) {
    return {
      isValid: false,
      sum,
      calculatedCheck,
      providedCheck: checkDigit,
      breakdown: breakdownStr,
      moduloFormula: moduloStr,
      error: `CAS Checksum failure: Modulo-10 algorithm yields check digit ${calculatedCheck}, but bottle label claims ${checkDigit}. Potential counterfeit or clerical transposition typo!`,
    };
  }

  return { 
    isValid: true,
    sum,
    calculatedCheck,
    providedCheck: checkDigit,
    breakdown: breakdownStr,
    moduloFormula: moduloStr,
    chemicalMatch,
  };
}

/**
 * Computes the exact days between two ISO dates
 */
export function getDaysBetween(startDateStr: string, endDateStr: string): number {
  const start = new Date(startDateStr).getTime();
  const end = new Date(endDateStr).getTime();
  const diffTime = end - start;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export interface RiskAssessmentResult {
  score: number; // 0 to 100
  level: RiskLevel;
  factors: string[];
  immediateActionRequired: boolean;
  quarantineRecommended: boolean;
}

/**
 * Deterministic Risk Calculator:
 * Enforces the safety principle: Deterministic Chemistry Rules are the absolute Safety Floor.
 */
export function calculateBottleRisk(
  bottle: Pick<ChemicalBottle, 'receivedDate' | 'openedDate' | 'expiryDate' | 'status'>,
  chemical: ChemicalMaster,
  events: { eventType: DegradationEventType; createdAt: string }[] = [],
  ambientConditions: { avgHumidityPct?: number; powerCutsWeekly?: number } = {}
): RiskAssessmentResult {
  const factors: string[] = [];
  let score = 5; // Baseline safe handling score
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Check Sealed Expiry Date
  const daysUntilExpiry = getDaysBetween(todayStr, bottle.expiryDate);
  if (daysUntilExpiry < 0) {
    const overdueDays = Math.abs(daysUntilExpiry);
    score += Math.min(45, 20 + Math.floor(overdueDays / 30) * 5);
    factors.push(`Past manufacturer expiry date by ${overdueDays} days`);
  } else if (daysUntilExpiry < 60) {
    score += 15;
    factors.push(`Nearing expiry date (within ${daysUntilExpiry} days)`);
  }

  // 2. Post-Opening Shelf Life Clock (Critical for Ethers, Volatiles & Deliquescents)
  if (bottle.openedDate) {
    const daysSinceOpened = getDaysBetween(bottle.openedDate, todayStr);

    if (chemical.peroxideClass === 'class_a_severe') {
      if (daysSinceOpened > 90) {
        score += 65;
        factors.push(`Class A Peroxide Former open for ${daysSinceOpened} days (Limit: 90 days)`);
      } else if (daysSinceOpened > 60) {
        score += 30;
        factors.push(`Class A Peroxide Former approaching 90-day testing window`);
      }
    } else if (chemical.peroxideClass === 'class_b_concentration_hazard') {
      if (daysSinceOpened > 180) {
        score += 55;
        factors.push(`Class B Peroxide Former open for ${daysSinceOpened} days (Limit: 180 days)`);
      } else if (daysSinceOpened > 120) {
        score += 25;
        factors.push(`Class B Peroxide Former open > 120 days`);
      }
    } else if (daysSinceOpened > chemical.postOpenShelfLifeDays) {
      score += 30;
      factors.push(`Exceeded open container shelf-life (${daysSinceOpened}d > ${chemical.postOpenShelfLifeDays}d)`);
    }
  }

  // 3. Climate & Peri-Urban Environmental Penalties
  const humidity = ambientConditions.avgHumidityPct ?? 65;
  const powerCuts = ambientConditions.powerCutsWeekly ?? 2;

  if (chemical.isHygroscopic && humidity > 75) {
    score += 20;
    factors.push(`High ambient lab humidity (${humidity}%) accelerating deliquescence/caking`);
  }

  if (chemical.isLightSensitive && powerCuts > 4) {
    score += 15;
    factors.push(`Unstable storage environment (frequent power cuts affecting climate control)`);
  }

  // 4. User-Reported Physical Degradation Events (The Hard Safety Triggers)
  let hasCrystals = false;
  let hasSwollenCap = false;
  let hasLeaksOrOdors = false;

  for (const ev of events) {
    if (ev.eventType === 'visual_crystals') {
      hasCrystals = true;
      score += 60;
      factors.push(`CRITICAL: Visual crystal precipitate detected around bottle cap/neck`);
    } else if (ev.eventType === 'swollen_cap') {
      hasSwollenCap = true;
      score += 45;
      factors.push(`HIGH RISK: Container pressurization / swollen cap reported`);
    } else if (ev.eventType === 'container_crack_leak' || ev.eventType === 'pungent_odor') {
      hasLeaksOrOdors = true;
      score += 40;
      factors.push(`Container integrity failure: active leak or vapor emission`);
    } else if (ev.eventType === 'color_change' || ev.eventType === 'precipitation') {
      score += 25;
      factors.push(`Visible chemical discoloration or phase separation observed`);
    }
  }

  // Critical Safety Clamp: Peroxide Former + Crystals = Automatic Emergency Level
  if ((chemical.peroxideClass === 'class_a_severe' || chemical.peroxideClass === 'class_b_concentration_hazard') && hasCrystals) {
    score = Math.max(score, 98);
    factors.unshift('🚨 IMMEDIATE DETONATION RISK: Peroxide crystals detected. DO NOT TWIST CAP OR MOVE.');
  }

  // Cap at 100
  score = Math.min(100, Math.max(0, score));

  // Determine Risk Category
  let level: RiskLevel = 'safe';
  if (score >= 85) level = 'critical';
  else if (score >= 65) level = 'high';
  else if (score >= 40) level = 'medium';
  else if (score >= 20) level = 'low';

  return {
    score,
    level,
    factors,
    immediateActionRequired: score >= 65,
    quarantineRecommended: score >= 85,
  };
}

/**
 * GHS Storage Incompatibility Matrix
 * Detects prohibited adjacent storage (e.g. Incompatible acids & flammables)
 */
export interface IncompatibilityCheckResult {
  isIncompatible: boolean;
  severity: 'none' | 'medium' | 'high' | 'critical';
  reason?: string;
  remedy?: string;
}

export function checkStorageIncompatibility(
  chemA: ChemicalMaster,
  chemB: ChemicalMaster
): IncompatibilityCheckResult {
  const grpA = chemA.storageGroup;
  const grpB = chemB.storageGroup;

  // Rule 1: Nitric Acid + Acetic Acid / Organic Flammables (Violent exothermic runaway)
  if (
    (chemA.canonicalName.toLowerCase().includes('nitric acid') && grpB === 'organic_acid') ||
    (chemB.canonicalName.toLowerCase().includes('nitric acid') && grpA === 'organic_acid')
  ) {
    return {
      isIncompatible: true,
      severity: 'critical',
      reason: `Explosive / Violent reaction hazard: Nitric Acid (${chemA.canonicalName}) stored directly adjacent to Organic Acid (${chemB.canonicalName}).`,
      remedy: 'Immediately segregate Nitric Acid into a dedicated inorganic acid secondary containment tray.',
    };
  }

  // Rule 2: Strong Inorganic Acids + Strong Bases
  if (
    (grpA === 'inorganic_acid' && grpB === 'base') ||
    (grpA === 'base' && grpB === 'inorganic_acid')
  ) {
    return {
      isIncompatible: true,
      severity: 'high',
      reason: `Acid-Base Incompatibility: Strong Acid (${chemA.canonicalName}) and Strong Base (${chemB.canonicalName}) co-located on same shelf.`,
      remedy: 'Store acids and bases in separate dedicated cabinets with secondary containment tubs.',
    };
  }

  // Rule 3: Flammables / Organics + Strong Oxidizers
  if (
    (grpA === 'organic_flammable' && grpB === 'oxidizer') ||
    (grpA === 'oxidizer' && grpB === 'organic_flammable')
  ) {
    return {
      isIncompatible: true,
      severity: 'critical',
      reason: `Spontaneous Combustion Hazard: Flammable solvent (${chemA.canonicalName}) stored with strong oxidizer (${chemB.canonicalName}).`,
      remedy: 'Flammables must be stored in a dedicated yellow Flammables Cabinet away from oxidizers.',
    };
  }

  return { isIncompatible: false, severity: 'none' };
}
