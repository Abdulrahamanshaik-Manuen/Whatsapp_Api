import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, MessageSquare, 
  Clock, CheckCircle2, AlertCircle, RefreshCcw,
  ChevronLeft, ChevronRight, MoreVertical, ExternalLink,
  Target, BarChart2, Users, Loader2, Send, CheckCheck
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

// Reusable StatCard following CampaignsPage style
const StatCard = ({ label, value, color, icon: Icon }) => {
  const colors = {
    indigo: 'from-indigo-500/10 to-purple-500/10 text-indigo-600 border-indigo-100',
    emerald: 'from-emerald-500/10 to-teal-500/10 text-emerald-600 border-emerald-100',
    blue: 'from-blue-500/10 to-cyan-500/10 text-blue-600 border-blue-100',
    purple: 'from-purple-500/10 to-pink-500/10 text-purple-600 border-purple-100',
    orange: 'from-orange-500/10 to-amber-500/10 text-orange-600 border-orange-100',
    rose: 'from-rose-500/10 to-pink-500/10 text-rose-600 border-rose-100'
  };

  return (
    <div className={`bg-white p-5 rounded-2xl md:rounded-[1.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300`}>
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br ${colors[color]} opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`}></div>
      <div className="flex items-center gap-4 relative z-10">
        <div className={`w-12 h-12 bg-gradient-to-br ${colors[color]} rounded-xl flex items-center justify-center`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
          <p className="text-2xl font-black text-slate-800 tracking-tight leading-none">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  useEffect(() => {
    fetchMessages();
  }, [page, searchQuery, statusFilter]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Note: Backend getMessages already handles search, we can add status filter if needed or filter client-side
      const response = await fetch(`${API_BASE_URL}/messages?page=${page}&search=${searchQuery}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setMessages(data.messages);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'delivered': return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      case 'read': return 'bg-indigo-100 text-indigo-600 border-indigo-200';
      case 'failed': return 'bg-rose-100 text-rose-600 border-rose-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const stats = {
    total: pagination.total,
    delivered: messages.filter(m => m.status === 'delivered').length, // This is just for the current page, ideally backend provides totals
    read: messages.filter(m => m.status === 'read').length,
    failed: messages.filter(m => m.status === 'failed').length
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      {/* Main Content Area - Scrollable */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar pb-10">
        
        {/* Title Row */}
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Message History</h2>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Audit and track your broadcast delivery performance</p>
          </div>
          <button
            onClick={fetchMessages}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
          >
            <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh Logs
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
           <StatCard label="Total Sent" value={stats.total} color="indigo" icon={Send} />
           <StatCard label="Delivered" value={stats.delivered} color="emerald" icon={CheckCircle2} />
           <StatCard label="Read" value={stats.read} color="blue" icon={CheckCheck} />
           <StatCard label="Failed" value={stats.failed} color="rose" icon={AlertCircle} />
        </div>

        {/* Filters & Table Card */}
        <div className="bg-white rounded-2xl md:rounded-[1.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-6 space-y-6">
           <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by phone number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all"
                />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar py-1">
                {['All', 'Sent', 'Delivered', 'Read', 'Failed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap min-w-[100px] text-center ${statusFilter === status
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                      }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
           </div>

           <div className="h-[1px] bg-slate-50 w-full"></div>

           {/* Table Area */}
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Recipient</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Template / Type</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Cost</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Timestamp</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    Array(5).fill(0).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan="6" className="px-6 py-5">
                          <div className="h-4 bg-slate-50 rounded-lg w-full"></div>
                        </td>
                      </tr>
                    ))
                  ) : messages.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-200">
                          <MessageSquare size={32} />
                        </div>
                        <h3 className="text-lg font-black text-slate-800 tracking-tight">No message logs found</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Try adjusting your search or filters</p>
                      </td>
                    </tr>
                  ) : (
                    messages.map(msg => (
                      <tr key={msg._id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-black">
                              {msg.to?.slice(-2)}
                            </div>
                            <span className="text-xs font-black text-slate-700 tracking-tight">{msg.to}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-0.5">
                            <p className="text-xs font-black text-slate-800">{msg.template_name || 'Direct Message'}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{msg.template_type || msg.type}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${getStatusColor(msg.status)}`}>
                            {msg.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-xs font-black text-slate-800 tracking-tight">${msg.total_cost?.toFixed(3)}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex flex-col items-end">
                              <span className="text-[10px] font-black text-slate-700">{new Date(msg.createdAt).toLocaleDateString()}</span>
                              <span className="text-[9px] font-bold text-slate-400">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                            <MoreVertical size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
           </div>

           {/* Pagination Card Footer */}
           <div className="flex items-center justify-between pt-6 border-t border-slate-50">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Showing <span className="text-slate-800">{messages.length}</span> of <span className="text-slate-800">{pagination.total}</span> logs
              </p>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="flex items-center gap-1.5 px-2">
                   <span className="text-[10px] font-black text-slate-800">Page {page} of {pagination.pages}</span>
                </div>
                <button 
                  onClick={() => setPage(prev => Math.min(pagination.pages, prev + 1))}
                  disabled={page === pagination.pages}
                  className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
           </div>
        </div>

      </main>
    </div>
  );
}
