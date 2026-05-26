import React, { useState, useEffect } from 'react';
import {
  Search, Bot, Zap, Plus, User, MoreVertical,
  Edit3, Trash2, CheckCircle, Clock, AlertCircle,
  Activity, Layers, MousePointer2, ChevronRight
} from 'lucide-react';
import axios from 'axios';

export default function AutomationHub({ onNavigate }) {
  const [loading, setLoading] = useState(() => {
    return !localStorage.getItem('admin_automation_data');
  });
  const [requests, setRequests] = useState(() => {
    const cached = localStorage.getItem('admin_automation_data');
    return cached ? JSON.parse(cached).requests || [] : [];
  });
  const [automations, setAutomations] = useState(() => {
    const cached = localStorage.getItem('admin_automation_data');
    return cached ? JSON.parse(cached).automations || [] : [];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState('assignments');

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

      const [reqRes, autoRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/admin/automation-requests`, { headers: { 'Authorization': `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/admin/automations`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      setRequests(reqRes.data);
      setAutomations(autoRes.data);
      localStorage.setItem('admin_automation_data', JSON.stringify({
        requests: reqRes.data,
        automations: autoRes.data
      }));
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    fetchData();
  }, []);

  const filteredAutomations = automations.filter(a =>
    a.status !== 'requested' && (
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.clientId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9FAFB] custom-scrollbar">
      {/* Header Section */}
      <div className="px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 pb-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-black text-primary tracking-tight">Automation Hub</h1>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Deploy and manage custom conversational nodes for clients</p>
          </div>

          <button
            onClick={() => onNavigate('/automations/builder')}
            className="flex items-center gap-2 px-6 py-3 bg-[#0F172A] text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200"
          >
            <Plus size={18} strokeWidth={3} /> Create Global Flow
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-6 md:px-8 pb-10">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard label="Total Flows" value={automations.length} icon={Layers} color="blue" />
            <StatCard label="Pending Requests" value={requests.length} icon={Clock} color="orange" />
            <StatCard label="Active Deployments" value={automations.filter(a => a.status === 'active').length} icon={Zap} color="emerald" />
          </div>

          {/* Tabs & Search */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-1.5 p-1 bg-slate-50 rounded-xl border border-slate-100">
              <button
                onClick={() => setTab('assignments')}
                className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${tab === 'assignments' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Assignments
              </button>
              <button
                onClick={() => setTab('requests')}
                className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${tab === 'requests' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Requests ({requests.length})
              </button>
            </div>

            <div className="relative w-full md:w-80 group">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search by flow or client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:bg-white focus:border-primary transition-all outline-none"
              />
            </div>
          </div>

          {/* Content Area */}
          {tab === 'requests' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests.length === 0 ? (
                <EmptyState icon={Bot} title="No Pending Requests" desc="All client automation needs are currently fulfilled." />
              ) : requests.map(req => (
                <RequestCard key={req._id} request={req} onNavigate={onNavigate} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAutomations.length === 0 ? (
                <EmptyState icon={Zap} title="No Active Assignments" desc="Start by creating a flow or fulfilling a request." />
              ) : filteredAutomations.map(auto => (
                <AssignmentCard key={auto._id} automation={auto} onNavigate={onNavigate} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon: Icon, trend }) {
  const bgColors = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary text-white shadow-lg shadow-secondary/20',
    blue: 'bg-blue-500/10 text-blue-600',
    purple: 'bg-purple-500/10 text-purple-600',
    orange: 'bg-orange-500/10 text-orange-600',
    amber: 'bg-amber-500/10 text-amber-600',
    rose: 'bg-rose-500/10 text-rose-600',
    emerald: 'bg-emerald-500/10 text-emerald-600',
    slate: 'bg-slate-500/10 text-slate-600',
  };
  const lineColors = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    emerald: 'bg-emerald-500',
    slate: 'bg-slate-500',
  };

  return (
    <div className="bg-white p-4 md:p-5 rounded-[1.25rem] border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden group">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 flex-shrink-0 ${bgColors[color] || bgColors.primary} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
        <div className="space-y-0.5 min-w-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{label}</p>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-black text-primary truncate">{value}</h3>
            {trend && (
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {trend}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 h-1 w-0 ${lineColors[color] || lineColors.primary} opacity-20 group-hover:w-full transition-all duration-500`}></div>
    </div>
  );
}

function RequestCard({ request, onNavigate }) {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-7 space-y-6 hover:shadow-xl hover:-translate-y-1 transition-all group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 font-black">
            {request.clientId?.name?.charAt(0) || 'C'}
          </div>
          <div>
            <p className="text-sm font-black text-slate-900">{request.clientId?.name || 'Unknown Client'}</p>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{request.clientId?.phone}</p>
          </div>
        </div>
        <div className="px-2.5 py-1 bg-amber-50 text-amber-600 rounded-lg text-[8px] font-black uppercase tracking-widest">Requested</div>
      </div>

      <div>
        <h4 className="text-base font-black text-slate-900 tracking-tight">{request.name}</h4>
        <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-2 italic">"{request.description}"</p>
      </div>

      <button
        onClick={() => onNavigate('/automations/builder', request)}
        className="w-full py-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 transition-all flex items-center justify-center gap-2"
      >
        <Zap size={14} fill="currentColor" /> Build & Assign
      </button>
    </div>
  );
}

function AssignmentCard({ automation, onNavigate }) {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm p-7 space-y-6 hover:shadow-xl transition-all group">
      <div className="flex items-center justify-between">
        <div className={`w-12 h-12 ${automation.status === 'active' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-400'} rounded-2xl flex items-center justify-center transition-colors group-hover:scale-110`}>
          <Zap size={22} fill="currentColor" />
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${automation.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
            {automation.status}
          </span>
          <p className="text-[8px] text-slate-300 font-bold uppercase tracking-[0.1em]">Version {automation.version || 1}</p>
        </div>
      </div>

      <div>
        <h4 className="text-base font-black text-slate-900 tracking-tight truncate">{automation.name}</h4>
        <div className="flex items-center gap-2 mt-1.5">
          <User size={12} className="text-slate-300" />
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            {automation.clientId?.name || 'Global Template'}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        <div className="flex items-center gap-4 text-slate-300">
          <div className="flex flex-col">
            <span className="text-[8px] font-black uppercase">Nodes</span>
            <span className="text-xs font-black text-slate-600">{automation.nodes?.length || 0}</span>
          </div>
        </div>
        <button
          onClick={() => onNavigate('/automations/builder', automation)}
          className="flex items-center gap-1.5 text-primary text-[10px] font-black uppercase tracking-widest hover:gap-2.5 transition-all"
        >
          Edit Flow <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, desc }) {
  return (
    <div className="col-span-full py-20 bg-white rounded-[3rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center px-6">
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
        <Icon size={40} />
      </div>
      <h3 className="text-xl font-black text-slate-800 tracking-tight">{title}</h3>
      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2 max-w-xs leading-relaxed">{desc}</p>
    </div>
  );
}
