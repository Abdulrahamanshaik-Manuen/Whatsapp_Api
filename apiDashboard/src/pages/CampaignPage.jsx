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
  Users,
  ChevronRight,
  Calendar,
  Globe,
  Image as ImageIcon,
  Video,
  FileText,
  Check,
  MousePointer2,
  Activity,
  Phone,
  Save,
  CalendarClock,
  Info,
  X,
  ChevronDown,
  AlertCircle
} from 'lucide-react';

export default function CampaignPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sendOption, setSendOption] = useState('schedule');
  const [scheduleDate, setScheduleDate] = useState('2025-05-25');
  const [scheduleTime, setScheduleTime] = useState('10:30');

  const campaigns = [
    {
      id: 1,
      name: 'Diwali Special Offer',
      template: 'festival_promo_v2',
      status: 'active',
      audience: 1,
      sent: 1,
      delivered: 1,
      read: 1,
      date: '20 May 2025',
    },
    {
      id: 2,
      name: 'Summer Sale Announcement',
      template: 'summer_sale_alert',
      status: 'completed',
      audience: 1,
      sent: 1,
      delivered: 1,
      read: 1,
      date: '15 May 2025',
    },
    {
      id: 3,
      name: 'Welcome Series - New Users',
      template: 'welcome_onboarding',
      status: 'active',
      audience: 1,
      sent: 1,
      delivered: 1,
      read: 1,
      date: 'Ongoing',
    },
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

  if (showCreateForm) {
    return (
      <div className="flex flex-col space-y-6 pb-20">




        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. Basic Details */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                1. Basic Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Campaign Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    placeholder="May Offer Campaign"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Campaign Description</label>
                  <input 
                    type="text" 
                    placeholder="Send exclusive offer to our VIP customers"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">Campaign Type <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none appearance-none transition-all">
                      <option>Broadcast</option>
                      <option>Sequence</option>
                    </select>
                    <Activity className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Audience Selection */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-base font-bold text-slate-800">2. Audience Selection</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Select Audience Type <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none appearance-none">
                      <option>Contact Groups</option>
                    </select>
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Select Groups <span className="text-red-500">*</span></label>
                  <div className="flex flex-wrap gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-xl min-h-[42px]">
                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium text-slate-700">
                      VIP Customers <X size={12} className="cursor-pointer text-slate-400 hover:text-red-500" />
                    </div>
                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium text-slate-700">
                      Repeat Buyers <X size={12} className="cursor-pointer text-slate-400 hover:text-red-500" />
                    </div>
                    <ChevronDown className="ml-auto mt-2 text-slate-400" size={16} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 text-slate-400">Exclude Groups (Optional)</label>
                  <div className="relative">
                    <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none appearance-none text-slate-400" disabled>
                      <option>Select groups to exclude</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Tag Filter (Optional)</label>
                  <div className="flex flex-wrap gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-xl min-h-[42px]">
                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium text-slate-700">
                      VIP <X size={12} />
                    </div>
                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium text-slate-700">
                      Active Customer <X size={12} />
                    </div>
                    <ChevronDown className="ml-auto mt-2 text-slate-400" size={16} />
                  </div>
                </div>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Total Audience</p>
                    <p className="text-xl font-bold text-emerald-900">1</p>
                  </div>
                </div>
                <p className="text-xs text-emerald-600 font-medium italic">Estimated recipients</p>
              </div>
            </div>

            {/* 3. Template Selection */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-base font-bold text-slate-800">3. Template Selection</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Select Template <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none appearance-none">
                      <option>Offer_20Percent_Off</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Language</label>
                  <div className="relative">
                    <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none appearance-none">
                      <option>English</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Template Preview</label>
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl relative">
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-md border border-green-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      APPROVED
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-800 font-medium">Hello {"{{name}}"}</p>
                      <p className="text-sm text-slate-600">Enjoy {"{{discount}}"}% OFF on your next purchase.</p>
                      <p className="text-sm text-slate-600">Use code {"{{couponCode}}"}. Valid till {"{{expiryDate}}"}.</p>
                    </div>
                    <button className="mt-4 text-emerald-600 text-xs font-bold hover:underline flex items-center gap-1">
                      View Full Template <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>


          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-6">


            {/* 4. Scheduling */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-base font-bold text-slate-800">4. Scheduling</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Send Option <span className="text-red-500">*</span></label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="sendOption" 
                        checked={sendOption === 'now'}
                        onChange={() => setSendOption('now')}
                        className="w-4 h-4 accent-emerald-600" 
                      />
                      <span className="text-sm text-slate-600">Send Now</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="sendOption" 
                        checked={sendOption === 'schedule'}
                        onChange={() => setSendOption('schedule')}
                        className="w-4 h-4 accent-emerald-600" 
                      />
                      <span className="text-sm text-slate-600">Schedule Later</span>
                    </label>
                  </div>
                </div>
                <div className={`grid grid-cols-2 gap-4 transition-all duration-300 ${sendOption === 'now' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Schedule Date *</label>
                    <div className="relative">
                      <input 
                        type="date" 
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-emerald-500 transition-all cursor-pointer" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Schedule Time *</label>
                    <div className="relative">
                      <input 
                        type="time" 
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-emerald-500 transition-all cursor-pointer" 
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Timezone</label>
                  <div className="relative">
                    <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold outline-none appearance-none">
                      <option>(GMT+05:30) Asia/Kolkata</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Recurring (Optional)</label>
                  <div className="relative">
                    <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none appearance-none">
                      <option>Does not repeat</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Advanced Settings */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-base font-bold text-slate-800">5. Advanced Settings</h3>
              <div className="space-y-4 text-xs">
                <div className="space-y-2">
                  <label className="font-bold text-slate-500 uppercase">Sender Number</label>
                  <div className="relative">
                    <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none appearance-none">
                      <option>+91 98765 43210</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="font-bold text-slate-500 uppercase">Message Speed</label>
                  <div className="relative">
                    <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none appearance-none">
                      <option>Normal (Recommended)</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="font-bold text-slate-500 uppercase">Retry Failed Messages</label>
                    <div className="relative">
                      <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none appearance-none">
                        <option>Yes</option>
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="font-bold text-slate-500 uppercase">Campaign Priority</label>
                    <div className="relative">
                      <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none appearance-none">
                        <option>Normal</option>
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. Tracking Options */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-base font-bold text-slate-800">6. Tracking Options</h3>
              <div className="space-y-3">
                {[
                  { label: 'Track Delivery (Sent / Delivered)', checked: true },
                  { label: 'Track Read', checked: true },
                  { label: 'Track Clicks (if link present)', checked: true }
                ].map((opt, i) => (
                  <label key={i} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${opt.checked ? 'bg-emerald-500 text-white' : 'bg-slate-100 border border-slate-200'}`}>
                      {opt.checked && <Check size={14} />}
                    </div>
                    <span className="text-sm font-medium text-slate-700 group-hover:text-emerald-600">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>


        </div>

        {/* Sticky Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 px-8 flex items-center justify-between z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <button 
            onClick={() => setShowCreateForm(false)}
            className="px-6 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            ← Back
          </button>
          <div className="flex gap-4">
            <button className="px-6 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-bold border border-emerald-100 hover:bg-emerald-100 transition-all flex items-center gap-2">
              <Save size={18} /> Save as Draft
            </button>
            <button className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all">
              <CalendarClock size={18} /> Schedule Campaign
            </button>
            <button className="px-6 py-2.5 bg-emerald-900 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/20 hover:bg-black transition-all">
              <Send size={18} /> Send Campaign Now
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <p className="text-2xl font-bold text-slate-800">1</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <Users size={20} />
            </div>
            <p className="text-sm font-medium text-slate-500">Messages Sent</p>
          </div>
          <p className="text-2xl font-bold text-slate-800">1</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
            <p className="text-sm font-medium text-slate-500">Delivery Rate</p>
          </div>
          <p className="text-2xl font-bold text-slate-800">1%</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
              <BarChart2 size={20} />
            </div>
            <p className="text-sm font-medium text-slate-500">Read Rate</p>
          </div>
          <p className="text-2xl font-bold text-slate-800">1%</p>
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
          <button 
            onClick={() => setShowCreateForm(true)}
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
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
              {campaigns.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map((camp) => (
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
