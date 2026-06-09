import React, { useState, useEffect } from 'react';
import {
  Send, MessageSquare, LayoutTemplate, Users, BarChart2,
  Settings, Bell, Search, ChevronDown, TrendingUp,
  Plus, ArrowRight, Crown, Smartphone, Zap, IndianRupee, ShieldCheck,
  Calendar, LayoutDashboard, Menu, Loader2
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { getDashboardStats } from '../utils/api';

export default function DashboardContent({ activeTab, toggleSidebar, onNavigate, setActiveTab }) {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('cached_dashboard_stats');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(!data);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('Last 7 Days');

  const handleInternalNav = (tab, path) => {
    if (setActiveTab) setActiveTab(tab);
    if (onNavigate) onNavigate(path);
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        if (onNavigate) onNavigate('/login');
        return;
      }

      if (!data) setLoading(true);
      const rangeMap = {
        'Last 24 Hours': '24h',
        'Last 7 Days': '7d',
        'Last 30 Days': '30d'
      };
      const rangeCode = rangeMap[selectedFilter] || '7d';

      try {
        const result = await getDashboardStats(token, rangeCode);
        if (result.error) {
          console.error("Fetch Stats Error:", result.error);
        } else {
          setData(result);
          localStorage.setItem('cached_dashboard_stats', JSON.stringify(result));
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [onNavigate, selectedFilter]);

  const stats = data?.kpi || {
    messagesSent: '0',
    delivered: '0',
    deliveryRate: '0%',
    activeContacts: '0',
    totalSpend: '₹0.00'
  };

  const performance = data?.performance || [];
  const recentCampaigns = data?.recentCampaigns || [];
  const topTemplates = data?.topTemplates || [];
  const usage = data?.usage || { used: 0, limit: 5000, percentage: 0, remaining: 5000 };
  const connection = data?.connection || { connected: false, phoneNumber: 'Not Connected', wabaId: '' };

  if (loading && !data) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background h-full">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F8FAFC]">
      <main className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar pb-12">

        {/* ── Page Header ── */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">Dashboard</h1>
            <p className="text-xs text-slate-400 font-semibold mt-2 leading-none">Monitor your real-time performance and usage</p>
          </div>
        </div>

        {/* 1. Stats Row - 5 separate Sleek Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          <StatCard
            label="Messages Sent"
            value={stats.messagesSent}
            badgeColor="green"
            icon={Send}
            onClick={() => handleInternalNav('Messages', '/messages')}
          />
          <StatCard
            label="Messages Delivered"
            value={stats.delivered}
            badgeColor="blue"
            icon={MessageSquare}
            onClick={() => handleInternalNav('Messages', '/messages')}
          />
          <StatCard
            label="Delivery Rate"
            value={stats.deliveryRate}
            badgeColor="green"
            icon={ShieldCheck}
            onClick={() => handleInternalNav('Analytics', '/analytics')}
          />
          <StatCard
            label="Active Contacts"
            value={stats.activeContacts}
            badgeColor="blue"
            icon={Users}
            onClick={() => handleInternalNav('Contacts', '/contacts')}
          />
          <StatCard
            label="Total Spend"
            value={stats.totalSpend}
            badgeColor="green"
            icon={IndianRupee}
            onClick={() => handleInternalNav('Billing & Plan', '/billing')}
          />
        </div>

        {/* 2. Middle Row: Chart & Connection Status */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* Chart Section */}
          <div className="lg:col-span-8 bg-white rounded-lg border border-slate-200/60 p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-slate-800">Message Performance</h3>
                {/* Legends under title */}
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#63C132] inline-block"></span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Messages Sent</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#003B6D] inline-block"></span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Messages Delivered</span>
                  </div>
                </div>
              </div>

              {/* Date Filter Dropdown */}
              <div className="relative">
                <div
                  onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                  className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">{selectedFilter}</span>
                  <ChevronDown size={12} className={`text-slate-400 transition-transform duration-300 ${filterDropdownOpen ? 'rotate-180' : ''}`} />
                </div>

                {filterDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-36 bg-white rounded-md border border-slate-100 shadow-lg py-1 z-30 animate-in fade-in slide-in-from-top-1 duration-200">
                    {['Last 24 Hours', 'Last 7 Days', 'Last 30 Days'].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => {
                          setSelectedFilter(filter);
                          setFilterDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-1.5 text-left text-[9px] font-bold uppercase tracking-widest transition-colors ${selectedFilter === filter ? 'text-[#003B6D] bg-[#003B6D]/5' : 'text-slate-700 hover:bg-slate-50'}`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Smooth Chart Area */}
            <div className="h-[200px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performance} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#63C132" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#63C132" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#003B6D" stopOpacity={0.05} />
                      <stop offset="95%" stopColor="#003B6D" stopOpacity={0} />
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
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ stroke: '#e2e8f0', strokeWidth: 1.5 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sent"
                    stroke="#63C132"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorSent)"
                    dot={{ r: 3, fill: '#63C132', strokeWidth: 1 }}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                    animationDuration={1500}
                  />
                  <Area
                    type="monotone"
                    dataKey="delivered"
                    stroke="#003B6D"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fillOpacity={1}
                    fill="url(#colorDelivered)"
                    dot={{ r: 3, fill: '#003B6D', strokeWidth: 1 }}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Combined WhatsApp Connection & Usage Card */}
          <div className="lg:col-span-4 bg-white rounded-lg border border-slate-200/60 p-4 shadow-sm flex flex-col justify-between">
            <div>
              {/* Connection Status Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">WhatsApp Connection</h3>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${connection.connected ? 'bg-[#EAFDF5] text-[#10B981] border border-[#A7F3D0]' : 'bg-red-50 text-red-500 border border-red-100'}`}>
                  {connection.connected ? 'Connected' : 'Not Connected'}
                </span>
              </div>

              {/* Connection Phone Number & ID */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current text-[#25D366]">
                    <path d="M12.004 2C6.48 2 2 6.48 2 12.004c0 1.88.52 3.65 1.43 5.17L2 22l4.99-1.3c1.5.82 3.19 1.3 4.96 1.3 5.52 0 10.05-4.48 10.05-10.004C22.054 6.48 17.524 2 12.004 2zM17.51 16.03c-.22.62-1.28 1.19-1.78 1.29-.46.09-.9.19-2.92-.6-2.58-1.01-4.2-3.6-4.33-3.77-.13-.17-1.09-1.44-1.09-2.75 0-1.31.68-1.96.93-2.22.2-.21.53-.34.82-.34.1 0 .2 0 .29.01.27.01.4.03.58.42.22.49.76 1.86.83 2 .07.14.12.31.02.51-.1.2-.15.32-.3.49-.15.17-.31.38-.45.54-.15.18-.32.38-.13.7.38.64.85 1.18 1.42 1.69.73.65 1.35 1.07 2.09 1.37.23.09.46.08.63-.09.22-.22.75-.87.95-1.17.16-.23.35-.19.58-.1.24.09 1.5.7 1.76.83.26.13.43.2.49.31.07.13.07.74-.15 1.33z"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-extrabold text-slate-800 leading-tight">{connection.phoneNumber || '+91 98765 43210'}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mt-0.5">ID: {connection.wabaId || '1643156013601277'}</p>
                </div>
              </div>

              {/* Usage Grid Info next to progress Ring */}
              <div className="border-t border-slate-100 pt-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Usage</h4>
                <div className="flex items-center justify-between gap-4">
                  {/* Text values */}
                  <div className="space-y-1.5 flex-1 text-xs">
                    <div className="flex justify-between border-b border-slate-50 pb-0.5">
                      <span className="text-slate-400 font-medium">Used</span>
                      <span className="font-bold text-slate-800">{usage.used}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-0.5">
                      <span className="text-slate-400 font-medium">Remaining</span>
                      <span className="font-bold text-slate-800">{usage.remaining.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Resets On</span>
                      <span className="font-bold text-slate-800">
                        {usage.expiry ? new Date(usage.expiry).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '13 Jun'}
                      </span>
                    </div>
                  </div>

                  {/* Circular progress donut */}
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Used', value: usage.used },
                            { name: 'Remaining', value: usage.remaining },
                          ]}
                          innerRadius={22}
                          outerRadius={30}
                          paddingAngle={2}
                          dataKey="value"
                          stroke="none"
                          startAngle={90}
                          endAngle={-270}
                        >
                          <Cell fill="#003B6D" />
                          <Cell fill="#E2E8F0" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xs font-black text-slate-850 leading-none">{usage.percentage}%</span>
                      <span className="text-[7px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">of {(usage.limit / 1000).toFixed(0)}k</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions Button */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => handleInternalNav('WhatsApp Setup', '/setup')}
                className="w-full py-2 bg-transparent border border-slate-200 hover:border-[#003B6D] hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Settings size={14} className="text-slate-400" />
                Manage Connection
              </button>
            </div>
          </div>
        </div>

        {/* 3. Bottom Row: Recent Campaigns & Top Templates tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          {/* Recent Campaigns table */}
          <div className="bg-white rounded-lg border border-slate-200/60 p-4 shadow-sm flex flex-col h-[280px]">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Recent Campaigns</h3>
              <button
                onClick={() => handleInternalNav('Campaigns', '/campaigns')}
                className="text-[#63C132] text-xs font-bold hover:underline"
              >
                View All
              </button>
            </div>
            <div className="flex-1 overflow-auto custom-scrollbar">
              {recentCampaigns.length > 0 ? (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-slate-400 font-bold uppercase text-[9px] tracking-wider border-b border-slate-100">
                      <th className="py-2.5 font-bold">Campaign Name</th>
                      <th className="py-2.5 font-bold">Status</th>
                      <th className="py-2.5 font-bold text-center">Sent</th>
                      <th className="py-2.5 font-bold text-center">Delivered</th>
                      <th className="py-2.5 font-bold text-center">Delivery Rate</th>
                      <th className="py-2.5 font-bold">Date</th>
                      <th className="py-2.5 font-bold text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {recentCampaigns.map((camp) => {
                      const displayDelivered = camp.status === 'completed' ? '100%' : (camp.status === 'scheduled' ? '-' : '98%');
                      return (
                        <tr key={camp._id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="py-2.5 font-semibold text-slate-800 truncate max-w-[110px]" title={camp.name}>
                            {camp.name}
                          </td>
                          <td className="py-2.5">
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#EAFDF5] text-[#10B981] border border-[#A7F3D0] uppercase tracking-wide">
                              Completed
                            </span>
                          </td>
                          <td className="py-2.5 text-center font-semibold text-slate-850">1</td>
                          <td className="py-2.5 text-center font-semibold text-slate-850">1</td>
                          <td className="py-2.5 text-center font-semibold text-slate-850">100%</td>
                          <td className="py-2.5 text-slate-500 font-medium">12 May 2026</td>
                          <td className="py-2.5 text-center">
                            <button
                              onClick={() => handleInternalNav('Campaigns', '/campaigns')}
                              className="text-slate-400 hover:text-primary transition-colors font-bold text-sm cursor-pointer px-1"
                            >
                              &gt;
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs italic">
                  No recent campaigns found.
                </div>
              )}
            </div>
          </div>

          {/* Top Templates list/table */}
          <div className="bg-white rounded-lg border border-slate-200/60 p-4 shadow-sm flex flex-col h-[280px]">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Top Templates</h3>
              <button
                onClick={() => handleInternalNav('Templates', '/templates')}
                className="text-[#63C132] text-xs font-bold hover:underline"
              >
                View All
              </button>
            </div>
            <div className="flex-1 overflow-auto custom-scrollbar">
              {topTemplates.length > 0 ? (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-slate-400 font-bold uppercase text-[9px] tracking-wider border-b border-slate-100">
                      <th className="py-2.5 font-bold">Template Name</th>
                      <th className="py-2.5 font-bold">Category</th>
                      <th className="py-2.5 font-bold text-center">Used</th>
                      <th className="py-2.5 font-bold text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {topTemplates.map((template, idx) => {
                      const isUtility = template.type.toLowerCase() === 'utility' || idx !== 1;
                      const badgeClasses = isUtility 
                        ? 'bg-blue-50 text-blue-650 border border-blue-100' 
                        : 'bg-purple-50 text-purple-650 border border-purple-100';
                      const label = isUtility ? 'Utility' : 'Marketing';
                      
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="py-2.5 font-semibold text-slate-800">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded bg-slate-50 text-slate-400 border border-slate-200 flex items-center justify-center flex-shrink-0">
                                <LayoutTemplate size={12} />
                              </div>
                              <span className="truncate max-w-[150px]" title={template.name}>
                                {template.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${badgeClasses}`}>
                              {label}
                            </span>
                          </td>
                          <td className="py-2.5 text-center font-bold text-slate-800">{template.usage}</td>
                          <td className="py-2.5 text-center">
                            <button
                              onClick={() => handleInternalNav('Templates', '/templates')}
                              className="text-slate-400 hover:text-primary transition-colors font-bold text-sm cursor-pointer px-1"
                            >
                              &gt;
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs italic">
                  No template data available.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4. Quick Actions Container - Divided Row */}
        <div className="bg-white rounded-lg border border-slate-200/60 p-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3.5 pl-0.5">Quick Actions</h3>
          <div className="flex items-center justify-between divide-x divide-slate-100 border border-slate-200/60 rounded-lg overflow-hidden bg-white">
            <ActionChip label="Create Campaign" icon={Send} color="green" onClick={() => handleInternalNav('Campaigns', '/campaigns')} />
            <ActionChip label="Send Message" icon={MessageSquare} color="blue" onClick={() => handleInternalNav('Messages', '/messages')} />
            <ActionChip label="Add Contact" icon={Users} color="green" onClick={() => handleInternalNav('Contacts', '/contacts')} />
            <ActionChip label="Create Template" icon={LayoutTemplate} color="blue" onClick={() => handleInternalNav('Templates', '/templates')} />
            <ActionChip label="View Analytics" icon={BarChart2} color="green" onClick={() => handleInternalNav('Analytics', '/analytics')} />
            <ActionChip label="WhatsApp Setup" icon={Smartphone} color="blue" onClick={() => handleInternalNav('WhatsApp Setup', '/setup')} />
          </div>
        </div>

      </main>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, badgeColor, onClick }) {
  const badgeClasses = badgeColor === 'green' 
    ? 'bg-emerald-50 text-[#63C132]' 
    : 'bg-blue-50 text-[#003B6D]';
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg border border-slate-200 p-3.5 flex items-center gap-3 hover:shadow-md transition-all cursor-pointer shadow-sm"
    >
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

function ActionChip({ label, icon: Icon, color, onClick }) {
  const isGreen = color === 'green';
  return (
    <button
      onClick={onClick}
      className="flex-1 flex items-center justify-center gap-2 hover:bg-slate-50 py-3.5 transition-colors cursor-pointer text-slate-700 hover:text-slate-900"
    >
      <Icon size={14} className={isGreen ? 'text-[#63C132]' : 'text-[#003B6D]'} />
      <span className="text-[11px] font-bold tracking-wide">{label}</span>
    </button>
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
              <div className="w-1.5 h-1.5 rounded-full bg-[#003B6D]"></div>
              <span className="text-[10px] font-bold">Delivered:</span>
            </div>
            <span className="text-[10px] font-black">{payload[1].value.toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}
