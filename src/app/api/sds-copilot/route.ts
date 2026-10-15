import { NextRequest, NextResponse } from 'next/server';
import { retrieveSdsChunks } from '@/lib/sds-knowledge-base';

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const { query, chemicalContext } = await req.json();
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // 1. Execute Semantic Multi-Document RAG Retrieval
    const ragResult = retrieveSdsChunks(query || chemicalContext || '');

    // 2. Handle Casual Greetings cleanly without false positive chemical matches
    if (ragResult.isGreeting) {
      if (apiKey) {
        try {
          const greetingPrompt = `You are the ReagentWatch AI Laboratory Safety Copilot for school chemistry labs.
The teacher greeted you with: "${query}".
Respond politely in 2-3 friendly sentences. Introduce yourself as the laboratory safety copilot and suggest asking about chemical spills (e.g. HCl or Nitric acid), handling peroxide crystals in ether, or GHS cabinet storage compatibility rules. Keep it professional and helpful.`;

          const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: greetingPrompt }] }]
            })
          });

          const geminiData = await geminiRes.json();
          const greetingReply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (greetingReply) {
            return NextResponse.json({
              success: true,
              reply: greetingReply,
              source: 'gemini-3.5-flash-rag',
              sds: null,
            });
          }
        } catch {}
      }

      return NextResponse.json({
        success: true,
        reply: `Hello! I am your AI Laboratory Safety Copilot. 

I can assist you with:
• **Acid & Solvent Spill Neutralization** (e.g., neutralizing HCl with sodium bicarbonate)
• **High-Risk Degradation Hazards** (e.g., peroxide crystal formation in Diethyl Ether)
• **GHS Cabinet Storage Compatibility** (e.g., separating mineral acids from caustic bases)
• **Mandatory Lab PPE & Eyewash Protocols**

What chemical safety question can I help you resolve today?`,
        source: 'rag-copilot-engine',
        sds: null,
      });
    }

    // 3. Synthesize via Gemini 3.5 Flash with Ground Truth Document Context
    if (apiKey) {
      try {
        let systemPrompt = '';
        if (ragResult.intent === 'incompatibility_query') {
          systemPrompt = `You are the ReagentWatch AI RAG Chemical Safety Copilot.
The user is asking about chemical storage compatibility: "${query}".

Ground-truth Safety Data Sheet context retrieved:
${ragResult.retrievedContextText}

Instructions:
1) Answer directly in clean Markdown.
2) State explicitly whether the chemicals can be stored together or must be separated.
3) Explain the chemical incompatibility hazard (e.g. violent exothermic neutralization, violent outgassing, flammable vapor fire).
4) Provide the exact cabinet segregation rule according to secondary school GHS guidelines (Cabinet A: Mineral Acids, Cabinet B: Flammables, Cabinet C: Bases).
5) Cite the relevant SDS sections (e.g. [SDS Section 7: Storage Rules], [SDS Section 10: Incompatible Materials]).`;
        } else if (ragResult.intent === 'spill_protocol') {
          systemPrompt = `You are the ReagentWatch AI RAG Chemical Safety Copilot.
The user is asking about an emergency chemical spill or neutralization: "${query}".

Ground-truth Safety Data Sheet context retrieved:
${ragResult.retrievedContextText}

Provide an immediate, authoritative emergency response in Markdown format:
• **Immediate Hazard Level & Action:** What to do immediately (evacuation, ventilation, ignition elimination).
• **Neutralizing Agent & Reaction:** Specific chemical neutralizing agent (e.g., Sodium Bicarbonate powder) and how to apply it from perimeter inward.
• **Mandatory PPE Equipment:** Gloves type and thickness, eye protection, respirator.
• **Disposal Protocol:** How to scoop, collect, and dispose of the neutralized slurry.
Cite: [SDS Section 6: Accidental Release Measures] and [SDS Section 8: Exposure Controls/PPE].`;
        } else {
          systemPrompt = `You are the ReagentWatch AI RAG Chemical Safety Copilot for high-school chemistry laboratories.
User Question: "${query}"

Ground-truth Safety Data Sheet context retrieved from lab database:
${ragResult.retrievedContextText}

Provide a concise, direct, authoritative answer in clean Markdown format with bullet points:
1) Immediate Action & GHS Hazard Summary
2) Safe Handling & Neutralization Protocol
3) Required Laboratory PPE Equipment
4) Storage Incompatibilities & Cabinet Separation Rules
Cite specific document sections where applicable.`;
        }

        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }]
          })
        });

        const geminiData = await geminiRes.json();
        const replyText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

        if (replyText) {
          return NextResponse.json({
            success: true,
            reply: replyText,
            source: 'gemini-3.5-flash-rag',
            sds: ragResult.primaryDoc,
          });
        }
      } catch (geminiError) {
        console.warn('Gemini 3.5 RAG copilot error, falling back to deterministic RAG engine:', geminiError);
      }
    }

    // 4. Deterministic RAG Fallback (Intelligent Context Generation)
    const primary = ragResult.primaryDoc;
    let fallbackAnswer = '';

    if (ragResult.intent === 'incompatibility_query') {
      fallbackAnswer = `### 🚫 GHS Storage Incompatibility Warning
**RULE: Incompatible Chemical Segregation**

• **Strict Storage Rule:**
  Never store strong mineral acids (such as Hydrochloric Acid or Nitric Acid) in the same cabinet as strong bases (such as Sodium Hydroxide Pellets).

• **Hazard Rationale:**
  Accidental contact causes a violent, instantaneous exothermic neutralization reaction (\`NaOH + HCl → NaCl + H2O + Extreme Heat\`). The rapid heat generation can shatter glass reagent bottles, cause boiling acidic/alkaline aerosol splatter, and release toxic fumes.

• **Mandatory Secondary School Separation:**
  - **Cabinet A (Dedicated Polyethylene Acid Cabinet):** Mineral Acids (HCl, HNO3, H2SO4)
  - **Cabinet B (Yellow Flammable Liquids Cabinet):** Solvents & Organic Acids (Ether, Acetic Acid, Acetone)
  - **Cabinet C (Dedicated Base Cabinet):** Bases & Caustics (NaOH pellets, KOH, Ammonia)`;
    } else if (primary) {
      fallbackAnswer = `### 🛡️ GHS Advisory: ${primary.chemicalName} (CAS: ${primary.casNumber})
**GHS Pictograms:** ${primary.ghsPictograms.join(', ')}

• **Immediate Spill Response & Neutralization [SDS Section 6]:**
  ${primary.spillResponse}

• **Mandatory PPE Equipment [SDS Section 8]:**
  ${primary.ppeRequirements}

• **Emergency First Aid Protocol [SDS Section 4]:**
  ${primary.firstAid}

• **Storage Incompatibility & Separation [SDS Section 7 & 10]:**
  ${primary.storageIncompatibility}

• **Safe Disposal Protocol [SDS Section 13]:**
  ${primary.disposalProtocol}`;
    } else {
      fallbackAnswer = `### ⚠️ General Laboratory Safety Advisory
For safety in secondary school chemistry laboratories:
• Isolate unverified reagent containers inside a dedicated secondary containment tray under a certified fume hood.
• Never mix acids with bases, oxidizers with organic solvents, or bleach with ammonia.
• Wear nitrile or neoprene gloves, splash goggles, and an acid-resistant lab coat.`;
    }

    return NextResponse.json({
      success: true,
      reply: fallbackAnswer,
      source: 'offline-sds-rag-engine',
      sds: primary,
    });
  } catch (error: any) {
    console.error('SDS Copilot route error:', error);
    return NextResponse.json({ error: error.message || 'SDS query failed' }, { status: 500 });
  }
}
