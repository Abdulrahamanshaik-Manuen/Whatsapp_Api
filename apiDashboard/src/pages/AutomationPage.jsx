import React, { useState, useEffect } from 'react';
import {
  Zap, Plus, Search, Filter, Bot, MessageSquare,
  Clock, CheckCircle2, AlertCircle, Play, Pause,
  Trash2, ChevronRight, LayoutGrid, List,
  Smartphone, BarChart2, MousePointer2, Settings,
  Workflow, Sparkles, Wand2, ShieldCheck, Info,
  Loader2, MoreVertical, X
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

// Reusable StatCard following MessagesPage style
const StatCard = ({ label, value, color, icon: Icon }) => {
  const colors = {
    primary: 'from-primary/10 to-primary-light/10 text-primary-light border-primary/10',
    secondary: 'from-blue-500/10 to-blue-600/10 text-blue-600 border-blue-100',
    amber: 'from-amber-500/10 to-amber-600/10 text-amber-600 border-amber-100',
    blue: 'from-cyan-500/10 to-blue-500/10 text-blue-600 border-blue-100'
  };

  return (
    <div className={`bg-white p-5 rounded-2xl md:rounded-[1.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300`}>
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br ${colors[color]} opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`}></div>
      <div className="flex items-center gap-4 relative z-10">
        <div className={`w-12 h-12 bg-gradient-to-br ${colors[color]} rounded-xl flex items-center justify-center`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
          <p className="text-2xl font-black text-slate-900 tracking-tight leading-none">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default function AutomationPage() {
  const [automations, setAutomations] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    type: 'auto-reply',
    trigger: {
      event: 'incoming_message',
      keywords: [],
      matchType: 'contains'
    },
    action: {
      messageType: 'text',
      content: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [globalTemplates, setGlobalTemplates] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestContent, setRequestContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [activeCategory, setActiveCategory] = useState('All');
  const [builderStep, setBuilderStep] = useState('gallery'); // 'gallery' or 'config'
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateSearch, setTemplateSearch] = useState('');

  useEffect(() => {
    fetchAutomations();
    fetchGlobalTemplates();
  }, []);

  const fetchGlobalTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/automations/templates`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (Array.isArray(data)) setGlobalTemplates(data);
    } catch (err) {
      console.error("Fetch Templates Error:", err);
    }
  };

  const fetchAutomations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/automations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (Array.isArray(data)) setAutomations(data);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      const res = await fetch(`${API_BASE_URL}/automations/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchAutomations();
      }
    } catch (err) {
      console.error("Toggle Error:", err);
    }
  };

  const handleLaunch = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        type: selectedTemplate?.title === 'Smart AI Responder' ? 'ai-responder' : formData.type,
        status: 'active'
      };

      const response = await fetch(`${API_BASE_URL}/automations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setShowCreateModal(false);
        setBuilderStep('gallery');
        fetchAutomations();
      }
    } catch (err) {
      console.error("Save Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', 'Auto-Reply', 'Keyword', 'Flow', 'Drip'];

  const stats = [
    { label: 'Active Workflows', value: automations.filter(a => a.status === 'active').length.toString(), icon: Workflow, color: 'primary' },
    { label: 'Automated Replies', value: automations.reduce((acc, curr) => acc + (curr.messagesSent || 0), 0).toLocaleString(), icon: MessageSquare, color: 'secondary' },
    { label: 'Time Saved', value: '0h', icon: Clock, color: 'amber' },
    { label: 'Success Rate', value: automations.length > 0 ? (automations.reduce((acc, curr) => acc + (curr.successRate || 0), 0) / automations.length).toFixed(1) + '%' : '0%', icon: ShieldCheck, color: 'blue' },
  ];

  const automationTypes = [
    {
      title: 'Keyword Responder',
      desc: 'Auto-reply when customers use specific words',
      icon: Wand2,
      color: 'bg-indigo-600'
    },
    {
      title: 'Welcome Message',
      desc: 'Greet new contacts automatically on first message',
      icon: Sparkles,
      color: 'bg-primary-light'
    },
    {
      title: 'Support Flow',
      desc: 'Interactive menu for customer self-service',
      icon: Bot,
      color: 'bg-amber-600'
    },
    {
      title: 'Drip Sequence',
      desc: 'Schedule a series of follow-up messages',
      icon: Clock,
      color: 'bg-blue-600'
    }
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
      {/* Top Header Section */}
      <div className="px-8 pt-8 pb-4 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              Automation Hub
            </h1>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider leading-relaxed">
              Build, scale, and automate your customer experience
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-primary to-primary-light text-white text-sm font-bold rounded-xl hover:from-primary-light hover:to-primary-dark transition-all shadow-lg shadow-primary/30 active:scale-95 group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" />
            New Workflow
          </button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar pb-20">

        {/* Smart Automations Card */}
        <div className="p-8 bg-gradient-to-br from-primary to-primary-light rounded-3xl shadow-2xl text-white relative overflow-hidden group border border-primary-light/30 mb-8">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-black leading-tight">Smart Automations</h3>
              <p className="text-primary-50 text-sm font-medium opacity-90 leading-relaxed max-w-md">No coding required. Choose a template and launch your automated customer experience in seconds.</p>
            </div>
            <button
              onClick={() => { setBuilderStep('gallery'); setShowCreateModal(true); }}
              className="px-10 py-4 bg-white text-primary-light text-sm font-bold rounded-xl hover:bg-primary-50 transition-all shadow-xl active:scale-95 whitespace-nowrap"
            >
              View Library
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>

        {/* Content Section with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
            {/* Categories & Search */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/80 backdrop-blur-sm p-4 rounded-2xl border-2 border-slate-200 shadow-lg">
              <div className="flex bg-white p-1 rounded-xl border-2 border-slate-200 overflow-x-auto custom-scrollbar no-scrollbar w-full md:w-auto">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeCategory === cat
                      ? 'bg-primary text-primary-light shadow-md border border-primary/20'
                      : 'text-slate-500 hover:text-slate-700'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-80 group">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary" />
                  <input
                    type="text"
                    placeholder="Search workflows..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-0 focus:border-primary transition-all hover:border-slate-300 placeholder:text-slate-400"
                  />
                </div>
                <div className="flex bg-white p-1 rounded-lg border-2 border-slate-200">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary text-primary-light shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <LayoutGrid size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-2.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-primary text-primary-light shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Automations Content */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {automations.map((auto) => (
                  <div key={auto._id} className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden group hover:shadow-2xl hover:border-primary/30 transition-all duration-300 relative">
                    <div className="p-6 pb-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white shadow-md ${auto.type === 'flow' ? 'bg-amber-500' :
                          auto.type === 'keyword' ? 'bg-primary' :
                            'bg-blue-500'
                          }`}>
                          {auto.type === 'flow' ? <Bot size={24} /> :
                            auto.type === 'keyword' ? <Wand2 size={24} /> :
                              <MessageSquare size={24} />}
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            onClick={() => handleToggleStatus(auto._id, auto.status)}
                            className={`w-10 h-6 rounded-full relative cursor-pointer transition-all ${auto.status === 'active' ? 'bg-primary' : 'bg-slate-300'}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${auto.status === 'active' ? 'left-5' : 'left-1'}`}></div>
                          </div>
                          <button className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-primary-light transition-colors">{auto.name}</h3>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-light"></div>
                        Trigger: {auto.trigger?.event === 'keyword_match' ? `Keyword` : 'Incoming'}
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                        <div>
                          <p className="text-xs font-semibold text-slate-500 mb-1">Messages</p>
                          <p className="text-lg font-black text-slate-900">{(auto.messagesSent || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-500 mb-1">Success</p>
                          <p className="text-lg font-black text-primary-light">{auto.successRate || 0}%</p>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-4 bg-slate-50/50 flex items-center justify-between border-t border-slate-100">
                      <span className="text-xs font-semibold text-slate-400">Last: {auto.lastActive || 'Never'}</span>
                      <button className="flex items-center gap-1.5 text-primary-light text-xs font-bold hover:gap-2.5 transition-all">
                        View
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}

                <div
                  onClick={() => setShowCreateModal(true)}
                  className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center p-8 hover:bg-primary/30 transition-all cursor-pointer group"
                >
                  <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center text-slate-400 group-hover:text-primary-light group-hover:scale-110 shadow-sm transition-all mb-3">
                    <Plus size={28} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-600 group-hover:text-primary-light transition-colors">New Workflow</h3>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b-2 border-slate-200">
                      <th className="px-6 py-5 text-xs font-bold text-slate-600 uppercase tracking-wider">Workflow</th>
                      <th className="px-6 py-5 text-xs font-bold text-slate-600 uppercase tracking-wider">Type & Trigger</th>
                      <th className="px-6 py-5 text-xs font-bold text-slate-600 uppercase tracking-wider text-center">Volume</th>
                      <th className="px-6 py-5 text-xs font-bold text-slate-600 uppercase tracking-wider text-center">Performance</th>
                      <th className="px-6 py-5 text-xs font-bold text-slate-600 uppercase tracking-wider text-center">Status</th>
                      <th className="px-6 py-5 text-xs font-bold text-slate-600 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {automations.map((auto) => (
                      <tr key={auto._id} className="group hover:bg-primary-50/30 transition-all">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold ${auto.type === 'flow' ? 'bg-amber-500' :
                              auto.type === 'keyword' ? 'bg-primary' :
                                'bg-blue-500'
                              }`}>
                              {auto.type === 'flow' ? <Bot size={18} /> :
                                auto.type === 'keyword' ? <Wand2 size={18} /> :
                                  <MessageSquare size={18} />}
                            </div>
                            <span className="text-sm font-bold text-slate-900">{auto.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">{auto.type}</p>
                            <p className="text-xs text-slate-500 font-semibold">{auto.trigger?.event === 'keyword_match' ? `Keyword` : 'Incoming'}</p>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-sm font-bold text-slate-900">{(auto.messagesSent || 0).toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${auto.successRate || 0}%` }}></div>
                            </div>
                            <span className="text-xs font-bold text-primary-light">{auto.successRate || 0}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-center">
                            <div className={`w-10 h-6 rounded-full relative cursor-pointer transition-all ${auto.status === 'active' ? 'bg-primary' : 'bg-slate-300'}`}>
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${auto.status === 'active' ? 'left-5' : 'left-1'}`}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-primary hover:text-primary-light transition-all">
                              <BarChart2 size={16} />
                            </button>
                            <button className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-blue-100 hover:text-blue-600 transition-all">
                              <MousePointer2 size={16} />
                            </button>
                            <button className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-all">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            <div className="p-8 bg-gradient-to-br from-primary to-primary-light rounded-3xl shadow-2xl text-white relative overflow-hidden group border border-primary-light/30">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all duration-700"></div>
              <div className="relative z-10 space-y-5">
                <div className="space-y-1">
                  <h4 className="text-xl font-black leading-tight">Expert Support</h4>
                  <p className="text-primary-50 text-xs font-semibold uppercase tracking-wider opacity-90">Let us build it for you</p>
                </div>
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="w-full py-4 bg-white text-primary-light text-xs font-bold rounded-xl hover:bg-primary-50 transition-all shadow-lg active:scale-95"
                >
                  Request Custom Build
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Workflow Builder Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[800px] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b-2 border-slate-200 flex items-center justify-between bg-gradient-to-r from-white to-primary-50/30 shrink-0">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => builderStep === 'config' ? setBuilderStep('gallery') : setShowCreateModal(false)}
                  className="w-10 h-10 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-all"
                >
                  {builderStep === 'config' ? <ChevronRight size={20} className="rotate-180" /> : <Bot size={20} />}
                </button>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 leading-tight">
                    {builderStep === 'gallery' ? 'Choose Template' : 'Configure Workflow'}
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold mt-1 flex items-center gap-2">
                    <Sparkles size={12} className="text-amber-500" />
                    {builderStep === 'gallery' ? 'Choose Template' : 'Configure Workflow'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setShowCreateModal(false); setBuilderStep('gallery'); }}
                className="w-10 h-10 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
              {builderStep === 'gallery' ? (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Search and Categories Header */}
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="relative w-full md:w-80 group">
                      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <input
                        type="text"
                        placeholder="Search templates..."
                        value={templateSearch}
                        onChange={(e) => setTemplateSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-primary focus:bg-white transition-all placeholder:text-slate-400"
                      />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 w-full md:w-auto">
                      {['All', 'Essentials', 'Marketing', 'Support'].map((cat) => (
                        <button
                          key={cat}
                          className="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 hover:bg-primary-50 hover:text-primary-light transition-all border border-transparent hover:border-primary/10 whitespace-nowrap"
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Scratch Card */}
                    <div
                      onClick={() => setBuilderStep('config')}
                      className="group relative bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[2rem] hover:border-primary/30 hover:bg-white hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 cursor-pointer flex flex-col h-full overflow-hidden"
                    >
                      <div className="h-24 bg-slate-100/50"></div>
                      <div className="px-8 pb-8 -mt-10 flex flex-col flex-1 relative z-10">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:scale-110 transition-all duration-500 mb-6">
                          <Plus size={32} />
                        </div>
                        <div className="space-y-3 flex-1">
                          <h3 className="text-base font-black text-slate-900 uppercase tracking-wider group-hover:text-primary-light transition-colors">Start From Scratch</h3>
                          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-2 leading-relaxed">Build a completely custom automation tailored to your unique requirements.</p>
                        </div>
                        <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-primary-light transition-colors">Create Manual</span>
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                            <Plus size={16} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Template Cards */}
                    {(globalTemplates.length > 0 ? globalTemplates : automationTypes)
                      .filter(t => (t.name || t.title).toLowerCase().includes(templateSearch.toLowerCase()))
                      .map((template, idx) => {
                        const title = template.name || template.title;
                        const desc = template.action?.content || template.desc;
                        const Icon = template.icon || Zap;
                        const colorClass = template.color || 'bg-primary';

                        const isInstalled = template._id && automations.some(a => a.originalTemplateId === template._id);

                        return (
                          <div
                            key={idx}
                            onClick={async () => {
                              if (isInstalled) return;
                              if (template._id) {
                                setLoading(true);
                                try {
                                  const token = localStorage.getItem('token');
                                  const res = await fetch(`${API_BASE_URL}/automations/clone/${template._id}`, {
                                    method: 'POST',
                                    headers: { 'Authorization': `Bearer ${token}` }
                                  });
                                  if (res.ok) {
                                    fetchAutomations();
                                    setShowCreateModal(false);
                                  } else {
                                    const data = await res.json();
                                    alert(data.message || "Failed to install template");
                                  }
                                } catch (e) { console.error(e); }
                                finally { setLoading(false); }
                              } else {
                                setSelectedTemplate(template);
                                setBuilderStep('config');
                              }
                            }}
                            className={`group relative bg-white border border-slate-100 rounded-[2rem] transition-all duration-500 cursor-pointer overflow-hidden flex flex-col h-full ${isInstalled ? 'opacity-60 grayscale-[0.5] cursor-default' : 'hover:shadow-2xl hover:shadow-primary/10'}`}
                          >
                            {/* Card Header with Theme Background */}
                            <div className={`h-24 ${colorClass} opacity-[0.03] transition-opacity group-hover:opacity-[0.08]`}></div>
                            
                            <div className="px-8 pb-8 -mt-10 flex flex-col flex-1 relative z-10">
                              {/* Floating Icon */}
                              <div className={`w-16 h-16 ${colorClass} rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center text-white mb-6 transition-all duration-500 ${!isInstalled && 'group-hover:-translate-y-1 group-hover:scale-110'}`}>
                                {isInstalled ? <CheckCircle2 size={28} /> : <Icon size={28} />}
                              </div>
                              
                              <div className="space-y-3 flex-1">
                                <div className="flex items-center justify-between">
                                  <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">
                                    {title}
                                  </h3>
                                  {isInstalled && (
                                    <span className="px-2 py-0.5 bg-primary/10 text-primary-light text-[8px] font-black uppercase tracking-widest rounded-md">
                                      Installed
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed line-clamp-3">
                                  {desc}
                                </p>
                              </div>

                              {/* Footer Action */}
                              <div className="pt-6 mt-6 border-t border-slate-50 flex items-center justify-between">
                                <span className={`text-[9px] font-black uppercase tracking-widest transition-transform ${isInstalled ? 'text-slate-400' : 'text-primary-light group-hover:translate-x-1'}`}>
                                  {isInstalled ? 'Already in Library' : (template._id ? 'Fast Install' : 'Use This Template')}
                                </span>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${isInstalled ? 'bg-slate-100 text-slate-400' : 'bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-white'}`}>
                                  {isInstalled ? <CheckCircle2 size={16} /> : <ChevronRight size={16} />}
                                </div>
                              </div>
                            </div>

                            {/* Corner Accent */}
                            <div className={`absolute top-0 right-0 w-2 h-2 ${colorClass} opacity-20`}></div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Compact Request Custom Workflow Banner */}
                  <div className="mt-8 p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2rem] shadow-xl relative overflow-hidden group border border-slate-700">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/20 transition-colors duration-1000"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-slate-900 shadow-lg shadow-primary/20 shrink-0">
                          <Sparkles size={18} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-lg font-black text-white uppercase tracking-wider">Custom Workflow?</h4>
                          <p className="text-slate-300 text-[10px] font-medium leading-relaxed max-w-sm">Our experts can build a custom automation tailored specifically to your business needs.</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowRequestModal(true)}
                        className="px-8 py-3 bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all shadow-xl active:scale-95 shrink-0"
                      >
                        Request Build
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Workflow Name</label>
                      <input
                        type="text"
                        placeholder="e.g., Summer Promo Responder"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Trigger Event</label>
                      <select
                        value={formData.trigger.event}
                        onChange={(e) => setFormData({ ...formData, trigger: { ...formData.trigger, event: e.target.value } })}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 cursor-pointer"
                      >
                        <option value="incoming_message">Incoming Message (Any)</option>
                        <option value="keyword_match">Incoming Keyword</option>
                        <option value="first_interaction">First Time Interaction</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-8 bg-slate-900 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4">
                      <div className="px-3 py-1 bg-white/10 text-white/40 text-[9px] font-black uppercase tracking-widest rounded-lg border border-white/5">Auto-Reply Preview</div>
                    </div>
                    <div className="space-y-6 relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white">
                          <Zap size={16} />
                        </div>
                        <p className="text-xs font-bold text-white/70 uppercase tracking-widest">Automation Action</p>
                      </div>
                      <textarea
                        rows="4"
                        placeholder="Type your automated response here..."
                        value={formData.action.content}
                        onChange={(e) => setFormData({ ...formData, action: { ...formData.action, content: e.target.value, messageType: 'text' } })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-white/20 font-medium"
                      ></textarea>
                      <div className="flex items-center gap-4">
                        <button className="px-4 py-2 bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-white/20 transition-all">Add Media</button>
                        <button className="px-4 py-2 bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-white/20 transition-all">Add Variable</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 border-t-2 border-slate-200 flex items-center justify-between bg-slate-50/50 shrink-0">
              <p className="text-xs text-slate-500 font-semibold">
                {builderStep === 'gallery' ? 'Explore our workflow library' : 'Configure your automation'}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setShowCreateModal(false); setBuilderStep('gallery'); }}
                  className="px-6 py-3 bg-white text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-100 transition-all border-2 border-slate-200"
                >
                  {builderStep === 'gallery' ? 'Cancel' : 'Back'}
                </button>
                {builderStep === 'config' && (
                  <button
                    onClick={handleLaunch}
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-primary to-primary-light text-white text-xs font-bold rounded-lg hover:from-primary-light hover:to-primary-dark transition-all shadow-lg shadow-primary/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading && <Loader2 size={14} className="animate-spin" />}
                    Launch
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[500px] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-primary-light shadow-md border-2 border-primary/20">
                  <Wand2 size={22} />
                </div>
                <button onClick={() => setShowRequestModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={22} />
                </button>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900">Custom Workflow</h3>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Tell us what you need</p>
              </div>
              <textarea
                rows="5"
                placeholder="Example: I want a workflow that automatically asks for a Google Review 2 days after a customer makes a purchase..."
                value={requestContent}
                onChange={(e) => setRequestContent(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-0 focus:border-primary transition-all placeholder:text-slate-400 hover:border-slate-300"
              ></textarea>
              <button
                onClick={() => {
                  alert("Request sent! We'll get back to you soon.");
                  setShowRequestModal(false);
                  setRequestContent('');
                }}
                className="w-full py-4 bg-gradient-to-r from-primary to-primary-light text-white text-xs font-bold rounded-xl hover:from-primary-light hover:to-primary-dark transition-all shadow-lg shadow-primary/30 active:scale-95"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
