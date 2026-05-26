import React, { useState, useEffect } from 'react';
import {
  Plus, Zap, Play, Pause,
  Search, Filter, Trash2, Edit3, ChevronRight,
  TrendingUp, Activity, Users, Clock, AlertCircle, X, Send, Bot
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function AutomationPage({ onNavigate }) {
  const [automations, setAutomations] = useState(() => {
    const saved = localStorage.getItem('cached_automations');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(!automations.length);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestData, setRequestData] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  // Calculate dynamic stats
  const stats = {
    totalExecutions: automations.reduce((acc, curr) => acc + (curr.metrics?.totalExecutions || 0), 0),
    activeFlows: automations.filter(a => a.status === 'active').length,
    successRate: automations.length > 0
      ? (automations.reduce((acc, curr) => acc + (curr.metrics?.successRate || 0), 0) / automations.length).toFixed(1)
      : 0,
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
      setShowRequestModal(true);
    }
  };

  const submitRequest = async (e) => {
    e.preventDefault();
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
        alert("Automation request sent to Admin successfully!");
        setShowRequestModal(false);
        setRequestData({ name: '', description: '' });
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

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden relative">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-8 custom-scrollbar">
        {/* Header */}
        <header className="pb-4 bg-transparent flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-primary tracking-tight">Automations</h1>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                 {isAdmin ? 'Design and manage global conversational flows' : 'Manage your conversational flows'}
              </p>
            </div>
            <button
              onClick={handleAction}
              className={`flex items-center gap-2 px-6 py-3 text-white text-sm font-bold rounded-2xl hover:brightness-110 transition-all shadow-xl active:scale-95 ${isAdmin ? 'bg-primary shadow-primary/20' : 'bg-[#0F172A] shadow-slate-200'} w-full sm:w-auto justify-center`}
            >
              {isAdmin ? <Plus size={18} /> : <Bot size={18} />}
              {isAdmin ? 'Create Workflow' : 'Request Workflow'}
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-6">
            <StatCard label="Total Executions" value={stats.totalExecutions.toLocaleString()} icon={Activity} color="primary" />
            <StatCard label="Active Flows" value={stats.activeFlows} icon={Zap} color="secondary" />
            <StatCard label="Avg Success Rate" value={`${stats.successRate}%`} icon={TrendingUp} color="blue" />
            <StatCard label="Total Workflows" value={stats.totalFlows} icon={Users} color="purple" />
          </div>
        </header>

        {/* List Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative w-96">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search workflows..."
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:border-primary transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Automation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {automations.map((auto, idx) => (
              <AutomationCard
                key={auto._id}
                automation={auto}
                isAdmin={isAdmin}
                onEdit={() => onNavigate('/automations/builder', auto)}
                onToggle={() => toggleStatus(auto._id, auto.status)}
              />
            ))}

            {/* Empty State Mockup */}
            {automations.length === 0 && !loading && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-300">
                  <Zap size={40} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">No automations yet</h3>
                  <p className="text-sm text-slate-400 max-w-xs">
                      {isAdmin ? 'Start by creating your first global template.' : 'Request your first custom workflow from our team.'}
                  </p>
                </div>
                <button
                  onClick={handleAction}
                  className="px-8 py-3 bg-slate-800 text-white text-xs font-bold rounded-2xl hover:bg-slate-900 transition-all shadow-xl shadow-slate-200"
                >
                  {isAdmin ? 'Get Started' : 'Request Now'}
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Request Modal */}
      {showRequestModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowRequestModal(false)}></div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 overflow-hidden"
              >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                  
                  <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                              <Bot size={22} />
                          </div>
                          <div>
                              <h3 className="text-xl font-black text-slate-900 tracking-tight">Request Workflow</h3>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Our team will build it for you</p>
                          </div>
                      </div>
                      <button onClick={() => setShowRequestModal(false)} className="text-slate-300 hover:text-slate-500 transition-colors">
                          <X size={20} />
                      </button>
                  </div>

                  <form onSubmit={submitRequest} className="space-y-6">
                      <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Workflow Name</label>
                          <input 
                            required
                            type="text" 
                            placeholder="e.g., Lead Follow-up Flow"
                            value={requestData.name}
                            onChange={e => setRequestData({...requestData, name: e.target.value})}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:border-primary transition-all outline-none"
                          />
                      </div>
                      <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Requirements / Description</label>
                          <textarea 
                            required
                            rows={4}
                            placeholder="Describe how the automation should work..."
                            value={requestData.description}
                            onChange={e => setRequestData({...requestData, description: e.target.value})}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:border-primary transition-all outline-none resize-none"
                          />
                      </div>
                      <button 
                        disabled={submitting}
                        className="w-full py-4 bg-primary text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 transition-all flex items-center justify-center gap-3"
                      >
                         {submitting ? <Clock className="animate-spin" size={16} /> : <Send size={16} />}
                         Send Request
                      </button>
                  </form>
              </motion.div>
          </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    blue: 'bg-blue-50 text-blue-500',
    purple: 'bg-purple-50 text-purple-500'
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center gap-3 sm:gap-5 group hover:scale-[1.02] transition-all cursor-pointer min-w-0">
      <div className={`w-10 sm:w-14 h-10 sm:h-14 shrink-0 ${colors[color]} rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      <div className="min-w-0">
        <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{label}</p>
        <h3 className="text-lg sm:text-2xl font-black text-slate-800 mt-0.5 truncate">{value}</h3>
      </div>
    </div>
  );
}

function AutomationCard({ automation, isAdmin, onEdit, onToggle }) {
  const isRequested = automation.status === 'requested';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-6 flex flex-col group hover:border-primary/20 transition-all ${isRequested ? 'opacity-80' : ''}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className={`w-12 h-12 ${isRequested ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-primary group-hover:bg-primary group-hover:text-white'} rounded-2xl flex items-center justify-center transition-all`}>
          {isRequested ? <Clock size={20} /> : <Zap size={20} fill="currentColor" />}
        </div>
        {!isRequested && (
          <div className="flex items-center gap-3">
            <button
              disabled={!isAdmin}
              onClick={(e) => {
                e.stopPropagation();
                if (isAdmin) onToggle();
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${automation.status === 'active' ? 'bg-emerald-500' : 'bg-slate-200'} ${!isAdmin ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${automation.status === 'active' ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
        )}
        {isRequested && (
            <span className="text-[8px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-lg uppercase tracking-widest">Under Review</span>
        )}
      </div>

      <div className="flex-1 space-y-1">
        <h4 className="text-base font-black text-slate-800 tracking-tight">{automation.name}</h4>
        <p className="text-xs text-slate-400 font-medium line-clamp-1">{automation.description || 'No description provided.'}</p>
      </div>

      <div className="h-[1px] bg-slate-50 my-6"></div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${automation.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{automation.status}</span>
        </div>
        {!isRequested ? (
            <button
              onClick={onEdit}
              className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:gap-3 transition-all"
            >
              {isAdmin ? 'Open Builder' : 'View Flow'}
              <ChevronRight size={14} />
            </button>
        ) : (
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <AlertCircle size={12} />
                Builder Locked
            </span>
        )}
      </div>
    </motion.div>
  );
}
