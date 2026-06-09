import React, { useState } from 'react';
import {
  ArrowLeft, Zap, AlertCircle, ImageIcon, User, CheckCheck,
  Phone, Link2, File, Headphones, Video, RefreshCcw, Trash2,
  Copy, Clock, CheckCircle2, XCircle, ChevronDown, ChevronRight,
  Calendar, Hash, Globe, Tag, Pencil, Lock
} from 'lucide-react';

/* ─── Tiny phone mockup ─────────────────────────────────── */
const PhonePreview = ({ template }) => {
  if (!template) return null;
  const bodyText = template.body?.text || template.content || '';
  const footerText = template.footer?.text || (typeof template.footer === 'string' ? template.footer : '');
  const buttons = template.buttons || [];
  const hType = template.header?.type || template.headerType;
  const hUrl = template.header?.media_url || template.header?.url || template.imageUrl;
  const hText = template.header?.text || template.headerText;

  return (
    <div className="w-full max-w-[220px] bg-slate-950 rounded-[2rem] p-1.5 border-[3px] border-slate-800 shadow-xl overflow-hidden aspect-[9/18] flex flex-col mx-auto">
      <div className="flex-1 bg-[#E5DDD5] rounded-[1.7rem] overflow-hidden flex flex-col">
        {/* WA status bar */}
        <div className="h-10 bg-[#075E54] flex items-center px-3 gap-2 shrink-0">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <User size={11} className="text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-[9px] font-bold leading-none truncate">Manuen Business</p>
            <p className="text-white/50 text-[6px] uppercase tracking-widest mt-0.5">Official Account</p>
          </div>
        </div>
        {/* Chat */}
        <div className="flex-1 p-2.5 pt-3 overflow-y-auto no-scrollbar">
          <div className="bg-white rounded-lg rounded-tl-none shadow-sm overflow-hidden">
            {hType && ['IMAGE','VIDEO','DOCUMENT','AUDIO'].includes(hType) && (
              <div className="aspect-video bg-slate-100 flex items-center justify-center text-slate-300 overflow-hidden">
                {hUrl ? (
                  <>
                    {hType === 'IMAGE' && <img src={hUrl} className="w-full h-full object-cover" alt="header" />}
                    {hType === 'VIDEO' && <video src={hUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />}
                    {hType === 'DOCUMENT' && <File size={16} className="text-indigo-400" />}
                    {hType === 'AUDIO' && <Headphones size={16} className="text-indigo-400" />}
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1 opacity-30">
                    {hType === 'IMAGE' && <ImageIcon size={16} />}
                    {hType === 'VIDEO' && <Video size={16} />}
                  </div>
                )}
              </div>
            )}
            <div className="p-2">
              {hType === 'TEXT' && hText && <p className="text-[9px] font-bold text-slate-900 mb-1">{hText}</p>}
              <p className="text-[9px] text-slate-800 leading-relaxed whitespace-pre-wrap">{bodyText}</p>
              {footerText && <p className="text-[7px] text-slate-400 mt-1 pt-1 border-t border-slate-50">{footerText}</p>}
              <div className="flex justify-end mt-1">
                <span className="text-[6px] text-slate-300 font-bold flex items-center gap-0.5">10:45 AM <CheckCheck size={7} /></span>
              </div>
            </div>
            {buttons.length > 0 && (
              <div className="border-t border-slate-100 divide-y divide-slate-100">
                {buttons.map((btn, i) => (
                  <div key={i} className="py-1.5 px-2 flex items-center justify-center gap-1 text-[#00a5f4] font-bold text-[8px]">
                    {btn.type === 'PHONE_NUMBER' ? <Phone size={7} /> : btn.type === 'URL' ? <Link2 size={7} /> : null}
                    <span>{btn.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Accordion section ─────────────────────────────────── */
const Section = ({ title, accent, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer"
      >
        <div className={`w-1 h-4 rounded-full shrink-0 ${accent}`} />
        <span className="text-xs font-bold text-slate-700 flex-1 text-left">{title}</span>
        {open ? <ChevronDown size={13} className="text-slate-400" /> : <ChevronRight size={13} className="text-slate-400" />}
      </button>
      {open && <div className="px-4 pb-4 pt-1">{children}</div>}
    </div>
  );
};

/* ─── Status config ─────────────────────────────────────── */
const STATUS_MAP = {
  approved: { label: 'Approved', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', dot: 'bg-emerald-500', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-rose-50 text-rose-600 border-rose-100', dot: 'bg-rose-500', icon: XCircle },
  pending_admin_approval: { label: 'Pending Admin', color: 'bg-amber-50 text-amber-600 border-amber-100', dot: 'bg-amber-400', icon: Clock },
  pending_meta_approval: { label: 'In Meta Review', color: 'bg-blue-50 text-blue-600 border-blue-100', dot: 'bg-blue-500', icon: Clock },
};
const getStatus = (s) => STATUS_MAP[(s || '').toLowerCase()] || { label: s || 'Draft', color: 'bg-slate-50 text-slate-500 border-slate-200', dot: 'bg-slate-400', icon: Clock };

/* ─── Approval timeline ─────────────────────────────────── */
const timeline = [
  { key: 'created', label: 'Created' },
  { key: 'pending_admin_approval', label: 'Admin Review' },
  { key: 'pending_meta_approval', label: 'Meta Review' },
  { key: 'approved', label: 'Approved' },
];
const timelineOrder = { created: 0, pending_admin_approval: 1, pending_meta_approval: 2, approved: 3, rejected: 3 };

const ApprovalTimeline = ({ status }) => {
  const s = (status || '').toLowerCase();
  const current = timelineOrder[s] ?? 0;
  const isRejected = s === 'rejected';
  return (
    <div className="flex items-center gap-0 w-full">
      {timeline.map((step, i) => {
        const done = i < current || (s === 'approved' && i <= 3);
        const active = i === current && !isRejected;
        const rejected = isRejected && i === 3;
        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center min-w-0 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all text-[9px] font-black
                ${rejected ? 'border-rose-400 bg-rose-50 text-rose-500' :
                  done ? 'border-emerald-400 bg-emerald-50 text-emerald-600' :
                  active ? 'border-blue-400 bg-blue-50 text-blue-600' :
                  'border-slate-200 bg-slate-50 text-slate-300'}`}>
                {rejected ? '✕' : done ? '✓' : i + 1}
              </div>
              <p className={`text-[8px] font-bold mt-1 text-center leading-tight
                ${rejected && i === 3 ? 'text-rose-500' :
                  done ? 'text-emerald-600' :
                  active ? 'text-blue-600' : 'text-slate-300'}`}>
                {rejected && i === 3 ? 'Rejected' : step.label}
              </p>
            </div>
            {i < timeline.length - 1 && (
              <div className={`h-0.5 flex-1 mb-4 transition-all ${done ? 'bg-emerald-300' : 'bg-slate-100'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* ─── Main page ─────────────────────────────────────────── */
export default function TemplateDetailsPage({ template, onBack, onNavigate, setActiveTab }) {
  if (!template) return (
    <div className="flex-1 flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-300 mx-auto mb-3">
          <AlertCircle size={24} />
        </div>
        <h2 className="text-sm font-bold text-slate-800">Template Not Found</h2>
        <button onClick={onBack} className="mt-3 text-xs text-primary font-bold hover:underline cursor-pointer">← Back to Templates</button>
      </div>
    </div>
  );

  const status = getStatus(template.status);
  const bodyText = template.body?.text || template.content || '';
  const footerText = template.footer?.text || (typeof template.footer === 'string' ? template.footer : '');
  const hType = template.header?.type || template.headerType;
  const hUrl = template.header?.media_url || template.header?.url || template.imageUrl;
  const hText = template.header?.text || template.headerText;
  const createdAt = template.createdAt ? new Date(template.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
  const updatedAt = template.updatedAt ? new Date(template.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
  const shortId = template._id ? `…${template._id.slice(-8)}` : '—';

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] overflow-hidden">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-4 md:p-5 max-w-7xl mx-auto space-y-4 pb-10">

          {/* ── Header bar ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3.5 border-b border-slate-100">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <button
                onClick={onBack}
                className="flex items-center gap-1.5 h-8 px-2.5 bg-white border border-slate-200 text-slate-500 hover:text-primary hover:border-primary/30 text-xs font-bold rounded-lg transition-all shadow-sm shrink-0 cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span className="hidden sm:inline">Back</span>
              </button>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-none truncate">{template.name}</h1>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${status.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                    {status.label}
                  </span>
                </div>
                {/* Chips row */}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[10px] font-bold uppercase">
                    <Tag size={9} />{template.category || 'Marketing'}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[10px] font-bold uppercase">
                    <Globe size={9} />{template.language || 'en_us'}
                  </span>
                  {template._id && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 text-slate-400 border border-slate-200 rounded text-[10px] font-mono">
                      <Hash size={9} />{shortId}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action toolbar */}
            <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto justify-end sm:justify-start">
              {/* Edit — only allowed before admin reviews or after rejection */}
              {['pending_admin_approval', 'rejected', 'draft', ''].includes((template.status || '').toLowerCase()) ? (
                <button
                  title={template.status?.toLowerCase() === 'rejected' ? 'Edit & Resubmit' : 'Recall & Edit'}
                  onClick={() => {
                    localStorage.setItem('editTemplateData', JSON.stringify(template));
                    if (setActiveTab) setActiveTab('Create Template');
                    if (onNavigate) onNavigate('/templates/create');
                  }}
                  className="h-8 px-2.5 flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 hover:text-primary hover:border-primary/30 text-xs font-bold rounded-lg transition-all shadow-sm cursor-pointer"
                >
                  <Pencil size={13} />
                  <span className="hidden sm:inline">
                    {(template.status || '').toLowerCase() === 'rejected' ? 'Edit & Resubmit' : 'Edit'}
                  </span>
                </button>
              ) : (
                <div
                  title={`Cannot edit — template is ${template.status}`}
                  className="h-8 px-2.5 flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-300 text-xs font-bold rounded-lg cursor-not-allowed"
                >
                  <Lock size={13} />
                  <span className="hidden sm:inline">Locked</span>
                </div>
              )}
              <button
                onClick={() => {
                  const data = JSON.stringify(template, null, 2);
                  navigator.clipboard.writeText(data);
                  alert('Template JSON copied!');
                }}
                title="Copy JSON"
                className="h-8 w-8 flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-all shadow-sm cursor-pointer"
              >
                <Copy size={13} />
              </button>
              <button
                title="Sync Status"
                className="h-8 w-8 flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-all shadow-sm cursor-pointer"
              >
                <RefreshCcw size={13} />
              </button>
              <button
                title="Delete"
                className="h-8 w-8 flex items-center justify-center bg-white border border-rose-200 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all shadow-sm cursor-pointer"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          {/* ── Approval timeline ── */}
          <div className="bg-white rounded-lg border border-slate-200 px-5 py-4 shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Approval Progress</p>
            <ApprovalTimeline status={template.status} />
          </div>

          {/* ── Two-column layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

            {/* Left: Content sections */}
            <div className="lg:col-span-7 space-y-3">

              {/* Header */}
              {(hType) && (
                <Section title={`Header — ${hType}`} accent="bg-indigo-500">
                  {hType === 'IMAGE' ? (
                    <div className="rounded-lg overflow-hidden bg-slate-50 border border-slate-100 max-h-[220px] flex items-center justify-center">
                      {hUrl ? (
                        <img src={hUrl} alt="Header" className="w-full h-full object-cover max-h-[220px]" />
                      ) : (
                        <div className="flex flex-col items-center gap-2 py-8 text-slate-300">
                          <ImageIcon size={28} />
                          <span className="text-[9px] font-bold uppercase tracking-wider">No image uploaded</span>
                        </div>
                      )}
                    </div>
                  ) : hType === 'TEXT' ? (
                    <p className="text-sm font-semibold text-slate-700 bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-100">{hText || '—'}</p>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      {hType === 'VIDEO' && <Video size={16} className="text-indigo-400 shrink-0" />}
                      {hType === 'DOCUMENT' && <File size={16} className="text-indigo-400 shrink-0" />}
                      {hType === 'AUDIO' && <Headphones size={16} className="text-indigo-400 shrink-0" />}
                      <span className="text-xs text-slate-500 font-medium">{hType} media {hUrl ? '(uploaded)' : '(no file)'}</span>
                    </div>
                  )}
                </Section>
              )}

              {/* Body */}
              <Section title="Message Body" accent="bg-[#25D366]">
                <div className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2.5 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {bodyText || <span className="text-slate-300 italic">No body content</span>}
                </div>
              </Section>

              {/* Footer */}
              {footerText && (
                <Section title="Footer" accent="bg-slate-300" defaultOpen={false}>
                  <p className="text-xs text-slate-500 bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg">{footerText}</p>
                </Section>
              )}

              {/* Buttons */}
              {template.buttons?.length > 0 && (
                <Section title={`Buttons (${template.buttons.length})`} accent="bg-blue-500" defaultOpen={false}>
                  <div className="flex flex-wrap gap-2">
                    {template.buttons.map((btn, i) => (
                      <div key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg text-xs font-bold text-blue-700">
                        {btn.type === 'PHONE_NUMBER' ? <Phone size={11} /> : btn.type === 'URL' ? <Link2 size={11} /> : <Zap size={11} />}
                        <span>{btn.text}</span>
                        <span className="text-[9px] text-blue-300 font-black uppercase ml-0.5">{btn.type?.replace(/_/g,' ')}</span>
                      </div>
                    ))}
                  </div>
                  {template.buttons.some(b => b.phone_number || b.url) && (
                    <div className="mt-3 space-y-1.5">
                      {template.buttons.filter(b => b.phone_number || b.url).map((btn, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-100 rounded-lg">
                          <span className="text-[9px] font-black text-slate-400 uppercase w-12 shrink-0">{btn.type === 'URL' ? 'URL' : 'Phone'}</span>
                          <span className="text-[10px] font-mono text-slate-600 truncate">{btn.phone_number || btn.url}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Section>
              )}

              {/* Metadata */}
              <div className="bg-white rounded-lg border border-slate-200 px-4 py-3 shadow-sm">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Template Metadata</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: Calendar, label: 'Created', value: createdAt },
                    { icon: RefreshCcw, label: 'Updated', value: updatedAt },
                    { icon: Hash, label: 'ID', value: shortId },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="bg-slate-50 rounded-lg border border-slate-100 px-3 py-2.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon size={10} className="text-slate-400" />
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                      </div>
                      <p className="text-xs font-bold text-slate-700 truncate font-mono">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Sticky phone preview */}
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-4">
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">WhatsApp Preview</p>
                    <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      Live
                    </span>
                  </div>
                  <PhonePreview template={template} />
                  <p className="text-[9px] text-center text-slate-300 font-semibold mt-3">Exact preview as customers will see it</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
