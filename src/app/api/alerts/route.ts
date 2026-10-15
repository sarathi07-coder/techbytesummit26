import { NextResponse } from 'next/server';
import { SEED_ALERTS } from '@/lib/seed-data';
import { AlertNotification } from '@/types/chemical';

let runtimeAlerts: AlertNotification[] = [...SEED_ALERTS];

export async function GET() {
  return NextResponse.json({
    success: true,
    count: runtimeAlerts.length,
    data: runtimeAlerts,
  });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { alertId, status, acknowledgedBy } = body;

    const alertIndex = runtimeAlerts.findIndex(a => a.id === alertId);
    if (alertIndex === -1) {
      return NextResponse.json({ success: false, error: 'Alert not found' }, { status: 404 });
    }

    runtimeAlerts[alertIndex] = {
      ...runtimeAlerts[alertIndex],
      status: status || 'acknowledged',
      acknowledgedAt: new Date().toISOString(),
      acknowledgedBy: acknowledgedBy || 'Principal (Authorized)',
    };

    return NextResponse.json({
      success: true,
      message: `Alert lifecycle updated to ${status}`,
      data: runtimeAlerts[alertIndex],
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
