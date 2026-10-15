import { NextRequest, NextResponse } from 'next/server';
import { dispatchOpenWaAlert, formatHazmatAlertMessage } from '@/lib/whatsapp-client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      schoolName,
      chemicalName,
      casNumber,
      qrCode,
      incidentType,
      riskScore,
      observation,
      location,
      alertId,
      recipients,
    } = body;

    const message = formatHazmatAlertMessage({
      schoolName: schoolName || 'Govt Higher Secondary School, Pollachi West',
      chemicalName: chemicalName || 'Diethyl Ether (Stabilized with BHT)',
      casNumber: casNumber || '60-29-7',
      qrCode: qrCode || 'QR-GHSS-ETH-001',
      incidentType: incidentType || 'visual_crystals',
      riskScore: Number(riskScore) || 98,
      observation: observation || 'Peroxide crystals observed around neck',
      location: location || 'Chemistry Lab #1, Cabinet A',
      alertId: alertId || `alert-${Date.now().toString().slice(-4)}`,
    });

    // Default target emergency contacts
    const defaultRecipients = [
      {
        name: 'District Education Officer (Coimbatore)',
        phone: '+91 94421 88301',
        role: 'District Education Officer' as const,
      },
      {
        name: 'Pollachi Fire & Rescue Hazmat Squad',
        phone: '+91 98425 43210',
        role: 'Fire Hazmat Response Team' as const,
      },
    ];

    const targets = recipients && recipients.length > 0 ? recipients : defaultRecipients;

    const results = await Promise.all(
      targets.map((target: any) =>
        dispatchOpenWaAlert({
          toPhone: target.phone,
          recipientName: target.name,
          role: target.role,
          message,
          chemicalName,
          casNumber,
          schoolName,
          qrCode,
          riskScore: Number(riskScore) || 98,
        })
      )
    );

    return NextResponse.json({
      success: true,
      messageFormatted: message,
      results,
      dispatchedCount: results.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in /api/whatsapp/send:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'WhatsApp dispatch failed' },
      { status: 500 }
    );
  }
}
