import React, { useState } from 'react';
import { 
  User, Shield, Bell, Zap, 
  Mail, Lock, Globe, Moon,
  Save, Trash2, Key, Smartphone,
  CheckCircle2, AlertCircle, Eye, EyeOff
} from 'lucide-react';

export default function SettingsPage({ userData, businessData, onUpdate }) {
  const [activeTab, setActiveTab] = useState('Profile');
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'Profile', icon: User, label: 'Profile Settings' },
    { id: 'Security', icon: Shield, label: 'Password & Security' },
    { id: 'Notifications', icon: Bell, label: 'Notification Prefs' },
    { id: 'Integrations', icon: Zap, label: 'API & Developer' },
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
    <div className="h-full bg-[#F8FAFC] flex flex-col p-8 lg:p-12 space-y-12 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">System <span className="text-primary">Settings</span></h1>
        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest pl-1">Personalize your CRM and manage security</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-12">
        {/* Settings Navigation */}
        <div className="xl:col-span-1 space-y-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-8 py-5 rounded-3xl transition-all duration-300 ${activeTab === tab.id 
                ? 'bg-primary text-white shadow-xl shadow-primary/20' 
                : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100 shadow-sm'}`}
            >
              <tab.icon size={20} />
              <span className="text-[11px] font-black uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
          
          <div className="mt-12 p-8 bg-slate-900 rounded-[2.5rem] text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-10">
               <Shield size={60} />
             </div>
             <div className="relative z-10 space-y-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Account Health</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                  <p className="text-sm font-black tracking-tight">Everything Secure</p>
                </div>
                <button className="text-[10px] font-black text-primary-light uppercase tracking-widest hover:brightness-110 transition-all">Security Audit</button>
             </div>
          </div>
        </div>

        {/* Settings Content Area */}
        <div className="xl:col-span-3">
          {activeTab === 'Profile' && (
            <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-2xl shadow-slate-200/40 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row md:items-center gap-10">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-[2.5rem] bg-primary/10 border-4 border-white shadow-xl flex items-center justify-center text-primary relative overflow-hidden">
                    <User size={48} />
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <Smartphone size={24} className="text-white" />
                    </div>
                  </div>
                  <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-xl text-white shadow-lg flex items-center justify-center border-4 border-white">
                    <Zap size={16} />
                  </button>
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">{userData?.name || 'Loading...'}</h3>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{userData?.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Full Name</label>
                  <input readOnly value={userData?.name || ''} className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-bold opacity-70 cursor-not-allowed" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Phone Number</label>
                  <input readOnly value={userData?.phone || ''} className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-bold opacity-70 cursor-not-allowed" />
                </div>
                 <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Business Name</label>
                  <input 
                    value={formData.business_name} 
                    onChange={e => setFormData({...formData, business_name: e.target.value})}
                    className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all" 
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email Address</label>
                  <input 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all" 
                  />
                </div>
              </div>

              <div className="flex justify-end pt-8 border-t border-slate-50">
                <button 
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className="px-12 py-5 bg-primary text-white text-[11px] font-black uppercase tracking-widest rounded-3xl hover:brightness-110 transition-all shadow-xl shadow-primary/20 active:scale-95 flex items-center gap-2"
                >
                  <Save size={18} />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'Security' && (
            <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-2xl shadow-slate-200/40 space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Security & Authentication</h3>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Secure your account with 2FA and strong passwords</p>
              </div>

              <div className="space-y-8">
                 <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center justify-between">
                  <div className="flex gap-5">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-primary">
                      <Smartphone size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-800 tracking-tight">Two-Factor Authentication</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Add an extra layer of security</p>
                    </div>
                  </div>
                  <div className="w-14 h-8 bg-secondary rounded-full relative p-1 transition-all cursor-pointer">
                    <div className="w-6 h-6 bg-white rounded-full translate-x-6"></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all" />
                  </div>
                   <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all" />
                  </div>
                </div>
              </div>

              <div className="p-8 bg-red-50 rounded-[2.5rem] border border-red-100 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-red-900 tracking-tight">Deactivate Account</h4>
                  <p className="text-[10px] text-red-800/60 font-bold uppercase tracking-widest mt-1">This action is irreversible</p>
                </div>
                <button className="px-8 py-4 bg-white text-red-600 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100 flex items-center gap-2">
                  <Trash2 size={16} />
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {activeTab === 'Notifications' && (
            <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-2xl shadow-slate-200/40 space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Notification Channels</h3>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Choose how you want to be alerted</p>
              </div>

              <div className="space-y-6">
                {[
                  { title: 'Inbound Message Alerts', desc: 'Notify when a customer sends a new message', active: true },
                  { title: 'Campaign Completion', desc: 'Get a report when your broadcast ends', active: true },
                  { title: 'System Updates', desc: 'Maintenance and new feature announcements', active: false },
                  { title: 'Daily Analytics Summary', desc: 'Morning report of your CRM performance', active: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:border-primary/20 transition-all">
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-slate-800 tracking-tight">{item.title}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.desc}</p>
                    </div>
                    <div className={`w-14 h-8 ${item.active ? 'bg-primary' : 'bg-slate-300'} rounded-full relative p-1 transition-all cursor-pointer`}>
                      <div className={`w-6 h-6 bg-white rounded-full transition-all ${item.active ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Integrations' && (
            <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-2xl shadow-slate-200/40 space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="flex items-center justify-between">
                 <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Developer API Keys</h3>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Connect Manuen CRM to your custom apps</p>
                </div>
                <button className="px-8 py-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 active:scale-95 flex items-center gap-2">
                  <Zap size={16} />
                  Generate New Key
                </button>
              </div>

              <div className="p-8 bg-slate-900 rounded-[3rem] text-white space-y-8 relative overflow-hidden">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-primary-light border border-white/5">
                    <Key size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black tracking-tight">Main Production Key</h4>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Created on May 08, 2026</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">API Token</label>
                    <button onClick={() => setShowToken(!showToken)} className="text-[10px] font-black text-primary-light uppercase tracking-widest hover:brightness-110">
                      {showToken ? 'Hide Secret' : 'Reveal Secret'}
                    </button>
                  </div>
                  <div className="relative group">
                    <input 
                      readOnly 
                      type={showToken ? 'text' : 'password'}
                      value="manuen_live_9382048293740283472018347201" 
                      className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-3xl text-sm font-black text-primary-light focus:outline-none"
                    />
                    <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
                       <Smartphone size={18} className="text-slate-400" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-4">
                   <div className="flex items-center gap-2">
                     <div className="w-1.5 h-1.5 bg-secondary rounded-full"></div>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Last used: 4 mins ago</span>
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
