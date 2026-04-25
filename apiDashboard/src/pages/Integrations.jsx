import React, { useState } from 'react';
import { 
  Blocks, 
  ExternalLink, 
  CheckCircle2, 
  Search, 
  Filter, 
  Zap, 
  ShoppingBag, 
  MessageSquare, 
  RefreshCw,
  Plus,
  ArrowRight,
  X
} from 'lucide-react';

export default function Integrations() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestApp, setRequestApp] = useState('');

  const categories = ['All', 'CRM', 'E-commerce', 'Automation', 'Support', 'Marketing'];

  const integrations = [
    { 
      id: 1, 
      name: 'Shopify', 
      category: 'E-commerce', 
      desc: 'Send order updates and abandoned cart recovery messages.', 
      status: 'Connected',
      color: 'bg-emerald-50 text-emerald-600',
      icon: <ShoppingBag size={24} />
    },
    { 
      id: 2, 
      name: 'WooCommerce', 
      category: 'E-commerce', 
      desc: 'Sync orders and customers with your WhatsApp dashboard.', 
      status: 'Connect',
      color: 'bg-indigo-50 text-indigo-600',
      icon: <RefreshCw size={24} />
    },
    { 
      id: 3, 
      name: 'Salesforce', 
      category: 'CRM', 
      desc: 'Log conversations as activities and sync lead data.', 
      status: 'Connect',
      color: 'bg-sky-50 text-sky-600',
      icon: <Blocks size={24} />
    },
    { 
      id: 4, 
      name: 'Zapier', 
      category: 'Automation', 
      desc: 'Connect with 5000+ apps via automated workflows.', 
      status: 'Connected',
      color: 'bg-orange-50 text-orange-600',
      icon: <Zap size={24} />
    },
    { 
      id: 5, 
      name: 'Zendesk', 
      category: 'Support', 
      desc: 'Manage support tickets directly through WhatsApp.', 
      status: 'Connect',
      color: 'bg-teal-50 text-teal-600',
      icon: <MessageSquare size={24} />
    },
    { 
      id: 6, 
      name: 'HubSpot', 
      category: 'CRM', 
      desc: 'Trigger messages from HubSpot workflows automatically.', 
      status: 'Connect',
      color: 'bg-orange-100 text-orange-700',
      icon: <Blocks size={24} />
    }
  ];

  const filtered = integrations.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden relative">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl font-black text-slate-800">App Directory</h1>
          <p className="text-slate-500 mt-2 font-medium">
            Connect your favorite tools to automate your workflow and sync customer data seamlessly.
          </p>
        </div>
        <button 
          onClick={() => setIsRequestModalOpen(true)}
          className="relative z-10 flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-black transition-all shadow-lg shadow-slate-200"
        >
          Request Integration <ArrowRight size={18} />
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search integrations..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm"
          />
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeCategory === cat 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div key={item.id} className="group bg-white border border-slate-200 rounded-[2rem] p-8 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                  {item.icon}
                </div>
                {item.status === 'Connected' ? (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-emerald-100">
                    <CheckCircle2 size={12} /> Connected
                  </span>
                ) : (
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-wider border border-slate-100 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 transition-all">
                    <Plus size={12} /> Connect
                  </button>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">{item.name}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{item.category}</p>
                <p className="text-sm text-slate-500 mt-4 leading-relaxed font-medium">
                  {item.desc}
                </p>
              </div>
            </div>
            
            <div className="pt-8 mt-8 border-t border-slate-50 flex items-center justify-between">
              <button className="text-xs font-bold text-slate-400 hover:text-slate-900 flex items-center gap-1.5 transition-colors">
                Documentation <ExternalLink size={14} />
              </button>
              <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                <Filter size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Developer CTA */}
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold">Build your own integration?</h2>
            <p className="text-slate-400 mt-2 font-medium">
              Use our robust REST APIs and Webhooks to connect your internal systems. Check out our developer portal for documentation and SDKs.
            </p>
          </div>
          <button className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold hover:bg-emerald-500 hover:text-white transition-all shadow-xl">
            Developer Docs
          </button>
        </div>
      </div>

      {/* Request Integration Modal */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Request Integration</h3>
              <button onClick={() => setIsRequestModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">App Name</label>
                <input 
                  type="text" 
                  value={requestApp}
                  onChange={(e) => setRequestApp(e.target.value)}
                  placeholder="e.g. Slack, Trello, etc."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Why do you need this?</label>
                <textarea 
                  rows="3"
                  placeholder="Describe your use case..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all resize-none"
                />
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button onClick={() => setIsRequestModalOpen(false)} className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-white rounded-xl transition-all">Cancel</button>
              <button 
                onClick={() => { setIsRequestModalOpen(false); alert('Request submitted! We will notify you once it is available.'); }}
                className="px-8 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl shadow-lg shadow-slate-900/10 hover:bg-black transition-all"
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
