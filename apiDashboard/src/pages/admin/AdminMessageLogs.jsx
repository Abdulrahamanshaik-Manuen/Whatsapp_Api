import React, { useState, useEffect } from 'react';
import { 
  Search, MessageSquare, Filter, Loader2, Calendar, 
  Clock, ArrowUpRight, Smartphone, User, CheckCircle2, 
  AlertCircle, ChevronLeft, ChevronRight, Download,
  ExternalLink, Info, CheckCheck, Send, Shield, Zap, TrendingUp, TrendingDown,
  Activity, IndianRupee
} from 'lucide-react';

export default function AdminMessageLogs() {
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({ totalSent: 0, delivered: 0, failed: 0, totalCost: 0 });
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');
  const [page, setPage] = useState(1);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/admin/messages?search=${search}&status=${status}&type=${type}&page=${page}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (response.ok) {
        setMessages(result.messages);
        setPagination(result.pagination);
        if (result.stats) setStats(result.stats);
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
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar bg-slate-50/30 h-full">
      <div className="max-w-[1600px] mx-auto space-y-10 pb-20">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-primary tracking-tight flex items-center gap-3">
              Message Logs
            </h1>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-1">
              Real-time audit trail of all messages across the platform
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           <StatCard 
              label="Total Sent" 
              value={stats.totalSent.toLocaleString()} 
              color="primary" 
              icon={Send} 
           />
           <StatCard 
              label="Delivered" 
              value={stats.delivered.toLocaleString()} 
              color="secondary" 
              icon={CheckCircle2} 
           />
           <StatCard 
              label="Failed" 
              value={stats.failed.toLocaleString()} 
              color="rose" 
              icon={AlertCircle} 
           />
           <StatCard 
              label="Total Cost" 
              value={`₹${stats.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} 
              color="amber" 
              icon={IndianRupee} 
           />
        </div>

        {/* Filters Section */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-6">
           <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1 group">
                 <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                 <input
                   type="text"
                   placeholder="Search by receiver, content, or template..."
                   value={search}
                   onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                   className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all placeholder:text-slate-400"
                 />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                 <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                    {['all', 'sent', 'delivered', 'read', 'failed'].map(s => (
                       <button 
                         key={s}
                         onClick={() => { setStatus(s); setPage(1); }}
                         className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                           status === s ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600'
                         }`}
                       >
                          {s}
                       </button>
                    ))}
                 </div>
                 <select 
                    value={type}
                    onChange={(e) => { setType(e.target.value); setPage(1); }}
                    className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 focus:outline-none cursor-pointer appearance-none min-w-[140px]"
                 >
                    <option value="all">All Types</option>
                    <option value="template">Template</option>
                    <option value="text">Text</option>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                 </select>
              </div>
           </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden relative">
           {loading && (
             <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={30} />
             </div>
           )}
           <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-200">
                       <th className="pl-8 pr-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100/50">Timestamp</th>
                       <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100/50">Sender (Client)</th>
                       <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100/50">Receiver</th>
                       <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100/50">Content</th>
                       <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100/50">Status</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Reference</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {messages.length === 0 ? (
                       <tr>
                          <td colSpan="6" className="px-8 py-24 text-center">
                             <div className="flex flex-col items-center gap-3 opacity-30">
                                <MessageSquare size={48} className="text-slate-300" />
                                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">No message logs found</p>
                             </div>
                          </td>
                       </tr>
                    ) : (
                       messages.map((msg) => (
                          <tr key={msg.id} className="group hover:bg-slate-50/80 transition-colors">
                             <td className="pl-8 pr-4 py-5 border-r border-slate-50/50">
                                <div className="flex flex-col gap-0.5">
                                   <p className="text-xs font-bold text-slate-900">{new Date(msg.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                   <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                             </td>
                             <td className="px-6 py-5 border-r border-slate-50/50">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 bg-primary/5 text-primary rounded-lg flex items-center justify-center font-black text-[10px] border border-primary/10">
                                      {msg.client.charAt(0)}
                                   </div>
                                   <div className="min-w-0">
                                      <p className="text-xs font-bold text-slate-900 truncate">{msg.client}</p>
                                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{msg.phone}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-6 py-5 border-r border-slate-50/50">
                                <div className="flex items-center gap-2">
                                   <Smartphone size={12} className="text-slate-300" />
                                   <p className="text-xs font-bold text-slate-700">{msg.to}</p>
                                </div>
                             </td>
                             <td className="px-6 py-5 border-r border-slate-50/50">
                                <div className="max-w-[300px] space-y-1">
                                   <div className="flex items-center gap-1.5">
                                      <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-[8px] font-black uppercase text-slate-500 border border-slate-200">{msg.type}</span>
                                      {msg.type === 'template' && <Zap size={10} className="text-amber-500 fill-amber-500" />}
                                   </div>
                                   <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed italic">"{msg.content}"</p>
                                </div>
                             </td>
                             <td className="px-6 py-5 border-r border-slate-50/50">
                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${getStatusColor(msg.status)}`}>
                                   {getStatusIcon(msg.status)}
                                   <span className="text-[9px] font-black uppercase tracking-widest">{msg.status}</span>
                                </div>
                             </td>
                             <td className="px-8 py-5 text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">#{msg.id.slice(-6).toUpperCase()}</p>
                                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">Log ID</p>
                             </td>
                          </tr>
                       ))
                    )}
                 </tbody>
              </table>
           </div>

           {/* Pagination */}
           {pagination.pages > 1 && (
             <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   Showing Page <span className="text-primary">{pagination.page}</span> of <span className="text-primary">{pagination.pages}</span>
                   <span className="ml-4 opacity-40">({pagination.total.toLocaleString()} total messages)</span>
                </p>
                <div className="flex items-center gap-2">
                   <button 
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                      className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-primary disabled:opacity-30 disabled:pointer-events-none transition-all"
                   >
                      <ChevronLeft size={18} />
                   </button>
                   <button 
                      disabled={page === pagination.pages}
                      onClick={() => setPage(p => p + 1)}
                      className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-primary disabled:opacity-30 disabled:pointer-events-none transition-all"
                   >
                      <ChevronRight size={18} />
                   </button>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon: Icon, trend }) {
  const colors = {
    primary: 'from-primary/10 to-primary/20 text-primary border-primary/10',
    secondary: 'from-secondary/10 to-secondary/20 text-secondary border-secondary/10',
    rose: 'from-rose-500/10 to-rose-600/10 text-rose-600 border-rose-100',
    amber: 'from-amber-500/10 to-amber-600/10 text-amber-600 border-amber-100',
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br ${colors[color]} opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`}></div>
      <div className="flex items-center gap-4 relative z-10">
        <div className={`w-14 h-14 bg-gradient-to-br ${colors[color]} rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-slate-200/50`}>
          <Icon size={28} strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] leading-none mb-2">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-primary tracking-tighter leading-none">{value}</p>
            {trend && (
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {trend}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
