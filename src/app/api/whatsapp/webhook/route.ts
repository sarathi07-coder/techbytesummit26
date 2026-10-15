import { NextRequest, NextResponse } from 'next/server';

/**
 * Inbound Webhook for OpenWA (https://github.com/rmyndharis/OpenWA.git)
 * Listens for incoming WhatsApp replies like "ACK <id>" or "QUARANTINE CONFIRMED"
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    console.log('OpenWA inbound webhook received:', JSON.stringify(payload));

    const sender = payload.sender || payload.from || 'Unknown';
    const messageBody = (payload.message?.text || payload.body || '').trim();

    const isAck = messageBody.toUpperCase().startsWith('ACK') || messageBody.toUpperCase().includes('CONFIRMED');

    return NextResponse.json({
      success: true,
      received: true,
      sender,
      messageBody,
      action: isAck ? 'alert_acknowledged_via_whatsapp' : 'logged',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    service: 'ReagentWatch OpenWA Webhook Listener',
    endpoint: '/api/whatsapp/webhook',
  });
}
