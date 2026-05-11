import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Filter, Plus, MessageSquare,
  CheckCircle2, AlertCircle, RefreshCcw,
  Smartphone, ChevronRight, Globe, Layers,
  Trash2, ExternalLink, Image as ImageIcon,
  Type, FileText, PlayCircle, MousePointer2,
  Clock, Target, LayoutDashboard, Menu, Loader2, Zap,
  X, Send, ShieldCheck, Info, Phone, Link2,
  Video, File, Headphones, Upload, CheckCheck, User,
  MoreVertical, Eye
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Reusable StatCard
const StatCard = ({ label, value, color, icon: Icon }) => {
  const colors = {
    primary: 'from-emerald-500/10 to-teal-500/10 text-emerald-600 border-emerald-100',
    secondary: 'from-blue-500/10 to-indigo-500/10 text-blue-600 border-blue-100',
    orange: 'from-orange-500/10 to-amber-500/10 text-orange-600 border-orange-100'
  };

  return (
    <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
      <div className="flex items-center gap-4 relative z-10">
        <div className={`w-12 h-12 bg-gradient-to-br ${colors[color]} rounded-2xl flex items-center justify-center shadow-sm`}>
          <Icon size={22} />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
          <p className="text-xl font-black text-slate-900 tracking-tight leading-none">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/templates`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        const templateList = Array.isArray(data) ? data : [];
        setTemplates(templateList);
        if (templateList.length > 0 && !selectedTemplate) {
          setSelectedTemplate(templateList[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch templates:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/templates/sync-all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) fetchTemplates();
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || (t.status || '').toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Refined WhatsApp Mockup
  const MessagePreview = ({ template, previewUrl }) => (
    <div className="relative w-[260px] h-[520px] bg-slate-900 rounded-[3rem] p-2.5 border-[8px] border-slate-900 shadow-2xl shrink-0 overflow-hidden">
      <div className="w-full h-full bg-[#E5DDD5] rounded-[2.3rem] overflow-hidden flex flex-col relative">
        {/* Dynamic Island */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-50"></div>

        {/* Header Mockup */}
        <div className="h-14 bg-[#075E54] flex items-center px-4 gap-3 shrink-0 pt-4">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
            <User size={16} />
          </div>
          <div>
            <p className="text-white text-[11px] font-bold leading-none">Maneun Business</p>
            <p className="text-white/60 text-[8px] font-medium mt-1 uppercase tracking-widest">Official Account</p>
          </div>
        </div>

        <div className="flex-1 p-3 overflow-y-auto no-scrollbar relative pt-6">
          <div className="bg-white rounded-xl rounded-tl-none shadow-sm overflow-hidden relative z-10">
            {(() => {
              const hType = template.header?.type || template.headerType;
              const hUrl = previewUrl || template.header?.media_url;
              if (['IMAGE', 'VIDEO', 'DOCUMENT', 'AUDIO'].includes(hType)) {
                return (
                  <div className="aspect-video bg-slate-100 flex items-center justify-center text-slate-300 relative overflow-hidden">
                    {hUrl ? (
                      <>
                        {hType === 'IMAGE' && <img src={hUrl} className="w-full h-full object-cover" />}
                        {hType === 'VIDEO' && <video src={hUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />}
                        {hType === 'DOCUMENT' && <File size={32} className="text-indigo-400" />}
                        {hType === 'AUDIO' && <Headphones size={32} className="text-indigo-400" />}
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2 opacity-50">
                        {hType === 'IMAGE' && <ImageIcon size={28} />}
                        {hType === 'VIDEO' && <Video size={28} />}
                        {hType === 'DOCUMENT' && <File size={28} />}
                        {hType === 'AUDIO' && <Headphones size={28} />}
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            })()}

            <div className="p-3">
              {(() => {
                const hType = template.header?.type || template.headerType;
                const hText = template.header?.text || template.headerText;
                if (hType === 'TEXT' && hText) {
                  return <p className="text-[11px] font-bold text-slate-900 mb-2">{hText}</p>;
                }
                return null;
              })()}

              <div className="text-[11px] text-slate-800 leading-relaxed whitespace-pre-wrap">
                {(() => {
                  const text = template.content || "Template message body content...";
                  const parts = text.split(/(\{\{[^}]+\}\})/g);
                  return parts.map((part, i) =>
                    part.startsWith('{{') ? (
                      <span key={i} className="px-1 py-0.5 bg-[#E7F6EE] text-[#128C7E] font-bold rounded border border-[#25D366]/20 mx-0.5 italic">{part}</span>
                    ) : part
                  );
                })()}
              </div>

              {template.footer && <p className="text-[9px] text-slate-400 mt-2 border-t border-slate-50 pt-1.5">{template.footer}</p>}

              <div className="flex justify-end mt-1">
                <span className="text-[7px] text-slate-300 font-bold flex items-center gap-1">10:45 AM <CheckCheck size={10} /></span>
              </div>
            </div>

            {template.buttons?.length > 0 && (
              <div className="border-t border-slate-100 divide-y divide-slate-100">
                {template.buttons.map((btn, i) => (
                  <div key={i} className="py-2.5 px-4 flex items-center justify-center gap-2 text-[#00a5f4] font-bold text-[10px]">
                    {btn.type === 'PHONE_NUMBER' ? <Phone size={10} /> : (btn.type === 'URL' ? <Link2 size={10} /> : null)}
                    <span>{btn.text || 'Action Button'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-black/10 rounded-full"></div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Refined Header */}
      <div className="shrink-0 px-8 py-5 flex items-center justify-between border-b border-slate-100 bg-white z-20">
        <div className="flex items-center gap-8">
          <div className="space-y-0.5">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Template Library</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
              <ShieldCheck size={12} className="text-[#25D366]" /> Official Meta Sync
            </p>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 bg-slate-50 p-1 rounded-2xl border border-slate-100">
            {['ALL', 'APPROVED', 'PENDING', 'REJECTED'].map(filter => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${statusFilter === filter ? 'bg-white text-[#25D366] shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={15} />
            <input
              type="text"
              placeholder="Search library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-4 py-2 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold focus:bg-white focus:ring-4 focus:ring-[#25D366]/5 focus:border-[#25D366] transition-all w-56"
            />
          </div>
          <button onClick={handleSync} className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-[#25D366] transition-all">
            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button className="px-6 py-2.5 bg-[#25D366] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#25D366]/20 flex items-center gap-2 hover:brightness-105 active:scale-95 transition-all">
            <Plus size={16} /> New Template
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden p-6 gap-6">
        {/* Left Column: Template List (Scrollable Cards) */}
        <div className="w-[340px] shrink-0 flex flex-col gap-4 overflow-y-auto no-scrollbar pb-10">
          <div className="grid grid-cols-1 gap-4">
             <div className="grid grid-cols-2 gap-3">
               <StatCard label="Approved" value={templates.filter(t => t.status === 'APPROVED' || t.status === 'approved').length} color="primary" icon={CheckCircle2} />
               <StatCard label="Total" value={templates.length} color="secondary" icon={Layers} />
             </div>

             {loading && templates.length === 0 ? (
               Array(5).fill(0).map((_, i) => (
                 <div key={i} className="bg-white p-5 rounded-[2rem] border border-slate-100 animate-pulse h-20"></div>
               ))
             ) : (
               filteredTemplates.map(template => (
                 <button
                   key={template._id}
                   onClick={() => setSelectedTemplate(template)}
                   className={`p-5 rounded-[2rem] text-left transition-all flex flex-col gap-4 border-2 shadow-sm ${selectedTemplate?._id === template._id ? 'border-[#25D366] bg-white shadow-xl shadow-[#25D366]/5' : 'border-white bg-white hover:border-slate-100 hover:shadow-md'}`}
                 >
                   <div className="flex items-center justify-between">
                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${selectedTemplate?._id === template._id ? 'bg-[#E7F6EE] text-[#25D366]' : 'bg-slate-50 text-slate-300'}`}>
                       {template.header?.type === 'IMAGE' ? <ImageIcon size={22} /> : <FileText size={22} />}
                     </div>
                     <ChevronRight size={18} className={`transition-all ${selectedTemplate?._id === template._id ? 'text-[#25D366] translate-x-1' : 'text-slate-200'}`} />
                   </div>
                   <div className="min-w-0">
                     <h3 className={`text-sm font-black truncate mb-2 ${selectedTemplate?._id === template._id ? 'text-slate-900' : 'text-slate-600'}`}>{template.name}</h3>
                     <div className="flex items-center gap-2">
                       <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${(template.status === 'APPROVED' || template.status === 'approved') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                         {template.status}
                       </span>
                       <span className="px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-slate-50 text-slate-400 border border-slate-100">
                         {template.category}
                       </span>
                     </div>
                   </div>
                 </button>
               ))
             )}
          </div>
        </div>

        {/* Center Column: Detailed Specs */}
        <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col p-8 overflow-y-auto no-scrollbar">
          {selectedTemplate ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedTemplate.name}</h2>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-xl text-[#25D366]">
                      <Globe size={11} />
                      <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{selectedTemplate.language}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-xl text-[#25D366]">
                      <Layers size={11} />
                      <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{selectedTemplate.category}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl hover:text-[#25D366] transition-colors border border-slate-100"><RefreshCcw size={18} /></button>
                </div>
              </div>

              <div className="flex items-center gap-6 mb-4 py-3 px-6 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex flex-col gap-1">
                   <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Header</label>
                   <div className="flex items-center gap-2 text-slate-600 font-bold">
                      <ImageIcon size={14} className="text-[#25D366]" />
                      <span className="text-xs uppercase tracking-wider">{selectedTemplate.header?.type || 'NONE'}</span>
                   </div>
                </div>
                <div className="w-[1px] h-8 bg-slate-100"></div>
                <div className="flex flex-col gap-1">
                   <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Status</label>
                   <div className={`flex items-center gap-2 font-bold ${(selectedTemplate.status === 'APPROVED' || selectedTemplate.status === 'approved') ? 'text-emerald-500' : 'text-orange-500'}`}>
                      <CheckCircle2 size={14} />
                      <span className="text-xs uppercase tracking-widest">{selectedTemplate.status}</span>
                   </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Message Payload</label>
                <div className="bg-[#0F172A] rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#25D366]/5 rounded-full blur-3xl"></div>
                  <p className="text-slate-300 font-medium text-base leading-relaxed relative z-10 whitespace-pre-wrap">{selectedTemplate.content}</p>
                  {selectedTemplate.footer && (
                    <p className="mt-8 pt-6 border-t border-white/5 text-[11px] text-slate-500 font-bold uppercase tracking-widest leading-none">{selectedTemplate.footer}</p>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center opacity-30 gap-6">
              <LayoutDashboard size={64} className="text-slate-200" />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Select a template to view details</p>
            </div>
          )}
        </div>

        {/* Right Column: Visualization */}
        <div className="w-[300px] shrink-0 flex flex-col items-center gap-2 no-scrollbar overflow-y-auto pb-10">
          <label className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] flex items-center gap-2">
            <Eye size={12} /> Device Visualization
          </label>
          {selectedTemplate ? (
            <MessagePreview template={selectedTemplate} />
          ) : (
            <div className="w-[280px] h-[580px] bg-slate-50 rounded-[2.8rem] border-[3px] border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-200">
              <Smartphone size={48} />
              <p className="text-[10px] font-bold uppercase tracking-widest mt-4">Preview Device</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
