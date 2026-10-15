'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  X, 
  ShieldAlert, 
  BookOpen, 
  AlertCircle, 
  Loader2,
  Volume2,
  Copy,
  Check,
  Flame,
  AlertTriangle,
  Beaker,
  ShieldCheck,
  ExternalLink,
  Layers,
  Cpu,
  FileText,
  Share2
} from 'lucide-react';
import { SdsDocument, retrieveSdsChunks } from '@/lib/sds-knowledge-base';

interface SdsCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sds?: SdsDocument | null;
  retrievedChunks?: string[];
  latencyMs?: number;
  source?: string;
  isGreeting?: boolean;
}

export default function SdsCopilotDrawer({ isOpen, onClose }: SdsCopilotDrawerProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am your AI Laboratory Safety Copilot powered by Gemini 3.5 Flash and offline-embedded GHS Safety Data Sheets.

Ask me about neutralizing chemical spills, inspecting peroxide crystal degradation, or checking Cabinet A, B, and C storage incompatibility rules.`,
      isGreeting: true,
    },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const executeQuery = async (userText: string) => {
    if (!userText.trim() || isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    const startTime = performance.now();

    setMessages(prev => [
      ...prev,
      { id: userMsgId, role: 'user', content: userText }
    ]);
    setQuery('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/sds-copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userText }),
      });
      const data = await res.json();
      const latencyMs = Math.round(performance.now() - startTime);

      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.reply || 'Safety advisory generated from authoritative GHS documents.',
          sds: data.sds,
          latencyMs,
          source: data.source || 'gemini-3.5-flash-rag',
          isGreeting: data.sds === null && !userText.toLowerCase().includes('spill'),
        },
      ]);
    } catch (err) {
      // Local deterministic RAG fallback
      const localResult = retrieveSdsChunks(userText);
      const latencyMs = Math.round(performance.now() - startTime);

      setMessages(prev => [
        ...prev,
        {
          id: `ai-fb-${Date.now()}`,
          role: 'assistant',
          content: localResult.primaryDoc
            ? `### 🛡️ GHS Advisory: ${localResult.primaryDoc.chemicalName} (CAS: ${localResult.primaryDoc.casNumber})\n\n• **Spill Neutralization [Section 6]:**\n  ${localResult.primaryDoc.spillResponse}\n\n• **Mandatory PPE [Section 8]:**\n  ${localResult.primaryDoc.ppeRequirements}\n\n• **Storage Segregation [Section 7 & 10]:**\n  ${localResult.primaryDoc.storageIncompatibility}`
            : `Please isolate container in a secondary ventilated tray inside certified fume hood and notify district hazmat officer.`,
          sds: localResult.primaryDoc,
          latencyMs,
          source: 'local-rag-vector-store',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    executeQuery(query);
  };

  // Web Speech API Text-to-Speech Playback
  const speakMessageAloud = (msgId: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (activeSpeechId === msgId) {
      window.speechSynthesis.cancel();
      setActiveSpeechId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.onstart = () => setActiveSpeechId(msgId);
    utterance.onend = () => setActiveSpeechId(null);
    utterance.onerror = () => setActiveSpeechId(null);
    window.speechSynthesis.speak(utterance);
  };

  const copyToClipboard = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper to render official GHS Diamond Pictograms
  const renderGhsBadge = (ghsCode: string) => {
    let label = 'HAZARD';
    let colorClass = 'border-rose-500/80 bg-rose-950/40 text-rose-300';
    let icon = AlertTriangle;

    if (ghsCode.includes('FLAMMABLE')) {
      label = 'FLAMMABLE (GHS02)';
      colorClass = 'border-red-500/80 bg-red-950/40 text-red-300';
      icon = Flame;
    } else if (ghsCode.includes('CORROSIVE')) {
      label = 'CORROSIVE (GHS05)';
      colorClass = 'border-cyan-500/80 bg-cyan-950/40 text-cyan-300';
      icon = Beaker;
    } else if (ghsCode.includes('OXIDIZER')) {
      label = 'OXIDIZER (GHS03)';
      colorClass = 'border-amber-500/80 bg-amber-950/40 text-amber-300';
      icon = Sparkles;
    } else if (ghsCode.includes('TOXIC')) {
      label = 'ACUTE TOXIC (GHS06)';
      colorClass = 'border-purple-500/80 bg-purple-950/40 text-purple-300';
      icon = ShieldAlert;
    } else if (ghsCode.includes('HARMFUL')) {
      label = 'HARMFUL (GHS07)';
      colorClass = 'border-amber-500/80 bg-amber-950/40 text-amber-300';
      icon = AlertCircle;
    }

    const IconComp = icon;

    return (
      <span
        key={ghsCode}
        className={`px-2 py-0.5 rounded-md border text-[9px] font-bold font-mono flex items-center gap-1 shadow-sm ${colorClass}`}
      >
        <IconComp className="w-3 h-3" />
        <span>{label}</span>
      </span>
    );
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[580px] bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      {/* Top Header: Neural RAG Radar */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Bot className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/40 flex items-center gap-1">
                <Cpu className="w-3 h-3 text-emerald-400" />
                <span>RAG COPILOT v2.5</span>
              </span>
              <span className="text-[10px] text-cyan-300 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>GEMINI 3.5 FLASH</span>
              </span>
            </div>
            <h3 className="text-sm font-bold text-white mt-0.5">
              RAG Chemical Safety Copilot
            </h3>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* RAG Telemetry Status Bar */}
      <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
          <span>8 Active Secondary School SDS Docs • 32 Ground-Truth Chunks</span>
        </div>
        <span className="text-emerald-400 font-semibold">100% Offline Vector Ready</span>
      </div>

      {/* Suggested Quick Prompt Chips (1-Click Instant Send) */}
      <div className="p-2.5 border-b border-slate-800/80 bg-slate-950 flex gap-1.5 overflow-x-auto text-[11px] scrollbar-thin">
        <button
          onClick={() => executeQuery('What to do if ether bottle has white crystals around cap?')}
          className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/60 hover:border-rose-500 text-rose-300 border border-slate-800 font-medium transition-all cursor-pointer flex items-center gap-1 shadow-sm"
        >
          <span>💎 Crystals in Ether?</span>
        </button>
        <button
          onClick={() => executeQuery('How to neutralize hydrochloric acid spill?')}
          className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-emerald-950/60 hover:border-emerald-500 text-emerald-300 border border-slate-800 font-medium transition-all cursor-pointer flex items-center gap-1 shadow-sm"
        >
          <span>🧪 HCl Acid Spill?</span>
        </button>
        <button
          onClick={() => executeQuery('Can I store NaOH pellets with hydrochloric acid in same cabinet?')}
          className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-amber-950/60 hover:border-amber-500 text-amber-300 border border-slate-800 font-medium transition-all cursor-pointer flex items-center gap-1 shadow-sm"
        >
          <span>🚫 Store NaOH + Acids?</span>
        </button>
        <button
          onClick={() => executeQuery('How to handle concentrated nitric acid spill safely?')}
          className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-cyan-950/60 hover:border-cyan-500 text-cyan-300 border border-slate-800 font-medium transition-all cursor-pointer flex items-center gap-1 shadow-sm"
        >
          <span>🔥 Nitric Acid Spill?</span>
        </button>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            {/* Message Bubble Container */}
            <div
              className={`p-4 rounded-2xl max-w-[95%] leading-relaxed shadow-lg relative ${
                m.role === 'user'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-none'
                  : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-bl-none w-full'
              }`}
            >
              {/* AI Metadata Pill */}
              {m.role === 'assistant' && (
                <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-800 text-[10px] font-mono text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-emerald-400 font-bold uppercase">{m.source || 'GEMINI-3.5-RAG'}</span>
                    {m.latencyMs && <span>• {m.latencyMs}ms</span>}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => speakMessageAloud(m.id, m.content)}
                      className={`p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer ${
                        activeSpeechId === m.id ? 'text-cyan-400 bg-cyan-950/60 animate-bounce' : ''
                      }`}
                      title="Listen aloud (TTS)"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(m.id, m.content)}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Copy to clipboard"
                    >
                      {copiedId === m.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Main Content Render */}
              <div className="whitespace-pre-line text-[11px] leading-relaxed">
                {m.content}
              </div>

              {/* Verified GHS Cited Document Card */}
              {m.sds && (
                <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-1 pb-1.5 border-b border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[10px] font-bold text-white">
                        Cited SDS: {m.sds.chemicalName}
                      </span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[9px] font-bold">
                      CAS: {m.sds.casNumber}
                    </span>
                  </div>

                  {/* Official GHS Diamonds */}
                  <div className="flex flex-wrap gap-1">
                    {m.sds.ghsPictograms.map(renderGhsBadge)}
                  </div>

                  {/* Cabinet Routing Tag */}
                  <div className="text-[10px] text-slate-300 flex items-center justify-between pt-1 border-t border-slate-800/60 font-mono">
                    <span className="text-slate-400">GHS Segregation Routing:</span>
                    <span className="text-cyan-300 font-semibold">
                      {m.sds.id === 'diethyl-ether' || m.sds.id === 'glacial-acetic-acid'
                        ? 'Cabinet B (Flammables - Shelf 2)'
                        : m.sds.id === 'hydrochloric-acid' || m.sds.id === 'nitric-acid'
                        ? 'Cabinet A (Acids - Shelf 1)'
                        : 'Cabinet C (Bases - Shelf 3)'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Dynamic Neural Retrieval Scanning State */}
        {isLoading && (
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 animate-in fade-in max-w-[90%]">
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Scanning GHS Safety Data Sheets & Vector Embeddings...</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 h-full w-2/3 animate-pulse rounded-full" />
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Matching Sections: Sec 6 (Accidental Release) & Sec 10 (Reactivity & Storage)
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Field Bar */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/95 flex gap-2">
        <input
          id="sds-copilot-input"
          name="sds_query"
          autoComplete="off"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask SDS Copilot (e.g. 'Handling ether crystals?' or 'Store NaOH + HCl?')..."
          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
        />
        <button
          onClick={handleSend}
          disabled={!query.trim() || isLoading}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center transition-all shadow-md shadow-emerald-500/20 cursor-pointer active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
