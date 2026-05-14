import React, { useState, useEffect } from 'react';
import {
  Send, MessageSquare, LayoutTemplate, Users, BarChart2,
  Settings, Bell, Search, ChevronDown, TrendingUp,
  Plus, ArrowRight, Crown, Smartphone, Zap, IndianRupee, ShieldCheck,
  Calendar, LayoutDashboard, Menu, Loader2, Bot, Clock, AlertCircle, RefreshCw,
  UserPlus, TrendingDown, ArrowUpRight
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

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
      }
    } catch (err) {
      console.error("Fetch Stats Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background h-full">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.2em]">Loading platform data...</p>
        </div>
      </div>
    );
  }

  const performanceData = stats?.performance || [];
  const userGrowthData = stats?.userGrowth || [];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      <main className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar pb-20">

        {/* Dashboard Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-primary tracking-tight">Platform Overview</h2>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Monitor and manage all managed nodes and global traffic</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-5">
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
            isCurrency
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6">
          {/* Messages Throughput Section */}
          <div className="lg:col-span-7 bg-white rounded-2xl md:rounded-[1.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div>
                <h3 className="text-base md:text-lg font-bold text-primary">Messages Throughput</h3>
                <div className="flex flex-wrap items-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-secondary"></div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Sent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary/40"></div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Delivered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Failed</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 cursor-pointer">
                  <span className="text-[10px] text-slate-600 font-black uppercase tracking-wider">Current Week (Mon - Sun)</span>
                </div>
              </div>
            </div>
            <div className="h-[280px] w-full">
              {performanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
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
                      tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 800 }}
                      dy={15}
                      padding={{ left: 10, right: 10 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 800 }}
                      tickFormatter={(val) => val >= 1000 ? `${val / 1000}K` : val}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }} />
                    <Area
                      type="monotone"
                      dataKey="sent"
                      stroke="#63C132"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorSent)"
                    />
                    <Area
                      type="monotone"
                      dataKey="delivered"
                      stroke="#003B6D"
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      fillOpacity={1}
                      fill="url(#colorDelivered)"
                    />
                    <Area
                      type="monotone"
                      dataKey="failed"
                      stroke="#ef4444"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorFailed)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Collecting data stream...</p>
                </div>
              )}
            </div>
          </div>

          {/* User Growth Column - AGGRESSIVELY TIGHTENED */}
          <div className="lg:col-span-5 space-y-5 md:space-y-6 flex flex-col">
            <div className="bg-white rounded-2xl md:rounded-[1.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-6 flex flex-col overflow-hidden relative group h-fit">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-black text-primary tracking-tight">User Growth</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Weekly Acquisition Bar</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserPlus size={20} strokeWidth={2.5} />
                </div>
              </div>

              {/* Bar Chart for User Growth - Minimized padding and offsets */}
              <div className="h-[140px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={userGrowthData} 
                      margin={{ top: 0, right: 0, left: -20, bottom: 5 }}
                      style={{ outline: 'none' }}
                    >
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                       <XAxis 
                          dataKey="week" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 800 }}
                          dy={8}
                       />
                       <Tooltip 
                          cursor={{fill: '#f1f5f9'}}
                          content={({ active, payload }) => {
                             if (active && payload && payload.length) {
                                return (
                                   <div className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-xl">
                                      {payload[0].value} New Clients
                                   </div>
                                );
                             }
                             return null;
                          }}
                       />
                       <Bar dataKey="users" radius={[6, 6, 0, 0]} barSize={40}>
                          {userGrowthData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={index === userGrowthData.length - 1 ? '#63C132' : '#E2E8F0'} />
                          ))}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                 <div className="space-y-0.5">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Total Active Nodes</p>
                    <p className="text-lg font-black text-primary">{stats?.totalUsers}</p>
                 </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl md:rounded-[1.5rem] p-6 text-white relative overflow-hidden shadow-2xl shadow-primary/40 h-[180px] group border border-white/10">
               {/* Animated Mesh Gradient Background */}
               <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/30 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-secondary/40 transition-colors"></div>
               <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2"></div>
               
               <div className="relative z-10 flex flex-col justify-between h-full">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Platform Revenue</h3>
                      <h4 className="text-3xl font-black tracking-tighter text-white drop-shadow-sm">
                        ₹{(stats?.mrr + stats?.metaCost)?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </h4>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Visual Breakdown Bar */}
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                      <div 
                        className="h-full bg-secondary transition-all duration-1000 ease-out" 
                        style={{ width: `${(stats?.mrr / (stats?.mrr + stats?.metaCost || 1)) * 100}%` }}
                      ></div>
                      <div 
                        className="h-full bg-white/20 transition-all duration-1000 ease-out" 
                        style={{ width: `${(stats?.metaCost / (stats?.mrr + stats?.metaCost || 1)) * 100}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-6">
                        <div className="space-y-0.5">
                          <p className="text-[8px] text-white/30 font-black uppercase tracking-widest">Subscriptions</p>
                          <p className="text-[11px] font-bold text-white">₹{stats?.mrr?.toLocaleString()}</p>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[8px] text-white/30 font-black uppercase tracking-widest">Usage/Meta</p>
                          <p className="text-[11px] font-bold text-secondary">₹{stats?.metaCost?.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

function StatCard({ label, value, color, icon: Icon, isCurrency }) {
  const isSecondary = color === 'secondary';
  return (
    <div className="bg-white p-4 md:p-5 rounded-[1.25rem] border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden group">
      <div className={`w-10 h-10 ${isSecondary ? 'bg-secondary text-white shadow-lg shadow-secondary/20' : 'bg-primary/10 text-primary'} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <Icon size={20} strokeWidth={2.5} />
      </div>
      <div className="space-y-0.5">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <h3 className="text-xl font-black text-primary">{value}</h3>
      </div>
      <div className={`absolute bottom-0 left-0 h-1 w-0 ${isSecondary ? 'bg-secondary' : 'bg-primary'} opacity-20 group-hover:w-full transition-all duration-500`}></div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 animate-in fade-in zoom-in duration-300">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-800 pb-2">{label}</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#63C132]"></div>
              <span className="text-xs font-bold">Sent:</span>
            </div>
            <span className="text-xs font-black">{payload[0].value.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#003B6D] opacity-40"></div>
              <span className="text-xs font-bold">Delivered:</span>
            </div>
            <span className="text-xs font-black">{payload[1].value.toLocaleString()}</span>
          </div>
          {payload[2] && (
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#ef4444]"></div>
                <span className="text-xs font-bold">Failed:</span>
              </div>
              <span className="text-xs font-black">{payload[2].value.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
}
