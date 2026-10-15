/**
 * REAGENTWATCH AI - COMPREHENSIVE RAG SAFETY DATA SHEET (SDS) KNOWLEDGE BASE
 * Embedded document repository for secondary school laboratory chemicals & GHS protocols.
 */

export interface SdsDocument {
  id: string;
  chemicalName: string;
  casNumber: string;
  formula: string;
  ghsPictograms: string[];
  hazardSummary: string;
  spillResponse: string;
  firstAid: string;
  storageIncompatibility: string;
  disposalProtocol: string;
  ppeRequirements: string;
  sections: {
    section2_hazards: string;
    section6_accidental_release: string;
    section7_handling_storage: string;
    section8_exposure_ppe: string;
    section10_stability_reactivity: string;
    section13_disposal: string;
  };
  keywords: string[];
}

export type SdsEntry = SdsDocument;

export const SDS_DOCUMENTS: SdsDocument[] = [
  {
    id: 'diethyl-ether',
    chemicalName: 'Diethyl Ether (Stabilized with BHT)',
    casNumber: '60-29-7',
    formula: '(C2H5)2O',
    ghsPictograms: ['GHS02_FLAMMABLE', 'GHS07_HARMFUL'],
    hazardSummary: 'Extremely flammable liquid & explosive Class B peroxide former. Vapor heavier than air; travels along floor to distant ignition sources.',
    spillResponse: 'Evacuate lab immediately. Eliminate all ignition sources. Absorb small spills with vermiculite or activated carbon. DO NOT use metal shovels due to spark risk.',
    firstAid: 'Inhalation: Move to fresh air. Skin contact: Flush with copious water for 15 minutes. Eyes: Irrigate immediately with eyewash station for 15 minutes.',
    storageIncompatibility: 'Incompatible with strong mineral acids (Nitric, Sulfuric), halogens, and open flames. Over time, auto-oxidizes to shock-sensitive peroxides. If crystals form on cap threads, DO NOT TWIST OR TOUCH.',
    disposalProtocol: 'Quarantine bottle with crimson hazard label. Submerge in dry vermiculite buffer. Must be collected by licensed hazardous waste disposal contractor for controlled destruction.',
    ppeRequirements: 'Class B organic vapor respirator, heavy butyl rubber gloves, chemical splash goggles, spark-proof lab coat.',
    sections: {
      section2_hazards: 'H224: Extremely flammable liquid and vapor. H302: Harmful if swallowed. H336: May cause drowsiness or dizziness. EUH019: May form explosive peroxides.',
      section6_accidental_release: 'Shut off all electrical appliances and gas burners. Use non-sparking intrinsically safe tools. Cover with vermiculite or inert absorbent.',
      section7_handling_storage: 'Store in explosion-proof cabinet below 25°C. Open shelf limit is strictly 180 days after seal is broken. Test regularly with starch-iodide test strips.',
      section8_exposure_ppe: 'Nitrile or butyl gloves (0.4mm). Splash goggles. Use only inside certified chemical fume hood with face velocity >= 100 fpm.',
      section10_stability_reactivity: 'Auto-oxidizes upon exposure to ambient air and light. Concentrated peroxide residue is sensitive to heat, friction, and mechanical shock.',
      section13_disposal: 'Do not evaporate to dryness. Do not dispose down municipal drainage. Requires certified hazardous chemical incineration.'
    },
    keywords: ['ether', 'diethyl', '60-29-7', 'peroxide', 'crystals', 'crystal', 'bht', 'solvent', 'flammable']
  },
  {
    id: 'hydrochloric-acid',
    chemicalName: 'Hydrochloric Acid 35-37% (ExcelaR)',
    casNumber: '7647-01-0',
    formula: 'HCl (MW: 36.46)',
    ghsPictograms: ['GHS05_CORROSIVE', 'GHS07_HARMFUL'],
    hazardSummary: 'Causes severe skin burns and permanent eye damage. Fuming vapor causes acute respiratory tract irritation and pulmonary edema.',
    spillResponse: 'Ventilate lab immediately. Neutralize carefully by applying Sodium Bicarbonate (baking soda) or Calcium Carbonate from spill perimeter inward until effervescence ceases. Absorb slurry with inert sand.',
    firstAid: 'Skin: Flush with deluge shower for 20 minutes while removing contaminated clothing. Eyes: Rinse eyes under eyewash for 20+ minutes. Inhalation: Move to fresh air, seek medical oxygen.',
    storageIncompatibility: 'Incompatible with strong bases (NaOH), amines, carbonates, and cyanides. Violently reactive with strong oxidizers (KMnO4) releasing toxic chlorine gas. NEVER store with bases.',
    disposalProtocol: 'Dilute slowly into large excess of cold water (never pour water into acid). Neutralize with lime slurry to pH 6-8 before licensed disposal.',
    ppeRequirements: 'Acid-resistant neoprene or heavy PVC gloves (0.5mm minimum), full-face shield + splash goggles, rubber apron, fume hood operation.',
    sections: {
      section2_hazards: 'H314: Causes severe skin burns and eye damage. H335: May cause respiratory irritation. H290: May be corrosive to metals.',
      section6_accidental_release: 'Apply dry Sodium Bicarbonate or limestone dust around spill perimeter to prevent spreading. Allow neutral bubbling to subside before scooping.',
      section7_handling_storage: 'Store in dedicated acid cabinet with corrosion-resistant polyethylene spill trays. Keep away from ammonia and organic solvents.',
      section8_exposure_ppe: 'Neoprene or nitrile heavy gloves. Chemical splash goggles. Operate inside operational exhaust fume hood.',
      section10_stability_reactivity: 'Corrosive to mild steel, brass, and aluminum producing flammable hydrogen gas (H2). Contact with bleach (hypochlorite) generates toxic chlorine gas.',
      section13_disposal: 'Neutralized solution (pH 6.5 - 8.5) may be disposed of according to district laboratory environmental regulations.'
    },
    keywords: ['hydrochloric', 'hcl', '7647-01-0', 'excelar', 'acid', 'acid spill', 'spill', 'neutralize', 'neutralizing']
  },
  {
    id: 'nitric-acid',
    chemicalName: 'Nitric Acid 68-70% (Extra Pure)',
    casNumber: '7697-37-2',
    formula: 'HNO3',
    ghsPictograms: ['GHS03_OXIDIZER', 'GHS05_CORROSIVE', 'GHS06_TOXIC'],
    hazardSummary: 'Powerful oxidizer and corrosive mineral acid. May intensify fire. Causes severe chemical burns and toxic brown nitrogen dioxide (NO2) outgassing.',
    spillResponse: 'Neutralize cautiously with Sodium Bicarbonate or limestone slurry. NEVER use sawdust, cellulose sponges, or paper towels (spontaneous combustion risk).',
    firstAid: 'Skin contact: Wash immediately with running water for 20+ minutes. Apply calcium gluconate gel if burns develop. Inhalation of brown NO2 fumes requires emergency hospitalization.',
    storageIncompatibility: 'CRITICAL INCOMPATIBILITY: Never store beside Glacial Acetic Acid, organic solvents, or flammables. Violently reactive with reducing agents, alcohol, and sulfides.',
    disposalProtocol: 'Neutralize with dilute lime slurry to pH 6-8 before industrial disposal, or pool into district cluster disposal route.',
    ppeRequirements: 'Neoprene or heavy PVC gloves, full acid hood shield, chemical vapor goggles, certified fume hood.',
    sections: {
      section2_hazards: 'H272: May intensify fire; oxidizer. H314: Causes severe skin burns and eye damage. H330: Fatal if inhaled.',
      section6_accidental_release: 'Do NOT use organic sorbents like sawdust or cellulose. Use sand, dolomite, or sodium bicarbonate. Brown NO2 smoke is deadly toxic.',
      section7_handling_storage: 'Dedicated acid cabinet. Keep completely segregated from acetic acid, ethanol, and acetone.',
      section8_exposure_ppe: 'Heavy butyl/neoprene gloves. Chemical face shield with goggles. Self-contained breathing apparatus in large vapor leaks.',
      section10_stability_reactivity: 'Decomposes photolytically in light into yellowish-brown NO2. Vigorous exothermic reaction with combustible organics.',
      section13_disposal: 'Neutralize with calcium hydroxide or sodium carbonate slurry to neutral pH.'
    },
    keywords: ['nitric', 'hno3', '7697-37-2', 'oxidizer', 'brown fume', 'no2', 'nitric spill']
  },
  {
    id: 'sodium-hydroxide',
    chemicalName: 'Sodium Hydroxide Pellets',
    casNumber: '1310-73-2',
    formula: 'NaOH (Caustic Soda)',
    ghsPictograms: ['GHS05_CORROSIVE'],
    hazardSummary: 'Strong caustic alkali. Causes rapid deep tissue liquefactive necrosis and permanent corneal damage. Dissolution in water generates intense boiling heat.',
    spillResponse: 'Sweep gently into plastic container without generating airborne caustic dust. Neutralize residue with dilute citric or boric acid solution. Mop with copious water.',
    firstAid: 'Eye contact: Rinse continuously for at least 30 minutes. Saponifies corneal tissue. Seek immediate ophthalmologic emergency care.',
    storageIncompatibility: 'Deliquescent strong base. Absorbs moisture & CO2. Incompatible with strong acids (HCl, HNO3, H2SO4), aluminum, zinc, and tin (releases flammable hydrogen gas).',
    disposalProtocol: 'Dissolve slowly into cold water with continuous stirring (highly exothermic reaction). Neutralize with dilute acid to neutral pH before disposal.',
    ppeRequirements: 'Nitrile gloves (min 0.11mm), splash-proof chemical goggles, laboratory coat with closed cuffs.',
    sections: {
      section2_hazards: 'H314: Causes severe skin burns and eye damage. H290: May be corrosive to metals.',
      section6_accidental_release: 'Avoid dusting. Wear respirator and goggles. Collect into clean plastic scoop.',
      section7_handling_storage: 'Store in tightly sealed airtight HDPE container in dedicated base cabinet (Cabinet C). Keep off top shelves.',
      section8_exposure_ppe: 'Nitrile or PVC gloves, safety goggles with rubber face seal.',
      section10_stability_reactivity: 'Reacts violently with acids in exothermic neutralization. Corrodes amphoteric metals (Al, Zn) yielding hydrogen.',
      section13_disposal: 'Neutralize to pH 7 with dilute acid solution prior to discharge.'
    },
    keywords: ['sodium hydroxide', 'naoh', '1310-73-2', 'caustic', 'base', 'pellet', 'alkali', 'lye']
  },
  {
    id: 'glacial-acetic-acid',
    chemicalName: 'Glacial Acetic Acid 99.5%',
    casNumber: '64-19-7',
    formula: 'CH3COOH',
    ghsPictograms: ['GHS02_FLAMMABLE', 'GHS05_CORROSIVE'],
    hazardSummary: 'Combustible organic acid and fuming vapor. Flash point 39°C. Causes severe burns. Freezes into ice-like crystals at 16.6°C.',
    spillResponse: 'Extinguish all flames. Neutralize with sodium bicarbonate or agricultural lime. Absorb with non-combustible vermiculite.',
    firstAid: 'Skin contact: Wash with plenty of soap and water for 15 minutes. Eyes: Rinse cautiously with water for 20 minutes.',
    storageIncompatibility: 'DO NOT STORE with Nitric Acid, Hydrogen Peroxide, or strong oxidizers. Keep in designated flammable liquid storage cabinet.',
    disposalProtocol: 'Neutralize with sodium hydroxide or lime slurry to pH 6-9 prior to hazardous disposal collection.',
    ppeRequirements: 'Butyl rubber or nitrile gloves, splash goggles, vapor respirator if vapors exceed 10 ppm.',
    sections: {
      section2_hazards: 'H226: Flammable liquid and vapor. H314: Causes severe skin burns and eye damage.',
      section6_accidental_release: 'Eliminate ignition sources. Dilute and neutralize with sodium bicarbonate.',
      section7_handling_storage: 'Store in flammables cabinet. Keep above 17°C to prevent freezing crystallization.',
      section8_exposure_ppe: 'Nitrile gloves, safety goggles, lab coat.',
      section10_stability_reactivity: 'Incompatible with strong oxidizers. Explodes in contact with chromic acid or ammonium nitrate.',
      section13_disposal: 'Dilute and neutralize with lime slurry.'
    },
    keywords: ['acetic', 'glacial', '64-19-7', 'ch3cooh', 'organic acid', 'vinegar']
  },
  {
    id: 'hydrogen-peroxide',
    chemicalName: 'Hydrogen Peroxide 30% AR',
    casNumber: '7722-84-1',
    formula: 'H2O2',
    ghsPictograms: ['GHS03_OXIDIZER', 'GHS05_CORROSIVE', 'GHS07_HARMFUL'],
    hazardSummary: 'Strong liquid oxidizer. Catalytic decomposition releases oxygen and steam, creating explosion risk in sealed containers.',
    spillResponse: 'Dilute with large amounts of cold water (at least 10x volume). Do not allow contact with combustible materials.',
    firstAid: 'Eyes: Flush immediately with water for 20 minutes. Skin: Wash thoroughly with water. Remove contaminated clothing immediately.',
    storageIncompatibility: 'Store in vented container in dark cool tray. Incompatible with iron, copper, brass, organic solvents, and dust.',
    disposalProtocol: 'Dilute with cold water to below 5% concentration and decompose with trace sodium sulfite, or pool for district collection.',
    ppeRequirements: 'Polyethylene or nitrile gloves, safety goggles, vented storage cap.',
    sections: {
      section2_hazards: 'H271: May cause fire or explosion; strong oxidizer. H302: Harmful if swallowed. H314: Causes severe skin burns.',
      section6_accidental_release: 'Flood with water. Do not use combustible materials or sawdust.',
      section7_handling_storage: 'Store in vented caps only to relieve oxygen outgassing. Keep in secondary containment tray.',
      section8_exposure_ppe: 'Nitrile gloves, eye protection, face shield.',
      section10_stability_reactivity: 'Decomposes exothermically into oxygen and water in presence of catalysts (MnO2, metals).',
      section13_disposal: 'Dilute and decompose safely.'
    },
    keywords: ['hydrogen peroxide', 'h2o2', '7722-84-1', 'peroxide 30', 'oxidizer']
  },
  {
    id: 'silver-nitrate',
    chemicalName: 'Silver Nitrate Crystalline',
    casNumber: '7761-88-8',
    formula: 'AgNO3',
    ghsPictograms: ['GHS03_OXIDIZER', 'GHS05_CORROSIVE', 'GHS09_ENVIRONMENT'],
    hazardSummary: 'Corrosive oxidizer. Very toxic to aquatic life with long-lasting effects. Causes dark photolytic skin stains.',
    spillResponse: 'Precipitate silver ions by adding Sodium Chloride (table salt) to form insoluble Silver Chloride (AgCl). Collect white precipitate.',
    firstAid: 'Skin: Causes dark silver oxide stains (argentea). Wash thoroughly with soap and water.',
    storageIncompatibility: 'Light sensitive. Store in amber bottles. Incompatible with organic reducing sugars, ammonia, and ethanol.',
    disposalProtocol: 'Do not flush into domestic sewage. Recover metallic silver via zinc displacement or pool for hazardous chemical waste collection.',
    ppeRequirements: 'Nitrile gloves, lab coat, safety glasses with side shields.',
    sections: {
      section2_hazards: 'H272: May intensify fire; oxidizer. H314: Causes severe skin burns. H410: Very toxic to aquatic life.',
      section6_accidental_release: 'Precipitate with excess NaCl (common salt). Sweep up white AgCl precipitate.',
      section7_handling_storage: 'Store in brown amber glass away from bright light and organic reducers.',
      section8_exposure_ppe: 'Nitrile gloves to prevent silver reduction black skin stains.',
      section10_stability_reactivity: 'Forms explosive silver fulminate or silver nitride if mixed with ammonia and ethanol.',
      section13_disposal: 'Precipitate with chloride and recover silver metal.'
    },
    keywords: ['silver nitrate', 'agno3', '7761-88-8', 'stain', 'salt']
  },
  {
    id: 'ghs-storage-matrix',
    chemicalName: 'GHS Chemical Storage & Incompatibility Matrix',
    casNumber: 'GHS-STORAGE-STD',
    formula: 'Standard Regulatory Matrix',
    ghsPictograms: ['GHS02_FLAMMABLE', 'GHS03_OXIDIZER', 'GHS05_CORROSIVE'],
    hazardSummary: 'Secondary school chemical segregation rules. Establishes mandatory physical isolation between incompatible chemical hazard classes.',
    spillResponse: 'Consult chemical-specific neutralization protocols. Do not mix neutralizer types.',
    firstAid: 'Maintain eyewash stations and safety showers with 15-minute flush capability.',
    storageIncompatibility: 'RULE 1: Never store Mineral Acids (HCl, HNO3) with Bases (NaOH). RULE 2: Never store Strong Oxidizers (HNO3, H2O2) with Flammable Solvents (Ether, Acetic Acid). RULE 3: Keep Class B Peroxide formers (Diethyl Ether) in cool, spark-proof cabinets.',
    disposalProtocol: 'Segregate waste streams into Chlorinated, Non-chlorinated, Corrosive Acid, Corrosive Base, and Heavy Metal drums.',
    ppeRequirements: 'Standard lab coat, chemical goggles, and nitrile gloves for all chemical transfers.',
    sections: {
      section2_hazards: 'Improper co-storage causes exothermic reactions, toxic gas liberation (Cl2, NO2, HCN), and spontaneous combustion.',
      section6_accidental_release: 'Acid and base spill kits must be stationed separately in distinct marked bins.',
      section7_handling_storage: 'Cabinet A: Inorganic Mineral Acids. Cabinet B: Flammables & Solvents. Cabinet C: Bases & Salts.',
      section8_exposure_ppe: 'PPE must match chemical category.',
      section10_stability_reactivity: 'Acid + Base -> Violent exothermic neutralization with boiling splatter. Acid + Hypochlorite -> Deadly Chlorine gas.',
      section13_disposal: 'Never pour incompatible wastes into the same waste container.'
    },
    keywords: ['store', 'storage', 'cabinet', 'incompatible', 'incompatibility', 'together', 'matrix', 'mix', 'co-store']
  }
];

