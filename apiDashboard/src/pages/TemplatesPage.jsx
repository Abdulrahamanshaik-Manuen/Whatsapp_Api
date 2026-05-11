import React, { useState, useEffect } from 'react';
import {
  Search, Plus,
  CheckCircle2, AlertCircle, RefreshCcw,
  Smartphone, ChevronRight, Globe, Layers,
  Image as ImageIcon,
  FileText, Zap,
  Phone, Link2,
  Video, File, Headphones, CheckCheck, User,
  ExternalLink, ShieldCheck, LayoutDashboard, Clock, Target, Upload as UploadIcon,
  Filter, MoreHorizontal, Eye, X, ArrowLeft
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Refined WhatsApp Mockup (Now used in Modal)
const MessagePreview = ({ template, onClose }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
    <div className="relative animate-in zoom-in-95 duration-300">
      <button
        onClick={onClose}
        className="absolute -top-12 right-0 p-2 text-white hover:text-slate-200 transition-colors bg-white/10 rounded-full"
      >
        <X size={24} />
      </button>

      <div className="relative w-[300px] h-[600px] bg-slate-950 rounded-[3.2rem] p-2 border-[4px] border-slate-800 shadow-2xl overflow-hidden">
        <div className="w-full h-full bg-[#E5DDD5] rounded-[2.8rem] overflow-hidden flex flex-col relative">
          {/* Header Mockup */}
          <div className="h-16 bg-[#075E54] flex items-center px-5 gap-3 shrink-0">
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
              <User size={18} />
            </div>
            <div>
              <p className="text-white text-[12px] font-bold leading-none">Maneun Business</p>
              <p className="text-white/60 text-[8px] font-medium mt-1 uppercase tracking-widest">Official Account</p>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto no-scrollbar relative pt-8">
            <div className="bg-white rounded-xl rounded-tl-none shadow-sm overflow-hidden relative z-10">
              {(() => {
                const hType = template.header?.type || template.headerType;
                const hUrl = template.header?.media_url || template.previewUrl;
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

              <div className="p-3.5">
                {(() => {
                  const hType = template.header?.type || template.headerType;
                  const hText = template.header?.text || template.headerText;
                  if (hType === 'TEXT' && hText) {
                    return <p className="text-[12px] font-bold text-slate-900 mb-2">{hText}</p>;
                  }
                  return null;
                })()}

                <div className="text-[12px] text-slate-800 leading-relaxed whitespace-pre-wrap">
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

                {template.footer && <p className="text-[10px] text-slate-400 mt-2 border-t border-slate-50 pt-2">{template.footer}</p>}

                <div className="flex justify-end mt-1.5">
                  <span className="text-[8px] text-slate-300 font-bold flex items-center gap-1">10:45 AM <CheckCheck size={10} /></span>
                </div>
              </div>

              {template.buttons?.length > 0 && (
                <div className="border-t border-slate-100 divide-y divide-slate-100">
                  {template.buttons.map((btn, i) => (
                    <div key={i} className="py-3 px-4 flex items-center justify-center gap-2 text-[#00a5f4] font-bold text-[11px]">
                      {btn.type === 'PHONE_NUMBER' ? <Phone size={12} /> : (btn.type === 'URL' ? <Link2 size={12} /> : null)}
                      <span>{btn.text || 'Action Button'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-black/10 rounded-full"></div>
        </div>
      </div>
    </div>
  </div>
);

// Reusable StatCard (Subtle Stripe Style)
const StatCard = ({ label, value, color, icon: Icon }) => {
  const colorMap = {
    emerald: 'text-emerald-500 bg-emerald-50',
    blue: 'text-blue-500 bg-blue-50',
    orange: 'text-orange-500 bg-orange-50',
    rose: 'text-rose-500 bg-rose-50',
    indigo: 'text-indigo-500 bg-indigo-50',
  };

  return (
    <div className="bg-white p-5 rounded-2xl md:rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group">
      <div className={`w-12 h-12 rounded-xl ${colorMap[color]} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}>
        <Icon size={20} strokeWidth={2.5} />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</span>
        <h3 className="text-2xl font-black text-[#003B6D] tracking-tight leading-none">{value}</h3>
      </div>
    </div>
  );
};

export default function TemplatesPage({ onNavigate }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/templates`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setTemplates(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch templates:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleSync = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/templates/sync-all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        await fetchTemplates();
      }
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = (t.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || (t.status || '').toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9FAFB] custom-scrollbar">
      {/* 🎨 1. Clean Header Section */}
      <div className="px-8 pt-8 pb-2">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              Templates
              <div className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-md">WABA</div>
            </h1>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Manage your WhatsApp message templates easily</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSync}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
              Sync Meta
            </button>
            <button
              onClick={() => onNavigate('/templates/create')}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#25D366] text-white text-sm font-bold rounded-xl hover:brightness-105 transition-all shadow-lg shadow-[#25D366]/20 active:scale-95"
            >
              <Plus size={18} strokeWidth={3} />
              Create Template
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 pt-2 pb-8">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard label="Total" value={templates.length} color="blue" icon={Layers} />
            <StatCard label="Approved" value={templates.filter(t => t.status?.toUpperCase() === 'APPROVED').length} color="emerald" icon={CheckCircle2} />
            <StatCard label="Pending" value={templates.filter(t => t.status?.toUpperCase() === 'PENDING').length} color="orange" icon={Clock} />
            <StatCard label="Rejected" value={templates.filter(t => t.status?.toUpperCase() === 'REJECTED').length} color="rose" icon={AlertCircle} />
          </div>

          {/* 🔍 5. Search + Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#25D366] transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search templates by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-[#25D366]/5 focus:border-[#25D366] transition-all"
              />
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-slate-50 border border-slate-100 rounded-xl">
              {['ALL', 'APPROVED', 'PENDING', 'REJECTED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] rounded-lg transition-all ${statusFilter === status
                    ? status === 'APPROVED' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : status === 'REJECTED' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                        : status === 'PENDING' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                          : 'bg-[#003B6D] text-white shadow-lg shadow-[#003B6D]/20'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                    }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* 📦 2. Card Grid Layout */}
          {loading && templates.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 h-56 animate-pulse">
                  <div className="flex gap-4 mb-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl"></div>
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3 bg-slate-100 rounded w-3/4"></div>
                      <div className="h-2 bg-slate-100 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-slate-50 rounded"></div>
                    <div className="h-2 bg-slate-50 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-32 bg-white rounded-[2rem] border border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText size={32} className="text-slate-200" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No templates found</h3>
              <p className="text-slate-400 text-sm max-w-xs mx-auto mt-2">We couldn't find any templates matching your search or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map(template => (
                <div
                  key={template._id}
                  className="bg-white rounded-[1.5rem] border border-slate-200/60 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4 mb-5 min-w-0">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                        {template.header?.type === 'IMAGE' ? <ImageIcon size={22} /> : <FileText size={22} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3
                          className="font-black text-slate-900 tracking-tight leading-tight line-clamp-2 break-all"
                          title={template.name}
                        >
                          {template.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                          {template.category} • {template.language || 'EN'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Message Preview */}
                  <div className="flex-1 bg-slate-50/50 rounded-2xl p-4 mb-6 border border-slate-100 group-hover:bg-white transition-colors">
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 italic">
                      "{template.content?.replace(/\{\{[^}]+\}\}/g, '...') || 'No content preview'}"
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    {/* Status Badge */}
                    {(() => {
                      const status = (template.status || 'PENDING').toUpperCase();
                      const styles = {
                        APPROVED: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                        PENDING: 'bg-amber-50 text-amber-600 border-amber-100',
                        REJECTED: 'bg-rose-50 text-rose-600 border-rose-100'
                      };
                      return (
                        <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${styles[status] || styles.PENDING}`}>
                          {status}
                        </span>
                      );
                    })()}

                    <button
                      onClick={() => onNavigate('/templates/view', template)}
                      className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-bold text-xs transition-colors"
                    >
                      <Eye size={14} />
                      Preview
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}