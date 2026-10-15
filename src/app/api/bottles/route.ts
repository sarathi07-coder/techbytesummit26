import { NextResponse } from 'next/server';
import { SEED_DEMO_BOTTLES, SEED_CHEMICALS } from '@/lib/seed-data';
import { validateCasChecksum, calculateBottleRisk } from '@/lib/chemistry-engine';
import { ChemicalBottle } from '@/types/chemical';

// In-memory runtime store for server lifecycle
let runtimeBottles: ChemicalBottle[] = [...SEED_DEMO_BOTTLES];

export async function GET() {
  return NextResponse.json({
    success: true,
    count: runtimeBottles.length,
    data: runtimeBottles,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { casNumber, qrCode, schoolId, initialVolumeMl, receivedDate, expiryDate, manufacturer } = body;

    // 1. Algorithmic CAS checksum validation
    const casValidation = validateCasChecksum(casNumber || '');
    if (!casValidation.isValid) {
      return NextResponse.json(
        { success: false, error: casValidation.error },
        { status: 400 }
      );
    }

    // 2. Find chemical master or default
    const matchedChem = SEED_CHEMICALS.find(c => c.casNumber === casNumber) || {
      id: `chem-${Date.now()}`,
      casNumber,
      canonicalName: body.canonicalName || 'Standard Laboratory Reagent',
      chemicalFormula: body.chemicalFormula || 'Unknown',
      ghsClasses: ['GHS07_HARMFUL'],
      peroxideClass: 'none' as const,
      isHygroscopic: false,
      isLightSensitive: false,
      maxShelfLifeDays: 730,
      postOpenShelfLifeDays: 365,
      storageGroup: 'general',
      safeHandlingSummary: 'Standard high-school secondary containment protocols apply.',
    };

    const newBottle: ChemicalBottle = {
      id: `bottle-${Date.now()}`,
      qrCode: qrCode || `QR-${Date.now().toString().slice(-6)}`,
      schoolId: schoolId || 'school-1',
      locationId: 'loc-1',
      chemicalId: matchedChem.id,
      chemical: matchedChem,
      batchNumber: body.batchNumber || 'BATCH-2026-IN',
      manufacturer: manufacturer || 'Standard Reagents Corp',
      initialVolumeMl: Number(initialVolumeMl) || 500,
      currentVolumeMl: Number(initialVolumeMl) || 500,
      unit: body.unit || 'ml',
      receivedDate: receivedDate || new Date().toISOString().split('T')[0],
      expiryDate: expiryDate || '2028-01-01',
      status: 'sealed',
      currentRiskScore: 5,
      riskLevel: 'safe',
      riskFactors: ['Newly logged reagent. Sealed container.'],
      createdAt: new Date().toISOString(),
    };

    // Calculate baseline risk
    const assessment = calculateBottleRisk(newBottle, matchedChem);
    newBottle.currentRiskScore = assessment.score;
    newBottle.riskLevel = assessment.level;
    newBottle.riskFactors = assessment.factors;

    runtimeBottles.unshift(newBottle);

    return NextResponse.json({
      success: true,
      message: 'Bottle successfully registered and risk assessed.',
      data: newBottle,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
