import React, { useState, useEffect } from 'react';
import {
  Plus, Zap, Play, Pause,
  Search, Filter, Trash2, Edit3, ChevronRight,
  TrendingUp, Activity, Users, Clock, AlertCircle, X, Send, Bot,
  ExternalLink, MoreVertical, Layers, Check, Loader2
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function AutomationPage({ onNavigate }) {
  const [automations, setAutomations] = useState(() => {
    const saved = localStorage.getItem('cached_automations');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(!automations.length);
  const [showRequestDrawer, setShowRequestDrawer] = useState(false);
  const [requestData, setRequestData] = useState({
    name: '',
    description: '',
    businessGoal: '',
    priority: 'Medium'
  });
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [creatorFilter, setCreatorFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [openMenuId, setOpenMenuId] = useState(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  // Calculate dynamic stats
  const stats = {
    totalExecutions: automations.reduce((acc, curr) => acc + (curr.metrics?.totalExecutions || 0), 0),
    activeFlows: automations.filter(a => a.status === 'active').length,
    successRate: automations.length > 0
      ? (automations.reduce((acc, curr) => acc + (curr.metrics?.successRate || 0), 0) / automations.length).toFixed(1)
      : '0.0',
    totalFlows: automations.length
  };

  useEffect(() => {
    fetchAutomations();
  }, []);

  const fetchAutomations = async () => {
    if (automations.length === 0) setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/automations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setAutomations(response.data);
      localStorage.setItem('cached_automations', JSON.stringify(response.data));
    } catch (err) {
      console.error("Failed to fetch automations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = () => {
    if (isAdmin) {
      if (onNavigate) onNavigate('/automations/builder');
    } else {
      setShowRequestDrawer(true);
    }
  };

  const submitRequest = async (e) => {
    e.preventDefault();
    if (!requestData.name || !requestData.description) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/automations`, {
        ...requestData,
        status: 'requested',
        nodes: [],
        edges: []
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert("Automation request sent successfully!");
      setShowRequestDrawer(false);
      setRequestData({ name: '', description: '', businessGoal: '', priority: 'Medium' });
      fetchAutomations();
    } catch (err) {
      console.error("Request Error:", err);
      alert("Failed to send request");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      await axios.put(`${API_BASE_URL}/automations/${id}`, { status: newStatus }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setAutomations(prev => prev.map(a => a._id === id ? { ...a, status: newStatus } : a));
    } catch (err) {
      console.error("Toggle Status Error:", err);
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this automation?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/automations/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setAutomations(prev => prev.filter(a => a._id !== id));
      alert("Automation deleted successfully!");
    } catch (err) {
      console.error("Delete Error:", err);
      alert("Failed to delete automation");
    }
  };

  // Filter and sort automations
  const filteredAutomations = automations.filter(auto => {
    const matchesSearch = auto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (auto.description && auto.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || auto.status === statusFilter;

    let matchesCreator = true;
    if (creatorFilter === 'admin') {
      matchesCreator = auto.createdBy && auto.createdBy !== user.user_id;
    } else if (creatorFilter === 'client') {
      matchesCreator = auto.createdBy === user.user_id;
    }

    return matchesSearch && matchesStatus && matchesCreator;
  });

  const sortedAutomations = [...filteredAutomations].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'success') {
      const rateA = a.metrics?.successRate || 0;
      const rateB = b.metrics?.successRate || 0;
      return rateB - rateA;
    } else {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden relative">
      <main className="flex-1 flex flex-col overflow-hidden p-4 md:p-6 space-y-4 custom-scrollbar">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 gap-4 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">Automations</h1>
            <p className="text-xs text-slate-400 font-semibold mt-2 leading-none">Build smart workflows and automate conversations</p>
          </div>
          <div>
            <button
              onClick={handleAction}
              className="flex items-center gap-1.5 h-9 px-3.5 bg-[#004277] hover:brightness-105 active:scale-98 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer shrink-0"
            >
              {isAdmin ? <Plus size={14} strokeWidth={2.5} /> : <Bot size={14} />}
              <span>{isAdmin ? 'Create Workflow' : 'Request Workflow'}</span>
            </button>
          </div>
        </div>

        {/* KPI Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 shrink-0">
          {/* Card 1: Total Executions */}
          <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-blue-50 text-[#004277] flex items-center justify-center shrink-0">
              <Activity size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 leading-none">{stats.totalExecutions.toLocaleString()}</h3>
              <p className="text-[11px] text-slate-500 font-semibold leading-none mt-1.5">Total Executions</p>
            </div>
          </div>

          {/* Card 2: Active Flows */}
          <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-emerald-50 text-[#22C55E] flex items-center justify-center shrink-0">
              <Zap size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 leading-none">{stats.activeFlows}</h3>
              <p className="text-[11px] text-slate-500 font-semibold leading-none mt-1.5">Active Flows</p>
            </div>
          </div>

          {/* Card 3: Avg Success Rate */}
          <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
              <TrendingUp size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 leading-none">{stats.successRate}%</h3>
              <p className="text-[11px] text-slate-500 font-semibold leading-none mt-1.5">Avg Success Rate</p>
            </div>
          </div>

          {/* Card 4: Total Workflows */}
          <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
              <Layers size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 leading-none">{stats.totalFlows}</h3>
              <p className="text-[11px] text-slate-500 font-semibold leading-none mt-1.5">Total Workflows</p>
            </div>
          </div>
        </div>

        {/* Search & Filter Row */}
        <div className="flex flex-col md:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm shrink-0">
          <div className="relative flex-1 w-full group">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#004277] transition-colors" />
            <input
              type="text"
              placeholder="Search workflows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 h-8 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-[#004277] focus:ring-1 focus:ring-[#004277]/10 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 pl-2.5 pr-8 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-wider focus:outline-none cursor-pointer appearance-none"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748B\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2.5\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '10px' }}
            >
              <option value="all">Status: All</option>
              <option value="active">Status: Active</option>
              <option value="paused">Status: Paused</option>
              <option value="requested">Status: Requested</option>
            </select>

            <select
              value={creatorFilter}
              onChange={(e) => setCreatorFilter(e.target.value)}
              className="h-8 pl-2.5 pr-8 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-wider focus:outline-none cursor-pointer appearance-none"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748B\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2.5\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '10px' }}
            >
              <option value="all">Created by: All</option>
              <option value="admin">Created by: Admin</option>
              <option value="client">Created by: Me</option>
            </select>

            <button
              onClick={() => { setStatusFilter('all'); setCreatorFilter('all'); setSearchQuery(''); }}
              className="h-8 w-8 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-400 rounded-lg transition-colors cursor-pointer flex items-center justify-center shrink-0"
              title="Reset Filters"
            >
              <Filter size={14} />
            </button>
          </div>
        </div>

        {/* Workflows List Section */}
        <div className="flex-1 flex flex-col min-h-0 space-y-3">
          <div className="flex items-center justify-between shrink-0">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Workflows ({sortedAutomations.length})</h2>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-7 pl-2.5 pr-8 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 focus:outline-none cursor-pointer appearance-none"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748B\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2.5\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '8px' }}
              >
                <option value="newest">Recently Created</option>
                <option value="name">Alphabetical</option>
                <option value="success">Success Rate</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1.5 custom-scrollbar min-h-0">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 bg-white rounded-xl border border-slate-100 animate-pulse shadow-sm" />
              ))
            ) : sortedAutomations.length === 0 ? (
              <div className="h-full bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-3 border border-slate-100 shadow-inner">
                  <Layers size={28} />
                </div>
                <h3 className="text-sm font-bold text-slate-800">No more workflows yet</h3>
                <p className="text-[11px] text-slate-400 max-w-xs font-semibold mt-1 leading-relaxed">
                  Create your first automation or request a custom workflow to streamline your customer communications.
                </p>
                <button
                  onClick={handleAction}
                  className="mt-4 flex items-center gap-1.5 h-8 px-4 bg-[#004277] hover:brightness-105 active:scale-98 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  {isAdmin ? <Plus size={13} strokeWidth={2.5} /> : <Bot size={13} />}
                  <span>{isAdmin ? 'Create Workflow' : 'Request Workflow'}</span>
                </button>
              </div>
            ) : (
              sortedAutomations.map((auto) => {
                const isAct = auto.status === 'active';
                const isReq = auto.status === 'requested';
                return (
                  <div
                    key={auto._id}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between p-4 relative overflow-hidden group hover:border-[#004277]/30 transition-all gap-4"
                  >
                    {/* Vertical Status Indicator Strip */}
                    <div className={`absolute left-0 top-0 bottom-0 w-[4px] ${isAct ? 'bg-[#22C55E]' : isReq ? 'bg-amber-400' : 'bg-slate-300'}`} />

                    {/* Left Details block */}
                    <div className="flex items-start gap-3.5 min-w-0 pl-1.5">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isAct ? 'bg-emerald-50 text-emerald-500 border border-emerald-100' : isReq ? 'bg-amber-50 text-amber-500 border border-amber-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                        {isReq ? <Clock size={16} /> : <Zap size={16} fill={isAct ? 'currentColor' : 'none'} />}
                      </div>
                      <div className="space-y-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-800 leading-tight group-hover:text-[#004277] transition-colors">{auto.name}</h4>
                        <p className="text-xs text-slate-450 font-medium line-clamp-1 pr-4" title={auto.description}>{auto.description || 'No description provided.'}</p>
                        
                        {/* Meta Tags Row */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                          <span className="flex items-center gap-1.5 shrink-0">
                            <span className={`w-1.5 h-1.5 rounded-full ${isAct ? 'bg-emerald-500' : isReq ? 'bg-amber-400' : 'bg-slate-400'}`} />
                            <span className="text-[10px] text-slate-500 font-bold capitalize">{auto.status}</span>
                          </span>
                          
                          <span className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold shrink-0">
                            <Users size={12} />
                            <span>{auto.nodes?.filter(n => n.type === 'trigger')?.length || 1} Trigger{(auto.nodes?.filter(n => n.type === 'trigger')?.length || 1) !== 1 ? 's' : ''}</span>
                          </span>

                          <span className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold shrink-0">
                            <Clock size={12} />
                            <span>Updated {new Date(auto.updatedAt || auto.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </span>

                          {auto.priority && (
                            <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded leading-none ${
                              auto.priority === 'High' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                              auto.priority === 'Medium' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                              'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}>
                              {auto.priority}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Success & Actions block */}
                    <div className="flex items-center justify-between md:justify-end gap-5 shrink-0 pl-1.5 md:pl-0 border-t border-slate-50 md:border-t-0 pt-3 md:pt-0">
                      <div className="text-left md:text-right shrink-0">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Success Rate</p>
                        <h4 className="text-lg font-black text-[#22C55E] leading-none mt-1">
                          {(auto.metrics?.successRate || 0).toFixed(1)}%
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onNavigate('/automations/builder', auto)}
                          className="flex items-center gap-1 h-8 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-650 hover:text-slate-800 text-xs font-bold rounded-lg transition-all cursor-pointer shadow-sm active:scale-98"
                        >
                          <span>View Flow</span>
                          <ExternalLink size={12} className="text-slate-400" />
                        </button>

                        {/* Options Dropdown block */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === auto._id ? null : auto._id);
                            }}
                            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-650 transition-colors cursor-pointer"
                          >
                            <MoreVertical size={14} />
                          </button>

                          {openMenuId === auto._id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                              <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-20 animate-in fade-in slide-in-from-top-1 duration-150">
                                {isAdmin && !isReq && (
                                  <button
                                    onClick={() => {
                                      toggleStatus(auto._id, auto.status);
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                                  >
                                    {isAct ? <Pause size={12} /> : <Play size={12} />}
                                    <span>{isAct ? 'Pause' : 'Activate'}</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    onNavigate('/automations/builder', auto);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Edit3 size={12} />
                                  <span>{isAdmin ? 'Open Builder' : 'View Flow'}</span>
                                </button>
                                <button
                                  onClick={() => {
                                    handleDelete(auto._id);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full text-left px-3 py-2 text-xs font-bold text-red-650 hover:bg-red-50 flex items-center gap-1.5 cursor-pointer border-t border-slate-100"
                                >
                                  <Trash2 size={12} />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* Slide-In Request Drawer */}
      <div className={`fixed inset-y-0 right-0 z-50 w-[360px] bg-white border-l border-slate-200 shadow-2xl transition-transform duration-300 ease-out flex flex-col ${showRequestDrawer ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2">
            <Bot size={16} className="text-[#004277]" />
            <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Request Workflow</span>
          </div>
          <button
            onClick={() => {
              setShowRequestDrawer(false);
              setRequestData({ name: '', description: '', businessGoal: '', priority: 'Medium' });
            }}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Banner Block */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex items-center gap-3 shrink-0 mx-4 mt-4 rounded-xl border border-slate-200/60">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#004277] flex items-center justify-center shrink-0 border border-blue-100/40">
            <Bot size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-850">Request Workflow</h4>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Our team will build it for you</p>
          </div>
        </div>

        {/* Scrollable Fields */}
        <form onSubmit={submitRequest} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          <div className="space-y-1">
            <div className="flex justify-between items-center ml-0.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Workflow Name *</label>
              <span className="text-[9px] text-slate-450 font-bold">{requestData.name.length}/100</span>
            </div>
            <input
              required
              maxLength={100}
              type="text"
              placeholder="e.g., Lead Follow-up Flow"
              value={requestData.name}
              onChange={e => setRequestData({ ...requestData, name: e.target.value })}
              className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-[#004277] focus:ring-1 focus:ring-[#004277]/10 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center ml-0.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Requirements / Description *</label>
              <span className="text-[9px] text-slate-450 font-bold">{requestData.description.length}/1000</span>
            </div>
            <textarea
              required
              maxLength={1000}
              rows={4}
              placeholder="Describe how the automation should work, what should trigger it, what actions should be taken, and any specific rules."
              value={requestData.description}
              onChange={e => setRequestData({ ...requestData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-[#004277] focus:ring-1 focus:ring-[#004277]/10 outline-none transition-all placeholder:text-slate-400 resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Business Goal (Optional)</label>
            <input
              type="text"
              maxLength={200}
              placeholder="e.g., Increase conversions, Improve support"
              value={requestData.businessGoal}
              onChange={e => setRequestData({ ...requestData, businessGoal: e.target.value })}
              className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-[#004277] focus:ring-1 focus:ring-[#004277]/10 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Priority</label>
            <select
              value={requestData.priority}
              onChange={e => setRequestData({ ...requestData, priority: e.target.value })}
              className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-[#004277] focus:ring-1 focus:ring-[#004277]/10 outline-none transition-all cursor-pointer"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Info SLA Banner */}
          <div className="p-3 bg-blue-50/40 border border-blue-100/50 rounded-lg flex gap-2 text-[#004277] leading-relaxed">
            <AlertCircle size={14} className="shrink-0 mt-0.5 text-blue-500" />
            <p className="text-[10px] font-bold">Our automation experts will review your request and get back to you within 24 hours.</p>
          </div>
        </form>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-100 flex items-center gap-2 bg-slate-50/50 shrink-0">
          <button
            type="button"
            onClick={() => {
              setShowRequestDrawer(false);
              setRequestData({ name: '', description: '', businessGoal: '', priority: 'Medium' });
            }}
            className="flex-1 h-9 bg-white text-slate-500 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={submitRequest}
            disabled={submitting || !requestData.name || !requestData.description}
            className="flex-1 flex items-center justify-center gap-1.5 h-9 bg-[#004277] hover:brightness-105 text-white text-xs font-bold rounded-lg transition-all active:scale-98 cursor-pointer disabled:opacity-50"
          >
            {submitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            <span>Send Request</span>
          </button>
        </div>
      </div>

      {/* Backdrop */}
      {showRequestDrawer && (
        <div
          onClick={() => {
            setShowRequestDrawer(false);
            setRequestData({ name: '', description: '', businessGoal: '', priority: 'Medium' });
          }}
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-xs transition-opacity duration-300"
        />
      )}
    </div>
  );
}
