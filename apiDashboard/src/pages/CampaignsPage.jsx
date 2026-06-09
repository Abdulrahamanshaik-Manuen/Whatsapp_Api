import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Filter, Calendar, MessageSquare,
  TrendingUp, Clock, CheckCircle2, AlertCircle,
  MoreVertical, Send, Loader2, ArrowRight, ChevronRight,
  Menu, Zap, User, Target, Users, LayoutDashboard, X, RefreshCcw, Upload,
  MessageCircle, FileText, Play
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

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

  const totalItems = filteredCampaigns.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedCampaigns = filteredCampaigns.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 6) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const stats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'running').length,
    completed: campaigns.filter(c => c.status === 'completed').length,
    scheduled: campaigns.filter(c => c.status === 'scheduled').length,
    failed: campaigns.filter(c => c.status === 'failed').length
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] overflow-hidden">
      <main className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar pb-12">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">Campaigns</h1>
            <p className="text-xs text-slate-400 font-semibold leading-none mt-2">Manage and monitor your outbound messaging campaigns</p>
          </div>
          <button
            onClick={() => onNavigate('/campaigns/create')}
            className="flex items-center justify-center gap-1.5 h-10 px-4 bg-[#25D366] hover:brightness-105 active:scale-98 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer shrink-0"
          >
            <Plus size={16} strokeWidth={2.5} />
            New Campaign
          </button>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* Card 1: Total */}
          <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
              <Target size={20} />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-semibold leading-none mb-1.5">Total Campaigns</p>
              <h3 className="text-xl font-bold text-slate-900 leading-none">{stats.total}</h3>
            </div>
          </div>
          {/* Card 2: Running */}
          <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
              <Play size={20} fill="currentColor" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-semibold leading-none mb-1.5">Running</p>
              <h3 className="text-xl font-bold text-slate-900 leading-none">{stats.active}</h3>
            </div>
          </div>
          {/* Card 3: Completed */}
          <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-[#EBF3FE] text-[#1B72E8] flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-semibold leading-none mb-1.5">Completed</p>
              <h3 className="text-xl font-bold text-slate-900 leading-none">{stats.completed}</h3>
            </div>
          </div>
          {/* Card 4: Scheduled */}
          <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-semibold leading-none mb-1.5">Scheduled</p>
              <h3 className="text-xl font-bold text-slate-900 leading-none">{stats.scheduled}</h3>
            </div>
          </div>
          {/* Card 5: Failed */}
          <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-semibold leading-none mb-1.5">Failed</p>
              <h3 className="text-xl font-bold text-slate-900 leading-none">{stats.failed}</h3>
            </div>
          </div>
        </div>

        {/* Search & Filters Row */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3 bg-white border border-slate-200 rounded-lg p-2.5 shadow-sm">
          {/* Left inputs */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full lg:w-auto">
            {/* Search Box */}
            <div className="relative w-full sm:w-60">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 h-8 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Statuses Dropdown */}
            <div className="relative w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-32 pl-3 pr-8 h-8 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-650 outline-none cursor-pointer appearance-none"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748B\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '10px' }}
              >
                <option value="All">All Statuses</option>
                <option value="Running">Running</option>
                <option value="Completed">Completed</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Failed">Failed</option>
              </select>
            </div>

            {/* Date Range Dropdown */}
            <div className="relative w-full sm:w-auto">
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Calendar size={13} />
              </div>
              <select
                defaultValue="All"
                className="w-full sm:w-32 pl-8 pr-8 h-8 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-650 outline-none cursor-pointer appearance-none"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748B\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '10px' }}
              >
                <option value="All">All Time</option>
                <option value="Today">Today</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>
          </div>

          {/* Right Status Tabs */}
          <div className="flex items-center bg-slate-50 p-1 rounded-lg border border-slate-200/60 w-full lg:w-auto overflow-x-auto no-scrollbar gap-0.5">
            {['All', 'Running', 'Completed', 'Scheduled', 'Failed'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`flex-1 lg:flex-initial text-center px-3.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  statusFilter.toLowerCase() === status.toLowerCase() 
                    ? 'bg-[#0A2540] text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Campaign Dense Table Container */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden p-3.5">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-primary" size={24} />
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Loading Campaigns</p>
            </div>
          ) : filteredCampaigns.length > 0 ? (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full min-w-[850px] text-left text-xs border-collapse">
                <thead>
                  <tr className="text-slate-400 font-bold uppercase text-[9px] tracking-wider border-b border-slate-100">
                    <th className="py-3 px-4 font-bold">Campaign Name</th>
                    <th className="py-3 px-2 font-bold">Status</th>
                    <th className="py-3 px-2 font-bold text-center">Sent</th>
                    <th className="py-3 px-2 font-bold text-center">Delivered</th>
                    <th className="py-3 px-2 font-bold text-center">Read</th>
                    <th className="py-3 px-2 font-bold text-center">Failed</th>
                    <th className="py-3 px-2 font-bold">Date</th>
                    <th className="py-3 px-4 font-bold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedCampaigns.map(camp => {
                    const statusColors = {
                      completed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                      running: 'bg-blue-50 text-blue-600 border-blue-100',
                      scheduled: 'bg-amber-50 text-amber-600 border-amber-100',
                      failed: 'bg-rose-50 text-rose-600 border-rose-100'
                    };

                    const sent = camp.sent_count || 0;
                    const delivered = camp.delivered_count || 0;
                    const read = camp.read_count || 0;
                    const failed = camp.failed_count || 0;

                    const delRate = sent > 0 ? Math.round((delivered / sent) * 100) : 0;
                    const readRate = sent > 0 ? Math.round((read / sent) * 100) : 0;
                    const failRate = sent > 0 ? Math.round((failed / sent) * 100) : 0;

                    return (
                      <tr key={camp._id} className="hover:bg-slate-50/50 transition-colors group">
                        {/* Campaign Name */}
                        <td className="py-3 px-4 text-slate-800">
                          <div>
                            <div className="font-bold text-[#003B6D] text-sm hover:underline cursor-pointer">
                              {camp.name}
                            </div>
                            <span className="text-[10px] text-slate-400 font-semibold block leading-none mt-1">
                              {camp.template_name || 'no_template'}
                            </span>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3 px-2">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border uppercase ${statusColors[camp.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                            {camp.status}
                          </span>
                        </td>

                        {/* Sent */}
                        <td className="py-3 px-2 text-center font-bold text-slate-800 text-sm">
                          {sent}
                        </td>

                        {/* Delivered */}
                        <td className="py-3 px-2 text-center text-slate-800">
                          <div className="flex flex-col items-center">
                            <span className="font-bold text-sm">{delivered}</span>
                            <span className="text-[10px] text-emerald-655 font-bold leading-none mt-1">
                              {delRate}%
                            </span>
                          </div>
                        </td>

                        {/* Read */}
                        <td className="py-3 px-2 text-center text-slate-800">
                          <div className="flex flex-col items-center">
                            <span className="font-bold text-sm">{read}</span>
                            <span className="text-[10px] text-blue-600 font-bold leading-none mt-1">
                              {readRate}%
                            </span>
                          </div>
                        </td>

                        {/* Failed */}
                        <td className="py-3 px-2 text-center text-slate-800">
                          <div className="flex flex-col items-center">
                            <span className="font-bold text-sm text-rose-600">{failed}</span>
                            <span className="text-[10px] text-rose-500 font-bold leading-none mt-1">
                              {failRate}%
                            </span>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="py-3 px-2 text-slate-855">
                          <div className="flex items-center gap-1.5 text-xs font-semibold">
                            <Calendar size={12} className="text-slate-400" />
                            <span>{new Date(camp.created_at || camp.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-semibold block mt-1 pl-4.5">
                            {new Date(camp.created_at || camp.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {(camp.status === 'pending' || camp.status === 'scheduled') && (
                              <button
                                onClick={() => handleStatusUpdate(camp._id, 'running')}
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer transition-colors"
                                title="Run Campaign"
                              >
                                <Send size={13} />
                              </button>
                            )}
                            <button className="w-8 h-8 bg-white hover:bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center transition-colors cursor-pointer shadow-sm text-slate-400 hover:text-slate-700">
                              <MoreVertical size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3.5 border-t border-slate-100 mt-4">
                <span className="text-xs text-slate-400 font-semibold">
                  Showing {totalItems > 0 ? startIndex + 1 : 0} to {endIndex} of {totalItems} campaigns
                </span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-200 rounded-lg bg-white p-0.5">
                    <button 
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors text-xs ${
                        currentPage === 1 
                          ? 'text-slate-350 cursor-not-allowed' 
                          : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50 cursor-pointer'
                      }`}
                    >
                      &lt;
                    </button>
                    {getPageNumbers().map((page, idx) => {
                      if (page === '...') {
                        return (
                          <span key={`dots-${idx}`} className="px-1.5 text-xs text-slate-450 select-none">
                            ...
                          </span>
                        );
                      }
                      const isCurrent = currentPage === page;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-bold transition-all ${
                            isCurrent 
                              ? 'bg-[#0A2540] text-white shadow-sm' 
                              : 'text-slate-600 hover:bg-slate-50 cursor-pointer font-semibold'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button 
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors text-xs ${
                        currentPage === totalPages 
                          ? 'text-slate-350 cursor-not-allowed' 
                          : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50 cursor-pointer'
                      }`}
                    >
                      &gt;
                    </button>
                  </div>

                  <select 
                    value={pageSize} 
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="h-8 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 px-2.5 bg-white cursor-pointer outline-none"
                  >
                    <option value="5">5 / page</option>
                    <option value="10">10 / page</option>
                    <option value="20">20 / page</option>
                    <option value="50">50 / page</option>
                  </select>
                </div>
              </div>

            </div>
          ) : (
            <div className="py-20 text-center">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-3 text-slate-300">
                <Target size={24} />
              </div>
              <h3 className="text-xs font-bold text-slate-800">No campaigns found</h3>
              <p className="text-xs text-slate-400 mt-0.5">Start a new campaign to see it here.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
