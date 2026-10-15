'use client';

import React, { useState } from 'react';
import { MessageSquare, Send, CheckCheck, X, ShieldAlert, PhoneCall } from 'lucide-react';
import { AlertNotification } from '@/types/chemical';

interface WhatsAppEscalationFeedProps {
  alerts: AlertNotification[];
  onAcknowledgeAlert: (alertId: string) => void;
}

export default function WhatsAppEscalationFeed({ alerts, onAcknowledgeAlert }: WhatsAppEscalationFeedProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [replyText, setReplyText] = useState('');

  const activeAlert = alerts[0] || {
    id: 'alert-1-ether',
    title: 'CRITICAL DETONATION HAZARD: Crystallized Peroxide',
    message: 'White crystals detected around Diethyl Ether bottle. Twisting cap poses shock detonation hazard.',
    status: 'raised',
    raisedAt: new Date().toISOString(),
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    onAcknowledgeAlert(activeAlert.id);
    setReplyText('');
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-2xl shadow-emerald-600/40 border border-emerald-400/40 transition-all hover:scale-105"
        >
          <MessageSquare className="w-4 h-4 fill-white" />
          <span>WhatsApp / SMS Escalation</span>
          {activeAlert.status === 'raised' && (
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping" />
          )}
        </button>
      </div>

      {/* WhatsApp Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-20 right-5 z-50 w-80 sm:w-96 rounded-2xl bg-[#0B141A] border border-slate-700 shadow-2xl overflow-hidden flex flex-col text-slate-100 animate-in slide-in-from-bottom">
          {/* Header */}
          <div className="bg-[#1F2C34] p-3.5 flex items-center justify-between border-b border-slate-700">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-slate-950 text-xs">
                RW
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">ReagentWatch Gov Alert Bot</h4>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> Official Secondary School Hazmat Link
                </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="p-3 space-y-2.5 max-h-72 overflow-y-auto text-xs bg-[#0B141A]">
            <div className="bg-[#1F2C34] p-3 rounded-xl rounded-tl-none border border-slate-700/80 max-w-[90%] space-y-1.5">
              <div className="flex items-center gap-1 text-[11px] font-bold text-rose-400">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>EMERGENCY LAB ALERT (TN EDU DEPT)</span>
              </div>
              <p className="text-slate-200 leading-relaxed text-[11px]">
                {activeAlert.message}
              </p>
              <div className="p-2 rounded bg-black/40 text-[10px] text-slate-300 font-mono">
                Reply <b>ACK {activeAlert.id.slice(-4)}</b> to confirm isolation & dispatch Hazmat team.
              </div>
              <div className="text-[9px] text-slate-400 text-right flex items-center justify-end gap-1">
                <span>10:32 AM</span>
                <CheckCheck className="w-3.5 h-3.5 text-cyan-400" />
              </div>
            </div>

            {activeAlert.status !== 'raised' && (
              <div className="bg-[#005C4B] p-2.5 rounded-xl rounded-tr-none text-white ml-auto max-w-[85%] text-[11px]">
                ACK {activeAlert.id.slice(-4)} — Reagent quarantined by Principal. Disposal team dispatched.
                <div className="text-[9px] text-emerald-200 text-right mt-1">10:35 AM • Delivered</div>
              </div>
            )}
          </div>

          {/* Quick Reply & Input */}
          <div className="p-2.5 bg-[#1F2C34] border-t border-slate-700 space-y-2">
            {/* OpenWA Gateway Status Header */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 pb-1 border-b border-slate-700/60">
              <span className="flex items-center gap-1 text-emerald-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                OpenWA Gateway (localhost:2785)
              </span>
              <a
                href={`https://wa.me/919442188301?text=${encodeURIComponent(
                  `🚨 *REAGENTWATCH HAZMAT ALERT*: Immediate danger on bottle ${activeAlert.id}. Reply ACK to authorize containment.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
              >
                Open in WhatsApp Web ↗
              </a>
            </div>

            {activeAlert.status === 'raised' && (
              <button
                onClick={() => onAcknowledgeAlert(activeAlert.id)}
                className="w-full py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md active:scale-98"
              >
                <span>One-Tap Quick Reply: "ACK {activeAlert.id.slice(-4)}"</span>
              </button>
            )}

            <div className="flex gap-2">
              <input
                id="whatsapp-reply-input"
                name="whatsapp_reply"
                autoComplete="off"
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                placeholder="Type SMS or ACK reply..."
                className="flex-1 bg-[#2A3942] border border-slate-600 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleSendReply}
                className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
