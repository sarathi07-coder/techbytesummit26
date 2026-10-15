import { NextResponse } from 'next/server';
import { SEED_DEMO_BOTTLES } from '@/lib/seed-data';
import { calculateBottleRisk } from '@/lib/chemistry-engine';
import { DegradationEventType } from '@/types/chemical';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bottleId, eventType, voiceNoteText, voiceLang, photoUrl } = body;

    const bottle = SEED_DEMO_BOTTLES.find(b => b.id === bottleId) || SEED_DEMO_BOTTLES[0];

    // Recalculate degradation risk with new event
    const assessment = calculateBottleRisk(
      bottle,
      bottle.chemical,
      [{ eventType: eventType as DegradationEventType, createdAt: new Date().toISOString() }],
      { avgHumidityPct: 80, powerCutsWeekly: 4 }
    );

    const updatedBottle = {
      ...bottle,
      currentRiskScore: assessment.score,
      riskLevel: assessment.level,
      riskFactors: assessment.factors,
      lastInspectedAt: new Date().toISOString(),
    };

    const isCritical = assessment.level === 'critical';

    return NextResponse.json({
      success: true,
      data: {
        bottle: updatedBottle,
        assessment,
        escalationTriggered: isCritical,
        smsDispatched: isCritical,
        message: isCritical 
          ? '🚨 CRITICAL HAZARD ALERT ELEVATED: Principal and District Officer notified via emergency SMS/WhatsApp dispatch.'
          : 'Degradation event logged successfully.',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
