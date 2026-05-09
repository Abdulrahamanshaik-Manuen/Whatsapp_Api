import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Filter, Plus, MessageSquare,
  CheckCircle2, AlertCircle, RefreshCcw,
  Smartphone, ChevronRight, Globe, Layers,
  Trash2, ExternalLink, Image as ImageIcon,
  Type, FileText, PlayCircle, MousePointer2,
  Clock, Target, LayoutDashboard, Menu, Loader2, Zap,
  X, Send, ShieldCheck, Info, Phone, Link2,
  Video, File, Headphones, Upload, CheckCheck, User
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

// Reusable StatCard
const StatCard = ({ label, value, color, icon: Icon }) => {
  const colors = {
    indigo: 'from-indigo-500/10 to-purple-500/10 text-indigo-600 border-indigo-100',
    emerald: 'from-emerald-500/10 to-teal-500/10 text-emerald-600 border-emerald-100',
    blue: 'from-blue-500/10 to-cyan-500/10 text-blue-600 border-blue-100',
    purple: 'from-purple-500/10 to-pink-500/10 text-purple-600 border-purple-100',
    orange: 'from-orange-500/10 to-amber-500/10 text-orange-600 border-orange-100'
  };

  return (
    <div className={`bg-white p-5 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300`}>
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br ${colors[color]} opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`}></div>
      <div className="flex items-center gap-4 relative z-10">
        <div className={`w-12 h-12 bg-gradient-to-br ${colors[color]} rounded-xl flex items-center justify-center`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
          <p className="text-2xl font-black text-slate-800 tracking-tight leading-none">{value}</p>
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

  // Create Template States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaHandle, setMediaHandle] = useState('');
  const [mediaPreview, setMediaPreview] = useState(null);
  const fileInputRef = useRef(null);

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    category: 'MARKETING',
    content: '',
    language: 'en_US',
    headerType: 'NONE',
    headerText: '',
    footer: '',
    buttons: []
  });

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
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Synchronization failed");
      }

      fetchTemplates();
      alert(`Templates synchronized successfully! (Sync Version: ${data.sync_version || '1.0'})`);
    } catch (err) {
      console.error("Sync failed:", err);
      alert(`Sync Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingMedia(true);
    setMediaPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/templates/upload-sample`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();
      if (response.ok) {
        setMediaHandle(data.handle);
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (err) {
      alert("An error occurred during upload.");
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleCreateTemplate = async (directSubmit = false) => {
    if (!newTemplate.name || !newTemplate.content) {
      alert("Please fill in the template name and content.");
      return;
    }

    if (['IMAGE', 'VIDEO', 'DOCUMENT', 'AUDIO'].includes(newTemplate.headerType) && !mediaHandle) {
      alert("A media sample is required for this header type.");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/templates/request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newTemplate,
          mediaHandle,
          directSubmit
        })
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        setShowCreateModal(false);
        resetForm();
        fetchTemplates();
      } else {
        alert(data.error || "Failed to create template");
      }
    } catch (err) {
      alert("An error occurred during submission.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewTemplate({
      name: '', category: 'MARKETING', content: '',
      language: 'en_US', headerType: 'NONE', headerText: '',
      footer: '', buttons: []
    });
    setMediaHandle('');
    setMediaPreview(null);
  };

  const addButton = (type) => {
    if (newTemplate.buttons.length >= 3) {
      alert("Maximum 3 buttons allowed for standard templates.");
      return;
    }
    const newBtn = type === 'QUICK_REPLY'
      ? { type, text: 'Quick Reply' }
      : (type === 'PHONE_NUMBER' ? { type, text: 'Call Us', phone_number: '+91' } : { type, text: 'Visit Website', url: 'https://' });
    setNewTemplate({ ...newTemplate, buttons: [...newTemplate.buttons, newBtn] });
  };

  const removeButton = (index) => {
    const btns = [...newTemplate.buttons];
    btns.splice(index, 1);
    setNewTemplate({ ...newTemplate, buttons: btns });
  };

  const updateButton = (index, field, value) => {
    const btns = [...newTemplate.buttons];
    btns[index][field] = value;
    setNewTemplate({ ...newTemplate, buttons: btns });
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status.toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Mockup Preview Component
  const MessagePreview = ({ template, previewUrl }) => (
    <div className="relative w-[280px] h-[560px] bg-slate-800 rounded-[3rem] border-[8px] border-slate-900 shadow-2xl overflow-hidden shrink-0">
      <div className="absolute inset-0 bg-[#E5DDD5] flex flex-col pt-12">
        <div className="h-14 bg-[#075E54] flex items-center px-4 gap-3 shrink-0">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
            <User size={16} />
          </div>
          <div>
            <p className="text-white text-[11px] font-bold leading-none">WhatsApp Business</p>
            <p className="text-white/60 text-[8px] font-medium mt-1 uppercase tracking-widest">Official Account</p>
          </div>
        </div>

        <div className="flex-1 p-3 overflow-y-auto space-y-4 custom-scrollbar relative">
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>

          <div className="bg-white rounded-xl rounded-tl-none shadow-sm overflow-hidden animate-in zoom-in-95 duration-500 relative z-10">
            {(() => {
              const hType = template.headerType || template.header?.type;
              const hUrl = previewUrl || template.header?.media_url;
              if (['IMAGE', 'VIDEO', 'DOCUMENT', 'AUDIO'].includes(hType)) {
                return (
                  <div className="aspect-video bg-slate-100 flex flex-col items-center justify-center text-slate-300 gap-2 relative overflow-hidden">
                    {hUrl ? (
                      <>
                        {hType === 'IMAGE' && <img src={hUrl} className="w-full h-full object-cover" />}
                        {hType === 'VIDEO' && <video src={hUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />}
                        {hType === 'DOCUMENT' && <div className="flex flex-col items-center gap-2"><File size={32} className="text-indigo-400" /></div>}
                        {hType === 'AUDIO' && <div className="flex flex-col items-center gap-2"><Headphones size={32} className="text-indigo-400" /></div>}
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2 opacity-50">
                        {hType === 'IMAGE' && <ImageIcon size={28} />}
                        {hType === 'VIDEO' && <Video size={28} />}
                        {hType === 'DOCUMENT' && <File size={28} />}
                        {hType === 'AUDIO' && <Headphones size={28} />}
                        <span className="text-[8px] font-black uppercase tracking-widest">{hType} SAMPLE</span>
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            })()}

            <div className="p-3 space-y-2">
              {(() => {
                const hType = template.headerType || template.header?.type;
                const hText = template.headerText || template.header?.text;
                if (hType === 'TEXT' && hText) {
                  return <p className="text-[11px] font-black text-slate-900 border-b border-slate-50 pb-2 mb-1">{hText}</p>;
                }
                return null;
              })()}

              <div className="text-[11px] text-slate-800 leading-relaxed whitespace-pre-wrap min-h-[40px]">
                {(() => {
                  const text = template.content || "Template message body content...";
                  const parts = text.split(/(\{\{[^}]+\}\})/g);
                  return parts.map((part, i) =>
                    part.startsWith('{{') ? (
                      <span key={i} className="px-1 py-0.5 bg-indigo-50 text-indigo-600 font-black rounded border border-indigo-100 mx-0.5 italic">
                        {part}
                      </span>
                    ) : part
                  );
                })()}
              </div>

              {template.footer && (
                <p className="text-[9px] text-slate-400 font-bold border-t border-slate-50 pt-2 mt-2">{template.footer}</p>
              )}

              <div className="flex justify-end mt-1">
                <span className="text-[7px] text-slate-300 font-black flex items-center gap-1">10:45 AM <CheckCheck size={10} /></span>
              </div>
            </div>

            {template.buttons?.length > 0 && (
              <div className="border-t border-slate-100">
                {template.buttons.map((btn, i) => (
                  <div key={i} className="py-2.5 px-4 flex items-center justify-center gap-2 text-[#00a5f4] border-b border-slate-100 last:border-0 font-bold text-[10px]">
                    {btn.type === 'PHONE_NUMBER' ? <Phone size={10} /> : (btn.type === 'URL' ? <Link2 size={10} /> : null)}
                    <span>{btn.text || 'Action Button'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-40"></div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F7F9FC] overflow-hidden">
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar pb-20">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Template Library</h1>
            <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.2em] opacity-60">Official WhatsApp Meta Templates</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSync}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-slate-200 text-slate-600 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
              Sync Meta
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 active:scale-95"
            >
              <Plus size={18} />
              New Template
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard label="Total Library" value={templates.length} color="indigo" icon={Layers} />
          <StatCard label="Approved & Live" value={templates.filter(t => t.status === 'APPROVED' || t.status === 'approved').length} color="emerald" icon={CheckCircle2} />
          <StatCard label="Pending Review" value={templates.filter(t => t.status !== 'APPROVED' && t.status !== 'approved').length} color="orange" icon={Clock} />
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
          {['ALL', 'APPROVED', 'PENDING', 'REJECTED'].map(filter => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === filter ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              {filter}
            </button>
          ))}
          <div className="h-6 w-[1px] bg-slate-100 mx-2 hidden md:block"></div>
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl text-xs font-bold focus:bg-white focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Dashboard: 2-Column Interface */}
        <div className="flex flex-col xl:flex-row gap-8">

          <div className="w-full xl:w-[420px] shrink-0">
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col h-[750px]">
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                {loading && templates.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 opacity-40">
                    <Loader2 className="animate-spin text-indigo-600" size={32} />
                    <p className="text-[10px] font-black uppercase tracking-widest">Metadata Loading...</p>
                  </div>
                ) : filteredTemplates.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 opacity-30 text-center px-8">
                    <MessageSquare size={48} className="text-slate-300" />
                    <p className="text-sm font-bold text-slate-800">No templates found</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest mt-1">Try a different search term or filter</p>
                  </div>
                ) : (
                  filteredTemplates.map(template => (
                    <button
                      key={template._id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`w-full p-5 rounded-3xl border-2 text-left transition-all relative group flex items-start gap-4 ${selectedTemplate?._id === template._id ? 'border-indigo-600 bg-indigo-50/20' : 'border-slate-50 bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-600/5'}`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${template.header?.type === 'IMAGE' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                        {template.header?.type === 'IMAGE' ? <ImageIcon size={20} /> : <FileText size={20} />}
                      </div>
                      <div className="flex-1 min-w-0 pr-4">
                        <h3 className={`text-sm font-black truncate transition-colors ${selectedTemplate?._id === template._id ? 'text-indigo-600' : 'text-slate-800'}`}>{template.name}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider border ${(template.status === 'APPROVED' || template.status === 'approved') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            (template.status === 'REJECTED' || template.status === 'rejected') ? 'bg-red-50 text-red-600 border-red-100' :
                              'bg-orange-50 text-orange-600 border-orange-100'
                            }`}>
                            {template.status}
                          </span>
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 px-2 rounded-lg py-0.5">{template.category}</span>
                        </div>
                      </div>
                      <ChevronRight size={18} className={`shrink-0 mt-3 transition-transform ${selectedTemplate?._id === template._id ? 'text-indigo-600 translate-x-1' : 'text-slate-200 group-hover:translate-x-1'}`} />
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {selectedTemplate ? (
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 p-8 md:p-12 min-h-[750px] h-full overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex flex-col lg:flex-row gap-16 items-start">

                  <div className="flex-1 space-y-12 w-full">
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">{selectedTemplate.name}</h2>
                      <div className="flex items-center gap-3 mt-4">
                        <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-2">
                          <Globe size={14} className="text-indigo-600" />
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{selectedTemplate.language}</span>
                        </div>
                        <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-2">
                          <Layers size={14} className="text-indigo-600" />
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{selectedTemplate.category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="h-[1px] bg-slate-100 w-full"></div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Header Configuration</h4>
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-xs font-black text-slate-800">{selectedTemplate.header?.type || 'No Header'}</p>
                          {selectedTemplate.header?.text && <p className="text-[10px] text-slate-500 mt-2 font-medium italic">"{selectedTemplate.header.text}"</p>}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Meta Verification</h4>
                        <div className={`p-5 rounded-2xl border flex items-center gap-3 ${(selectedTemplate.status === 'APPROVED' || selectedTemplate.status === 'approved') ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-orange-50 border-orange-100 text-orange-700'
                          }`}>
                          {(selectedTemplate.status === 'APPROVED' || selectedTemplate.status === 'approved') ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                          <p className="text-xs font-black uppercase tracking-widest">{selectedTemplate.status}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message Payload</h4>
                      <div className="bg-slate-900 rounded-[2rem] p-8 relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <p className="text-indigo-100/90 font-mono text-[13px] leading-relaxed relative z-10 whitespace-pre-wrap">
                          {selectedTemplate.content}
                        </p>
                        {selectedTemplate.footer && (
                          <p className="mt-8 pt-8 border-t border-white/5 text-[10px] text-white/30 font-bold uppercase tracking-widest relative z-10">
                            {selectedTemplate.footer}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-[2rem] flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                        <ShieldCheck size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-emerald-900 tracking-tight">Verified Compliance</p>
                        <p className="text-[10px] font-bold text-emerald-600/70 mt-1 uppercase tracking-widest">Complies with official WhatsApp Business policy guidelines</p>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-center w-full lg:w-auto">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Device Visualization</h4>
                    <MessagePreview template={selectedTemplate} />
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-8 flex items-center gap-2">
                      <Target size={14} className="text-indigo-600" />
                      Official Meta Render View
                    </p>
                  </div>

                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col items-center justify-center h-full min-h-[750px] text-center p-12 opacity-30 border-2 border-dashed border-slate-200">
                <LayoutDashboard size={48} className="text-slate-200 mb-8" />
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Library Explorer</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2 max-w-[280px] leading-relaxed">Select a template from the library to view specifications and live mockup</p>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* New Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[1300px] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-300 relative">

            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                  <Plus size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">New Template Request</h2>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                    <Clock size={12} className="text-orange-500" />
                    Estimated Meta approval: 2–24 hours
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-12 h-12 rounded-2xl hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-all hover:rotate-90"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="flex flex-col xl:flex-row h-full">
                <div className="flex-1 p-8 md:p-12 space-y-12 border-r border-slate-50 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Template Name</label>
                      <input
                        type="text"
                        placeholder="e.g., marketing_promo_2026"
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                        className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all placeholder:text-slate-300"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                      <select
                        value={newTemplate.category}
                        onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                        className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all cursor-pointer"
                      >
                        <option value="MARKETING">Marketing</option>
                        <option value="UTILITY">Utility</option>
                        <option value="AUTHENTICATION">Authentication</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Language</label>
                      <select
                        value={newTemplate.language}
                        onChange={(e) => setNewTemplate({ ...newTemplate, language: e.target.value })}
                        className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all cursor-pointer"
                      >
                        <option value="en_US">English (US)</option>
                        <option value="hi">Hindi</option>
                        <option value="es">Spanish</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                      <LayoutDashboard size={20} className="text-indigo-600" />
                      Visual Header Configuration
                    </h3>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                      {['NONE', 'TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT', 'AUDIO'].map(type => (
                        <button
                          key={type}
                          onClick={() => {
                            setNewTemplate({ ...newTemplate, headerType: type });
                            setMediaHandle('');
                            setMediaPreview(null);
                          }}
                          className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${newTemplate.headerType === type ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'bg-slate-50 text-slate-400 border border-transparent hover:border-indigo-200'}`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>

                    {newTemplate.headerType === 'TEXT' && (
                      <div className="pt-2 animate-in slide-in-from-top-2 duration-300">
                        <input
                          type="text"
                          placeholder="Header title text..."
                          value={newTemplate.headerText}
                          onChange={(e) => setNewTemplate({ ...newTemplate, headerText: e.target.value })}
                          className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all"
                        />
                      </div>
                    )}

                    {['IMAGE', 'VIDEO', 'DOCUMENT', 'AUDIO'].includes(newTemplate.headerType) && (
                      <div className="pt-2 animate-in slide-in-from-top-2 duration-300">
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className={`p-10 border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center gap-4 transition-all cursor-pointer ${mediaHandle ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:bg-indigo-50/30'}`}
                        >
                          <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileUpload}
                            accept={newTemplate.headerType === 'IMAGE' ? 'image/*' : newTemplate.headerType === 'VIDEO' ? 'video/*' : '*/*'}
                          />
                          {uploadingMedia ? <Loader2 size={32} className="animate-spin text-indigo-600" /> :
                            mediaHandle ? <CheckCircle2 size={32} className="text-emerald-500" /> : <Upload size={32} className="text-slate-300" />}
                          <div className="text-center">
                            <p className="text-xs font-black text-slate-700 uppercase tracking-widest">{mediaHandle ? 'Sample Uploaded' : `Upload ${newTemplate.headerType} Sample`}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Required for Meta approval systems</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                        <Type size={20} className="text-indigo-600" />
                        Message Body
                      </h3>
                      <textarea
                        rows={6}
                        placeholder="Message content. Use {{1}}, {{2}} for variables."
                        value={newTemplate.content}
                        onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                        className="w-full px-6 py-5 bg-slate-50 border border-transparent rounded-[2rem] text-sm font-medium focus:bg-white focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all placeholder:text-slate-300 resize-none leading-relaxed"
                      ></textarea>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                        <FileText size={20} className="text-indigo-600" />
                        Footer Note
                      </h3>
                      <textarea
                        rows={6}
                        placeholder="Optional footer text."
                        value={newTemplate.footer}
                        onChange={(e) => setNewTemplate({ ...newTemplate, footer: e.target.value })}
                        className="w-full px-6 py-5 bg-slate-50 border border-transparent rounded-[2rem] text-sm font-medium focus:bg-white focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all placeholder:text-slate-300 resize-none leading-relaxed"
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="w-full xl:w-[480px] bg-slate-50/50 p-12 flex flex-col items-center border-l border-slate-100 overflow-y-auto">
                  <div className="sticky top-0 w-full flex flex-col items-center gap-8">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Device Mockup</h4>
                    <MessagePreview template={newTemplate} previewUrl={mediaPreview} />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-4 bg-white sticky bottom-0">
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-full sm:w-auto px-8 py-4 bg-slate-50 text-slate-400 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCreateTemplate(false)}
                disabled={submitting || uploadingMedia}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-indigo-50 text-indigo-600 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-100 transition-all active:scale-95 disabled:opacity-50"
              >
                Save Draft
              </button>
              <button
                onClick={() => handleCreateTemplate(true)}
                disabled={submitting || uploadingMedia}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-4 bg-emerald-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/25 active:scale-95 disabled:opacity-50"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                Submit to Meta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
