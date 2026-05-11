import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  TrendingUp, Users, MessageSquare, CheckCircle, 
  ArrowUpRight, ArrowDownRight, Filter, Download,
  Calendar, Zap, Shield, BarChart2
} from 'lucide-react';

const COLORS = ['#003B6D', '#63C132', '#f59e0b', '#ef4444'];

const StatCard = ({ title, value, change, trend, icon: Icon, color }) => {
  const colorMap = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    secondary: 'bg-secondary/10 text-secondary border-secondary/20',
    indigo: 'bg-primary/10 text-primary border-primary/20',
    emerald: 'bg-secondary/10 text-secondary border-secondary/20',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
  };

  return (
    <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500">
      <div className={`absolute top-0 right-0 w-32 h-32 ${color === 'indigo' || color === 'primary' ? 'bg-primary/5' : 'bg-secondary/5'} rounded-full -mr-16 -mt-16 blur-2xl group-hover:opacity-80 transition-all duration-700`}></div>
      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border ${colorMap[color] || colorMap.primary}`}>
            <Icon size={28} />
          </div>
          <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${trend === 'up' ? 'bg-secondary/10 text-secondary' : 'bg-red-50 text-red-600'}`}>
            {trend === 'up' ? <TrendingUp size={14} /> : <ArrowDownRight size={14} />}
            {change}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
          <h3 className="text-3xl font-black text-slate-800 tracking-tight mt-1">{value}</h3>
        </div>
      </div>
    </div>
  );
};

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [range, setRange] = useState('7d');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/analytics/dashboard?range=${range === '7D' ? '7d' : range === '30D' ? '30d' : '7d'}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok) setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  if (loading && !data) {
    return (
      <div className="h-full flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const performanceData = data?.performance || [
    { name: 'Mon', sent: 0, delivered: 0 },
    { name: 'Tue', sent: 0, delivered: 0 },
    { name: 'Wed', sent: 0, delivered: 0 },
    { name: 'Thu', sent: 0, delivered: 0 },
    { name: 'Fri', sent: 0, delivered: 0 },
    { name: 'Sat', sent: 0, delivered: 0 },
    { name: 'Sun', sent: 0, delivered: 0 },
  ];

  return (
    <div className="h-full bg-[#F8FAFC] flex flex-col p-8 lg:p-12 space-y-10 overflow-y-auto custom-scrollbar">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
              <BarChart2 size={24} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Performance <span className="text-primary">Analytics</span></h1>
          </div>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest pl-15">Real-time engagement & delivery metrics</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100">
          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
            {['7D', '30D', '90D', '1Y'].map(period => (
              <button 
                key={period} 
                onClick={() => setRange(period)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${range === period ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {period}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-5 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-lg shadow-primary/10">
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard title="Total Sent" value={data?.kpi?.messagesSent || '0'} change="+14.2%" trend="up" icon={MessageSquare} color="primary" />
        <StatCard title="Delivery Rate" value={data?.kpi?.deliveryRate || '0%'} change="+0.4%" trend="up" icon={CheckCircle} color="secondary" />
        <StatCard title="Total Spend" value={data?.kpi?.totalSpend || '₹0.00'} change="-2.1%" trend="down" icon={Zap} color="amber" />
        <StatCard title="Conversations" value={data?.kpi?.activeContacts || '0'} change="+18.5%" trend="up" icon={Users} color="blue" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Traffic Chart */}
        <div className="xl:col-span-2 p-10 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/20 space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-xl font-black text-slate-800 tracking-tight">Messaging Activity</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Compare sent vs read volume across time</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-secondary rounded-full"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Read</span>
              </div>
            </div>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#003B6D" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#003B6D" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRead" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#63C132" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#63C132" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900, textTransform: 'uppercase'}} 
                  dy={20}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} 
                  dx={-20}
                />
                <Tooltip 
                  contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', padding: '20px'}}
                  itemStyle={{fontSize: '11px', fontWeight: 900, textTransform: 'uppercase'}}
                />
                <Area type="monotone" dataKey="sent" stroke="#003B6D" strokeWidth={4} fillOpacity={1} fill="url(#colorSent)" />
                <Area type="monotone" dataKey="delivered" stroke="#63C132" strokeWidth={4} fillOpacity={1} fill="url(#colorRead)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Chart */}
        <div className="p-10 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/20 flex flex-col">
          <div className="space-y-1 mb-8 text-center">
            <h4 className="text-xl font-black text-slate-800 tracking-tight">Message Categories</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">By business intent</p>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.topTemplates?.map(t => ({ name: t.name, value: parseInt(t.usage) || 0 })) || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {data?.topTemplates?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={12} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-8">
            {data?.topTemplates?.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest leading-none truncate max-w-[80px]">{entry.name}</p>
                  <p className="text-xs font-black text-slate-400 tracking-tight">{entry.usage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Campaign Performance Table */}
      <div className="p-10 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/20">
        <div className="flex items-center justify-between mb-10">
          <div className="space-y-1">
            <h4 className="text-xl font-black text-slate-800 tracking-tight">Top Campaigns</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Highest performing broadcasts this month</p>
          </div>
          <button className="px-6 py-3 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:text-slate-600 transition-all border border-slate-100">
            View All Campaigns
          </button>
        </div>
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Campaign Name</th>
                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sent</th>
                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Read Rate</th>
                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Conversion</th>
                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">ROI Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { name: 'Summer Sale Blast', sent: '42,000', read: '88%', conv: '12%', roi: '9.4' },
                { name: 'Onboarding Sequence', sent: '12,500', read: '94%', conv: '24%', roi: '9.8' },
                { name: 'Weekend Discount', sent: '28,200', read: '76%', conv: '8%', roi: '7.2' },
                { name: 'Loyalty Reward', sent: '5,000', read: '98%', conv: '42%', roi: '10.0' },
              ].map((campaign, i) => (
                <tr key={i} className="group hover:bg-slate-50/50 transition-all">
                  <td className="py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-[10px]">#{i+1}</div>
                      <span className="text-xs font-black text-slate-700 tracking-tight">{campaign.name}</span>
                    </div>
                  </td>
                  <td className="py-6 text-xs font-black text-slate-600 tracking-tight">{campaign.sent}</td>
                  <td className="py-6">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-secondary rounded-full" style={{ width: campaign.read }}></div>
                      </div>
                      <span className="text-[10px] font-black text-secondary tracking-tight">{campaign.read}</span>
                    </div>
                  </td>
                  <td className="py-6 text-xs font-black text-slate-600 tracking-tight">{campaign.conv}</td>
                  <td className="py-6 text-right">
                    <span className="px-4 py-2 bg-primary/10 text-primary text-[11px] font-black rounded-lg border border-primary/20">{campaign.roi}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
