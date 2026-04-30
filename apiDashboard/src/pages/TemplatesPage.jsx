import React, { useState, useEffect } from 'react';
import { 
    LayoutTemplate, 
    Plus, 
    RefreshCw, 
    Search, 
    CheckCircle2, 
    Clock, 
    XCircle,
    MoreVertical,
    Eye,
    Trash2,
    ArrowRight,
    Image,
    Video,
    FileText,
    PenSquare
} from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export default function TemplatesPage({ onCreateNew, onUseInCampaign }) {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [showPreview, setShowPreview] = useState(false);

    const [menuOpenId, setMenuOpenId] = useState(null);

    useEffect(() => {
        fetchTemplates();
    }, []);

    useEffect(() => {
        const handleClickOutside = () => setMenuOpenId(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE}/templates`);
            setTemplates(res.data);
        } catch (err) {
            console.error("Failed to fetch templates", err);
        } finally {
            setLoading(false);
        }
    };

    const syncStatuses = async () => {
        try {
            setSyncing(true);
            await axios.post(`${API_BASE}/templates/sync-meta-status`);
            await fetchTemplates();
            alert("Statuses synced with Meta successfully!");
        } catch (err) {
            console.error("Failed to sync statuses", err);
            alert("Sync failed: " + (err.response?.data?.message || err.message));
        } finally {
            setSyncing(false);
        }
    };

    const deleteTemplate = async (e, id) => {
        if (e) e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this template?")) return;
        try {
            await axios.delete(`${API_BASE}/templates/${id}`);
            setTemplates(templates.filter(t => t._id !== id));
        } catch (err) {
            alert("Delete failed");
        }
    };

    const handlePreview = (template) => {
        setSelectedTemplate(template);
        setShowPreview(true);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Preview Modal */}
            {showPreview && selectedTemplate && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-slate-800">Template Preview</h3>
                            <button onClick={() => setShowPreview(false)} className="text-slate-400 hover:text-slate-600 font-bold">Close</button>
                        </div>
                        <div className="p-8 bg-slate-50 flex justify-center">
                            {/* Simple WhatsApp-style bubble */}
                            <div className="bg-white rounded-2xl shadow-md max-w-[280px] overflow-hidden border border-slate-200">
                                {selectedTemplate.components.find(c => c.type === 'HEADER') && (
                                    <div className="h-32 bg-slate-100 flex flex-col items-center justify-center text-slate-400 border-b border-slate-100 gap-2">
                                        {selectedTemplate.components.find(c => c.type === 'HEADER')?.format === 'IMAGE' && <Image size={32} className="opacity-20" />}
                                        {selectedTemplate.components.find(c => c.type === 'HEADER')?.format === 'VIDEO' && <Video size={32} className="opacity-20" />}
                                        {selectedTemplate.components.find(c => c.type === 'HEADER')?.format === 'DOCUMENT' && <FileText size={32} className="opacity-20" />}
                                        <span className="text-[10px] font-bold uppercase tracking-widest">{selectedTemplate.components.find(c => c.type === 'HEADER')?.format} HEADER</span>
                                    </div>
                                )}
                                <div className="p-4 space-y-2">
                                    <p className="text-sm text-slate-800 whitespace-pre-wrap">
                                        {selectedTemplate.components.find(c => c.type === 'BODY')?.text}
                                    </p>
                                    <p className="text-[10px] text-slate-400">
                                        {selectedTemplate.components.find(c => c.type === 'FOOTER')?.text}
                                    </p>
                                </div>
                                {selectedTemplate.components.find(c => c.type === 'BUTTONS')?.buttons.map((b, i) => (
                                    <div key={i} className="border-t border-slate-100 p-2.5 text-center text-blue-600 text-sm font-semibold">
                                        {b.text}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search templates..."
                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={syncStatuses}
                        disabled={syncing}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
                    >
                        <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
                        Sync Status
                    </button>
                    <button 
                        onClick={onCreateNew}
                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-black transition-all shadow-lg shadow-slate-200"
                    >
                        <Plus size={18} />
                        New Template
                    </button>
                </div>
            </div>

            {/* Templates Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.filter(t => ['APPROVED', 'PENDING', 'REJECTED'].includes(t.status?.toUpperCase())).map((template) => (
                        <div key={template._id} className="group bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-emerald-500/30 transition-all relative overflow-hidden">
                            {/* Status Badge */}
                            <div className="flex items-center justify-between mb-4">
                                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                    template.status === 'APPROVED' || template.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                    template.status === 'REJECTED' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                    'bg-amber-50 text-amber-600 border-amber-100'
                                }`}>
                                    {template.status === 'APPROVED' || template.status === 'Approved' ? <CheckCircle2 size={12} /> :
                                     template.status === 'REJECTED' ? <XCircle size={12} /> :
                                     <Clock size={12} />}
                                    {template.status || 'Pending'}
                                </span>
                                
                                <div className="relative">
                                    <button 
                                        onClick={(e) => { 
                                            e.preventDefault();
                                            e.stopPropagation(); 
                                            setMenuOpenId(menuOpenId === template._id ? null : template._id); 
                                        }}
                                        className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                        <MoreVertical size={18} />
                                    </button>
                                    
                                    {menuOpenId === template._id && (
                                        <div 
                                            className="absolute right-0 mt-2 w-36 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-2 animate-in fade-in slide-in-from-top-1 duration-200"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <button 
                                                className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                                onClick={() => { alert("Edit feature coming soon!"); setMenuOpenId(null); }}
                                            >
                                                <PenSquare size={14} /> Edit
                                            </button>
                                            <button 
                                                onClick={(e) => { deleteTemplate(e, template._id); setMenuOpenId(null); }}
                                                className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                                            >
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">{template.name}</h3>
                                    <p className="text-xs text-slate-500 mt-1 uppercase font-semibold">{template.category} • {template.language}</p>
                                </div>

                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 line-clamp-3 text-xs text-slate-600 leading-relaxed italic">
                                    "{template.components.find(c => c.type === 'BODY')?.text}"
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handlePreview(template); }}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all border border-slate-100"
                                    >
                                        <Eye size={14} /> Preview
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onUseInCampaign(template); }}
                                        title="Use in Campaign"
                                        className="w-10 h-10 flex items-center justify-center bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-all border border-emerald-100"
                                    >
                                        <ArrowRight size={16} />
                                    </button>
                                    <button 
                                        onClick={(e) => deleteTemplate(e, template._id)}
                                        title="Delete Template"
                                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {templates.filter(t => ['APPROVED', 'PENDING', 'REJECTED'].includes(t.status?.toUpperCase())).length === 0 && (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                                <LayoutTemplate size={40} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">No templates found</h3>
                                <p className="text-slate-500 text-sm">Start by creating your first message template.</p>
                            </div>
                            <button 
                                onClick={onCreateNew}
                                className="px-6 py-2.5 bg-emerald-500 text-white rounded-2xl text-sm font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"
                            >
                                Create Template
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
