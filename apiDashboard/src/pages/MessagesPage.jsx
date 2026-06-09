import React, { useState, useEffect, useRef } from 'react';
import {
  Search, MessageSquare,
  CheckCircle2, AlertCircle, RefreshCcw,
  ChevronLeft, ChevronRight,
  Users, Send, CheckCheck, MoreVertical, Download, XCircle
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

export default function MessagesPage({ onNavigate }) {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('cached_message_logs');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(!messages.length);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('cached_message_stats');
    return saved ? JSON.parse(saved) : { total: 0, delivered: 0, read: 0, failed: 0 };
  });

  const [activeActionMenu, setActiveActionMenu] = useState(null);
  const [viewingDetailsMessage, setViewingDetailsMessage] = useState(null);
  const actionMenuRef = useRef(null);

  useEffect(() => {
    fetchMessages();
  }, [page, searchQuery, statusFilter]);

  const fetchMessages = async () => {
    if (messages.length === 0) setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const statusParam = statusFilter !== 'All' ? `&status=${statusFilter.toLowerCase()}` : '';
      const response = await fetch(`${API_BASE_URL}/messages?page=${page}&limit=10&search=${searchQuery}${statusParam}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setMessages(data.messages);
        setPagination(data.pagination);
        setStats(data.stats);
        localStorage.setItem('cached_message_logs', JSON.stringify(data.messages));
        localStorage.setItem('cached_message_stats', JSON.stringify(data.stats));
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
        setActiveActionMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleExport = () => {
    if (!messages.length) {
      alert("No logs to export");
      return;
    }
    const headers = ["Recipient", "Campaign", "Type", "Status", "Cost ($)", "Date"];
    const rows = messages.map(msg => [
      `+${msg.to}`,
      msg.template_name || 'Direct Message',
      msg.template_type || msg.type || 'text',
      msg.status,
      msg.total_cost?.toFixed(3) || '0.000',
      new Date(msg.created_at || msg.createdAt).toLocaleString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `message_history_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRetryMessage = async (msg) => {
    setActiveActionMenu(null);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        to: msg.to,
        text: msg.body || `Retrying campaign message: ${msg.template_name}`,
        type: 'text'
      };
      
      const response = await fetch('http://localhost:5000/api/messages/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const resData = await response.json();
      if (response.ok) {
        alert("Message resent successfully!");
        fetchMessages();
      } else {
        alert("Resend failed: " + (resData.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Retry failed:", err);
      alert("Error retrying message send: " + err.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'read':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold">
            👁 Read
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-bold">
            ✓ Delivered
          </span>
        );
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-bold">
            ✈ Sent
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-100 text-[10px] font-bold">
            ✖ Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-bold">
            {status}
          </span>
        );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'delivered': return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'read': return 'bg-primary/5 text-primary border-primary/10';
      case 'failed': return 'bg-rose-100 text-rose-600 border-rose-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const displayMessages = messages.filter(msg => {
    if (!dateFilter) return true;
    const msgDate = new Date(msg.created_at || msg.createdAt).toISOString().slice(0, 10);
    return msgDate === dateFilter;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      {/* Main Content Area - Scrollable */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar pb-10">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">Message History</h1>
            <p className="text-xs text-slate-400 font-semibold mt-2 leading-none">Track your broadcast delivery performance</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchMessages}
              className="flex items-center gap-1.5 h-8 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              <RefreshCcw size={12} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 h-8 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              <Download size={12} />
              Export
            </button>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Total Sent */}
          <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
              <Send size={20} />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-semibold leading-none mb-1.5">Total Sent</p>
              <h3 className="text-xl font-bold text-slate-900 leading-none">{stats.total}</h3>
            </div>
          </div>

          {/* Card 2: Delivered */}
          <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-semibold leading-none mb-1.5">Delivered</p>
              <h3 className="text-xl font-bold text-slate-900 leading-none">{stats.delivered}</h3>
            </div>
          </div>

          {/* Card 3: Read */}
          <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-[#EBF3FE] text-[#1B72E8] flex items-center justify-center shrink-0">
              <CheckCheck size={20} />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-semibold leading-none mb-1.5">Read</p>
              <h3 className="text-xl font-bold text-slate-900 leading-none">{stats.read}</h3>
            </div>
          </div>

          {/* Card 4: Failed */}
          <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-semibold leading-none mb-1.5">Failed</p>
              <h3 className="text-xl font-bold text-slate-900 leading-none">{stats.failed}</h3>
            </div>
          </div>
        </div>

        {/* Filters & Table Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-4">
          
          {/* Search + Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full bg-slate-100/50 border border-slate-200/60 rounded-lg p-2">
            {/* Search & Mobile Date Group */}
            <div className="flex items-center gap-2 w-full sm:w-auto sm:flex-initial">
              {/* Search Input */}
              <div className="relative flex-1 sm:w-64 sm:flex-initial">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-slate-400 transition-all text-slate-700"
                />
              </div>

              {/* Mobile Date Filter (hidden on desktop) */}
              <div className="relative sm:hidden shrink-0">
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 px-3 py-1.5 focus:outline-none focus:border-slate-400 cursor-pointer shadow-sm w-full"
                />
                {dateFilter && (
                  <button
                    onClick={() => setDateFilter('')}
                    className="absolute right-7 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px] font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Status Filters */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full sm:w-auto">
              {['All', 'Sent', 'Delivered', 'Read', 'Failed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === status
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Spacer for desktop */}
            <div className="hidden sm:block flex-1"></div>

            {/* Desktop Date Filter */}
            <div className="hidden sm:flex items-center gap-2 justify-end shrink-0">
              <div className="relative">
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 px-3 py-1.5 focus:outline-none focus:border-slate-400 cursor-pointer shadow-sm"
                />
                {dateFilter && (
                  <button
                    onClick={() => setDateFilter('')}
                    className="absolute right-7 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px] font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Table Area */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recipient</th>
                  <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Campaign</th>
                  <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cost</th>
                  <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-10">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="7" className="px-4 py-3">
                        <div className="h-4 bg-slate-50 rounded-lg w-full"></div>
                      </td>
                    </tr>
                  ))
                ) : displayMessages.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-300">
                        <MessageSquare size={24} />
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 tracking-tight">No message logs found</h3>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-1">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                ) : (
                  displayMessages.map(msg => (
                    <tr key={msg._id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0">
                      <td className="px-4 py-2 text-xs font-bold text-slate-700">
                        +{msg.to}
                      </td>
                      <td className="px-4 py-2 text-xs text-slate-800 font-semibold">
                        {msg.template_name || 'Direct Message'}
                      </td>
                      <td className="px-4 py-2 text-xs text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                        {msg.template_type || msg.type || 'text'}
                      </td>
                      <td className="px-4 py-2">
                        {getStatusBadge(msg.status)}
                      </td>
                      <td className="px-4 py-2 text-xs font-bold text-slate-800">
                        ${msg.total_cost?.toFixed(3) || '0.000'}
                      </td>
                      <td className="px-4 py-2 text-[11px] text-slate-500 font-semibold">
                        {new Date(msg.created_at || msg.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="px-4 py-2 relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveActionMenu(activeActionMenu === msg._id ? null : msg._id);
                          }}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                        >
                          <MoreVertical size={14} />
                        </button>
                        
                        {activeActionMenu === msg._id && (
                          <div
                            ref={actionMenuRef}
                            className="absolute right-4 top-full mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-30 text-xs text-slate-700 font-semibold"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setViewingDetailsMessage(msg);
                                setActiveActionMenu(null);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-slate-50 transition-colors"
                            >
                              View Details
                            </button>
                            <button
                              type="button"
                              disabled={msg.status !== 'failed'}
                              onClick={() => handleRetryMessage(msg)}
                              className="w-full text-left px-3 py-1.5 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
                            >
                              Retry
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveActionMenu(null);
                                // Export specific log
                                const headers = ["Recipient", "Campaign", "Type", "Status", "Cost", "Date"];
                                const row = [
                                  `+${msg.to}`,
                                  msg.template_name || 'Direct Message',
                                  msg.template_type || msg.type || 'text',
                                  msg.status,
                                  msg.total_cost || 0,
                                  new Date(msg.created_at || msg.createdAt).toLocaleString()
                                ];
                                const csvContent = "data:text/csv;charset=utf-8," 
                                  + [headers.join(","), row.map(val => `"${val}"`).join(",")].join("\n");
                                const link = document.createElement("a");
                                link.setAttribute("href", encodeURI(csvContent));
                                link.setAttribute("download", `log_${msg._id}.csv`);
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-slate-50 transition-colors"
                            >
                              Export CSV
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Card Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Showing <span className="text-slate-800">{displayMessages.length}</span> of <span className="text-slate-800">{pagination.total}</span> logs
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:text-primary hover:bg-white hover:shadow-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
              </button>
              <div className="flex items-center gap-1.5 px-2">
                <span className="text-[10px] font-bold text-slate-800">Page {page} of {pagination.pages}</span>
              </div>
              <button
                onClick={() => setPage(prev => Math.min(pagination.pages, prev + 1))}
                disabled={page === pagination.pages}
                className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:text-primary hover:bg-white hover:shadow-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

      </main>

      {/* Viewing Details Message Modal */}
      {viewingDetailsMessage && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800 tracking-tight leading-none">Message Log Details</h3>
              <button
                onClick={() => setViewingDetailsMessage(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar text-xs font-semibold text-slate-700">
              <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-50">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Recipient</span>
                <span className="col-span-2 font-bold text-slate-800">+{viewingDetailsMessage.to}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-50">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Campaign / Name</span>
                <span className="col-span-2 font-bold text-slate-800">{viewingDetailsMessage.template_name || 'Direct Message'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-50">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Type</span>
                <span className="col-span-2 font-bold text-slate-800 uppercase text-[9px]">{viewingDetailsMessage.template_type || viewingDetailsMessage.type || 'text'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-50">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Status</span>
                <span className="col-span-2">{getStatusBadge(viewingDetailsMessage.status)}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-50">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Cost</span>
                <span className="col-span-2 font-bold text-slate-800">${viewingDetailsMessage.total_cost?.toFixed(3) || '0.000'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-50">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Timestamp</span>
                <span className="col-span-2 font-bold text-slate-800">{new Date(viewingDetailsMessage.created_at || viewingDetailsMessage.createdAt).toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-50">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Message ID</span>
                <span className="col-span-2 font-mono text-[10px] text-slate-500 break-all">{viewingDetailsMessage.meta_message_id || 'N/A'}</span>
              </div>
              {viewingDetailsMessage.body && (
                <div className="space-y-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] block">Message Content</span>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 whitespace-pre-wrap text-[11px] leading-relaxed text-slate-800 font-medium">
                    {viewingDetailsMessage.body}
                  </div>
                </div>
              )}
              {viewingDetailsMessage.error && (
                <div className="space-y-1">
                  <span className="text-red-400 font-bold uppercase tracking-wider text-[9px] block">Error Details</span>
                  <div className="bg-red-50 text-red-700 rounded-xl p-3 border border-red-100 text-[11px] leading-relaxed">
                    {viewingDetailsMessage.error}
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewingDetailsMessage(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
