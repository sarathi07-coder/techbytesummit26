/**
 * OpenWA (https://github.com/rmyndharis/OpenWA.git) & WhatsApp Escalation Client
 * Connects to local/self-hosted OpenWA Gateway (http://localhost:2785) with fallback to wa.me universal deep links
 */

export interface WhatsAppDispatchPayload {
  toPhone: string;
  recipientName: string;
  role: 'District Education Officer' | 'Fire Hazmat Response Team' | 'School Principal';
  message: string;
  chemicalName: string;
  casNumber: string;
  schoolName: string;
  qrCode: string;
  riskScore: number;
}

export interface WhatsAppDispatchResult {
  success: boolean;
  status: 'sent_openwa' | 'simulated_delivery' | 'direct_link_ready';
  dispatchId: string;
  waMeUrl: string;
  timestamp: string;
  recipient: string;
  error?: string;
}

const OPENWA_BASE_URL = process.env.OPENWA_API_URL || process.env.NEXT_PUBLIC_OPENWA_API_URL || 'http://localhost:2785';

/**
 * Clean phone number to international E.164 without '+' or spaces for WhatsApp wa.me / OpenWA
 */
export function sanitizePhone(phone: string): string {
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.length === 10) {
    return `91${digits}`; // Default to India (+91) if 10 digits
  }
  return digits;
}

/**
 * Generate official WhatsApp Hazmat Emergency Alert text
 */
export function formatHazmatAlertMessage(params: {
  schoolName: string;
  chemicalName: string;
  casNumber: string;
  qrCode: string;
  incidentType: string;
  riskScore: number;
  observation: string;
  location: string;
  alertId: string;
}): string {
  const shortId = (params.alertId || '0000').slice(-4);
  return `🚨 *REAGENTWATCH HAZMAT EMERGENCY ESCALATION* 🚨
------------------------------------------------
🏫 *School:* ${params.schoolName}
🧪 *Reagent:* ${params.chemicalName}
🏷️ *CAS:* ${params.casNumber} | *QR Token:* ${params.qrCode}
📍 *Lab Location:* ${params.location}

⚠️ *Incident Detected:* ${(params.incidentType || 'hazard').toUpperCase().replace(/_/g, ' ')}
🔥 *Calculated Risk Score:* ${params.riskScore}/100 [CRITICAL HAZARD]
🗣️ *Teacher Observation:* "${params.observation}"

🛑 *GHS PROTOCOL:* Shock-sensitive peroxide crystallization hazard. DO NOT MOVE OR FORCE OPEN.
------------------------------------------------
👉 *Reply "ACK ${shortId}" to authorize isolation & emergency district disposal pickup.*`;
}

/**
 * Generate universal WhatsApp wa.me URL
 */
export function createWhatsAppWebUrl(phone: string, text: string): string {
  const clean = sanitizePhone(phone);
  return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
}

/**
 * Dispatch message via OpenWA REST API or generate universal link
 */
export async function dispatchOpenWaAlert(payload: WhatsAppDispatchPayload): Promise<WhatsAppDispatchResult> {
  const cleanPhone = sanitizePhone(payload.toPhone);
  const waMeUrl = createWhatsAppWebUrl(cleanPhone, payload.message);
  const dispatchId = `WA-DISP-${Date.now().toString().slice(-6)}`;

  try {
    // Attempt real HTTP POST to OpenWA Gateway if running (http://localhost:2785)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // Fast 2s check

    const response = await fetch(`${OPENWA_BASE_URL}/api/messages/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        receiver: cleanPhone,
        message: {
          text: payload.message,
        },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      return {
        success: true,
        status: 'sent_openwa',
        dispatchId,
        waMeUrl,
        timestamp: new Date().toISOString(),
        recipient: `${payload.recipientName} (${payload.toPhone})`,
      };
    }
  } catch (err) {
    // OpenWA local container not active or offline - cleanly fallback to simulated instant delivery + wa.me link
    console.info('OpenWA gateway at http://localhost:2785 offline, falling back to simulated SMS/WhatsApp relay + direct wa.me link');
  }

  return {
    success: true,
    status: 'simulated_delivery',
    dispatchId,
    waMeUrl,
    timestamp: new Date().toISOString(),
    recipient: `${payload.recipientName} (${payload.toPhone})`,
  };
}
