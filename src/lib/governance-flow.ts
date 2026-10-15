/**
 * Continuous Institutional Governance Workflow Service
 * Strict 3-Tier Execution Chain: Science Teacher ➔ Headmaster / Principal ➔ District Officer (DEO)
 *
 * Rules:
 * 1. Science Teacher detects anomaly / requests quarantine for a real chemical bottle.
 * 2. Ticket enters status "pending_principal". Only Principal can review and dual-key sign off.
 * 3. Once approved by Principal, status advances to "pending_deo". Only DEO can accept & dispatch fleet.
 * 4. Once DEO dispatches collection fleet, lifecycle is completed with manifest logged.
 */

export interface GovernanceTicket {
  id: string; // e.g. "HAZ-TICKET-2026-001"
  bottleId: string;
  chemicalName: string;
  chemicalFormula: string;
  casNumber: string;
  schoolId: string;
  schoolName: string;
  roomName: string;
  cabinetName: string;
  shelfNumber: string;
  initialVolumeMl: number;
  currentVolumeMl: number;
  unit: string;
  riskScore: number;
  anomalyType: string;
  teacherObservation: string;
  urgency: 'critical' | 'high' | 'moderate';

  // Step 1: Teacher Stage
  teacherId: string;
  teacherName: string;
  teacherDesignation: string;
  submittedAt: string; // ISO String

  // Step 2: Headmaster / Principal Stage
  principalStatus: 'pending' | 'approved' | 'rejected';
  principalId?: string;
  principalName?: string;
  principalNotes?: string;
  principalActionAt?: string;

  // Step 3: DEO Stage
  deoStatus: 'awaiting_principal' | 'pending_dispatch' | 'dispatched' | 'collected';
  deoId?: string;
  deoName?: string;
  deoActionAt?: string;
  fleetVehicleId?: string;
  estimatedPickupAt?: string;
  manifestId?: string;
}

const STORAGE_KEY = 'reagentwatch_governance_tickets';

// Initial verified seed data: Teacher Selvakumar flagged Diethyl Ether crystals
export const INITIAL_GOVERNANCE_TICKETS: GovernanceTicket[] = [
  {
    id: 'HAZ-2026-0924',
    bottleId: 'bottle-1-ether-critical',
    chemicalName: 'Diethyl Ether (Stabilized with BHT)',
    chemicalFormula: '(C2H5)2O',
    casNumber: '60-29-7',
    schoolId: 'school-1',
    schoolName: 'Govt Higher Secondary School, Pollachi West',
    roomName: 'Lab Room 102',
    cabinetName: 'Cabinet B (Flammables / Organics)',
    shelfNumber: 'Shelf 2 (Middle Shelf)',
    initialVolumeMl: 500,
    currentVolumeMl: 120,
    unit: 'ml',
    riskScore: 98,
    anomalyType: 'Visual Peroxide Crystal Formation',
    teacherObservation: 'Observed white crystalline ring formation around glass neck and inner cap threads. High shock sensitivity detected. Opened > 180 days ago.',
    urgency: 'critical',

    teacherId: 'user-teacher-01',
    teacherName: 'R. Selvakumar, M.Sc.',
    teacherDesignation: 'Senior Chemistry Faculty & Lab Custodian',
    submittedAt: '2026-10-15T06:30:00.000Z',

    principalStatus: 'pending',
    deoStatus: 'awaiting_principal',
  },
  {
    id: 'HAZ-2026-0811',
    bottleId: 'bottle-2-nitric-acid',
    chemicalName: 'Nitric Acid 70%',
    chemicalFormula: 'HNO3',
    casNumber: '7697-37-2',
    schoolId: 'school-1',
    schoolName: 'Govt Higher Secondary School, Pollachi West',
    roomName: 'Lab Room 102',
    cabinetName: 'Cabinet A (Acids & Corrosives)',
    shelfNumber: 'Shelf 1 (Top Shelf)',
    initialVolumeMl: 500,
    currentVolumeMl: 450,
    unit: 'ml',
    riskScore: 68,
    anomalyType: 'Secondary Containment Leak Risk',
    teacherObservation: 'Cap liner shows photolytic degradation and slight nitrogen dioxide fuming. Teacher requests replacement bottle from peer exchange.',
    urgency: 'moderate',

    teacherId: 'user-teacher-01',
    teacherName: 'R. Selvakumar, M.Sc.',
    teacherDesignation: 'Senior Chemistry Faculty & Lab Custodian',
    submittedAt: '2026-10-14T11:15:00.000Z',

    principalStatus: 'approved',
    principalId: 'user-principal-02',
    principalName: 'Dr. K. Meenakshi, Ph.D.',
    principalNotes: 'Authorized for district chemical redistribution. Acid secondary tray confirmed intact.',
    principalActionAt: '2026-10-14T14:20:00.000Z',

    deoStatus: 'pending_dispatch',
  }
];

/**
 * Get all current governance tickets
 */
export function getGovernanceTickets(): GovernanceTicket[] {
  if (typeof window === 'undefined') return INITIAL_GOVERNANCE_TICKETS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_GOVERNANCE_TICKETS));
      return INITIAL_GOVERNANCE_TICKETS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_GOVERNANCE_TICKETS;
  } catch (err) {
    console.error('Error reading governance tickets:', err);
    return INITIAL_GOVERNANCE_TICKETS;
  }
}

