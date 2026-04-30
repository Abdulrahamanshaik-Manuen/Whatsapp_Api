import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

const API_BASE = 'http://localhost:5000/api';

export default function CampaignPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sendOption, setSendOption] = useState('now');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [campaignName, setCampaignName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedGroups, setSelectedGroups] = useState([]);

  useEffect(() => {
    fetchCampaigns();
    fetchTemplates();
    fetchGroups();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await axios.get(`${API_BASE}/campaigns`);
      setCampaigns(res.data);
    } catch (err) {
      console.error("Failed to fetch campaigns", err);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await axios.get(`${API_BASE}/templates`);
      setTemplates(res.data);
      if (res.data.length > 0) setSelectedTemplate(res.data[0].name);
    } catch (err) {
      console.error("Failed to fetch templates", err);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await axios.get(`${API_BASE}/contacts/groups`);
      setGroups(res.data);
      if (res.data.length > 0) setSelectedGroups([res.data[0]]);
    } catch (err) {
      console.error("Failed to fetch groups", err);
    }
  };

  const handleSendCampaign = async () => {
    if (!campaignName || !selectedTemplate) {
      alert("Please fill in required fields");
      return;
    }

    setLoading(true);
    try {
      // 1. Create Campaign
      const campRes = await axios.post(`${API_BASE}/campaigns`, {
        name: campaignName,
        description,
        templateName: selectedTemplate,
        groups: selectedGroups,
        sendOption: 'now',
        status: 'draft'
      });

      const campaignId = campRes.data._id;

      // 2. Execute Campaign
      const execRes = await axios.post(`${API_BASE}/campaigns/${campaignId}/execute`);
      
      let message = `Campaign processed! Successfully sent to ${execRes.data.sentCount} contacts.`;
      if (execRes.data.errors) {
        message += `\n\nErrors encountered:\n${execRes.data.errors.map(e => `${e.phone}: ${e.error}`).join('\n')}`;
      }
      
      alert(message);
      setShowCreateForm(false);
      fetchCampaigns();
    } catch (err) {
      console.error("Campaign execution failed", err);
      alert("Failed to execute campaign: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

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
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="May Offer Campaign"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Campaign Description</label>
                  <input 
                    type="text" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Send exclusive offer to our VIP customers"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* 2. Audience Selection */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-base font-bold text-slate-800">2. Audience Selection</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Select Group <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select 
                      value={selectedGroups[0] || ''}
                      onChange={(e) => setSelectedGroups([e.target.value])}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none appearance-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <option value="">Select a group</option>
                      {groups.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Template Selection */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-base font-bold text-slate-800">3. Template Selection</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Select Template <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select 
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none appearance-none"
                    >
                      <option value="">Select a template</option>
                      {templates.map(t => (
                        <option key={t._id} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
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
                    <label className="flex items-center gap-2 cursor-pointer opacity-50">
                      <input 
                        type="radio" 
                        name="sendOption" 
                        disabled
                        className="w-4 h-4 accent-emerald-600" 
                      />
                      <span className="text-sm text-slate-600">Schedule Later (Pro)</span>
                    </label>
                  </div>
                </div>
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
            <button 
              onClick={handleSendCampaign}
              disabled={loading}
              className="px-6 py-2.5 bg-emerald-900 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/20 hover:bg-black transition-all disabled:opacity-50"
            >
              <Send size={18} /> {loading ? 'Sending...' : 'Send Campaign Now'}
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
          <p className="text-2xl font-bold text-slate-800">{campaigns.length}</p>
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
                <th className="p-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campaigns.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map((camp) => (
                <tr key={camp._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 px-6">
                    <p className="font-semibold text-slate-800">{camp.name}</p>
                    <p className="text-xs text-slate-500 mt-1 font-mono bg-slate-100 px-1.5 py-0.5 rounded inline-block border border-slate-200">{camp.templateName}</p>
                  </td>
                  <td className="p-4 px-6">
                    {getStatusBadge(camp.status)}
                  </td>
                  <td className="p-4 px-6">
                    <span className="text-sm text-slate-700 font-medium">{camp.metrics?.sent || 0} / {camp.metrics?.audience || 0}</span>
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
