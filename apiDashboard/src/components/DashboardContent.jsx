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

const COLORS = ['#6366f1', '#e2e8f0'];

export default function DashboardContent({ activeTab, toggleSidebar, onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('Last 7 Days');

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        if (onNavigate) onNavigate('/login');
        return;
      }

      // Convert UI label to API range code
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
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [onNavigate, selectedFilter]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F5F7FA]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-slate-500 font-bold tracking-tight">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Fallback to mock-like structure if data fails but we want to show UI
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
  const usage = data?.usage || { used: 0, limit: 100, percentage: 0, remaining: 100 };
  const connection = data?.connection || { connected: false, phoneNumber: 'Not Connected', wabaId: '' };

  const usagePieData = [
    { name: 'Used', value: usage.used },
    { name: 'Remaining', value: usage.remaining },
  ];

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F7F9FC]">
      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar pb-20">

        {/* Premium Dashboard Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard Overview</h2>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest opacity-60">Monitor your real-time performance and usage</p>
          </div>
          
          {/* Quick Actions (Top Right) */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-3 px-6 py-4 bg-white border border-slate-100 text-slate-600 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-95">
              <Zap size={16} className="text-amber-500" />
              Broadcast
            </button>
            <button className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95">
              <Plus size={16} />
              New Message
            </button>
          </div>
        </div>

        {/* KPI Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-5">
          <StatCard
            label="Messages Sent"
            value={stats.messagesSent}
            color="emerald"
            icon={Send}
          />
          <StatCard
            label="Messages Delivered"
            value={stats.delivered}
            color="blue"
            icon={MessageSquare}
          />
          <StatCard
            label="Delivery Rate"
            value={stats.deliveryRate}
            color="indigo"
            icon={ShieldCheck}
          />
          <StatCard
            label="Active Contacts"
            value={stats.activeContacts}
            color="orange"
            icon={Users}
          />
          <StatCard
            label="Total Spend"
            value={stats.totalSpend}
            color="amber"
            icon={IndianRupee}
            isCurrency
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6">
          {/* Chart Section */}
          <div className="lg:col-span-8 bg-white rounded-2xl md:rounded-[1.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div>
                <h3 className="text-base md:text-lg font-bold text-slate-800">Message Performance</h3>
                <div className="flex flex-wrap items-center gap-4 mt-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-xs text-slate-500 font-medium">Messages Sent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-xs text-slate-500 font-medium">Messages Delivered</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div
                  onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                  className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <span className="text-xs text-slate-600 font-bold uppercase tracking-wider">{selectedFilter}</span>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${filterDropdownOpen ? 'rotate-180' : ''}`} />
                </div>

                {filterDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl border border-slate-100 shadow-xl py-2 z-30 animate-in fade-in slide-in-from-top-1 duration-200">
                    {['Last 24 Hours', 'Last 7 Days', 'Last 30 Days'].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => {
                          setSelectedFilter(filter);
                          setFilterDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-[10px] font-bold uppercase tracking-widest transition-colors ${selectedFilter === filter ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-700 hover:bg-slate-50'}`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="h-[260px] md:h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performance}>
                  <defs>
                    <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                    dy={15}
                    interval={
                      selectedFilter === 'Last 30 Days' ? 3 :
                        selectedFilter === 'Last 24 Hours' ? 2 : 0
                    }
                    padding={{ left: 20, right: 25 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                    tickFormatter={(val) => val >= 1000 ? `${val / 1000}K` : val}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sent"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorSent)"
                    animationDuration={2000}
                  />
                  <Area
                    type="monotone"
                    dataKey="delivered"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorDelivered)"
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sidebar Content Column */}
          <div className="lg:col-span-4 space-y-5 md:space-y-6">
            {/* WhatsApp Connection Card */}
            <div className="bg-white rounded-2xl md:rounded-[1.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-4 md:p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm md:text-base font-bold text-slate-800">WhatsApp Connection</h3>
                <div className="bg-emerald-50 text-emerald-600 text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                  Connected
                </div>
              </div>
              <div className="flex items-center gap-3 md:gap-4 mb-5">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-4 ring-emerald-50 flex-shrink-0">
                  <MessageSquare size={20} className="md:w-6 md:h-6" fill="currentColor" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-base md:text-lg font-bold text-slate-800 truncate">{connection.phoneNumber}</h4>
                  <p className="text-[9px] md:text-[10px] text-slate-500 mt-0.5 truncate">ID: {connection.wabaId || '---'}</p>
                </div>
              </div>
              <button className="w-full py-2.5 border border-slate-200 hover:border-indigo-600 hover:bg-indigo-50 text-indigo-600 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 group">
                <Settings size={14} className="group-hover:rotate-90 transition-transform" />
                Manage Connection
              </button>
            </div>

            {/* Usage Overview Card */}
            <div className="bg-white rounded-2xl md:rounded-[1.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-4 md:p-5">
              <h3 className="text-sm md:text-base font-bold text-slate-800 mb-4">Usage Overview</h3>
              <div className="flex items-center justify-between gap-4">
                <div className="relative w-24 h-24 md:w-28 md:h-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={usagePieData}
                        innerRadius={30}
                        outerRadius={42}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {usagePieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg md:text-xl font-black text-slate-800">{usage.percentage}%</span>
                    <span className="text-[7px] text-slate-400 font-bold uppercase">of {(usage.limit / 1000).toFixed(0)}K</span>
                  </div>
                </div>
                <div className="space-y-2 flex-1 w-full pl-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-medium">Used</span>
                    <span className="text-xs font-bold text-slate-800">{usage.used.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-medium">Remaining</span>
                    <span className="text-xs font-bold text-slate-800">{usage.remaining.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-medium">Resets</span>
                    <span className="text-xs font-bold text-slate-800">01 Jun</span>
                  </div>
                </div>
              </div>
              <button className="w-full mt-4 py-2.5 text-indigo-600 text-xs font-bold flex items-center justify-center gap-2 hover:bg-indigo-50 rounded-xl transition-colors">
                <BarChart2 size={14} />
                View Usage
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section: Campaigns & Templates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
          {/* Recent Campaigns */}
          <div className="bg-white rounded-2xl md:rounded-[1.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 md:p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base md:text-lg font-black text-slate-800 tracking-tight whitespace-nowrap">Recent Campaigns</h3>
              <button className="text-indigo-600 text-xs font-bold hover:text-indigo-700 transition-colors whitespace-nowrap ml-4">View All</button>
            </div>
            <div className="space-y-4 flex-1">
              {recentCampaigns.length > 0 ? recentCampaigns.map((camp) => (
                <CampaignItem
                  key={camp._id}
                  name={camp.name}
                  type={`${camp.template_type.charAt(0).toUpperCase() + camp.template_type.slice(1)} Campaign`}
                  date={new Date(camp.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  status={camp.status === 'running' ? 'In Progress' : (camp.status.charAt(0).toUpperCase() + camp.status.slice(1))}
                  sent={camp.total_contacts.toLocaleString()}
                  delivered={camp.status === 'completed' ? '100%' : (camp.status === 'scheduled' ? '-' : '98%')} // Mock % for now
                  icon={camp.template_type === 'marketing' ? TrendingUp : MessageSquare}
                  iconColor={camp.template_type === 'marketing' ? 'emerald' : 'purple'}
                />
              )) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs italic">
                  No recent campaigns found.
                </div>
              )}
            </div>
          </div>

          {/* Top Templates */}
          <div className="bg-white rounded-2xl md:rounded-[1.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 md:p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base md:text-lg font-black text-slate-800 tracking-tight whitespace-nowrap">Top Templates</h3>
              <button className="text-indigo-600 text-xs font-bold hover:text-indigo-700 transition-colors whitespace-nowrap ml-4">View All</button>
            </div>
            <div className="space-y-2.5 md:space-y-3 flex-1">
              {topTemplates.length > 0 ? topTemplates.map((template, idx) => (
                <TemplateItem
                  key={idx}
                  name={template.name}
                  type={template.type.charAt(0).toUpperCase() + template.type.slice(1)}
                  usage={template.usage}
                  isActive={idx === 0}
                />
              )) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs italic">
                  No template data available.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions: Full Width Below */}
        <div className="bg-white rounded-2xl md:rounded-[1.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 md:p-6">
          <h3 className="text-base md:text-lg font-black text-slate-800 tracking-tight mb-6 whitespace-nowrap">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            <ActionBtn label="Create Campaign" icon={Send} color="emerald" />
            <ActionBtn label="Send Message" icon={MessageSquare} color="blue" />
            <ActionBtn label="Add Contact" icon={Users} color="purple" />
            <ActionBtn label="Create Template" icon={LayoutTemplate} color="orange" />
            <ActionBtn label="View Analytics" icon={BarChart2} color="emerald" />
            <ActionBtn label="WhatsApp Setup" icon={Smartphone} color="emerald" />
          </div>
        </div>

      </main>
    </div>
  );
}

function StatCard({ label, value, color, icon: Icon, isCurrency }) {
  const colorMap = {
    emerald: 'bg-emerald-50 text-emerald-500',
    blue: 'bg-blue-50 text-blue-500',
    indigo: 'bg-indigo-50 text-indigo-500',
    orange: 'bg-orange-50 text-orange-500',
    amber: 'bg-amber-50 text-amber-500',
  };

  return (
    <div className="bg-white p-4 md:p-5 rounded-[1.25rem] border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden group">
      <div className={`w-10 h-10 ${colorMap[color]} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <Icon size={20} strokeWidth={2.5} />
      </div>
      <div className="space-y-0.5">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <h3 className="text-xl font-black text-slate-800">{value}</h3>
      </div>
      <div className={`absolute bottom-0 left-0 h-1 w-0 bg-current opacity-20 group-hover:w-full transition-all duration-500 ${colorMap[color].split(' ')[1]}`}></div>
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
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-xs font-bold">Sent:</span>
            </div>
            <span className="text-xs font-black">{payload[0].value.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-xs font-bold">Delivered:</span>
            </div>
            <span className="text-xs font-black">{payload[1].value.toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

function CampaignItem({ name, type, date, status, sent, delivered, icon: Icon, iconColor }) {
  const colorMap = {
    emerald: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20',
    blue: 'bg-blue-500 text-white shadow-lg shadow-blue-500/20',
    purple: 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20',
  };

  const statusMap = {
    'Completed': 'bg-emerald-50 text-emerald-600',
    'In Progress': 'bg-blue-50 text-blue-600',
    'Scheduled': 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="flex items-center gap-3 group cursor-pointer hover:bg-slate-50 p-1.5 -mx-1.5 rounded-2xl transition-all border-b border-slate-50 last:border-0 pb-3">
      <div className={`w-11 h-11 ${colorMap[iconColor]} rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110`}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-[100px]">
        <div className="flex flex-wrap items-center gap-2 mb-0.5">
          <h4 className="text-[14px] font-extrabold text-slate-800 leading-tight">{name}</h4>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-lg ${statusMap[status]}`}>{status}</span>
        </div>
        <p className="text-[10px] text-slate-400 font-medium">{type} • {date}</p>
      </div>
      <div className="flex items-center gap-4 sm:gap-8 flex-shrink-0">
        <div className="text-left min-w-[60px]">
          <p className="text-[13px] font-black text-slate-800">{sent}</p>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{status === 'Scheduled' ? 'Sched' : 'Sent'}</p>
        </div>
        <div className="text-left min-w-[70px]">
          <p className="text-[13px] font-black text-slate-800">{delivered}</p>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Deliv</p>
        </div>
      </div>
    </div>
  );
}

function TemplateItem({ name, type, usage, isActive }) {
  return (
    <div className={`flex items-center justify-between group cursor-pointer p-4 rounded-2xl transition-all duration-300 ${isActive ? 'bg-indigo-50/50 border border-indigo-100/50' : 'hover:bg-slate-50/80 border border-transparent'}`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 md:w-14 md:h-14 ${isActive ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'} rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm transition-colors`}>
          <LayoutTemplate size={24} />
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <h4 className="text-sm md:text-[15px] font-extrabold text-slate-800 leading-tight truncate">{name}</h4>
          <div>
            <span className={`text-[9px] md:text-[10px] font-bold px-2 md:px-3 py-1 rounded-lg ${type === 'Promotional' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
              {type}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
        <div className="text-right">
          <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-tight">Used</p>
          <div className="flex flex-col leading-none mt-1">
            <span className="text-sm md:text-[15px] font-black text-slate-800">{usage}</span>
            <span className="text-[10px] md:text-[11px] text-slate-500 font-bold uppercase">times</span>
          </div>
        </div>
        <ArrowRight size={16} className={`${isActive ? 'text-indigo-600' : 'text-slate-300'} group-hover:text-indigo-600 group-hover:translate-x-1 transition-all`} />
      </div>
    </div>
  );
}

function ActionBtn({ label, icon: Icon, color }) {
  const colorMap = {
    emerald: 'bg-[#F0FDF4] text-[#10B981]',
    blue: 'bg-[#EFF6FF] text-[#3B82F6]',
    purple: 'bg-[#F5F3FF] text-[#8B5CF6]',
    orange: 'bg-[#FFF7ED] text-[#F97316]',
  };

  return (
    <button className="flex flex-col items-center justify-center gap-2 p-3 md:p-4 bg-white border border-slate-100 rounded-xl md:rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group min-h-[100px] md:min-h-[110px]">
      <div className={`w-9 h-9 md:w-11 md:h-11 ${colorMap[color]} rounded-xl flex items-center justify-center mb-1 group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={18} className="md:w-5 md:h-5" strokeWidth={2.5} />
      </div>
      <span className="text-[10px] md:text-[11px] font-extrabold text-slate-700 text-center leading-tight max-w-[80px] md:max-w-full">
        {label}
      </span>
    </button>
  );
}
