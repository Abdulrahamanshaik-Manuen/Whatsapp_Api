import React, { useState } from 'react';
import { 
  KeyRound, 
  Plus, 
  Copy, 
  Check, 
  Trash2, 
  Eye, 
  EyeOff, 
  Shield, 
  Activity, 
  Clock, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Database,
  Lock,
  Globe
} from 'lucide-react';

export default function ApiKeysPage() {
  const [keys, setKeys] = useState([
    { id: 1, name: 'Production Key', key: 'pk_live_51M0...9a2b', created: 'Oct 12, 2024', lastUsed: '2 mins ago', status: 'Active', scope: 'Full Access' },
    { id: 2, name: 'Test Environment', key: 'pk_test_51M0...c4d5', created: 'Nov 05, 2024', lastUsed: '1 hour ago', status: 'Active', scope: 'Read Only' },
    { id: 3, name: 'Analytics Integration', key: 'pk_live_72X...f8g9', created: 'Dec 01, 2024', lastUsed: 'Never', status: 'Revoked', scope: 'Write Only' },
  ]);

  const [showKey, setShowKey] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleKeyVisibility = (id) => {
    setShowKey(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const revokeKey = (id) => {
    if (window.confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      setKeys(keys.map(k => k.id === id ? { ...k, status: 'Revoked' } : k));
    }
  };

  const createKey = () => {
    if (!newKeyName) return;
    const newKey = {
      id: Date.now(),
      name: newKeyName,
      key: `pk_live_${Math.random().toString(36).substring(2, 15)}`,
      created: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      lastUsed: 'Never',
      status: 'Active',
      scope: 'Full Access'
    };
    setKeys([newKey, ...keys]);
    setNewKeyName('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">API Keys</h1>
          <p className="text-slate-500">Securely manage access to your WhatsApp Business API account.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg shadow-slate-200"
        >
          <Plus size={18} /> Generate New Key
        </button>
      </div>

      {/* Security Alert */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
          <Shield size={20} />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-amber-900">Security Best Practices</h4>
          <p className="text-xs text-amber-700 mt-1 leading-relaxed">
            Never share your API keys or commit them to version control. Use environment variables to store them securely in your application.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Keys List */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] uppercase font-bold text-slate-400 tracking-widest border-b border-slate-100">
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">API Key</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Last Used</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {keys.map((key) => (
                    <tr key={key.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800">{key.name}</span>
                          <span className="text-[10px] text-slate-400 font-medium">Created on {key.created}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">
                            {showKey[key.id] ? key.key : '••••••••••••••••'}
                          </code>
                          <button 
                            onClick={() => toggleKeyVisibility(key.id)}
                            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {showKey[key.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                          <button 
                            onClick={() => handleCopy(key.id, key.key)}
                            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {copiedId === key.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          key.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {key.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                          <Clock size={12} /> {key.lastUsed}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => revokeKey(key.id)}
                          disabled={key.status === 'Revoked'}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-6">
          {/* Usage Stats */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Activity size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-800">API Usage</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database size={14} className="text-slate-400" />
                  <span className="text-sm text-slate-600 font-medium">Requests (Monthly)</span>
                </div>
                <span className="text-sm font-bold text-slate-800">4,256 / 10,000</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '42.5%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock size={14} className="text-slate-400" />
                  <span className="text-sm text-slate-600 font-medium">Active Keys</span>
                </div>
                <span className="text-sm font-bold text-slate-800">2 / 5</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
          </div>


        </div>
      </div>

      {/* Generate Key Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Generate New API Key</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl transition-all">
                <AlertCircle size={20} className="rotate-180" />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Key Name</label>
                <input 
                  type="text" 
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g. Mobile App Production"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Permissions</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Full Access', 'Read Only', 'Write Only'].map((scope) => (
                    <div key={scope} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-white transition-all">
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100"></div>
                      </div>
                      <span className="text-xs font-bold text-slate-600">{scope}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-white rounded-xl transition-all">Cancel</button>
              <button 
                onClick={createKey}
                className="px-8 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl shadow-lg shadow-slate-900/10 hover:bg-black transition-all"
              >
                Generate Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
