import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Plus,
  CheckCircle2, AlertCircle, RefreshCcw,
  Smartphone, ChevronRight, ChevronLeft, Globe, Layers,
  Image as ImageIcon,
  FileText, Zap,
  Phone, Link2,
  Video, File, Headphones, CheckCheck, User,
  ExternalLink, ShieldCheck, LayoutDashboard, Clock, Target, Upload as UploadIcon,
  Filter, MoreHorizontal, MoreVertical, Eye, X, ArrowLeft, Download, Trash2, Copy
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

// Reusable StatCard matching the circular ring style of the mockup
const StatCard = ({ label, value, color, icon: Icon }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border border-blue-100 ring-4 ring-blue-50/30',
    emerald: 'bg-emerald-50 text-emerald-600 border border-emerald-100 ring-4 ring-emerald-50/30',
    orange: 'bg-orange-50 text-orange-600 border border-orange-100 ring-4 ring-orange-50/30',
    rose: 'bg-rose-50 text-rose-600 border border-rose-100 ring-4 ring-rose-50/30'
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-4 hover:shadow-md transition-all flex-1 min-w-0">
      <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${colors[color] || 'bg-slate-50 text-slate-500'}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 leading-none mb-1">{label}</p>
        <h3 className="text-xl font-bold text-slate-800 leading-none">{value}</h3>
      </div>
    </div>
  );
};

