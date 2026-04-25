import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import {
  TrendingUp, TrendingDown, Users, MessageSquare, Send, CheckCircle2,
  Clock, Calendar, Download, Filter, ChevronDown, MoreVertical,
  ArrowUpRight, ArrowDownRight, Zap, Eye, MousePointer2, AlertCircle,
  Globe, Smartphone, Tablet, Laptop
} from 'lucide-react';

const trafficData = [
  { name: 'Mon', sent: 1, received: 1 },
  { name: 'Tue', sent: 1, received: 1 },
  { name: 'Wed', sent: 1, received: 1 },
  { name: 'Thu', sent: 1, received: 1 },
  { name: 'Fri', sent: 1, received: 1 },
  { name: 'Sat', sent: 1, received: 1 },
  { name: 'Sun', sent: 1, received: 1 },
];

const funnelData = [
  { name: 'Sent', value: 1, color: '#10b981' },
  { name: 'Delivered', value: 1, color: '#3b82f6' },
  { name: 'Read', value: 1, color: '#8b5cf6' },
  { name: 'Replied', value: 1, color: '#f59e0b' },
];

const deviceData = [
  { name: 'Android', value: 1, color: '#10b981' },
  { name: 'iOS', value: 1, color: '#3b82f6' },
  { name: 'Web/Other', value: 1, color: '#94a3b8' },
];

const templatePerformance = [
  { name: 'order_update', usage: 1, readRate: '1%', ctr: '1%', status: 'approved' },
  { name: 'welcome_message', usage: 1, readRate: '1%', ctr: '1%', status: 'approved' },
  { name: 'promotion_festive', usage: 1, readRate: '1%', ctr: '1%', status: 'approved' },
  { name: 'payment_reminder', usage: 1, readRate: '1%', ctr: '1%', status: 'approved' },
  { name: 'feedback_loop', usage: 1, readRate: '1%', ctr: '1%', status: 'pending' },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('Last 7 Days');

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Filter & Action Bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 cursor-pointer hover:bg-slate-100 transition-all">
            <Calendar size={18} className="text-slate-400" />
            <span className="text-sm font-bold text-slate-700">{timeRange}</span>
            <ChevronDown size={16} className="text-slate-400" />
          </div>
        </div>
        <button className="flex items-center gap-2 bg-slate-900 text-white rounded-xl px-6 py-2.5 text-sm font-bold hover:bg-black transition-all shadow-lg shadow-slate-200">
          <Download size={18} /> Export Data
        </button>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Messages', value: '1', trend: '1%', isUp: true, icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Delivery Rate', value: '1%', trend: '1%', isUp: true, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Read Rate', value: '1%', trend: '1%', isUp: false, icon: Eye, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Conversion', value: '1%', trend: '1%', isUp: true, icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm group hover:border-slate-300 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg ${stat.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {stat.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.trend}
              </div>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
            <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{stat.value}</h3>
            <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full ${stat.color.replace('text', 'bg')} opacity-60`} style={{ width: '70%' }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Middle Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Traffic Area Chart */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm lg:col-span-8 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Traffic Analysis</h3>
              <p className="text-sm text-slate-500">Volume of sent vs. received messages</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-xs font-bold text-slate-600">Sent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-xs font-bold text-slate-600">Received</span>
              </div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData}>
                <defs>
                  <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} tickFormatter={(v) => `${v/1000}K`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 700 }}
                />
                <Area type="monotone" dataKey="sent" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSent)" />
                <Area type="monotone" dataKey="received" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorReceived)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engagement Funnel */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm lg:col-span-4 flex flex-col">
          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-800">Engagement Funnel</h3>
            <p className="text-sm text-slate-500">Drop-off rates across stages</p>
          </div>
          <div className="flex-1 space-y-6">
            {funnelData.map((stage, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-slate-700">{stage.name}</span>
                  <span className="text-xs font-extrabold text-slate-400">{stage.value}%</span>
                </div>
                <div className="h-4 w-full bg-slate-50 rounded-lg overflow-hidden border border-slate-100 p-0.5">
                  <div 
                    className="h-full rounded-md shadow-sm transition-all duration-1000" 
                    style={{ width: `${stage.value}%`, backgroundColor: stage.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-blue-500" />
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                <span className="font-bold text-slate-800">Insight:</span> Read rate is 1% higher than last week. Great job on the new templates!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Template Performance Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm lg:col-span-8 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Template Performance</h3>
              <p className="text-sm text-slate-500">Metric breakdown by message template</p>
            </div>
            <button className="text-blue-600 text-sm font-bold hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                  <th className="px-8 py-4">Template Name</th>
                  <th className="px-8 py-4">Usage</th>
                  <th className="px-8 py-4">Read Rate</th>
                  <th className="px-8 py-4">CTR</th>
                  <th className="px-8 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {templatePerformance.map((tmp, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                          <Zap size={14} />
                        </div>
                        <span className="text-sm font-bold text-slate-800 truncate">{tmp.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-sm font-bold text-slate-600">{tmp.usage.toLocaleString()}</td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500" style={{ width: tmp.readRate }}></div>
                        </div>
                        <span className="text-xs font-bold text-slate-700">{tmp.readRate}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-sm font-bold text-emerald-600">{tmp.ctr}</td>
                    <td className="px-8 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${tmp.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                        {tmp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm lg:col-span-4 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-8">Device Distribution</h3>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} cornerRadius={4} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-800">1%</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mobile</span>
            </div>
          </div>
          <div className="mt-8 space-y-4">
            {deviceData.map((device, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: device.color }}></div>
                  <span className="text-sm font-bold text-slate-600">{device.name}</span>
                </div>
                <span className="text-sm font-black text-slate-800">{device.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
