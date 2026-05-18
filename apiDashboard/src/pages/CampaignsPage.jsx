import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Filter, Calendar, MessageSquare,
  TrendingUp, Clock, CheckCircle2, AlertCircle,
  MoreVertical, Send, Loader2, ArrowRight, ChevronRight,
  Menu, Zap, User, Target, Users, LayoutDashboard, X, RefreshCcw, Upload,
  MessageCircle, FileText
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

import { useSocket } from '../context/SocketContext';

export default function CampaignsPage({ onNavigate }) {
  const { socket } = useSocket();
  const [campaigns, setCampaigns] = useState(() => {
    const saved = localStorage.getItem('cached_campaigns');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(!campaigns.length);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchCampaigns();
    
    if (socket) {
      socket.on('campaign_progress', (data) => {
        const { campaignId, status } = data;
        setCampaigns(prev => prev.map(c => {
          if (c._id === campaignId) {
            const countField = `${status}_count`;
            return {
              ...c,
              [countField]: (c[countField] || 0) + 1
            };
          }
          return c;
        }));
      });
    }

    return () => {
      if (socket) socket.off('campaign_progress');
    };
  }, [socket]);

  const fetchCampaigns = async () => {
    if (campaigns.length === 0) setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/campaigns`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setCampaigns(data);
        localStorage.setItem('cached_campaigns', JSON.stringify(data));
      }
    } catch (err) {
      console.error("Failed to fetch campaigns:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (campaignId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setCampaigns(prev => prev.map(c =>
          c._id === campaignId ? { ...c, status: newStatus } : c
        ));
      }
    } catch (err) {
      console.error("Status Update Error:", err);
    }
  };

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = (c.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || (c.status || '').toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'running').length,
    completed: campaigns.filter(c => c.status === 'completed').length,
    scheduled: campaigns.filter(c => c.status === 'scheduled').length,
    failed: campaigns.filter(c => c.status === 'failed').length
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] overflow-hidden">
      <main className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar pb-20">

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-primary tracking-tight">Campaigns</h1>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Create and monitor your message broadcasts</p>
          </div>
          <button
            onClick={() => onNavigate('/campaigns/create')}
            className="flex items-center gap-2 px-6 py-3 bg-secondary text-white text-sm font-bold rounded-xl hover:brightness-105 transition-all shadow-lg shadow-secondary/20 active:scale-95"
          >
            <Plus size={18} />
            New Campaign
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          <StatCard label="Total Campaigns" value={stats.total} icon={Target} color="primary" />
          <StatCard label="Active Now" value={stats.active} icon={TrendingUp} color="secondary" />
          <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} color="primary" />
          <StatCard label="Scheduled" value={stats.scheduled} icon={Calendar} color="secondary" />
          <StatCard label="Failed" value={stats.failed} icon={AlertCircle} color="primary" />
        </div>

        {/* Filters & List */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {['All', 'Running', 'Completed', 'Scheduled', 'Failed'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${statusFilter === status ? 'bg-primary text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <Loader2 className="animate-spin text-primary" size={32} />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Loading Campaigns</p>
              </div>
            ) : filteredCampaigns.length > 0 ? (
              <div className="space-y-4">
                {filteredCampaigns.map(camp => (
                  <CampaignItem key={camp._id} campaign={camp} onStatusUpdate={handleStatusUpdate} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-200">
                  <Target size={32} />
                </div>
                <h3 className="text-base font-bold text-slate-800">No campaigns found</h3>
                <p className="text-sm text-slate-500 mt-1">Start a new campaign to see it here.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  const isSecondary = color === 'secondary';
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 flex items-center gap-4">
      <div className={`w-12 h-12 ${isSecondary ? 'bg-secondary text-white' : 'bg-primary/10 text-primary'} rounded-xl flex items-center justify-center`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <h3 className="text-xl font-black text-primary">{value}</h3>
      </div>
    </div>
  );
}

function CampaignItem({ campaign, onStatusUpdate }) {
  const statusColors = {
    running: 'bg-blue-50 text-blue-600',
    completed: 'bg-secondary/10 text-secondary',
    scheduled: 'bg-purple-50 text-purple-600',
    failed: 'bg-red-50 text-red-600'
  };

  return (
    <div className="group p-5 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all flex flex-col md:flex-row md:items-center gap-6">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <h4 className="text-base font-bold text-slate-800 truncate">{campaign.name}</h4>
          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${statusColors[campaign.status] || 'bg-slate-100 text-slate-500'}`}>
            {campaign.status}
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1.5"><MessageSquare size={14} /> {campaign.template_name}</span>
          <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(campaign.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex items-center gap-6 px-6 md:border-l md:border-slate-100">
        <div className="text-center min-w-[50px]">
          <p className="text-sm font-black text-slate-800">{campaign.sent_count || 0}</p>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Sent</p>
        </div>
        <div className="text-center min-w-[50px]">
          <p className="text-sm font-black text-slate-800">{campaign.delivered_count || 0}</p>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Deliv</p>
        </div>
        <div className="text-center min-w-[50px]">
          <p className="text-sm font-black text-slate-800">{campaign.read_count || 0}</p>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Read</p>
        </div>
        <div className="text-center min-w-[50px]">
          <p className="text-sm font-black text-red-500">{campaign.failed_count || 0}</p>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Failed</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {(campaign.status === 'pending' || campaign.status === 'scheduled') && (
          <button
            onClick={() => onStatusUpdate(campaign._id, 'running')}
            className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center hover:brightness-110 shadow-lg shadow-primary/20"
          >
            <Send size={16} />
          </button>
        )}
        <button className="w-9 h-9 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 transition-colors border border-slate-100">
          <MoreVertical size={18} />
        </button>
      </div>
    </div>
  );
}
