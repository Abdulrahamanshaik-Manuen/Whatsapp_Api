import React, { useState, useEffect } from 'react';
import { Search, Bot, Zap, Plus, User, MoreVertical, Edit3, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function AutomationHub({ onNavigate }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/admin/automations/requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setRequests(data);
      }
    } catch (err) {
      console.error("Fetch Requests Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar">
      <div className="max-w-[1400px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Automation Hub</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Review client requests and build custom automation flows</p>
          </div>
          <button 
            onClick={() => onNavigate('/automations/builder')}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
          >
            <Plus size={16} /> Create Global Template
          </button>
        </div>

        {/* Requests Section */}
        <div className="space-y-6">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                 <Clock size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Pending Client Requests</h2>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full py-12 text-center text-slate-400 font-black uppercase tracking-widest animate-pulse">Scanning requests...</div>
              ) : requests.length === 0 ? (
                <div className="col-span-full py-16 bg-white rounded-[2.5rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                   <Bot size={40} className="text-slate-200 mb-4" />
                   <h3 className="text-lg font-black text-slate-800">No new requests</h3>
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">All automation queues are empty</p>
                </div>
              ) : requests.map(req => (
                <div key={req._id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 space-y-6 hover:shadow-md transition-all group">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 font-black">
                            {req.clientId?.name?.charAt(0) || 'C'}
                         </div>
                         <div>
                            <p className="text-sm font-black text-slate-900">{req.clientId?.name || 'Unknown Client'}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{req.clientId?.phone}</p>
                         </div>
                      </div>
                      <div className="px-2.5 py-1 bg-amber-50 text-amber-600 rounded-lg text-[9px] font-black uppercase tracking-widest">REQUESTED</div>
                   </div>

                   <div>
                      <h4 className="text-base font-black text-slate-900 tracking-tight truncate">{req.name}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-2">{req.description || 'No detailed description provided.'}</p>
                   </div>

                   <div className="flex items-center gap-2">
                      <button 
                        onClick={() => onNavigate('/automations/builder', { ...req, isAdminAction: true })}
                        className="flex-1 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                      >
                         <Zap size={14} fill="currentColor" /> Build & Assign
                      </button>
                      <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all">
                         <Trash2 size={16} />
                      </button>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Managed Automations */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                 <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                    <CheckCircle size={24} className="text-secondary" />
                 </div>
                 <div>
                    <h3 className="text-xl font-black tracking-tight">Active Managed Flows</h3>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Powering automated client nodes</p>
                 </div>
              </div>
              <button className="px-8 py-4 bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all">
                 View All Assignments
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
