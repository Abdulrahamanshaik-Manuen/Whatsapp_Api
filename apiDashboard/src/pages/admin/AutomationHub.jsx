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
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] overflow-hidden">
      <main className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar pb-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 gap-3 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">Automation Hub</h1>
            <p className="text-xs text-slate-400 font-semibold mt-2 leading-none">Deploy and manage custom conversational nodes for clients</p>
          </div>
          <button
            onClick={() => onNavigate('/automations/builder')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#003B6D] text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-all active:scale-95 shadow-sm shrink-0"
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>Create Global Flow</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
          <StatCard label="Total Flows" value={automations.length} icon={Layers} color="blue" />
          <StatCard label="Pending Requests" value={requests.length} icon={Clock} color="orange" />
          <StatCard label="Active Deployments" value={automations.filter(a => a.status === 'active').length} icon={Zap} color="emerald" />
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200 shadow-sm w-full sm:w-auto shrink-0 justify-center">
            <button
              onClick={() => setTab('assignments')}
              className={`px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${tab === 'assignments' ? 'bg-[#003B6D] text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
            >
              Assignments
            </button>
            <button
              onClick={() => setTab('requests')}
              className={`px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${tab === 'requests' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
            >
              Requests ({requests.length})
            </button>
          </div>

          <div className="relative flex-1 w-full group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
            <input
              type="text"
              placeholder="Search by flow or client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-slate-400 transition-all placeholder:text-slate-400 shadow-sm"
            />
          </div>
        </div>

        {/* Content Area */}
        {tab === 'requests' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {requests.length === 0 ? (
              <EmptyState icon={Bot} title="No Pending Requests" desc="All client automation needs are currently fulfilled." />
            ) : requests.map(req => (
              <RequestCard key={req._id} request={req} onNavigate={onNavigate} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredAutomations.length === 0 ? (
              <EmptyState icon={Zap} title="No Active Assignments" desc="Start by creating a flow or fulfilling a request." />
            ) : filteredAutomations.map(auto => (
              <AssignmentCard key={auto._id} automation={auto} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, color, icon: Icon }) {
  const bgColors = {
    blue: 'bg-blue-50 text-[#003B6D]',
    orange: 'bg-orange-50 text-orange-600',
    emerald: 'bg-emerald-50 text-[#63C132]',
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3.5 flex items-center gap-3 hover:shadow-md transition-all cursor-pointer shadow-sm">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${bgColors[color] || 'bg-blue-50 text-[#003B6D]'}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[11px] text-slate-500 font-semibold leading-none mb-1.5">{label}</p>
        <h3 className="text-xl font-bold text-slate-900 leading-none">{value}</h3>
      </div>
    </div>
  );
}

function RequestCard({ request, onNavigate }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 space-y-4 hover:shadow-md transition-all group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-bold text-sm">
            {request.clientId?.name?.charAt(0) || 'C'}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800 leading-none mb-1">{request.clientId?.name || 'Unknown Client'}</p>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none">{request.clientId?.phone}</p>
          </div>
        </div>
        <div className="px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 rounded text-[8px] font-bold uppercase tracking-wider">Requested</div>
      </div>

      <div>
        <h4 className="text-xs font-bold text-slate-850 tracking-tight truncate">{request.name}</h4>
        <p className="text-[10px] text-slate-400 font-medium mt-1 line-clamp-2 italic leading-relaxed">"{request.description}"</p>
      </div>

      <button
        onClick={() => onNavigate('/automations/builder', request)}
        className="w-full py-1.5 bg-[#003B6D] hover:opacity-90 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm flex items-center justify-center gap-1"
      >
        <Zap size={12} fill="currentColor" />
        <span>Build & Assign</span>
      </button>
    </div>
  );
}

function AssignmentCard({ automation, onNavigate }) {
  const isActive = automation.status === 'active';
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 space-y-4 hover:shadow-md transition-all group">
      <div className="flex items-center justify-between">
        <div className={`w-9 h-9 ${isActive ? 'bg-emerald-50 text-[#63C132]' : 'bg-slate-50 text-slate-400'} rounded-lg flex items-center justify-center transition-colors group-hover:scale-105`}>
          <Zap size={16} fill="currentColor" />
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
            {automation.status}
          </span>
          <p className="text-[8px] text-slate-300 font-bold uppercase tracking-[0.1em] leading-none">Version {automation.version || 1}</p>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-bold text-slate-850 tracking-tight truncate">{automation.name}</h4>
        <div className="flex items-center gap-1.5 mt-1">
          <User size={10} className="text-slate-400" />
          <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider truncate">
            {automation.clientId?.name || 'Global Template'}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[10px]">
        <div className="flex flex-col">
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Nodes</span>
          <span className="text-xs font-bold text-slate-700 mt-0.5">{automation.nodes?.length || 0}</span>
        </div>
        <button
          onClick={() => onNavigate('/automations/builder', automation)}
          className="flex items-center gap-1 text-[#003B6D] font-bold uppercase tracking-wider hover:gap-1.5 transition-all text-[9px]"
        >
          <span>Edit Flow</span>
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, desc }) {
  return (
    <div className="col-span-full py-12 bg-white rounded-lg border border-dashed border-slate-200 flex flex-col items-center justify-center text-center px-4">
      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-3">
        <Icon size={24} />
      </div>
      <h3 className="text-sm font-bold text-slate-800 tracking-tight">{title}</h3>
      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-1 max-w-xs leading-normal">{desc}</p>
    </div>
  );
}
