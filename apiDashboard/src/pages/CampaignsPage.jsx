import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Filter, Calendar, MessageSquare,
  TrendingUp, Clock, CheckCircle2, AlertCircle,
  MoreVertical, Send, Loader2, ArrowRight, ChevronRight,
  Menu, Bell, ChevronDown, Zap, User, Settings,
  BarChart2, Target, Users, LayoutDashboard
} from 'lucide-react';

import * as XLSX from 'xlsx';

const API_BASE_URL = 'http://localhost:5000/api';

export default function CampaignsPage({ onNavigate, toggleSidebar }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleStatusUpdate = async (campaignId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setCampaigns(prev => prev.map(c =>
          c._id === campaignId ? { ...c, status: newStatus } : c
        ));
      } else {
        console.error("Failed to update status");
      }
    } catch (err) {
      console.error("Status Update Error:", err);
    }
  };
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/campaigns`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setCampaigns(data);
      }
    } catch (err) {
      console.error("Failed to fetch campaigns:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });



  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onNavigate) onNavigate('/login');
  };

  const stats = {
    total: campaigns.length,
    pending: campaigns.filter(c => c.status === 'pending').length,
    active: campaigns.filter(c => c.status === 'running').length,
    completed: campaigns.filter(c => c.status === 'completed').length,
    scheduled: campaigns.filter(c => c.status === 'scheduled').length
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar pb-10">

        {/* Local Page Title Row */}
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Campaigns Management</h2>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Create and monitor your message broadcasts</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white text-sm font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/25 active:scale-95 self-start md:self-auto"
          >
            <Plus size={16} />
            New Campaign
          </button>
        </div>

        {/* Campaign Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          <StatCard
            label="Total Campaigns"
            value={stats.total}
            color="indigo"
            icon={Target}
          />
          <StatCard
            label="Active Now"
            value={stats.active}
            color="emerald"
            icon={Clock}
          />
          <StatCard
            label="Completed"
            value={stats.completed}
            color="blue"
            icon={CheckCircle2}
          />
          <StatCard
            label="Scheduled"
            value={stats.scheduled}
            color="purple"
            icon={Calendar}
          />
        </div>

        {/* Filters & Search Row */}
        <div className="bg-white rounded-2xl md:rounded-[1.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all shadow-sm"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar py-2">
              {['All', 'Pending', 'Running', 'Completed', 'Scheduled', 'Failed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap min-w-[100px] text-center ${statusFilter === status
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-[1.05]'
                    : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                    }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* View Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl ml-auto md:ml-0">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                title="Grid View"
              >
                <LayoutDashboard size={18} />
              </button>
              <button 
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                title="Table View"
              >
                <Menu size={18} />
              </button>
            </div>
          </div>

          <div className="h-[1px] bg-slate-100 my-6"></div>

          {/* List Area */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Loading Campaigns...</p>
              </div>
            ) : filteredCampaigns.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 gap-4">
                  {filteredCampaigns.map((camp) => (
                    <CampaignRow key={camp._id} campaign={camp} onStatusUpdate={handleStatusUpdate} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/50">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Campaign Name</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sent/Deliv</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filteredCampaigns.map((camp) => (
                          <tr key={camp._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <p className="text-sm font-bold text-slate-800">{camp.name}</p>
                              <p className="text-[10px] text-slate-400 font-medium">{camp.template_name}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${camp.status === 'running' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                {camp.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-700">{camp.sent_count || 0} / {camp.delivered_count || 0}</span>
                                <div className="w-24 h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                                  <div 
                                    className="h-full bg-indigo-500 rounded-full" 
                                    style={{ width: `${(camp.delivered_count / (camp.sent_count || 1)) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                                <MoreVertical size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            ) : (
              <div className="p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                  <Send size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">No campaigns found</h3>
                  <p className="text-sm text-slate-500 max-w-xs mx-auto">
                    {searchQuery || statusFilter !== 'All'
                      ? "We couldn't find any campaigns matching your filters."
                      : "You haven't created any campaigns yet. Start your first broadcast now!"}
                  </p>
                </div>
                {!(searchQuery || statusFilter !== 'All') && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="text-indigo-600 font-bold text-sm hover:underline flex items-center gap-2 mx-auto"
          >
            Create First Campaign <ArrowRight size={16} />
          </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Tips or Stats Footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <QuickInfoCard
            title="Best Performance"
            desc="Marketing campaigns have 24% higher engagement."
            icon={TrendingUp}
            color="emerald"
          />
          <QuickInfoCard
            title="Next Scheduled"
            desc={stats.scheduled > 0 ? `${stats.scheduled} campaigns ready to launch.` : "No upcoming campaigns."}
            icon={Calendar}
            color="purple"
          />
          <QuickInfoCard
            title="Template Usage"
            desc="Usage-based templates are 15% cheaper."
            icon={BarChart2}
            color="blue"
          />
        </div>
        {/* Create Campaign Modal */}
        {showCreateModal && (
          <CreateCampaignModal 
            onClose={() => setShowCreateModal(false)} 
            onSuccess={() => {
              setShowCreateModal(false);
              fetchCampaigns();
            }}
          />
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, color, icon: Icon }) {
  const colorMap = {
    emerald: 'bg-emerald-50 text-emerald-500',
    blue: 'bg-blue-50 text-blue-500',
    indigo: 'bg-indigo-50 text-indigo-500',
    purple: 'bg-purple-50 text-purple-500',
  };

  return (
    <div className="bg-white p-4 md:p-5 rounded-[1.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden group flex items-center gap-4">
      <div className={`w-12 h-12 ${colorMap[color]} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0`}>
        <Icon size={22} strokeWidth={2.5} />
      </div>
      <div className="space-y-0.5 min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{label}</p>
        <h3 className="text-2xl font-black text-slate-800">{value}</h3>
      </div>
      <div className={`absolute bottom-0 left-0 h-1 w-0 bg-current opacity-20 group-hover:w-full transition-all duration-500 ${colorMap[color].split(' ')[1]}`}></div>
    </div>
  );
}

function CampaignRow({ campaign, onStatusUpdate }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const statusColors = {
    pending: 'bg-slate-100 text-slate-500 border-slate-200',
    running: 'bg-blue-50 text-blue-600 border-blue-100',
    completed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    scheduled: 'bg-purple-50 text-purple-600 border-purple-100',
    failed: 'bg-red-50 text-red-600 border-red-100'
  };

  const statusIcons = {
    pending: <Clock size={12} />,
    running: <Clock size={12} className="animate-pulse" />,
    completed: <CheckCircle2 size={12} />,
    scheduled: <Calendar size={12} />,
    failed: <AlertCircle size={12} />
  };

  const handleAction = async (newStatus) => {
    setIsUpdating(true);
    await onStatusUpdate(campaign._id, newStatus);
    setIsUpdating(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-slate-50/30 transition-all p-5 flex flex-col lg:flex-row lg:items-center gap-6 group relative overflow-hidden">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1.5">
          <h4 className="text-base font-extrabold text-slate-800 truncate tracking-tight">{campaign.name}</h4>
          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border flex items-center gap-1 ${statusColors[campaign.status] || statusColors.pending}`}>
            {statusIcons[campaign.status] || statusIcons.pending}
            {campaign.status}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-1.5 bg-slate-100/50 px-2.5 py-1 rounded-lg">
            <MessageSquare size={13} className="text-slate-400" />
            <span className="font-bold text-slate-600">{campaign.template_name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar size={13} />
            {new Date(campaign.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-10 px-0 md:px-6 border-l-0 md:border-l border-slate-100">
        <StatItem label="Targets" value={campaign.total_contacts} />
        <StatItem label="Sent" value={campaign.sent_count || 0} color="indigo" />
        <StatItem label="Deliv" value={campaign.delivered_count || 0} color="emerald" />
        <StatItem label="Read" value={campaign.read_count || 0} color="blue" />
      </div>

      <div className="flex items-center gap-3 border-l border-slate-100 pl-6">
        {campaign.status === 'pending' || campaign.status === 'scheduled' ? (
          <button
            disabled={isUpdating}
            onClick={() => handleAction('running')}
            className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-sm group/btn"
            title="Start Campaign"
          >
            {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <TrendingUp size={18} className="group-hover/btn:scale-110 transition-transform" />}
          </button>
        ) : campaign.status === 'running' ? (
          <button
            disabled={isUpdating}
            onClick={() => handleAction('scheduled')}
            className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all shadow-sm group/btn"
            title="Pause Campaign"
          >
            {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Clock size={18} className="group-hover/btn:scale-110 transition-transform" />}
          </button>
        ) : campaign.status === 'failed' ? (
          <button
            disabled={isUpdating}
            onClick={() => handleAction('running')}
            className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-all shadow-sm group/btn"
            title="Retry Campaign"
          >
            {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Zap size={18} className="group-hover/btn:scale-110 transition-transform" />}
          </button>
        ) : null}

        <button className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 hover:text-slate-600 transition-all border border-slate-100">
          <MoreVertical size={16} />
        </button>
      </div>
    </div>
  );
}

function StatItem({ label, value, color }) {
  const colorClasses = {
    indigo: 'text-indigo-600',
    emerald: 'text-emerald-600',
    blue: 'text-blue-600',
  };

  return (
    <div className="space-y-0.5">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</p>
      <p className={`text-base font-black ${colorClasses[color] || 'text-slate-800'} leading-none`}>
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function QuickInfoCard({ title, desc, icon: Icon, color }) {
  const colorMap = {
    emerald: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
    blue: 'bg-blue-50 text-blue-600',
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow cursor-default">
      <div className={`w-10 h-10 ${colorMap[color]} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon size={20} />
      </div>
      <div>
        <h5 className="text-[13px] font-black text-slate-800 tracking-tight">{title}</h5>
        <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

function CreateCampaignModal({ onClose, onSuccess }) {
  const [excelData, setExcelData] = useState(null);
  const [excelMapping, setExcelMapping] = useState({ phone: '', vars: [] });
  const [audienceMode, setAudienceMode] = useState('groups'); // 'groups' or 'excel'

  const [formData, setFormData] = useState({
    campaign_name: '',
    template_id: '',
    template_type: '',
    contacts: [],
    group_ids: [],
    variable_values: [],
    scheduled_at: ''
  });
  
  const [templates, setTemplates] = useState([]);
  const [groups, setGroups] = useState([]);
  const [allContacts, setAllContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [contactSearch, setContactSearch] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      
      if (data.length > 0) {
        setExcelData({
          headers: data[0],
          rows: data.slice(1)
        });
        setExcelMapping({
          phone: data[0][0] || '',
          vars: []
        });
        setAudienceMode('excel');
      }
    };
    reader.readAsBinaryString(file);
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [tRes, gRes, cRes] = await Promise.all([
        fetch(`${API_BASE_URL}/templates`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/groups`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/contacts`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      const tData = await tRes.json();
      const gData = await gRes.json();
      const cData = await cRes.json();
      setTemplates(Array.isArray(tData) ? tData : []);
      setGroups(Array.isArray(gData) ? gData : []);
      setAllContacts(Array.isArray(cData) ? cData : []);
    } catch (err) {
      console.error("Failed to load modal data:", err);
    }
  };

  const handleSyncTemplates = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/templates/sync-all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        // Refresh templates list
        const tRes = await fetch(`${API_BASE_URL}/templates`, { 
          headers: { 'Authorization': `Bearer ${token}` } 
        });
        const tData = await tRes.json();
        setTemplates(Array.isArray(tData) ? tData : []);
      } else {
        alert(data.error + ": " + (data.details || "Unknown error"));
      }
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    let finalPayload = { ...formData };
    
    if (audienceMode === 'excel' && excelData) {
      const rich_contacts = excelData.rows.map(row => {
        const rowObj = {};
        excelData.headers.forEach((h, i) => rowObj[h] = row[i]);
        return {
          phone: String(rowObj[excelMapping.phone] || '').replace(/[^0-9]/g, ''),
          variables: excelMapping.vars.map(col => rowObj[col] || '')
        };
      });
      finalPayload.rich_contacts = rich_contacts;
      finalPayload.group_ids = [];
      finalPayload.contacts = [];
    } else if (audienceMode === 'groups') {
        finalPayload.contacts = [];
    } else if (audienceMode === 'contacts') {
        finalPayload.group_ids = [];
    }

    if (!finalPayload.campaign_name || !finalPayload.template_id || (finalPayload.group_ids.length === 0 && finalPayload.contacts.length === 0 && (!finalPayload.rich_contacts || finalPayload.rich_contacts.length === 0))) {
      alert("Please fill in all required fields (Name, Template, and Audience)");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(finalPayload)
      });
      if (response.ok) {
        onSuccess();
      } else {
        const errData = await response.json();
        alert(errData.error || "Failed to create campaign");
      }
    } catch (err) {
      console.error("Creation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white max-h-[90vh] flex flex-col">
        <div className="p-6 md:p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Plus size={24} strokeWidth={3} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Create New Campaign</h2>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Fill in the details to launch your broadcast</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all text-slate-400 hover:text-slate-600">
            <Plus size={24} className="rotate-45" />
          </button>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-black">1</div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Campaign Details</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Campaign Name *</label>
                    <input 
                      type="text"
                      placeholder="E.g. Summer Sale 2024"
                      value={formData.campaign_name}
                      onChange={(e) => setFormData({...formData, campaign_name: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all font-bold placeholder:text-slate-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Schedule (Optional)</label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="datetime-local"
                        value={formData.scheduled_at}
                        onChange={(e) => setFormData({...formData, scheduled_at: e.target.value})}
                        className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all font-bold"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-black">2</div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Target Audience *</h3>
                  </div>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button 
                      onClick={() => setAudienceMode('groups')}
                      className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${audienceMode === 'groups' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
                    >Groups</button>
                    <button 
                      onClick={() => setAudienceMode('contacts')}
                      className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${audienceMode === 'contacts' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
                    >Contacts</button>
                    <button 
                      onClick={() => setAudienceMode('excel')}
                      className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${audienceMode === 'excel' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
                    >Excel Upload</button>
                  </div>
                </div>

                {audienceMode === 'groups' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {groups.map(g => (
                      <button
                        key={g._id}
                        type="button"
                        onClick={() => {
                          const newGroups = formData.group_ids.includes(g._id)
                            ? formData.group_ids.filter(id => id !== g._id)
                            : [...formData.group_ids, g._id];
                          setFormData({...formData, group_ids: newGroups});
                        }}
                        className={`p-3 rounded-xl border flex items-center justify-between transition-all ${formData.group_ids.includes(g._id) ? 'border-emerald-600 bg-emerald-50/50 text-emerald-700 shadow-sm' : 'border-slate-100 hover:bg-slate-50 text-slate-600'}`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Users size={14} className={formData.group_ids.includes(g._id) ? 'text-emerald-600' : 'text-slate-400'} />
                          <span className="text-xs font-bold truncate">{g.name}</span>
                        </div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border ${formData.group_ids.includes(g._id) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                          {g.contacts?.length || 0}
                        </span>
                      </button>
                    ))}
                    {groups.length === 0 && (
                      <div className="col-span-full p-8 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 text-center">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-300 shadow-sm">
                          <Users size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No contact groups found</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-1">Create a group in the Contacts page to select them here.</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : audienceMode === 'contacts' ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text"
                        placeholder="Search contacts by name or phone..."
                        value={contactSearch}
                        onChange={(e) => setContactSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {allContacts
                        .filter(c => 
                          c.name?.toLowerCase().includes(contactSearch.toLowerCase()) || 
                          c.phoneNumber?.includes(contactSearch)
                        )
                        .map(c => (
                          <button
                            key={c._id}
                            type="button"
                            onClick={() => {
                              const isSelected = formData.contacts.includes(c.phoneNumber);
                              const newContacts = isSelected
                                ? formData.contacts.filter(phone => phone !== c.phoneNumber)
                                : [...formData.contacts, c.phoneNumber];
                              setFormData({...formData, contacts: newContacts});
                            }}
                            className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${formData.contacts.includes(c.phoneNumber) ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-sm' : 'border-slate-100 hover:bg-slate-50 text-slate-600'}`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${formData.contacts.includes(c.phoneNumber) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                              {c.name?.[0]?.toUpperCase() || '#'}
                            </div>
                            <div className="min-w-0 text-left">
                              <p className="text-[11px] font-black truncate">{c.name}</p>
                              <p className="text-[9px] font-bold opacity-60 truncate">{c.phoneNumber}</p>
                            </div>
                            {formData.contacts.includes(c.phoneNumber) && (
                              <div className="ml-auto bg-indigo-600 text-white p-1 rounded-full">
                                <CheckCircle2 size={10} strokeWidth={3} />
                              </div>
                            )}
                          </button>
                        ))
                      }
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-indigo-400 transition-colors bg-slate-50/30 group">
                      <input 
                        type="file" 
                        accept=".xlsx, .xls, .csv" 
                        onChange={handleFileUpload}
                        className="hidden" 
                        id="excel-upload" 
                      />
                      <label htmlFor="excel-upload" className="cursor-pointer">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform">
                          <Plus size={20} className="text-emerald-600" />
                        </div>
                        <p className="text-xs font-black text-slate-700">Click to upload Excel</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tight">Support .xlsx, .csv</p>
                      </label>
                    </div>

                    {excelData && (
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 animate-in slide-in-from-top-2">
                        <div className="flex items-center gap-2 mb-4 text-emerald-600">
                          <CheckCircle2 size={16} />
                          <span className="text-xs font-black uppercase tracking-wider">{excelData.rows.length} Rows Imported</span>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Phone Column</label>
                            <select 
                              value={excelMapping.phone}
                              onChange={(e) => setExcelMapping({...excelMapping, phone: e.target.value})}
                              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none"
                            >
                              {excelData.headers.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>
            </div>

            <section className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-black">3</div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Select Template *</h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleSyncTemplates}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50"
                  >
                    <BarChart2 size={12} className={loading ? 'animate-spin' : ''} />
                    Sync Meta
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {templates.map(t => (
                    <button
                      key={t._id}
                      type="button"
                      onClick={() => {
                        const content = t.content?.body || t.content || "";
                        const vars = content.match(/\{\{([^}]+)\}\}/g) || [];
                        const uniqueVars = [...new Set(vars)];
                        setFormData({
                          ...formData, 
                          template_id: t._id, 
                          template_type: t.category,
                          variable_values: uniqueVars.map(() => '')
                        });
                        setExcelMapping(prev => ({...prev, vars: uniqueVars.map(() => '')}));
                      }}
                      className={`p-4 rounded-2xl border-2 text-left transition-all group relative overflow-hidden ${formData.template_id === t._id ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-50 hover:border-slate-100 bg-slate-50/30'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${formData.template_id === t._id ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 group-hover:bg-slate-100 border border-slate-100'}`}>
                            <MessageSquare size={18} />
                          </div>
                          <div>
                            <h3 className="text-[13px] font-black text-slate-800">{t.name}</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">{t.category}</p>
                          </div>
                        </div>
                        {formData.template_id === t._id && (
                          <div className="bg-indigo-600 text-white p-1 rounded-full">
                            <CheckCircle2 size={12} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-3 line-clamp-2 italic font-medium opacity-70">
                        {t.content?.body || t.content || "Template preview not available"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {formData.template_id && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-[10px] font-black">4</div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Personalize Message</h3>
                  </div>
                  
                  {(() => {
                    const selectedTemplate = templates.find(t => t._id === formData.template_id);
                    const content = selectedTemplate?.content?.body || selectedTemplate?.content || "";
                    const vars = content.match(/\{\{([^}]+)\}\}/g) || [];
                    const uniqueVars = [...new Set(vars)];

                    if (uniqueVars.length === 0) {
                      return <p className="text-[11px] text-slate-400 font-bold italic">No variables found in this template.</p>;
                    }

                    return (
                      <div className="space-y-4">
                        {uniqueVars.map((v, idx) => (
                          <div key={idx} className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                              Variable {v}
                            </label>
                            <div className="flex gap-2">
                              {audienceMode === 'excel' ? (
                                <select 
                                  className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none"
                                  value={excelMapping.vars[idx] || ''}
                                  onChange={(e) => {
                                    const newVars = [...excelMapping.vars];
                                    newVars[idx] = e.target.value;
                                    setExcelMapping({...excelMapping, vars: newVars});
                                  }}
                                >
                                  <option value="">-- Select Column --</option>
                                  {excelData?.headers.map(h => <option key={h} value={h}>{h}</option>)}
                                </select>
                              ) : (
                                <>
                                  <select 
                                    className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none"
                                    onChange={(e) => {
                                      const newValues = [...formData.variable_values];
                                      newValues[idx] = e.target.value === 'custom' ? '' : `{{contact.${e.target.value}}}`;
                                      setFormData({...formData, variable_values: newValues});
                                    }}
                                  >
                                    <option value="custom">Static Text</option>
                                    <option value="name">Contact Name</option>
                                    <option value="phone">Contact Phone</option>
                                  </select>
                                  {!formData.variable_values[idx]?.startsWith('{{contact.') && (
                                    <input 
                                      type="text"
                                      placeholder="Enter value..."
                                      value={formData.variable_values[idx] || ''}
                                      onChange={(e) => {
                                        const newValues = [...formData.variable_values];
                                        newValues[idx] = e.target.value;
                                        setFormData({...formData, variable_values: newValues});
                                      }}
                                      className="flex-1 px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all font-bold placeholder:text-slate-300"
                                    />
                                  )}
                                  {formData.variable_values[idx]?.startsWith('{{contact.') && (
                                    <div className="flex-1 px-5 py-3 bg-indigo-50 border border-indigo-100 rounded-xl text-sm font-black text-indigo-600 flex items-center gap-2">
                                      <User size={14} />
                                      Dynamic: {formData.variable_values[idx].replace('{{contact.', '').replace('}}', '').toUpperCase()}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </section>
          </div>
        </div>

        <div className="p-6 md:p-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <div className="hidden md:flex flex-col">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Recipients</p>
            <p className="text-xs font-bold text-slate-600">
              {audienceMode === 'excel' ? (excelData?.rows.length || 0) : groups.filter(g => formData.group_ids.includes(g._id)).reduce((acc, curr) => acc + (curr.contacts?.length || 0), 0)} Total
            </p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 md:flex-none px-8 py-3.5 text-sm font-black text-slate-400 hover:text-slate-600 transition-all uppercase tracking-widest"
            >
              Cancel
            </button>
            <button 
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="flex-1 md:flex-none px-12 py-3.5 bg-indigo-600 text-white text-sm font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/25 active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Send size={18} fill="currentColor" />
                  <span>Launch Campaign</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
