import React, { useState } from 'react';
import {
  X, Headphones, MessageCircle, Mail,
  Search, Clock
} from 'lucide-react';

export default function SupportModal({ onClose }) {
  const [query, setQuery] = useState('');

  const primaryChannels = [
    {
      icon: MessageCircle,
      color: 'bg-emerald-50 text-emerald-500',
      title: 'WhatsApp Support',
      hint: 'Best for quick questions',
      action: 'Chat Now',
      actionStyle: 'bg-emerald-500 hover:bg-emerald-600 text-white',
      link: 'https://wa.me/918501920633',
      primary: true
    },
    {
      icon: Mail,
      color: 'bg-blue-50 text-blue-500',
      title: 'Email Support',
      hint: 'Best for technical issues',
      action: 'Send Email',
      actionStyle: 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700',
      link: 'mailto:connect@manuen.com',
      primary: false
    }
  ];



  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:justify-end p-0 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full sm:w-[360px] bg-white rounded-t-2xl sm:rounded-xl shadow-2xl shadow-slate-900/20 overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-right-4 duration-300 flex flex-col max-h-[90vh]">

        {/* ── Header ── */}
        <div className="flex items-center gap-3 px-4 py-3 bg-[#003B6D] text-white shrink-0">
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
            <Headphones size={16} className="text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-white leading-none">Technical Support</h2>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[10px] text-white/60 font-semibold">Online · Avg response: 15 min</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all cursor-pointer shrink-0"
          >
            <X size={14} />
          </button>
        </div>

        {/* ── Search ── */}
        <div className="px-4 pt-3 pb-2 shrink-0">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search help articles..."
              className="w-full h-9 pl-8 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 placeholder:text-slate-300 focus:bg-white focus:border-[#004277] outline-none transition-all"
            />
          </div>
        </div>

        {/* ── Primary Channels ── */}
        <div className="px-4 pb-3 space-y-2 shrink-0">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contact Us</p>
          {primaryChannels.map((ch, i) => (
            <a
              key={i}
              href={ch.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50/60 transition-all group cursor-pointer"
            >
              <div className={`w-9 h-9 rounded-lg ${ch.color} flex items-center justify-center shrink-0`}>
                <ch.icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 leading-none">{ch.title}</p>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{ch.hint}</p>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer transition-all shrink-0 ${ch.actionStyle}`}>
                {ch.action}
              </span>
            </a>
          ))}
        </div>



        {/* ── Footer ── */}
        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5">
            <Clock size={11} className="text-slate-400" />
            <span className="text-[10px] text-slate-400 font-semibold">Mon–Sat · 9 AM – 7 PM IST</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-600">Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}
