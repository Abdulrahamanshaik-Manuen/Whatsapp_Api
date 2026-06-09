import React, { useState, useEffect } from 'react';
import { 
  Search, MessageSquare, Filter, Loader2, Calendar, 
  Clock, ArrowUpRight, Smartphone, User, CheckCircle2, 
  AlertCircle, ChevronLeft, ChevronRight, Download,
  ExternalLink, Info, CheckCheck, Send, Shield, Zap, TrendingUp, TrendingDown,
  Activity, IndianRupee
} from 'lucide-react';

export default function AdminMessageLogs() {
  const [loading, setLoading] = useState(() => {
    return !localStorage.getItem('admin_message_logs_data');
  });
  const [messages, setMessages] = useState(() => {
    const cached = localStorage.getItem('admin_message_logs_data');
    return cached ? JSON.parse(cached).messages || [] : [];
  });
  const [stats, setStats] = useState(() => {
    const cached = localStorage.getItem('admin_message_logs_data');
    return cached && JSON.parse(cached).stats ? JSON.parse(cached).stats : { totalSent: 0, delivered: 0, failed: 0, totalCost: 0 };
  });
  const [pagination, setPagination] = useState(() => {
    const cached = localStorage.getItem('admin_message_logs_data');
    return cached && JSON.parse(cached).pagination ? JSON.parse(cached).pagination : { total: 0, page: 1, pages: 1 };
  });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');
  const [page, setPage] = useState(1);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/admin/messages?search=${search}&status=${status}&type=${type}&page=${page}&limit=20`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (response.ok) {
        setMessages(result.messages);
        setPagination(result.pagination);
        if (result.stats) setStats(result.stats);

        if (page === 1 && search === '' && status === 'all' && type === 'all') {
          localStorage.setItem('admin_message_logs_data', JSON.stringify(result));
        }
      }
    } catch (err) {
      console.error("Fetch Messages Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchMessages();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, status, type, page]);

  const getStatusColor = (s) => {
    switch (s) {
      case 'read': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'delivered': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'sent': return 'bg-slate-50 text-slate-600 border-slate-200';
      case 'failed': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  };

  const getStatusIcon = (s) => {
    switch (s) {
      case 'read': return <CheckCheck size={12} className="text-emerald-500" />;
      case 'delivered': return <CheckCircle2 size={12} className="text-blue-500" />;
      case 'sent': return <Send size={12} className="text-slate-400" />;
      case 'failed': return <AlertCircle size={12} className="text-rose-500" />;
      case 'pending': return <Clock size={12} className="text-amber-500" />;
      default: return null;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#F8FAFC] h-full">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">Message Logs</h1>
          <p className="text-xs text-slate-400 font-semibold mt-2 leading-none">Real-time audit trail of all messages across the platform</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 shrink-0">
         <StatCard 
            label="Total Sent" 
            value={loading && stats.totalSent === 0 ? "..." : stats.totalSent.toLocaleString()} 
            color="primary" 
            icon={Send} 
         />
         <StatCard 
            label="Delivered" 
            value={loading && stats.delivered === 0 ? "..." : stats.delivered.toLocaleString()} 
            color="secondary" 
            icon={CheckCircle2} 
         />
         <StatCard 
            label="Failed" 
            value={loading && stats.failed === 0 ? "..." : stats.failed.toLocaleString()} 
            color="rose" 
            icon={AlertCircle} 
         />
         <StatCard 
            label="Total Cost" 
            value={loading && stats.totalCost === 0 ? "..." : `₹${stats.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} 
            color="amber" 
            icon={IndianRupee} 
         />
      </div>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm shrink-0">
        <div className="relative flex-1 w-full group">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
          <input
            type="text"
            placeholder="Search by receiver, content, or template..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3.5 h-8 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-slate-400 outline-none transition-all placeholder:text-slate-400 shadow-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0">
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200 justify-center">
            {['all', 'sent', 'delivered', 'read', 'failed'].map(s => (
              <button
                key={s}
                onClick={() => { setStatus(s); setPage(1); }}
                className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${
                  status === s ? 'bg-[#003B6D] text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <select
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            className="h-8 pl-2 pr-6 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-wider focus:outline-none cursor-pointer appearance-none min-w-[120px] truncate"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748B\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2.5\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center', backgroundSize: '8px' }}
          >
            <option value="all">All Types</option>
            <option value="template">Template</option>
            <option value="text">Text</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden relative">
         <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[800px] text-left border-collapse">
               <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-400">
                     <th className="pl-4 pr-3 py-3 text-[9px] font-black uppercase tracking-widest">Timestamp</th>
                     <th className="px-3 py-3 text-[9px] font-black uppercase tracking-widest">Sender (Client)</th>
                     <th className="px-3 py-3 text-[9px] font-black uppercase tracking-widest">Receiver</th>
                     <th className="px-3 py-3 text-[9px] font-black uppercase tracking-widest">Content</th>
                     <th className="px-3 py-3 text-[9px] font-black uppercase tracking-widest">Status</th>
                     <th className="pr-4 pl-3 py-3 text-[9px] font-black uppercase tracking-widest text-right">Reference</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {loading ? (
                     <tr>
                        <td colSpan="6" className="px-8 py-16 text-center">
                           <div className="flex flex-col items-center justify-center gap-2 text-[#003B6D]">
                              <Loader2 size={24} className="animate-spin" />
                              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-450">Loading logs...</span>
                           </div>
                        </td>
                     </tr>
                  ) : messages.length === 0 ? (
                     <tr>
                        <td colSpan="6" className="px-8 py-16 text-center">
                           <div className="flex flex-col items-center gap-2.5 opacity-30">
                              <MessageSquare size={36} className="text-slate-300" />
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">No message logs found</p>
                           </div>
                        </td>
                     </tr>
                  ) : (
                     messages.map((msg) => (
                        <tr key={msg.id} className="group hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0">
                           <td className="pl-4 pr-3 py-2.5">
                              <div className="flex flex-col gap-0.5">
                                 <p className="text-xs font-bold text-slate-800">{new Date(msg.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                           </td>
                           <td className="px-3 py-2.5">
                              <div className="flex items-center gap-2.5">
                                 <div className="w-7 h-7 bg-blue-50 text-[#003B6D] rounded-lg flex items-center justify-center font-bold text-[10px] border border-blue-100/50">
                                    {msg.client.charAt(0)}
                                 </div>
                                 <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-800 truncate">{msg.client}</p>
                                    <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">{msg.phone}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-3 py-2.5">
                              <div className="flex items-center gap-1.5">
                                 <Smartphone size={11} className="text-slate-400" />
                                 <p className="text-xs font-semibold text-slate-700">{msg.to}</p>
                              </div>
                           </td>
                           <td className="px-3 py-2.5">
                              <div className="max-w-[280px] space-y-0.5">
                                 <div className="flex items-center gap-1">
                                    <span className="px-1 py-0.5 rounded bg-slate-100 text-[8px] font-bold uppercase text-slate-500 border border-slate-200/60 leading-none">{msg.type}</span>
                                    {msg.type === 'template' && <Zap size={9} className="text-amber-500 fill-amber-500" />}
                                 </div>
                                 <p className="text-xs text-slate-650 line-clamp-1 pr-2 leading-relaxed" title={msg.content}>"{msg.content}"</p>
                              </div>
                           </td>
                           <td className="px-3 py-2.5">
                              <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${getStatusColor(msg.status)}`}>
                                 {getStatusIcon(msg.status)}
                                 <span>{msg.status}</span>
                              </div>
                           </td>
                           <td className="pr-4 pl-3 py-2.5 text-right">
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">#{msg.id.slice(-6).toUpperCase()}</p>
                              <p className="text-[8px] text-slate-400 font-semibold uppercase tracking-wider leading-none mt-0.5">Log ID</p>
                           </td>
                        </tr>
                     ))
                  )}
               </tbody>
            </table>
         </div>

         {/* Pagination */}
         <div className="p-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
               Page <span className="text-[#003B6D]">{pagination.page}</span> / <span className="text-[#003B6D]">{pagination.pages}</span>
               <span className="ml-3 opacity-60">({pagination.total.toLocaleString()} logs)</span>
            </p>
            <div className="flex items-center gap-1.5">
               <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-450 hover:text-[#003B6D] disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-50 transition-all cursor-pointer shadow-sm active:scale-95"
               >
                  <ChevronLeft size={14} />
               </button>
               <button 
                  disabled={page === pagination.pages}
                  onClick={() => setPage(p => p + 1)}
                  className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-450 hover:text-[#003B6D] disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-50 transition-all cursor-pointer shadow-sm active:scale-95"
               >
                  <ChevronRight size={14} />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon: Icon }) {
  const bgColors = {
    primary: 'bg-blue-50 text-[#003B6D]',
    secondary: 'bg-emerald-50 text-[#63C132]',
    blue: 'bg-blue-50 text-[#003B6D]',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
    emerald: 'bg-emerald-50 text-[#63C132]',
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-3 hover:shadow-md transition-all cursor-pointer shadow-sm">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${bgColors[color] || bgColors.primary}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[10px] text-slate-500 font-semibold leading-none mb-1">{label}</p>
        <h3 className="text-lg font-bold text-slate-900 leading-none">{value}</h3>
      </div>
    </div>
  );
}
