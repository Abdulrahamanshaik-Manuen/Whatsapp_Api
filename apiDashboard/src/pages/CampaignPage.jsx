import React, { useState } from 'react';
import { 
  Send, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  PlayCircle, 
  PauseCircle, 
  CheckCircle2, 
  Clock, 
  BarChart2,
  Users
} from 'lucide-react';

export default function CampaignPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const campaigns = [
    {
      id: 1,
      name: 'Diwali Special Offer',
      template: 'festival_promo_v2',
      status: 'active',
      audience: 12500,
      sent: 12500,
      delivered: 12100,
      read: 8500,
      date: '20 May 2025',
    },
    {
      id: 2,
      name: 'Summer Sale Announcement',
      template: 'summer_sale_alert',
      status: 'completed',
      audience: 50000,
      sent: 50000,
      delivered: 48000,
      read: 32000,
      date: '15 May 2025',
    },
    {
      id: 3,
      name: 'Welcome Series - New Users',
      template: 'welcome_onboarding',
      status: 'active',
      audience: 1500,
      sent: 1500,
      delivered: 1450,
      read: 1100,
      date: 'Ongoing',
    },
    {
      id: 4,
      name: 'Product Launch Q3',
      template: 'product_launch_teaser',
      status: 'scheduled',
      audience: 25000,
      sent: 0,
      delivered: 0,
      read: 0,
      date: '01 Jun 2025',
    },
    {
      id: 5,
      name: 'Cart Abandonment Recovery',
      template: 'cart_reminder_24h',
      status: 'draft',
      audience: 0,
      sent: 0,
      delivered: 0,
      read: 0,
      date: '-',
    }
  ];

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active':
        return <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1 w-fit"><PlayCircle size={12} /> Active</span>;
      case 'completed':
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full flex items-center gap-1 w-fit"><CheckCircle2 size={12} /> Completed</span>;
      case 'scheduled':
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full flex items-center gap-1 w-fit"><Clock size={12} /> Scheduled</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full flex items-center gap-1 w-fit"><PauseCircle size={12} /> Draft</span>;
    }
  };

  return (
    <div className="flex flex-col space-y-6 min-h-[800px]">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Send size={20} />
            </div>
            <p className="text-sm font-medium text-slate-500">Total Campaigns</p>
          </div>
          <p className="text-2xl font-bold text-slate-800">128</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <Users size={20} />
            </div>
            <p className="text-sm font-medium text-slate-500">Messages Sent</p>
          </div>
          <p className="text-2xl font-bold text-slate-800">452k</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
            <p className="text-sm font-medium text-slate-500">Delivery Rate</p>
          </div>
          <p className="text-2xl font-bold text-slate-800">98.2%</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
              <BarChart2 size={20} />
            </div>
            <p className="text-sm font-medium text-slate-500">Read Rate</p>
          </div>
          <p className="text-2xl font-bold text-slate-800">64.5%</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col flex-1">
        {/* Header/Toolbar */}
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search campaigns..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
            <button className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 flex items-center gap-2 text-sm font-medium transition-colors">
              <Filter size={16} />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
          <button className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-sm">
            <Plus size={18} />
            Create Campaign
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="p-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Campaign Name</th>
                <th className="p-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="p-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Audience</th>
                <th className="p-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Performance</th>
                <th className="p-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="p-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 px-6">
                    <p className="font-semibold text-slate-800">{camp.name}</p>
                    <p className="text-xs text-slate-500 mt-1 font-mono bg-slate-100 px-1.5 py-0.5 rounded inline-block border border-slate-200">{camp.template}</p>
                  </td>
                  <td className="p-4 px-6">
                    {getStatusBadge(camp.status)}
                  </td>
                  <td className="p-4 px-6">
                    <span className="text-sm text-slate-700 font-medium">{camp.audience > 0 ? camp.audience.toLocaleString() : '-'}</span>
                  </td>
                  <td className="p-4 px-6">
                    {camp.audience > 0 ? (
                      <div className="w-48">
                        <div className="flex justify-between text-[10px] font-medium mb-1.5">
                          <span className="text-blue-600 bg-blue-50 px-1.5 rounded">Delivered {Math.round(camp.delivered/camp.sent*100)}%</span>
                          <span className="text-purple-600 bg-purple-50 px-1.5 rounded">Read {Math.round(camp.read/camp.sent*100)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                          <div className="bg-blue-500 h-full" style={{ width: `${(camp.delivered - camp.read)/camp.audience*100}%` }}></div>
                          <div className="bg-purple-500 h-full" style={{ width: `${camp.read/camp.audience*100}%` }}></div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">N/A</span>
                    )}
                  </td>
                  <td className="p-4 px-6">
                    <span className="text-sm text-slate-600 font-medium">{camp.date}</span>
                  </td>
                  <td className="p-4 px-6 text-right">
                    <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
                      <MoreVertical size={18} />
                    </button>
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
