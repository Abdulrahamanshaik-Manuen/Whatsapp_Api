import React, { useState, useEffect } from 'react';
import {
  Send, Users, IndianRupee, ShieldCheck,
  Bot, Clock, AlertCircle, RefreshCw,
  UserPlus
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';

import { useSocket } from '../../context/SocketContext';

export default function AdminDashboard({ onNavigate }) {
  const { socket } = useSocket();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(() => {
    const cached = localStorage.getItem('admin_dashboard_stats');
    return cached ? JSON.parse(cached) : {};
  });
  const [systemLogs, setSystemLogs] = useState(() => {
    const cached = localStorage.getItem('admin_dashboard_logs');
    return cached ? JSON.parse(cached) : [];
  });

  // Global fix for Recharts "black box" outline
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .recharts-wrapper:focus, 
      .recharts-surface:focus,
      .recharts-container:focus,
      .recharts-wrapper *,
      .recharts-surface *,
      .recharts-container *,
      path:focus,
      rect:focus,
      svg:focus {
        outline: none !important;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setStats(data);
        localStorage.setItem('admin_dashboard_stats', JSON.stringify(data));
      }
    } catch (err) {
      console.error("Fetch Stats Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/admin/system-logs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setSystemLogs(data);
        localStorage.setItem('admin_dashboard_logs', JSON.stringify(data));
      }
    } catch (err) {
      console.error("Fetch Logs Error:", err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchLogs();

    if (socket) {
      socket.on('admin_stats_update', () => {
        fetchStats();
      });
      socket.on('new_system_log', (log) => {
        setSystemLogs(prev => [log, ...prev].slice(0, 50));
      });
    }

    return () => {
      if (socket) {
        socket.off('admin_stats_update');
        socket.off('new_system_log');
      }
    };
  }, [socket]);

  const performanceData = stats?.performance || [];
  const userGrowthData = stats?.userGrowth || [];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F8FAFC]">
      <main className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar pb-12">

        {/* Page Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">Platform Overview</h1>
            <p className="text-xs text-slate-400 font-semibold mt-2 leading-none">Monitor and manage all managed nodes and global traffic</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
          <StatCard
            label="Managed Clients"
            value={stats?.totalUsers || 0}
            color="secondary"
            icon={Users}
          />
          <StatCard
            label="Global Messages"
            value={stats?.totalMessages?.toLocaleString() || 0}
            color="primary"
            icon={Send}
          />
          <StatCard
            label="Delivery Rate"
            value={`${stats?.deliveryRate || 0}%`}
            color="secondary"
            icon={ShieldCheck}
          />
          <StatCard
            label="Pending Approvals"
            value={stats?.pendingTemplates || 0}
            color="primary"
            icon={Clock}
          />
          <StatCard
            label="Platform MRR"
            value={`₹${stats?.mrr?.toLocaleString() || '0'}`}
            color="secondary"
            icon={IndianRupee}
          />
        </div>

        {/* Charts & Revenue Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* Messages Throughput Section */}
          <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200/60 p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-slate-800">Messages Throughput</h3>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#63C132] inline-block"></span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sent</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#003B6D] inline-block"></span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Delivered</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Failed</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1">
                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Current Week</span>
              </div>
            </div>
            <div className="h-[200px] w-full mt-2">
              {performanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#63C132" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#63C132" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#003B6D" stopOpacity={0.05} />
                        <stop offset="95%" stopColor="#003B6D" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }}
                      dy={5}
                      interval="preserveStartEnd"
                      minTickGap={25}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }}
                      tickFormatter={(val) => val >= 1000 ? `${val / 1000}K` : val}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1.5 }} />
                    <Area
                      type="monotone"
                      dataKey="sent"
                      stroke="#63C132"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorSent)"
                      dot={{ r: 2.5, fill: '#63C132', strokeWidth: 1 }}
                      activeDot={{ r: 3.5, strokeWidth: 0 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="delivered"
                      stroke="#003B6D"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      fillOpacity={1}
                      fill="url(#colorDelivered)"
                      dot={{ r: 2.5, fill: '#003B6D', strokeWidth: 1 }}
                      activeDot={{ r: 3.5, strokeWidth: 0 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="failed"
                      stroke="#ef4444"
                      strokeWidth={1.5}
                      fillOpacity={1}
                      fill="url(#colorFailed)"
                      dot={{ r: 2, fill: '#ef4444', strokeWidth: 1 }}
                      activeDot={{ r: 3, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Collecting data stream...</p>
                </div>
              )}
            </div>
          </div>

          {/* User Growth & Revenue Column */}
          <div className="lg:col-span-5 space-y-3.5 flex flex-col justify-between">
            {/* User Growth Card */}
            <div className="bg-white rounded-lg border border-slate-200/60 p-4 shadow-sm flex flex-col justify-between h-[180px]">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">User Growth</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Weekly Acquisition</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
                  <UserPlus size={16} strokeWidth={2.5} />
                </div>
              </div>
              <div className="h-[90px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={userGrowthData}
                    margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                    style={{ outline: 'none' }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                    <XAxis
                      dataKey="week"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 8, fill: '#94a3b8', fontWeight: 600 }}
                      dy={5}
                    />
                    <Tooltip
                      cursor={{ fill: '#f1f5f9' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-900 text-white px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest shadow-lg">
                              {payload[0].value} New Clients
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="users" radius={[4, 4, 0, 0]} barSize={28}>
                      {userGrowthData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === userGrowthData.length - 1 ? '#63C132' : '#E2E8F0'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <span>Total Active Nodes: {stats?.totalUsers}</span>
              </div>
            </div>

            {/* Platform Revenue Card */}
            <div className="bg-slate-900 rounded-lg p-4 text-white relative overflow-hidden shadow-sm flex flex-col justify-between h-[180px] group border border-white/10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/20 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/20 rounded-full blur-[30px] translate-y-1/2 -translate-x-1/2"></div>
              
              <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em]">Platform Revenue</h3>
                    <h4 className="text-2xl font-bold tracking-tight text-white">
                      ₹{(stats?.mrr + stats?.metaCost)?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </h4>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-[#63C132] transition-all duration-1000 ease-out"
                      style={{ width: `${(stats?.mrr / (stats?.mrr + stats?.metaCost || 1)) * 100}%` }}
                    ></div>
                    <div
                      className="h-full bg-white/20 transition-all duration-1000 ease-out"
                      style={{ width: `${(stats?.metaCost / (stats?.mrr + stats?.metaCost || 1)) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex gap-4 text-[10px]">
                    <div>
                      <span className="text-white/30 block uppercase font-bold text-[8px] tracking-wider">Subscriptions</span>
                      <span className="font-bold text-white">₹{stats?.mrr?.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-white/30 block uppercase font-bold text-[8px] tracking-wider">Usage/Meta</span>
                      <span className="font-bold text-[#63C132]">₹{stats?.metaCost?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Logs & Errors Section */}
        <div className="bg-white rounded-lg border border-slate-200/60 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">System Logs & Errors</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Real-time Backend Security & Infrastructure Tracking</p>
            </div>
            <button onClick={fetchLogs} className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-primary rounded-md transition-colors">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="h-[220px] overflow-y-auto custom-scrollbar border border-slate-100 rounded-lg bg-slate-50/30">
            {systemLogs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center">
                <ShieldCheck size={28} className="text-emerald-500 mb-2" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No System Errors Detected</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {systemLogs.map((log, index) => (
                  <div key={index} className="p-3 hover:bg-white transition-colors flex gap-3 text-xs">
                    <div className="shrink-0 mt-0.5">
                      {log.level === 'error' ? (
                        <div className="w-7 h-7 bg-rose-50 text-rose-500 rounded-md flex items-center justify-center"><AlertCircle size={14} /></div>
                      ) : log.level === 'warn' ? (
                        <div className="w-7 h-7 bg-amber-50 text-amber-500 rounded-md flex items-center justify-center"><AlertCircle size={14} /></div>
                      ) : (
                        <div className="w-7 h-7 bg-blue-50 text-blue-500 rounded-md flex items-center justify-center"><Bot size={14} /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${log.level === 'error' ? 'bg-rose-100 text-rose-600' : log.level === 'warn' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                          {log.source || 'internal'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-800 font-semibold break-words leading-tight">{log.message}</p>
                      {log.stack && (
                        <pre className="mt-1.5 p-2 bg-slate-900 text-slate-300 text-[9px] rounded-md overflow-x-auto font-mono opacity-85">
                          {log.stack.split('\n')[0]}...
                        </pre>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}

function StatCard({ label, value, color, icon: Icon }) {
  const isSecondary = color === 'secondary';
  const badgeClasses = isSecondary 
    ? 'bg-emerald-50 text-[#63C132]' 
    : 'bg-blue-50 text-[#003B6D]';
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3.5 flex items-center gap-3 hover:shadow-md transition-all cursor-pointer shadow-sm">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${badgeClasses}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[11px] text-slate-500 font-semibold leading-none mb-1.5">{label}</p>
        <h3 className="text-xl font-bold text-slate-900 leading-none">{value}</h3>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-2 rounded-md shadow-xl border border-slate-800 animate-in fade-in zoom-in duration-200">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 border-b border-slate-800 pb-1">{label}</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#63C132]"></div>
              <span className="text-[10px] font-bold">Sent:</span>
            </div>
            <span className="text-[10px] font-black">{payload[0].value.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#003B6D] opacity-40"></div>
              <span className="text-[10px] font-bold">Delivered:</span>
            </div>
            <span className="text-[10px] font-black">{payload[1].value.toLocaleString()}</span>
          </div>
          {payload[2] && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444]"></div>
                <span className="text-[10px] font-bold">Failed:</span>
              </div>
              <span className="text-[10px] font-black">{payload[2].value.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
}
