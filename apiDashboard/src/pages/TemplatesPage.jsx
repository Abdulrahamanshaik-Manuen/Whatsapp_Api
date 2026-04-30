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
    ArrowRight
} from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export default function TemplatesPage({ onCreateNew }) {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        fetchTemplates();
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
            // We'll implement a bulk sync endpoint in the backend
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

    const deleteTemplate = async (id) => {
        if (!window.confirm("Are you sure you want to delete this template?")) return;
        try {
            await axios.delete(`${API_BASE}/templates/${id}`);
            setTemplates(templates.filter(t => t._id !== id));
        } catch (err) {
            alert("Delete failed");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
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
                    {templates.map((template) => (
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
                                <button className="text-slate-400 hover:text-slate-600">
                                    <MoreVertical size={18} />
                                </button>
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
                                    <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all border border-slate-100">
                                        <Eye size={14} /> Preview
                                    </button>
                                    <button 
                                        onClick={() => deleteTemplate(template._id)}
                                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Hover Arrow */}
                            <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all">
                                <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center">
                                    <ArrowRight size={16} />
                                </div>
                            </div>
                        </div>
                    ))}

                    {templates.length === 0 && (
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