/**
 * Save all tickets to storage
 */
function saveTickets(tickets: GovernanceTicket[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
    window.dispatchEvent(new Event('governance_tickets_updated'));
  } catch (err) {
    console.error('Error saving governance tickets:', err);
  }
}

/**
 * Step 1: Teacher submits an incident / quarantine request
 */
export function submitTeacherIncident(data: {
  bottleId: string;
  chemicalName: string;
  chemicalFormula: string;
  casNumber: string;
  schoolId: string;
  schoolName: string;
  roomName?: string;
  cabinetName?: string;
  shelfNumber?: string;
  volumeMl?: number;
  unit?: string;
  riskScore: number;
  anomalyType: string;
  teacherObservation: string;
  teacherId: string;
  teacherName: string;
  teacherDesignation?: string;
  urgency?: 'critical' | 'high' | 'moderate';
}): GovernanceTicket {
  const tickets = getGovernanceTickets();
  const newTicket: GovernanceTicket = {
    id: `HAZ-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    bottleId: data.bottleId,
    chemicalName: data.chemicalName,
    chemicalFormula: data.chemicalFormula,
    casNumber: data.casNumber,
    schoolId: data.schoolId,
    schoolName: data.schoolName,
    roomName: data.roomName || 'Senior Chemistry Lab',
    cabinetName: data.cabinetName || 'Cabinet B',
    shelfNumber: data.shelfNumber || 'Shelf 2',
    initialVolumeMl: data.volumeMl || 500,
    currentVolumeMl: data.volumeMl || 250,
    unit: data.unit || 'ml',
    riskScore: data.riskScore,
    anomalyType: data.anomalyType,
    teacherObservation: data.teacherObservation,
    urgency: data.urgency || (data.riskScore >= 80 ? 'critical' : data.riskScore >= 50 ? 'high' : 'moderate'),

    teacherId: data.teacherId,
    teacherName: data.teacherName,
    teacherDesignation: data.teacherDesignation || 'Science Teacher / Lab Custodian',
    submittedAt: new Date().toISOString(),

    principalStatus: 'pending',
    deoStatus: 'awaiting_principal',
  };

  const updated = [newTicket, ...tickets];
  saveTickets(updated);
  return newTicket;
}

/**
 * Step 2: Headmaster / Principal approves the teacher's request
 */
export function approveByPrincipal(
  ticketId: string, 
  principalId: string, 
  principalName: string, 
  notes?: string
): GovernanceTicket | null {
  const tickets = getGovernanceTickets();
  let updatedTicket: GovernanceTicket | null = null;

  const next = tickets.map(t => {
    if (t.id === ticketId) {
      updatedTicket = {
        ...t,
        principalStatus: 'approved',
        principalId,
        principalName,
        principalNotes: notes || `Dual-Key Authorized by Headmaster ${principalName}. Immediate lab quarantine sealed. Transmitted to DEO Hazmat Fleet.`,
        principalActionAt: new Date().toISOString(),
        deoStatus: 'pending_dispatch',
      };
      return updatedTicket;
    }
    return t;
  });

  if (updatedTicket) {
    saveTickets(next);
  }
  return updatedTicket;
}

/**
 * Step 2B: Headmaster / Principal rejects the request
 */
export function rejectByPrincipal(
  ticketId: string, 
  principalId: string, 
  principalName: string, 
  directiveNotes: string
): GovernanceTicket | null {
  const tickets = getGovernanceTickets();
  let updatedTicket: GovernanceTicket | null = null;

  const next = tickets.map(t => {
    if (t.id === ticketId) {
      updatedTicket = {
        ...t,
        principalStatus: 'rejected',
        principalId,
        principalName,
        principalNotes: directiveNotes || 'Returned to Lab Teacher: Re-test with potassium iodide starch paper before quarantine.',
        principalActionAt: new Date().toISOString(),
        deoStatus: 'awaiting_principal',
      };
      return updatedTicket;
    }
    return t;
  });

  if (updatedTicket) {
    saveTickets(next);
  }
  return updatedTicket;
}

/**
 * Step 3: DEO accepts the Principal-approved request & dispatches the collection vehicle
 */
export function dispatchByDeo(
  ticketId: string, 
  deoId: string, 
  deoName: string, 
  vehicleId?: string
): GovernanceTicket | null {
  const tickets = getGovernanceTickets();
  let updatedTicket: GovernanceTicket | null = null;

  const next = tickets.map(t => {
    if (t.id === ticketId) {
      // Must be approved by Principal first!
      if (t.principalStatus !== 'approved') {
        throw new Error('Cannot dispatch: Request must be dual-key approved by School Principal first.');
      }

      updatedTicket = {
        ...t,
        deoStatus: 'dispatched',
        deoId,
        deoName,
        deoActionAt: new Date().toISOString(),
        fleetVehicleId: vehicleId || 'TN-38-HZ-04 (Coimbatore South Hazmat Fleet)',
        estimatedPickupAt: 'Within 3.5 Hours (Route #100.2-KM)',
        manifestId: `TN-MANIFEST-${Date.now().toString().slice(-6)}`,
      };
      return updatedTicket;
    }
    return t;
  });

  if (updatedTicket) {
    saveTickets(next);
  }
  return updatedTicket;
}
