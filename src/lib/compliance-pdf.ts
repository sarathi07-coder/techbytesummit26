/**
 * REAGENTWATCH AI - REGULATORY HAZMAT COMPLIANCE GENERATOR
 * Outputs formatted government hazardous waste disposal manifest.
 */

import { School, ChemicalBottle } from '@/types/chemical';

export function downloadComplianceManifest(school: School, bottles: ChemicalBottle[]) {
  const degradedBottles = bottles.filter(b => b.riskLevel === 'critical' || b.riskLevel === 'high');
  const dateStr = new Date().toISOString().split('T')[0];

  const content = `
================================================================================
GOVERNMENT OF TAMIL NADU - DEPARTMENT OF SCHOOL EDUCATION
HAZARDOUS LABORATORY REAGENT DISPOSAL & DEGRADATION AUDIT MANIFEST
================================================================================
Generated Date: ${dateStr}
Reference Docket: TN-SCH-HAZ-${dateStr.replace(/-/g, '')}-001

1. INSTITUTION DETAILS:
--------------------------------------------------------------------------------
School Name: ${school.name}
School Code: ${school.code}
District:    ${school.district}
State:       ${school.state}
Contact:     ${school.contactPhone} (${school.contactEmail})
Lab Grid:    Avg Humidity ${school.avgLabHumidityPct}% | Weekly Power Cuts: ${school.powerCutFrequencyWeekly}

2. HAZARDOUS REAGENTS FLAGGED FOR QUARANTINE / DESTRUCTION:
--------------------------------------------------------------------------------
${degradedBottles.map((b, idx) => `
[${idx + 1}] QR CODE: ${b.qrCode}
    Chemical:     ${b.chemical.canonicalName}
    CAS Number:   ${b.chemical.casNumber}
    Hazard Level: ${b.riskLevel.toUpperCase()} (Score: ${b.currentRiskScore}/100)
    Volume:       ${b.currentVolumeMl} ${b.unit}
    Opened Date:  ${b.openedDate || 'Sealed'} (Post-Open Limit: ${b.chemical.postOpenShelfLifeDays} days)
    Key Findings: ${b.riskFactors.join('; ')}
`).join('\n')}

3. CHAIN OF CUSTODY & SIGN-OFF:
--------------------------------------------------------------------------------
Science Teacher (Auditor): ____________________  Date: ____________
School Headmaster/Principal: __________________  Date: ____________
District Education Officer:  __________________  Date: ____________
Authorized Hazmat Transporter: ________________  Vehicle Reg: _____

================================================================================
This is an electronically validated manifest produced by ReagentWatch AI.
Deterministic Chemistry Rules Safety Floor Certified.
================================================================================
`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Hazmat_Compliance_Manifest_${school.code}_${dateStr}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
