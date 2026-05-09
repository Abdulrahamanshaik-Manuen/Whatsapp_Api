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

export default function AutomationPage() {
  const [automations, setAutomations] = useState([
    {
      _id: '1',
      name: 'Welcome Greeting',
      type: 'auto-reply',
      trigger: 'First Message',
      status: 'active',
      messagesSent: 1245,
      successRate: 98,
      lastActive: '2 mins ago'
    },
    {
      _id: '2',
      name: 'Keyword: PRICING',
      type: 'keyword',
      trigger: '"Price", "Cost"',
      status: 'active',
      messagesSent: 856,
      successRate: 94,
      lastActive: '15 mins ago'
    },
    {
      _id: '3',
      name: 'Support Bot V1',
      type: 'flow',
      trigger: 'Customer Support',
      status: 'paused',
      messagesSent: 3420,
      successRate: 89,
      lastActive: '1 day ago'
    }
  ]);

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
    { label: 'Active Workflows', value: '12', icon: Workflow, color: 'indigo' },
    { label: 'Automated Replies', value: '5.8k', icon: MessageSquare, color: 'emerald' },
    { label: 'Time Saved', value: '142h', icon: Clock, color: 'amber' },
    { label: 'Success Rate', value: '96%', icon: ShieldCheck, color: 'blue' },
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
      color: 'bg-emerald-600'
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

  const colorMap = {
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600' }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar pb-20">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              Automation <span className="text-indigo-600">Hub</span>
              <div className="px-2.5 py-1 bg-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-lg">Pro</div>
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
              <Zap size={14} className="text-amber-500 fill-amber-500" />
              Build, Scale, and Automate your Customer Experience
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 px-10 py-5 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest rounded-[2rem] hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-600/30 active:scale-95 group"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" />
            Launch New Workflow
          </button>
        </div>

        {/* Template Spotlight Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 p-10 bg-slate-900 rounded-[3rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-indigo-600/30 transition-colors duration-1000"></div>
            <div className="relative z-10 flex flex-col h-full justify-between gap-10">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-indigo-500/10">
                  <Sparkles size={12} /> Spotlight Template
                </div>
                <h2 className="text-4xl font-black text-white leading-tight">Automated Sales<br />Assistant</h2>
                <p className="text-slate-400 text-sm font-medium max-w-md leading-relaxed">Boost your conversion rate by 30% with our pre-built sales sequence. Captures leads and answers FAQs instantly.</p>
              </div>
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => { setBuilderStep('gallery'); setShowCreateModal(true); }}
                  className="px-10 py-5 bg-white text-slate-900 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-xl active:scale-95"
                >
                  Explore Spotlight
                </button>
                <div className="flex -space-x-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">
                      {i}+
                    </div>
                  ))}
                  <div className="pl-6 text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center">4.2k Active Users</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-8 bg-indigo-600 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden group h-full flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-125 transition-transform duration-500">
                <Zap size={100} />
              </div>
              <div className="relative z-10 space-y-4">
                <h3 className="text-2xl font-black leading-none">Instant<br />Success</h3>
                <p className="text-indigo-100 text-xs font-medium opacity-80 leading-relaxed">No coding needed. Choose a template and go live in seconds.</p>
              </div>
              <button 
                onClick={() => { setBuilderStep('gallery'); setShowCreateModal(true); }}
                className="w-full py-4 bg-white/20 hover:bg-white/30 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-white/10"
              >
                Launch Library
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 group hover:border-indigo-100 transition-all">
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 ${colorMap[stat.color].bg} ${colorMap[stat.color].text} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-2xl font-black text-slate-800 tracking-tight leading-none">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Content Section with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
            {/* Categories & Search */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-3 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/20">
              <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100 overflow-x-auto custom-scrollbar no-scrollbar w-full md:w-auto">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat
                      ? 'bg-white text-indigo-600 shadow-lg shadow-indigo-600/10 border border-indigo-50'
                      : 'text-slate-400 hover:text-slate-600'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    type="text"
                    placeholder="Search workflows..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all placeholder:text-slate-300"
                  />
                </div>
                <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <LayoutGrid size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-2.5 rounded-xl transition-all ${viewMode === 'table' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
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
                  <div key={auto._id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden group hover:shadow-indigo-600/10 transition-all duration-500 relative">
                    <div className="p-8 pb-4">
                      <div className="flex items-start justify-between mb-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${auto.type === 'flow' ? 'bg-amber-500 shadow-amber-500/20' :
                          auto.type === 'keyword' ? 'bg-indigo-600 shadow-indigo-600/20' :
                            'bg-emerald-500 shadow-emerald-500/20'
                          }`}>
                          {auto.type === 'flow' ? <Bot size={28} /> :
                            auto.type === 'keyword' ? <Wand2 size={28} /> :
                              <MessageSquare size={28} />}
                        </div>
                        <div className="flex items-center gap-2">
                          <div 
                            onClick={() => handleToggleStatus(auto._id, auto.status)}
                            className={`w-10 h-6 rounded-full relative cursor-pointer transition-all ${auto.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${auto.status === 'active' ? 'left-5' : 'left-1'}`}></div>
                          </div>
                          <button className="w-8 h-8 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-300 hover:text-slate-600 transition-colors">
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-lg font-black text-slate-800 tracking-tight mb-1 group-hover:text-indigo-600 transition-colors">{auto.name}</h3>
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                        Trigger: {auto.trigger?.event === 'keyword_match' ? `Keyword (${auto.trigger?.keywords?.join(', ')})` : 'Incoming Message'}
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Messages</p>
                          <p className="text-lg font-black text-slate-700 tracking-tight">{(auto.messagesSent || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Success</p>
                          <p className="text-lg font-black text-emerald-500 tracking-tight">{auto.successRate || 0}%</p>
                        </div>
                      </div>
                    </div>

                    <div className="px-8 py-5 bg-slate-50/50 flex items-center justify-between border-t border-slate-50">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">Last active {auto.lastActive || 'Never'}</span>
                      <button className="flex items-center gap-2 text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:gap-3 transition-all">
                        View Analytics
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}

                <div
                  onClick={() => setShowCreateModal(true)}
                  className="bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 hover:bg-indigo-50/30 hover:border-indigo-200 transition-all cursor-pointer group"
                >
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-indigo-600 group-hover:scale-110 shadow-sm transition-all duration-300 mb-4">
                    <Plus size={32} />
                  </div>
                  <h3 className="text-sm font-black text-slate-400 group-hover:text-indigo-600 transition-colors uppercase tracking-widest">New Workflow</h3>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Workflow Name</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type & Trigger</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Volume</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Performance</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {automations.map((auto) => (
                      <tr key={auto._id} className="group hover:bg-slate-50/30 transition-all">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${auto.type === 'flow' ? 'bg-amber-500' :
                              auto.type === 'keyword' ? 'bg-indigo-600' :
                                'bg-emerald-500'
                              }`}>
                              {auto.type === 'flow' ? <Bot size={20} /> :
                                auto.type === 'keyword' ? <Wand2 size={20} /> :
                                  <MessageSquare size={20} />}
                            </div>
                            <span className="text-xs font-black text-slate-700">{auto.name}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{auto.type}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{auto.trigger?.event === 'keyword_match' ? `Keyword: ${auto.trigger?.keywords?.[0]}...` : 'Incoming Message'}</p>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className="text-xs font-black text-slate-700">{(auto.messagesSent || 0).toLocaleString()}</span>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${auto.successRate || 0}%` }}></div>
                            </div>
                            <span className="text-[10px] font-black text-emerald-600">{auto.successRate || 0}%</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-center">
                            <div className={`w-10 h-6 rounded-full relative cursor-pointer transition-all ${auto.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${auto.status === 'active' ? 'left-5' : 'left-1'}`}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100">
                              <BarChart2 size={16} />
                            </button>
                            <button className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-all border border-slate-100">
                              <MousePointer2 size={16} />
                            </button>
                            <button className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-all border border-slate-100">
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
          <div className="space-y-8">
            <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 shadow-sm border border-amber-100">
                  <Info size={20} />
                </div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Pro Tips</h4>
              </div>
              <ul className="space-y-5">
                {[
                  'Keep messages short & friendly',
                  'Test workflows on a test number',
                  'Use variables like {name}',
                  'Analyze performance weekly'
                ].map((tip, i) => (
                  <li key={i} className="flex gap-3 text-[11px] font-bold text-slate-500 leading-relaxed">
                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-1.5 shrink-0"></div>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-10 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[3rem] shadow-2xl text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all duration-700"></div>
              <div className="relative z-10 space-y-6">
                <div className="space-y-2">
                  <h4 className="text-2xl font-black leading-tight">Need Expert<br />Support?</h4>
                  <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest opacity-80">Our team can build it for you</p>
                </div>
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="w-full py-5 bg-white text-indigo-900 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-amber-500 hover:text-slate-900 transition-all shadow-xl active:scale-95"
                >
                  Request Custom Build
                </button>
              </div>
            </div>

            <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200/50 flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center text-slate-400">
                <Workflow size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Platform Version</p>
                <p className="text-xs font-black text-slate-800">v2.4.0 Stable</p>
              </div>
              <button 
                onClick={async () => {
                  const token = localStorage.getItem('token');
                  await fetch(`${API_BASE_URL}/automations/seed`, { 
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                  });
                  fetchGlobalTemplates();
                  alert("Marketplace seeded successfully!");
                }}
                className="mt-4 px-4 py-2 bg-slate-200 text-slate-600 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-indigo-600 hover:text-white transition-all"
              >
                Seed Marketplace
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Workflow Builder Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[800px] rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => builderStep === 'config' ? setBuilderStep('gallery') : setShowCreateModal(false)}
                  className="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-all"
                >
                  {builderStep === 'config' ? <ChevronRight size={24} className="rotate-180" /> : <Bot size={24} />}
                </button>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 leading-none">
                    {builderStep === 'gallery' ? 'Choose Automation Template' : 'Configure Workflow'}
                  </h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                    <Sparkles size={12} className="text-amber-500" />
                    {builderStep === 'gallery'
                      ? 'Select a starting point for your smart workflow'
                      : `Building ${selectedTemplate?.title || 'Custom'} Automation`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setShowCreateModal(false); setBuilderStep('gallery'); }}
                className="w-12 h-12 rounded-2xl hover:bg-slate-50 flex items-center justify-center text-slate-300 hover:text-slate-600 transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
              {builderStep === 'gallery' ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    <button 
                      onClick={() => setBuilderStep('config')}
                      className="group relative p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] hover:border-indigo-600/30 hover:bg-white transition-all flex flex-col items-center justify-center gap-4 min-h-[200px]"
                    >
                      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                        <Plus size={32} />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Start From Scratch</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Build your own custom workflow</p>
                      </div>
                    </button>

                    {globalTemplates.length > 0 ? globalTemplates.map((template) => (
                      <div 
                        key={template._id}
                        onClick={async () => {
                          setLoading(true);
                          try {
                            const token = localStorage.getItem('token');
                            const res = await fetch(`${API_BASE_URL}/automations/clone/${template._id}`, {
                              method: 'POST',
                              headers: { 'Authorization': `Bearer ${token}` }
                            });
                            
                            const data = await res.json();
                            
                            if (res.ok) {
                              fetchAutomations();
                              setShowCreateModal(false);
                            } else {
                              alert(data.message || "Failed to install template");
                            }
                          } catch (e) { console.error(e); }
                          finally { setLoading(false); }
                        }}
                        className="group relative p-8 bg-white border border-slate-100 rounded-[2.5rem] hover:shadow-2xl hover:shadow-indigo-600/10 transition-all cursor-pointer overflow-hidden border-indigo-50"
                      >
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700`}></div>
                        <div className="relative z-10 space-y-6">
                          <div className={`w-14 h-14 bg-indigo-600 rounded-2xl shadow-xl flex items-center justify-center text-white`}>
                            <Zap size={24} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 uppercase tracking-widest">{template.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 leading-relaxed line-clamp-2">{template.action?.content}</p>
                          </div>
                          <div className="flex items-center gap-2 text-[9px] font-black text-indigo-600 uppercase tracking-widest group-hover:translate-x-2 transition-all">
                            Install Template <ChevronRight size={12} />
                          </div>
                        </div>
                      </div>
                    )) : (
                      automationTypes.map((type, idx) => (
                        <div 
                          key={idx}
                          onClick={() => {
                            setSelectedTemplate(type);
                            setBuilderStep('config');
                          }}
                          className="group relative p-8 bg-white border border-slate-100 rounded-[2.5rem] hover:shadow-2xl hover:shadow-indigo-600/10 transition-all cursor-pointer overflow-hidden"
                        >
                          <div className={`absolute top-0 right-0 w-32 h-32 ${type.color} opacity-5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700`}></div>
                          <div className="relative z-10 space-y-6">
                            <div className={`w-14 h-14 ${type.color} rounded-2xl shadow-xl flex items-center justify-center text-white`}>
                              <type.icon size={24} />
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900 uppercase tracking-widest">{type.title}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 leading-relaxed">{type.desc}</p>
                            </div>
                            <div className="flex items-center gap-2 text-[9px] font-black text-indigo-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                              Use Template <ChevronRight size={12} />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Request Custom Workflow Banner */}
                  <div className="mt-12 p-10 bg-gradient-to-br from-slate-900 to-indigo-900 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/10 transition-colors"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-slate-900">
                            <Sparkles size={16} />
                          </div>
                          <h4 className="text-xl font-black text-white uppercase tracking-wider">Can't find the right workflow?</h4>
                        </div>
                        <p className="text-slate-300 text-sm font-medium leading-relaxed max-w-md">Our experts can build a custom automation tailored specifically to your business needs. Describe your vision, and we'll handle the rest.</p>
                      </div>
                      <button 
                        onClick={() => setShowRequestModal(true)}
                        className="px-10 py-5 bg-white text-indigo-950 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-amber-500 hover:text-slate-900 transition-all shadow-xl active:scale-95 shrink-0"
                      >
                        Request Custom Workflow
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
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Trigger Event</label>
                      <select
                        value={formData.trigger.event}
                        onChange={(e) => setFormData({ ...formData, trigger: { ...formData.trigger, event: e.target.value } })}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600/10 cursor-pointer"
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
                          <div className="w-8 h-8 bg-indigo-500 rounded-xl flex items-center justify-center text-white">
                            <Zap size={16} />
                          </div>
                          <p className="text-xs font-bold text-white/70 uppercase tracking-widest">Automation Action</p>
                        </div>
                        <textarea
                          rows="4"
                          placeholder="Type your automated response here..."
                          value={formData.action.content}
                          onChange={(e) => setFormData({ ...formData, action: { ...formData.action, content: e.target.value, messageType: 'text' } })}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder:text-white/20 font-medium"
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

            <div className="p-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/30 shrink-0">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                {builderStep === 'gallery' ? 'Need inspiration? Check our automation library' : 'Workflow will be saved as Draft by default'}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setShowCreateModal(false); setBuilderStep('gallery'); }}
                  className="px-8 py-4 bg-white text-slate-400 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all border border-slate-200"
                >
                  {builderStep === 'gallery' ? 'Close Gallery' : 'Cancel'}
                </button>
                {builderStep === 'config' && (
                  <button
                    onClick={handleLaunch}
                    disabled={loading}
                    className="px-10 py-4 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    Launch Workflow
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
          <div className="bg-white w-full max-w-[500px] rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 space-y-8">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                  <Wand2 size={24} />
                </div>
                <button onClick={() => setShowRequestModal(false)} className="text-slate-300 hover:text-slate-600 transition-colors">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 leading-none">Request Custom Workflow</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Describe your automation idea below</p>
              </div>
              <textarea 
                rows="5"
                placeholder="Example: I want a workflow that automatically asks for a Google Review 2 days after a customer makes a purchase..."
                value={requestContent}
                onChange={(e) => setRequestContent(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-6 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all placeholder:text-slate-300"
              ></textarea>
              <button 
                onClick={() => {
                  alert("Request sent to Admin! We'll get back to you soon.");
                  setShowRequestModal(false);
                  setRequestContent('');
                }}
                className="w-full py-5 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
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