export interface RagRetrievalResult {
  isGreeting: boolean;
  intent: 'greeting' | 'chemical_query' | 'incompatibility_query' | 'spill_protocol' | 'general';
  matchedDocs: SdsDocument[];
  primaryDoc: SdsDocument | null;
  retrievedContextText: string;
}

/**
 * Intelligent RAG Document Retriever
 * Resolves query intent and retrieves relevant SDS document sections without false positives
 */
export function retrieveSdsChunks(query: string): RagRetrievalResult {
  const q = (query || '').toLowerCase().trim();

  // 1. Detect greetings and conversational queries
  const greetingPatterns = [
    /^hi\b/, /^hello\b/, /^hey\b/, /^good\s*(morning|afternoon|evening)/,
    /^help\b/, /^who are you/, /^what can you do/, /^start\b/
  ];

  const isGreeting = greetingPatterns.some(regex => regex.test(q)) || q === 'hi' || q === 'hello';
  if (isGreeting && q.split(/\s+/).length <= 4 && !q.includes('spill') && !q.includes('acid') && !q.includes('ether') && !q.includes('crystal')) {
    return {
      isGreeting: true,
      intent: 'greeting',
      matchedDocs: [],
      primaryDoc: null,
      retrievedContextText: ''
    };
  }

  // 2. Score all documents against query
  const scoredDocs = SDS_DOCUMENTS.map(doc => {
    let score = 0;
    const lowerName = doc.chemicalName.toLowerCase();
    const lowerCas = doc.casNumber.toLowerCase();

    // Exact CAS match
    if (q.includes(lowerCas)) score += 50;

    // Chemical name matches
    if (q.includes(lowerName)) score += 30;

    // Keyword matches
    for (const kw of doc.keywords) {
      if (q.includes(kw)) {
        score += kw.length > 5 ? 15 : 10;
      }
    }

    // Specific hazard scenarios
    if (doc.id === 'diethyl-ether' && (q.includes('crystal') || q.includes('cap thread') || q.includes('detonat'))) {
      score += 25;
    }
    if (doc.id === 'hydrochloric-acid' && (q.includes('hcl') || (q.includes('acid') && q.includes('spill') && !q.includes('nitric')))) {
      score += 25;
    }
    if (doc.id === 'nitric-acid' && (q.includes('nitric') || q.includes('hno3') || q.includes('brown gas') || q.includes('no2'))) {
      score += 30;
    }
    if (doc.id === 'sodium-hydroxide' && (q.includes('naoh') || q.includes('caustic') || q.includes('pellet') || q.includes('base'))) {
      score += 30;
    }
    if (doc.id === 'ghs-storage-matrix' && (q.includes('store') || q.includes('together') || q.includes('cabinet') || q.includes('incompat'))) {
      score += 25;
    }

    return { doc, score };
  });

  // Filter matched documents
  const relevantDocs = scoredDocs
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.doc);

  const primaryDoc = relevantDocs[0] || null;

  // Determine intent
  let intent: RagRetrievalResult['intent'] = 'chemical_query';
  if (q.includes('store') || q.includes('together') || q.includes('incompat')) {
    intent = 'incompatibility_query';
  } else if (q.includes('spill') || q.includes('neutraliz')) {
    intent = 'spill_protocol';
  }

  // Build formatted context chunk string for LLM injection
  let contextChunks = '';
  if (relevantDocs.length > 0) {
    contextChunks = relevantDocs.slice(0, 3).map(d => `
--- DOCUMENT: ${d.chemicalName} (CAS: ${d.casNumber}, Formula: ${d.formula}) ---
• GHS Pictograms: ${d.ghsPictograms.join(', ')}
• Hazard Summary: ${d.hazardSummary}
• Section 6 (Accidental Release & Spill Neutralization): ${d.sections.section6_accidental_release} (${d.spillResponse})
• Section 7 (Handling & Storage Rules): ${d.sections.section7_handling_storage} (${d.storageIncompatibility})
• Section 8 (Mandatory PPE): ${d.sections.section8_exposure_ppe} (${d.ppeRequirements})
• Section 10 (Stability & Incompatible Materials): ${d.sections.section10_stability_reactivity}
• Section 13 (Disposal Considerations): ${d.sections.section13_disposal} (${d.disposalProtocol})
• First Aid: ${d.firstAid}
`).join('\n');
  }

  return {
    isGreeting: false,
    intent,
    matchedDocs: relevantDocs,
    primaryDoc,
    retrievedContextText: contextChunks
  };
}

/**
 * Backward compatibility helper
 */
export function querySdsKnowledgeBase(query: string): SdsDocument | null {
  const result = retrieveSdsChunks(query);
  return result.primaryDoc;
}
