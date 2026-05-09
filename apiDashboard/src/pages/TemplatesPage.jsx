import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Filter, Plus, MessageSquare,
  CheckCircle2, AlertCircle, RefreshCcw,
  Smartphone, ChevronRight, Globe, Layers,
  Trash2, ExternalLink, Image as ImageIcon,
  Type, FileText, PlayCircle, MousePointer2,
  Clock, Target, LayoutDashboard, Menu, Loader2, Zap,
  X, Send, ShieldCheck, Info, Phone, Link2,
  Video, File, Headphones, Upload, Check
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
    setNewTemplate({...newTemplate, buttons: [...newTemplate.buttons, newBtn]});
  };

  const removeButton = (index) => {
    const btns = [...newTemplate.buttons];
    btns.splice(index, 1);
    setNewTemplate({...newTemplate, buttons: btns});
  };

  const updateButton = (index, field, value) => {
    const btns = [...newTemplate.buttons];
    btns[index][field] = value;
    setNewTemplate({...newTemplate, buttons: btns});
  };

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mockup Preview Component
  const MessagePreview = ({ template, previewUrl }) => (
    <div className="relative w-[280px] h-[560px] bg-slate-800 rounded-[3rem] border-[8px] border-slate-900 shadow-2xl overflow-hidden">
      <div className="absolute inset-0 bg-[#E5DDD5] flex flex-col pt-12">
        <div className="h-12 bg-[#075E54] flex items-center px-4 gap-3 shrink-0">
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white">
            <Zap size={14} />
          </div>
          <p className="text-white text-[10px] font-bold">Business Suite</p>
        </div>

        <div className="flex-1 p-3 overflow-y-auto space-y-4 custom-scrollbar">
          <div className="bg-white rounded-xl rounded-tl-none shadow-sm overflow-hidden animate-in zoom-in-95 duration-500">
            {/* Media Header Previews */}
            {(() => {
              const hType = template.headerType || template.header?.type;
              const hUrl = previewUrl || template.header?.media_url;

              if (['IMAGE', 'VIDEO', 'DOCUMENT', 'AUDIO'].includes(hType)) {
                return (
                  <div className="aspect-video bg-slate-50 flex flex-col items-center justify-center text-slate-300 gap-2 relative overflow-hidden">
                    {hUrl ? (
                      <>
                        {hType === 'IMAGE' && <img src={hUrl} className="w-full h-full object-cover" />}
                        {hType === 'VIDEO' && (
                          <video 
                            src={hUrl} 
                            className="w-full h-full object-cover" 
                            autoPlay 
                            muted 
                            loop 
                            playsInline 
                          />
                        )}
                        {hType === 'DOCUMENT' && (
                          <div className="flex flex-col items-center gap-2">
                            <File size={32} className="text-indigo-400" />
                            <span className="text-[9px] font-black text-slate-400">DOCUMENT READY</span>
                          </div>
                        )}
                        {hType === 'AUDIO' && (
                          <div className="flex flex-col items-center gap-2">
                            <Headphones size={32} className="text-indigo-400" />
                            <span className="text-[9px] font-black text-slate-400">AUDIO READY</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {hType === 'IMAGE' && <ImageIcon size={28} />}
                        {hType === 'VIDEO' && <Video size={28} />}
                        {hType === 'DOCUMENT' && <File size={28} />}
                        {hType === 'AUDIO' && <Headphones size={28} />}
                        <span className="text-[8px] font-black uppercase tracking-widest">{hType} PREVIEW</span>
                      </>
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
                  const text = template.content || "Start typing your message body...";
                  const parts = text.split(/(\{\{[^}]+\}\})/g);
                  return parts.map((part, i) =>
                    part.startsWith('{{') ? (
                      <span key={i} className="px-1 py-0.5 bg-emerald-50 text-emerald-600 font-black rounded border border-emerald-100 mx-0.5">
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
                <span className="text-[7px] text-slate-300 font-bold">10:14 AM</span>
              </div>
            </div>

            {template.buttons?.length > 0 && (
              <div className="border-t border-slate-50">
                {template.buttons.map((btn, i) => (
                  <div key={i} className="py-2.5 px-4 flex items-center justify-center gap-2 text-[#00a5f4] border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                    {btn.type === 'PHONE_NUMBER' ? <Phone size={10} /> : (btn.type === 'URL' ? <Link2 size={10} /> : null)}
                    <span className="text-[10px] font-black">{btn.text || 'Button Text'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-900 rounded-b-2xl z-40"></div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar pb-10">

        {/* Title Row */}
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Templates Management</h2>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Preview and synchronize your Meta WhatsApp templates</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSync}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-100 transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
              Sync Meta
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/25 active:scale-95"
            >
              <Plus size={16} />
              New Template
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <StatCard label="Total Templates" value={templates.length} color="indigo" icon={Layers} />
          <StatCard label="Approved by Meta" value={templates.filter(t => t.status === 'approved').length} color="emerald" icon={CheckCircle2} />
          <StatCard label="Pending Approval" value={templates.filter(t => t.status !== 'approved').length} color="orange" icon={Clock} />
        </div>

        {/* Main Interface Row */}
        <div className="flex flex-col xl:flex-row gap-6">
          <div className="w-full xl:w-[420px] shrink-0 space-y-4">
            <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col h-[700px]">
              <div className="p-5 border-b border-slate-50">
                <div className="relative group">
                  <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                {loading && templates.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 opacity-40">
                    <Loader2 className="animate-spin text-indigo-600" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Loading Library...</p>
                  </div>
                ) : filteredTemplates.map(template => (
                  <button
                    key={template._id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all relative group ${selectedTemplate?._id === template._id ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-50 bg-white hover:border-slate-100'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1 min-w-0 pr-4">
                        <h3 className="text-xs font-black text-slate-800 truncate">{template.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider border ${template.status === 'approved' ? 'bg-emerald-100 text-emerald-600 border-emerald-200' : 'bg-orange-100 text-orange-600 border-orange-200'}`}>
                            {template.status}
                          </span>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{template.category}</span>
                        </div>
                      </div>
                      <ChevronRight size={16} className={`transition-transform ${selectedTemplate?._id === template._id ? 'text-indigo-600 translate-x-1' : 'text-slate-300'}`} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {selectedTemplate ? (
              <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-6 md:p-8 min-h-[700px]">
                <div className="flex flex-col lg:flex-row gap-10">
                  <div className="flex-1 space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Template Specifications</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Language</p>
                          <p className="text-xs font-black text-slate-800">{selectedTemplate.language || 'English (US)'}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Header Format</p>
                          <p className="text-xs font-black text-slate-800">{selectedTemplate.header?.type || 'None'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Message Body</h3>
                      <div className="bg-slate-900 rounded-2xl p-6 text-indigo-300 font-mono text-[11px] leading-relaxed shadow-lg">
                        {selectedTemplate.content}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col items-center">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Real-Time Mockup</h3>
                    <MessagePreview template={selectedTemplate} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center justify-center h-full min-h-[700px] text-center p-12 opacity-40">
                <Layers size={40} className="text-slate-200 mb-6" />
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Select a Template</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Pick a template from the library to see the live preview</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* New Template Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[1250px] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                  <Plus size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800 leading-none">Create New Template</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                    <Clock size={12} className="text-orange-500" />
                    Meta approval takes 24–48 hours
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="flex flex-col lg:flex-row h-full">
                {/* Form Side */}
                <div className="flex-1 p-8 space-y-10 border-r border-slate-50">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Template Name</label>
                      <input 
                        type="text"
                        placeholder="e.g., promo_summer_2026"
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all placeholder:text-slate-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                      <select 
                        value={newTemplate.category}
                        onChange={(e) => setNewTemplate({...newTemplate, category: e.target.value})}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all cursor-pointer"
                      >
                        <option value="MARKETING">Marketing</option>
                        <option value="UTILITY">Utility</option>
                        <option value="AUTHENTICATION">Authentication</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Language</label>
                      <select 
                        value={newTemplate.language}
                        onChange={(e) => setNewTemplate({...newTemplate, language: e.target.value})}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all cursor-pointer"
                      >
                        <option value="en_US">English (US)</option>
                        <option value="en_GB">English (UK)</option>
                        <option value="hi">Hindi</option>
                        <option value="es">Spanish</option>
                      </select>
                    </div>
                  </div>

                  {/* Header Section */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                      <LayoutDashboard size={16} className="text-indigo-600" />
                      Header Configuration
                    </h3>
                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Header Media Type</label>
                        <div className="flex flex-wrap gap-2">
                          {['NONE', 'TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT', 'AUDIO'].map(type => (
                            <button
                              key={type}
                              onClick={() => {
                                setNewTemplate({...newTemplate, headerType: type});
                                setMediaHandle('');
                                setMediaPreview(null);
                              }}
                              className={`flex-1 min-w-[80px] py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newTemplate.headerType === type ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white border border-slate-100 text-slate-400 hover:border-indigo-200'}`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {newTemplate.headerType === 'TEXT' && (
                        <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Header Title Text</label>
                          <input 
                            type="text"
                            placeholder="Enter header title..."
                            value={newTemplate.headerText}
                            onChange={(e) => setNewTemplate({...newTemplate, headerText: e.target.value})}
                            className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all"
                          />
                        </div>
                      )}

                      {['IMAGE', 'VIDEO', 'DOCUMENT', 'AUDIO'].includes(newTemplate.headerType) && (
                        <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Media Sample (Required for Approval)</label>
                          <div 
                            onClick={() => fileInputRef.current?.click()}
                            className={`p-8 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${mediaHandle ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-100 bg-white hover:border-indigo-200 hover:bg-indigo-50/30'}`}
                          >
                            <input 
                              type="file" 
                              ref={fileInputRef} 
                              className="hidden" 
                              onChange={handleFileUpload}
                              accept={
                                newTemplate.headerType === 'IMAGE' ? 'image/*' :
                                newTemplate.headerType === 'VIDEO' ? 'video/*' :
                                newTemplate.headerType === 'DOCUMENT' ? '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt' :
                                'audio/*,.mp3,.m4a,.ogg,.aac'
                              }
                            />
                            {uploadingMedia ? (
                              <Loader2 size={32} className="animate-spin text-indigo-600" />
                            ) : mediaHandle ? (
                              <div className="flex flex-col items-center gap-2">
                                <Check size={32} className="text-emerald-600" />
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Sample Uploaded & Verified</p>
                              </div>
                            ) : (
                              <>
                                <Upload size={32} className="text-slate-300" />
                                <div className="text-center">
                                  <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Click to Upload {newTemplate.headerType} Sample</p>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Maximum file size: 5MB</p>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Body & Footer Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                        <Type size={16} className="text-indigo-600" />
                        Message Body
                      </h3>
                      <textarea 
                        rows={5}
                        placeholder="Type your message content..."
                        value={newTemplate.content}
                        onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all placeholder:text-slate-300 resize-none leading-relaxed"
                      ></textarea>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                        <FileText size={16} className="text-indigo-600" />
                        Footer Text (Optional)
                      </h3>
                      <textarea 
                        rows={5}
                        placeholder="e.g., Reply STOP to opt out"
                        value={newTemplate.footer}
                        onChange={(e) => setNewTemplate({...newTemplate, footer: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all placeholder:text-slate-300 resize-none leading-relaxed"
                      ></textarea>
                    </div>
                  </div>

                  {/* Buttons Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                        <MousePointer2 size={16} className="text-indigo-600" />
                        Interactive Buttons
                      </h3>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => addButton('QUICK_REPLY')}
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-emerald-100 transition-all"
                        >
                          + Quick Reply
                        </button>
                        <button 
                          onClick={() => addButton('PHONE_NUMBER')}
                          className="px-3 py-1.5 bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-orange-100 transition-all"
                        >
                          + Call Us
                        </button>
                        <button 
                          onClick={() => addButton('URL')}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-100 transition-all"
                        >
                          + Website
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {newTemplate.buttons.map((btn, idx) => (
                        <div key={idx} className="flex flex-col md:flex-row gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-in slide-in-from-bottom-2 duration-300">
                          <div className="flex-1">
                            <input 
                              type="text"
                              placeholder="Button Text"
                              value={btn.text}
                              onChange={(e) => updateButton(idx, 'text', e.target.value)}
                              className="w-full px-4 py-2 bg-white border border-slate-100 rounded-xl text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600/10"
                            />
                          </div>
                          {btn.type === 'URL' && (
                            <div className="flex-1">
                              <input 
                                type="text"
                                placeholder="Website URL"
                                value={btn.url}
                                onChange={(e) => updateButton(idx, 'url', e.target.value)}
                                className="w-full px-4 py-2 bg-white border border-slate-100 rounded-xl text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600/10"
                              />
                            </div>
                          )}
                          {btn.type === 'PHONE_NUMBER' && (
                            <div className="flex-1">
                              <input 
                                type="text"
                                placeholder="Phone Number (with code)"
                                value={btn.phone_number}
                                onChange={(e) => updateButton(idx, 'phone_number', e.target.value)}
                                className="w-full px-4 py-2 bg-white border border-slate-100 rounded-xl text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600/10"
                              />
                            </div>
                          )}
                          <button 
                            onClick={() => removeButton(idx)}
                            className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Preview Side */}
                <div className="w-full lg:w-[480px] bg-slate-50/50 p-10 flex flex-col items-center border-l border-slate-50 overflow-y-auto">
                  <div className="sticky top-0 w-full flex flex-col items-center gap-6">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-Time Mockup</h3>
                    <MessagePreview template={newTemplate} previewUrl={mediaPreview} />
                    
                    <div className="w-full p-6 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/20 space-y-4">
                      <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck size={14} className="text-emerald-500" />
                        Approval Confidence
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                        Your media sample has been processed. Providing a sample significantly increases the chance of **Instant Approval** by Meta's automated systems.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-end gap-3 bg-white">
              <button 
                onClick={() => setShowCreateModal(false)}
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-50 text-slate-400 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleCreateTemplate(false)}
                disabled={submitting || uploadingMedia}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-50 text-indigo-600 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-100 transition-all active:scale-95 disabled:opacity-50"
              >
                <ShieldCheck size={16} />
                Save to Admin
              </button>
              <button 
                onClick={() => handleCreateTemplate(true)}
                disabled={submitting || uploadingMedia}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Submit to Meta Direct
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
