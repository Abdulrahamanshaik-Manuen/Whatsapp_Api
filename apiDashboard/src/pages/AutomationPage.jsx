import React, { useState, useEffect } from 'react';
import { 
  Plus, Zap, Play, Pause, MoreVertical, 
  Search, Filter, Trash2, Edit3, ChevronRight,
  TrendingUp, Activity, Users, Clock, AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function AutomationPage({ onNavigate }) {
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAutomations();
  }, []);

  const fetchAutomations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/automations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setAutomations(response.data);
    } catch (err) {
      console.error("Failed to fetch automations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    if (onNavigate) onNavigate('/automations/builder');
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
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      {/* Header */}
      <header className="px-8 py-6 bg-white border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Automation workflows</h2>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Design and manage conversational flows</p>
        </div>
        <button 
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-bold rounded-2xl hover:brightness-110 transition-all shadow-xl shadow-primary/20 active:scale-95"
        >
          <Plus size={18} />
          Create Workflow
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <StatCard label="Total Executions" value="12.4k" icon={Activity} color="primary" />
            <StatCard label="Active Flows" value="8" icon={Zap} color="secondary" />
            <StatCard label="Success Rate" value="98.2%" icon={TrendingUp} color="blue" />
            <StatCard label="Active Users" value="452" icon={Users} color="purple" />
        </div>

        {/* List Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search workflows..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-100 rounded-xl text-xs font-bold focus:outline-none focus:border-primary transition-all shadow-sm"
              />
            </div>
            <button className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-primary transition-all shadow-sm">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Automation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {automations.map((auto, idx) => (
              <AutomationCard 
                key={auto._id} 
                automation={auto} 
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
                  <p className="text-sm text-slate-400 max-w-xs">Start by creating your first workflow to automate your customer interactions.</p>
                </div>
                <button 
                  onClick={handleCreateNew}
                  className="px-8 py-3 bg-slate-800 text-white text-xs font-bold rounded-2xl hover:bg-slate-900 transition-all shadow-xl shadow-slate-200"
                >
                  Get Started
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
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
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center gap-5 group hover:scale-[1.02] transition-all cursor-pointer">
      <div className={`w-14 h-14 ${colors[color]} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <h3 className="text-2xl font-black text-slate-800 mt-0.5">{value}</h3>
      </div>
    </div>
  );
}

function AutomationCard({ automation, onEdit, onToggle }) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-6 flex flex-col group hover:border-primary/20 transition-all"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
          <Zap size={20} fill="currentColor" />
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={(e) => {
                e.stopPropagation();
                onToggle();
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${automation.status === 'active' ? 'bg-emerald-500' : 'bg-slate-200'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${automation.status === 'active' ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-1">
        <h4 className="text-base font-black text-slate-800 tracking-tight">{automation.name}</h4>
        <p className="text-xs text-slate-400 font-medium line-clamp-1">{automation.description || 'No description provided.'}</p>
      </div>

      <div className="h-[1px] bg-slate-50 my-6"></div>

      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
            {[1,2,3].map(i => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-400">
                    U{i}
                </div>
            ))}
        </div>
        <button 
          onClick={onEdit}
          className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:gap-3 transition-all"
        >
          Open Builder
          <ChevronRight size={14} />
        </button>
      </div>
    </motion.div>
  );
}