export default function TemplatesPage({ onNavigate, setActiveTab, setSelectedTemplateData }) {
  const [templates, setTemplates] = useState(() => {
    const saved = localStorage.getItem('cached_templates');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(!templates.length);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [langFilter, setLangFilter] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState([]);
  const [drawerTemplate, setDrawerTemplate] = useState(null);
  const [activeActionMenu, setActiveActionMenu] = useState(null);

  const actionMenuRef = useRef(null);
  const drawerRef = useRef(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    if (templates.length === 0) setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/templates`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        const templateList = Array.isArray(data) ? data : [];
        setTemplates(templateList);
        localStorage.setItem('cached_templates', JSON.stringify(templateList));
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
        setActiveActionMenu(null);
      }
      if (drawerRef.current && !drawerRef.current.contains(event.target) && !event.target.closest('tr') && !event.target.closest('.preview-drawer-trigger')) {
        setDrawerTemplate(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm("Are you sure you want to delete this template?")) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        alert("Template deleted successfully!");
        setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
        fetchTemplates();
      } else {
        alert("Failed to delete template.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSyncTemplate = async (templateName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/templates/sync/${templateName}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        alert(`Synced template ${templateName}!`);
        fetchTemplates();
      } else {
        alert("Sync failed.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredTemplates.map(t => t._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectId = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete the ${selectedIds.length} selected templates?`)) return;
    try {
      const token = localStorage.getItem('token');
      await Promise.all(selectedIds.map(id =>
        fetch(`${API_BASE_URL}/templates/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ));
      alert("Selected templates deleted successfully!");
      setSelectedIds([]);
      fetchTemplates();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkSync = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/templates/sync-all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert("Templates synced successfully!");
      setSelectedIds([]);
      fetchTemplates();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkExport = () => {
    const selectedTemplates = templates.filter(t => selectedIds.includes(t._id));
    const jsonStr = JSON.stringify(selectedTemplates, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `whatsapp_templates_export_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = (t.name || '').toLowerCase().includes(searchQuery.toLowerCase());

    let matchesStatus = statusFilter === 'ALL';
    if (!matchesStatus) {
      const s = (t.status || '').toLowerCase();
      if (statusFilter === 'PENDING' || statusFilter === 'PENDING REVIEW') {
        matchesStatus = s.includes('pending') || s.includes('review');
      } else if (statusFilter === 'ADMIN PENDING' || statusFilter === 'PENDING_ADMIN_APPROVAL') {
        matchesStatus = s === 'pending_admin_approval';
      } else if (statusFilter === 'META PENDING' || statusFilter === 'PENDING_META_APPROVAL') {
        matchesStatus = s === 'pending_meta_approval';
      } else {
        matchesStatus = s.toUpperCase() === statusFilter.toUpperCase();
      }
    }

    let matchesCategory = categoryFilter === 'ALL';
    if (!matchesCategory) {
      matchesCategory = (t.category || '').toUpperCase() === categoryFilter.toUpperCase();
    }

    let matchesLang = langFilter === 'ALL';
    if (!matchesLang) {
      matchesLang = (t.language || '').toUpperCase() === langFilter.toUpperCase();
    }

    return matchesSearch && matchesStatus && matchesCategory && matchesLang;
  }).sort((a, b) => (b._id || '').localeCompare(a._id || ''));

  const uniqueCategories = Array.from(new Set([
    'ALL', 
    'MARKETING', 
    'UTILITY', 
    'AUTHENTICATION', 
    ...templates.map(t => (t.category || '').toUpperCase()).filter(Boolean)
  ]));

  const uniqueLanguages = Array.from(new Set([
    'ALL', 
    'EN_US', 
    'EN_GB', 
    'ES', 
    'PT', 
    'HI', 
    ...templates.map(t => (t.language || '').toUpperCase()).filter(Boolean)
  ]));

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'pending_admin_approval') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
          Pending Admin
        </span>
      );
    }
    if (s === 'pending_meta_approval') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200 uppercase tracking-wider">
          Pending Review
        </span>
      );
    }
    if (s === 'approved') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
          Approved
        </span>
      );
    }
    if (s === 'rejected') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider">
          Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-50 text-slate-600 border border-slate-200 uppercase tracking-wider">
        Draft
      </span>
    );
  };

  const getMetaStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'pending_admin_approval') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-50 text-slate-500 border border-slate-200 uppercase tracking-wider">
          Draft
        </span>
      );
    }
    if (s === 'pending_meta_approval') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
          In Review
        </span>
      );
    }
    if (s === 'approved') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
          Approved
        </span>
      );
    }
    if (s === 'rejected') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider">
          Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-50 text-slate-500 border border-slate-200 uppercase tracking-wider">
        Draft
      </span>
    );
  };

  const formatUpdatedDate = (dateVal) => {
    if (!dateVal) return { date: 'N/A', time: '' };
    try {
      const d = new Date(dateVal);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      return { date: dateStr, time: timeStr };
    } catch {
      return { date: dateVal, time: '' };
    }
  };

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    alert("Copied ID to clipboard!");
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] overflow-hidden relative">
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar pb-24">
        {/* Page Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">Templates</h1>
            <p className="text-xs text-slate-400 font-semibold leading-none mt-2">Manage your templates</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSync}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 h-10 px-4 bg-white border border-slate-200 hover:bg-slate-50 active:scale-98 text-slate-600 text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer shrink-0 disabled:opacity-50"
            >
              <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Sync Meta</span>
            </button>
            <button
              onClick={() => onNavigate('/templates/create')}
              className="flex items-center justify-center gap-1.5 h-10 px-4 bg-[#25D366] hover:brightness-105 active:scale-98 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer shrink-0"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Create Template</span>
            </button>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
              <Layers size={20} />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-semibold leading-none mb-1.5">Total Templates</p>
              <h3 className="text-xl font-bold text-slate-900 leading-none">{templates.length}</h3>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-semibold leading-none mb-1.5">Approved</p>
              <h3 className="text-xl font-bold text-slate-900 leading-none">
                {templates.filter(t => (t.status || '').toLowerCase() === 'approved').length}
              </h3>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-semibold leading-none mb-1.5">Pending</p>
              <h3 className="text-xl font-bold text-slate-900 leading-none">
                {templates.filter(t => (t.status || '').toLowerCase().includes('pending')).length}
              </h3>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-semibold leading-none mb-1.5">Rejected</p>
              <h3 className="text-xl font-bold text-slate-900 leading-none">
                {templates.filter(t => (t.status || '').toLowerCase() === 'rejected').length}
              </h3>
            </div>
          </div>
        </div>

        {/* Search & Filters Row */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3 bg-white border border-slate-200 rounded-lg p-2.5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full lg:w-auto">
            {/* Search Box */}
            <div className="relative w-full sm:w-60">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 h-8 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-[#25D366]/20 outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Category Dropdown */}
            <div className="relative w-full sm:w-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full sm:w-36 pl-3 pr-8 h-8 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-655 outline-none cursor-pointer appearance-none animate-in fade-in"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748B\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '10px' }}
              >
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat === 'ALL' ? 'All Categories' : cat}</option>
                ))}
              </select>
            </div>

            {/* Language Dropdown */}
            <div className="relative w-full sm:w-auto">
              <select
                value={langFilter}
                onChange={(e) => setLangFilter(e.target.value)}
                className="w-full sm:w-36 pl-3 pr-8 h-8 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-655 outline-none cursor-pointer appearance-none animate-in fade-in"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748B\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '10px' }}
              >
                {uniqueLanguages.map(lang => (
                  <option key={lang} value={lang}>{lang === 'ALL' ? 'All Languages' : lang}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Right Status Tabs */}
          <div className="flex items-center bg-slate-50 p-1 rounded-lg border border-slate-200/60 w-full lg:w-auto overflow-x-auto no-scrollbar gap-0.5">
            {['ALL', 'ADMIN PENDING', 'META PENDING', 'APPROVED', 'REJECTED'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`flex-1 lg:flex-initial text-center px-3.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${statusFilter === status
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Template Table Container */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          {loading && templates.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <RefreshCcw className="animate-spin text-[#25D366]" size={24} />
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Loading Templates</p>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-20 bg-white">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <FileText size={24} className="text-slate-300" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No templates found</h3>
              <p className="text-slate-400 text-xs max-w-xs mx-auto mt-1">We couldn't find any templates matching your search or filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar min-h-[280px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-slate-400 font-bold uppercase text-[9px] tracking-wider border-b border-slate-200 bg-slate-50/70 select-none">
                    <th className="py-3 px-4 font-bold text-center w-12">
                      <input
                        type="checkbox"
                        checked={filteredTemplates.length > 0 && selectedIds.length === filteredTemplates.length}
                        onChange={handleSelectAll}
                        className="rounded border-slate-300 text-[#25D366] focus:ring-[#25D366]"
                      />
                    </th>
                    <th className="py-3 px-4 font-bold">Template Name</th>
                    <th className="py-3 px-2 font-bold">Category</th>
                    <th className="py-3 px-2 font-bold">Language</th>
                    <th className="py-3 px-2 font-bold">Status</th>
                    <th className="py-3 px-2 font-bold">Last Updated</th>
                    <th className="py-3 px-4 font-bold text-center w-20">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTemplates.map((template, idx) => {
                    return (
                      <tr
                        key={template._id}
                        onClick={() => setDrawerTemplate(template)}
                        className={`hover:bg-slate-50/50 transition-colors group cursor-pointer ${drawerTemplate?._id === template._id ? 'bg-slate-50' : ''
                          }`}
                      >
                        {/* Checkbox cell */}
                        <td className="py-3 px-4 text-center w-12" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(template._id)}
                            onChange={() => handleSelectId(template._id)}
                            className="rounded border-slate-300 text-[#25D366] focus:ring-[#25D366]"
                          />
                        </td>

                        {/* Name & Content Preview */}
                        <td className="py-3 px-4 text-slate-800 font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                              {template.header?.type === 'IMAGE' ? <ImageIcon size={16} /> : <FileText size={16} />}
                            </div>
                            <div className="truncate max-w-[280px]">
                              <div className="font-bold text-[#003B6D] text-sm truncate" title={template.name}>
                                {template.name}
                              </div>
                              <span className="text-[10px] text-slate-400 truncate block mt-0.5" title={template.content}>
                                {template.content || 'No content preview'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#EBF3FE] text-[#1B72E8] uppercase tracking-wider">
                            {template.category || 'marketing'}
                          </span>
                        </td>

                        {/* Language */}
                        <td className="py-3 px-2 text-slate-600 font-semibold text-xs uppercase whitespace-nowrap">
                          {template.language || 'EN_US'}
                        </td>

                        {/* Status Badge */}
                        <td className="py-3 px-2 whitespace-nowrap">
                          {getStatusBadge(template.status)}
                        </td>

                        {/* Meta Status Badge */}
                        <td className="py-3 px-2 whitespace-nowrap">
                          {getMetaStatusBadge(template.status)}
                        </td>

                        {/* Variables */}
                        <td className="py-3 px-2 text-slate-600 font-semibold text-xs whitespace-nowrap">
                          {template.variables && template.variables.length > 0
                            ? template.variables.map(v => `{{${v}}}`).join(', ')
                            : '-'}
                        </td>

                        {/* Last Updated */}
                        <td className="py-3 px-2 whitespace-nowrap">
                          {(() => {
                            const dateInfo = formatUpdatedDate(template.updatedAt || template.createdAt);
                            return (
                              <div>
                                <div className="font-bold text-slate-800 text-xs">{dateInfo.date}</div>
                                <div className="text-[10px] text-slate-400 font-semibold block mt-0.5 leading-none">{dateInfo.time}</div>
                              </div>
                            );
                          })()}
                        </td>

                        {/* Actions button (⋮) */}
                        <td className="py-3 px-4 text-center w-20 relative" onClick={(e) => e.stopPropagation()}>
                          <div className="inline-block relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveActionMenu(activeActionMenu === template._id ? null : template._id);
                              }}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-650 transition-colors active:scale-95"
                            >
                              <MoreVertical size={16} />
                            </button>

                            {activeActionMenu === template._id && (() => {
                              const isLastRow = filteredTemplates.length > 2 && idx >= filteredTemplates.length - 2;
                              return (
                                <div
                                  ref={actionMenuRef}
                                  className={`absolute right-0 w-36 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1.5 text-left animate-in fade-in duration-150 ${
                                    isLastRow 
                                      ? 'bottom-full mb-1 slide-in-from-bottom-1' 
                                      : 'top-full mt-1 slide-in-from-top-1'
                                  }`}
                                >
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDrawerTemplate(template);
                                      setActiveActionMenu(null);
                                    }}
                                    className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                                  >
                                    <Eye size={13} />
                                    <span>Preview</span>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSyncTemplate(template.name);
                                      setActiveActionMenu(null);
                                    }}
                                    className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                                  >
                                    <RefreshCcw size={13} />
                                    <span>Sync Status</span>
                                  </button>
                                  <div className="border-t border-slate-100 my-1"></div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteTemplate(template._id);
                                      setActiveActionMenu(null);
                                    }}
                                    className="w-full px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-bold"
                                  >
                                    <Trash2 size={13} />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              );
                            })()}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Right-Side Sliding Preview Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-[360px] bg-white border-l border-slate-200 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${drawerTemplate ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="h-14 border-b border-slate-100 flex items-center justify-between px-4 shrink-0">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-slate-800 text-sm leading-none">Template Preview</h3>
            <p className="text-[10px] text-slate-400 font-medium truncate max-w-[200px] mt-0.5">{drawerTemplate?.name}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                if (drawerTemplate) {
                  localStorage.setItem('selectedTemplateData', JSON.stringify(drawerTemplate));
                  if (setSelectedTemplateData) setSelectedTemplateData(drawerTemplate);
                  if (setActiveTab) setActiveTab('Template Details');
                }
              }}
              className="h-7 px-2.5 text-[10px] font-bold text-[#003B6D] border border-[#003B6D]/20 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all cursor-pointer whitespace-nowrap"
            >
              View Details →
            </button>
            <button
              onClick={() => setDrawerTemplate(null)}
              className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-650 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50 p-4 flex flex-col items-center justify-start gap-4">
          {drawerTemplate ? (
            <div className="relative w-full max-w-[290px] bg-slate-950 rounded-[2.5rem] p-1.5 border-[4px] border-slate-800 shadow-xl overflow-hidden aspect-[9/18]">
              <div className="w-full h-full bg-[#E5DDD5] rounded-[2.2rem] overflow-hidden flex flex-col relative">
                {/* Header Mockup */}
                <div className="h-12 bg-[#075E54] flex items-center px-4 gap-2 shrink-0">
                  <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                    <User size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-[10px] font-bold leading-none truncate">Maneun Business</p>
                    <p className="text-white/60 text-[7px] font-medium mt-0.5 uppercase tracking-widest leading-none">Official Account</p>
                  </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 p-3 overflow-y-auto no-scrollbar relative pt-4">
                  <div className="bg-white rounded-lg rounded-tl-none shadow-sm overflow-hidden relative z-10 border border-slate-200/50">
                    {/* Media Header (if applicable) */}
                    {(() => {
                      const hType = drawerTemplate.header?.type || drawerTemplate.headerType;
                      const hUrl = drawerTemplate.header?.media_url || drawerTemplate.previewUrl;
                      if (['IMAGE', 'VIDEO', 'DOCUMENT', 'AUDIO'].includes(hType)) {
                        return (
                          <div className="aspect-video bg-slate-100 flex items-center justify-center text-slate-300 relative overflow-hidden">
                            {hUrl ? (
                              <>
                                {hType === 'IMAGE' && <img src={hUrl} className="w-full h-full object-cover" alt="preview" />}
                                {hType === 'VIDEO' && <video src={hUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />}
                                {hType === 'DOCUMENT' && <File size={24} className="text-indigo-550" />}
                                {hType === 'AUDIO' && <Headphones size={24} className="text-indigo-550" />}
                              </>
                            ) : (
                              <div className="flex flex-col items-center gap-1.5 opacity-50">
                                {hType === 'IMAGE' && <ImageIcon size={20} />}
                                {hType === 'VIDEO' && <Video size={20} />}
                                {hType === 'DOCUMENT' && <File size={20} />}
                                {hType === 'AUDIO' && <Headphones size={20} />}
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })()}

                    <div className="p-2.5">
                      {/* Text Header (if applicable) */}
                      {(() => {
                        const hType = drawerTemplate.header?.type || drawerTemplate.headerType;
                        const hText = drawerTemplate.header?.text || drawerTemplate.headerText;
                        if (hType === 'TEXT' && hText) {
                          return <p className="text-[10px] font-bold text-slate-900 mb-1 leading-tight">{hText}</p>;
                        }
                        return null;
                      })()}

                      {/* Body Content */}
                      <div className="text-[10px] text-slate-800 leading-relaxed whitespace-pre-wrap">
                        {(() => {
                          const text = drawerTemplate.content || "Template message body content...";
                          const parts = text.split(/(\{\{[^}]+\}\})/g);
                          return parts.map((part, i) =>
                            part.startsWith('{{') ? (
                              <span key={i} className="px-1 py-0.5 bg-[#E7F6EE] text-[#128C7E] font-bold rounded border border-[#25D366]/20 mx-0.5 italic">{part}</span>
                            ) : part
                          );
                        })()}
                      </div>

                      {/* Footer */}
                      {drawerTemplate.footer && (
                        <p className="text-[8px] text-slate-400 mt-1.5 border-t border-slate-50 pt-1 leading-tight">{drawerTemplate.footer}</p>
                      )}

                      {/* Time & Tick */}
                      <div className="flex justify-end mt-1">
                        <span className="text-[7px] text-slate-300 font-bold flex items-center gap-0.5">10:45 AM <CheckCheck size={8} /></span>
                      </div>
                    </div>

                    {/* Buttons */}
                    {drawerTemplate.buttons?.length > 0 && (
                      <div className="border-t border-slate-100 divide-y divide-slate-100">
                        {drawerTemplate.buttons.map((btn, i) => (
                          <div key={i} className="py-2 px-3 flex items-center justify-center gap-1.5 text-[#00a5f4] font-bold text-[9px] hover:bg-slate-50 transition-colors">
                            {btn.type === 'PHONE_NUMBER' ? <Phone size={10} /> : (btn.type === 'URL' ? <Link2 size={10} /> : null)}
                            <span>{btn.text || 'Action Button'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {/* Bottom line mock */}
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-20 h-1 bg-black/10 rounded-full"></div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400 text-xs">
              Select a template row to view live preview.
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 shadow-2xl text-white rounded-2xl px-6 py-3.5 flex items-center gap-6 z-40 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center gap-2 border-r border-slate-800 pr-6">
            <span className="w-5 h-5 rounded-full bg-[#25D366] text-slate-950 font-black text-[10px] flex items-center justify-center">
              {selectedIds.length}
            </span>
            <span className="text-xs font-semibold text-slate-300">Selected</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleBulkSync}
              className="flex items-center gap-1.5 px-3.5 py-1.5 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all active:scale-95"
            >
              <RefreshCcw size={14} />
              <span>Sync All</span>
            </button>
            <button
              onClick={handleBulkExport}
              className="flex items-center gap-1.5 px-3.5 py-1.5 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all active:scale-95"
            >
              <Download size={14} />
              <span>Export Metadata</span>
            </button>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg text-xs font-bold transition-all active:scale-95"
            >
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
          </div>

          <button
            onClick={() => setSelectedIds([])}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}