import React from 'react';
import { Settings, Shield, Globe, Bell, Database, Key, Save, AlertCircle } from 'lucide-react';

export default function AdminSettings() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar">
      <div className="max-w-[1000px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Settings</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Global platform configuration and security protocols</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all active:scale-95">
             <Save size={16} /> Save Changes
          </button>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 gap-8">
           
           {/* API Configuration */}
           <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex items-center gap-4">
                 <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                    <Globe size={20} />
                 </div>
                 <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Meta API Integration</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Global Graph API Credentials</p>
                 </div>
              </div>
              <div className="p-8 space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">App ID</label>
                       <input type="password" value="786037217716991" readOnly className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:border-primary transition-all outline-none" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">App Secret</label>
                       <input type="password" value="••••••••••••••••" readOnly className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:border-primary transition-all outline-none" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Webhook Verify Token</label>
                    <input type="text" defaultValue="my_secret_token_2026" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:border-primary transition-all outline-none" />
                 </div>
              </div>
           </section>

           {/* Security Settings */}
           <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex items-center gap-4">
                 <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                    <Shield size={20} />
                 </div>
                 <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Security & Auth</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Global Authentication Protocols</p>
                 </div>
              </div>
              <div className="p-8 space-y-6">
                 <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <div>
                       <p className="text-sm font-black text-slate-900">Multi-Factor Authentication</p>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Enforce MFA for all admin accounts</p>
                    </div>
                    <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                       <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                 </div>
                 <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <div>
                       <p className="text-sm font-black text-slate-900">Session Timeout</p>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Automatically log out inactive users</p>
                    </div>
                    <select className="bg-white border border-slate-200 rounded-xl text-[10px] font-black px-4 py-2 outline-none">
                       <option>24 HOURS</option>
                       <option>7 DAYS</option>
                       <option>30 DAYS</option>
                    </select>
                 </div>
              </div>
           </section>

           {/* Danger Zone */}
           <section className="bg-rose-50/30 rounded-[2.5rem] border border-rose-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-rose-100/50 flex items-center gap-4">
                 <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center">
                    <AlertCircle size={20} />
                 </div>
                 <div>
                    <h3 className="text-lg font-black text-rose-900 tracking-tight">Danger Zone</h3>
                    <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest">Irreversible System Actions</p>
                 </div>
              </div>
              <div className="p-8 flex flex-col md:flex-row gap-4">
                 <button className="flex-1 py-4 bg-white border border-rose-200 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-rose-50 transition-all">
                    Clear System Logs
                 </button>
                 <button className="flex-1 py-4 bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-rose-200 hover:brightness-110 transition-all">
                    Maintenance Mode
                 </button>
              </div>
           </section>

        </div>
      </div>
    </div>
  );
}
