import React, { useState } from 'react';
import { 
  User, Shield, Bell, Zap, 
  Mail, Lock, Globe, Moon,
  Save, Trash2, Key, Smartphone,
  CheckCircle2, AlertCircle, Eye, EyeOff,
  ChevronRight, ArrowRight, Copy, ShieldCheck, Plus
} from 'lucide-react';

export default function SettingsPage({ userData, businessData, onUpdate }) {
  const [activeTab, setActiveTab] = useState('Profile');
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'Profile', icon: User, label: 'Profile' },
    { id: 'Security', icon: Shield, label: 'Security' },
    { id: 'Integrations', icon: Zap, label: 'API Keys' },
  ];

  const [formData, setFormData] = useState({
    business_name: businessData?.business_name || '',
    email: businessData?.email || '',
    business_category: businessData?.business_category || 'Other'
  });

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/business/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert('Profile updated successfully!');
        onUpdate();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] overflow-hidden">
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        
        {/* Simple Header */}
        <div className="px-8 lg:px-12 pt-12 pb-8 shrink-0">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-black text-primary tracking-tight">Settings</h1>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-1">Manage your account and preferences</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-8 lg:px-12 pb-12 grid grid-cols-1 xl:grid-cols-12 gap-10">
          
          {/* Simple Navigation Sidebar */}
          <div className="xl:col-span-3 space-y-6">
            <div className="bg-white p-2 rounded-3xl border border-slate-200/60 shadow-sm">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-200 ${activeTab === tab.id 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <tab.icon size={18} className={activeTab === tab.id ? 'text-white' : 'text-slate-400'} />
                  <span className="text-sm font-bold">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Simple Help Card */}
            <div className="p-6 bg-slate-900 rounded-3xl text-white shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck size={16} className="text-emerald-400" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Account Status</p>
              </div>
              <p className="text-sm font-bold mb-4">Your account is secure and active.</p>
              <button className="text-[10px] font-black text-primary-light uppercase tracking-widest hover:underline flex items-center gap-2">
                Learn more <ArrowRight size={12} />
              </button>
            </div>
          </div>

          {/* Clean Content Area */}
          <div className="xl:col-span-9">
            
            {activeTab === 'Profile' && (
              <div className="bg-white rounded-3xl p-10 border border-slate-200/60 shadow-sm space-y-10 animate-in fade-in duration-300">
                <div className="flex items-center gap-6 pb-8 border-b border-slate-100">
                  <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center text-primary border border-slate-200/60 relative">
                    <User size={32} />
                    <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-lg text-white shadow-md flex items-center justify-center border-2 border-white">
                      <Plus size={14} />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800">{userData?.name || 'User Name'}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{userData?.phone || 'No phone linked'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 ml-1">Full Name</label>
                    <input readOnly value={userData?.name || ''} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-400 cursor-not-allowed" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 ml-1">Phone Number</label>
                    <input readOnly value={userData?.phone || ''} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-400 cursor-not-allowed" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-800 ml-1">Business Name</label>
                    <input 
                      value={formData.business_name} 
                      onChange={e => setFormData({...formData, business_name: e.target.value})}
                      placeholder="Enter business name"
                      className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary/10 transition-all outline-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-800 ml-1">Email Address</label>
                    <input 
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      placeholder="Enter email address"
                      className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary/10 transition-all outline-none" 
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    onClick={handleUpdateProfile}
                    disabled={loading}
                    className="px-8 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:brightness-110 transition-all shadow-md active:scale-95 flex items-center gap-2"
                  >
                    <Save size={16} />
                    {loading ? 'Saving...' : 'Update Profile'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'Security' && (
              <div className="bg-white rounded-3xl p-10 border border-slate-200/60 shadow-sm space-y-10 animate-in fade-in duration-300">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-800">Security</h3>
                  <p className="text-sm text-slate-500">Manage your password and account security</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-800 ml-1">Current Password</label>
                      <input type="password" placeholder="••••••••" className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:border-primary focus:ring-1 focus:ring-primary/10 transition-all outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-800 ml-1">New Password</label>
                      <input type="password" placeholder="••••••••" className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:border-primary focus:ring-1 focus:ring-primary/10 transition-all outline-none" />
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between p-6 bg-red-50 rounded-2xl border border-red-100">
                    <div>
                      <h4 className="text-sm font-bold text-red-900">Deactivate Account</h4>
                      <p className="text-xs text-red-700">Delete your account and business data</p>
                    </div>
                    <button className="px-6 py-2.5 bg-white text-red-600 text-xs font-bold rounded-lg hover:bg-red-600 hover:text-white transition-all border border-red-200 flex items-center gap-2">
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}


            {activeTab === 'Integrations' && (
              <div className="bg-white rounded-3xl p-10 border border-slate-200/60 shadow-sm space-y-10 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-slate-800">API Keys</h3>
                    <p className="text-sm text-slate-500">Connect the CRM to other apps</p>
                  </div>
                  <button className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-lg shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-2">
                    <Plus size={14} /> New Key
                  </button>
                </div>

                <div className="p-8 bg-slate-900 rounded-3xl text-white space-y-8 relative overflow-hidden group shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-primary-light border border-white/5">
                        <Key size={24} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold">Production Key</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Created May 08, 2026</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Secret Key</label>
                      <button onClick={() => setShowToken(!showToken)} className="text-[10px] font-black text-primary-light uppercase tracking-widest hover:underline flex items-center gap-1.5">
                        {showToken ? <EyeOff size={12} /> : <Eye size={12} />} {showToken ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <div className="relative">
                      <input 
                        readOnly 
                        type={showToken ? 'text' : 'password'}
                        value="manuen_live_9382048293740283472018347201" 
                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-xs font-mono text-primary-light focus:outline-none"
                      />
                      <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-lg transition-all">
                        <Copy size={14} className="text-slate-400" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Last used: 4 minutes ago</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
