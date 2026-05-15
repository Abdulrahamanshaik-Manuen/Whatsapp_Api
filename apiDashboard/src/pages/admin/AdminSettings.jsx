import React, { useState } from 'react';
import { 
  Shield, Globe, Database, Save, AlertCircle, Lock, Eye, EyeOff, 
  Terminal, RefreshCw, Trash2, Activity, Loader2, Palette, 
  Layout, Smartphone, BellRing, UserPlus, Sliders, CheckCircle2,
  Image as ImageIcon, Type, Link as LinkIcon
} from 'lucide-react';

export default function AdminSettings() {
  const [showSecret, setShowSecret] = useState(false);
  const [saving, setSaving] = useState(false);
  const [regEnabled, setRegEnabled] = useState(true);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1500);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-10 custom-scrollbar bg-slate-50/30 h-full">
      <div className="max-w-[1200px] mx-auto space-y-12 pb-24">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-primary tracking-tight flex items-center gap-3">
               System Settings
            </h1>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1 opacity-70">
               Global platform configuration & white-label infrastructure
            </p>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-3 px-10 py-4 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-[1.5rem] shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-70"
          >
             {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} strokeWidth={3} />}
             {saving ? 'Synchronizing...' : 'Save Configuration'}
          </button>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* Left Column: API & Branding */}
           <div className="lg:col-span-2 space-y-8">
              
              {/* Meta API Configuration */}
              <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden group hover:shadow-2xl transition-all duration-500">
                 <div className="p-10 border-b border-slate-50 flex items-center gap-5 bg-slate-50/30">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                       <Globe size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-primary tracking-tight uppercase">Meta API Integration</h3>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Global Graph API Infrastructure</p>
                    </div>
                 </div>
                 <div className="p-10 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Meta App ID</label>
                          <div className="relative group/input">
                             <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                                <Terminal size={16} />
                             </div>
                             <input 
                                type="text" 
                                value="786037217716991" 
                                readOnly 
                                className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-primary outline-none ring-primary/5 transition-all focus:ring-4" 
                             />
                          </div>
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">App Secret Key</label>
                          <div className="relative group/input">
                             <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                                <Lock size={16} />
                             </div>
                             <input 
                                type={showSecret ? "text" : "password"} 
                                value="••••••••••••••••••••" 
                                readOnly 
                                className="w-full pl-14 pr-14 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-primary outline-none ring-primary/5 transition-all focus:ring-4" 
                             />
                             <button 
                                type="button"
                                onClick={() => setShowSecret(!showSecret)}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary transition-colors"
                             >
                                {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                             </button>
                          </div>
                       </div>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Webhook Verification Token</label>
                       <div className="relative group/input">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-secondary">
                             <Shield size={16} strokeWidth={3} />
                          </div>
                          <input 
                             type="text" 
                             defaultValue="my_secret_token_2026" 
                             className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-primary focus:border-secondary outline-none ring-secondary/5 transition-all focus:ring-4" 
                          />
                          <button className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-secondary">
                             <RefreshCw size={18} />
                          </button>
                       </div>
                    </div>
                 </div>
              </section>

              {/* Platform Branding & UI */}
              <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden group">
                 <div className="p-10 border-b border-slate-50 flex items-center gap-5 bg-slate-50/30">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-secondary group-hover:rotate-12 transition-transform">
                       <Palette size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-primary tracking-tight uppercase">Platform Branding</h3>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">White-Label Identity Configuration</p>
                    </div>
                 </div>
                 <div className="p-10 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Portal Name</label>
                          <div className="relative group/input">
                             <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                                <Type size={16} />
                             </div>
                             <input 
                                type="text" 
                                defaultValue="Maneun WhatsApp API" 
                                className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-primary focus:border-primary outline-none transition-all" 
                             />
                          </div>
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Support URL</label>
                          <div className="relative group/input">
                             <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                                <LinkIcon size={16} />
                             </div>
                             <input 
                                type="text" 
                                defaultValue="https://support.maneun.com" 
                                className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-primary focus:border-primary outline-none transition-all" 
                             />
                          </div>
                       </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col items-center gap-3 text-center group/logo cursor-pointer hover:bg-white transition-all">
                          <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover/logo:text-primary">
                             <ImageIcon size={24} />
                          </div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Admin Logo</p>
                       </div>
                       <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col items-center gap-3 text-center group/logo cursor-pointer hover:bg-white transition-all">
                          <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover/logo:text-primary">
                             <ImageIcon size={24} />
                          </div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Favicon</p>
                       </div>
                       <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col items-center gap-3 text-center group/logo cursor-pointer hover:bg-white transition-all">
                          <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover/logo:text-primary">
                             <Palette size={24} />
                          </div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Primary Theme</p>
                       </div>
                    </div>
                 </div>
              </section>
           </div>

           {/* Right Column: Platform Controls */}
           <div className="space-y-8">
              
              {/* Access & Registration */}
              <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                 <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-amber-500">
                       <UserPlus size={20} strokeWidth={3} />
                    </div>
                    <h3 className="text-sm font-black text-primary uppercase tracking-tight">Access Control</h3>
                 </div>
                 <div className="p-8 space-y-6">
                    <div className="space-y-4">
                       <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                          <div>
                             <p className="text-[11px] font-black text-primary uppercase">User Registration</p>
                             <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Enable Public Signups</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                             <input 
                                type="checkbox" 
                                className="sr-only peer"
                                checked={regEnabled}
                                onChange={e => setRegEnabled(e.target.checked)}
                             />
                             <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                       </div>
                       <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                          <div>
                             <p className="text-[11px] font-black text-primary uppercase">Maintenance</p>
                             <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Platform Offline</p>
                          </div>
                          <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-lg shadow-emerald-200"></div>
                       </div>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Default Signup Plan</label>
                       <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black text-primary uppercase outline-none cursor-pointer appearance-none ring-primary/5 transition-all focus:ring-4">
                          <option>STARTER (FREE)</option>
                          <option>GROWTH (PAID)</option>
                          <option>ENTERPRISE (PRO)</option>
                       </select>
                    </div>
                 </div>
              </section>

              {/* Messaging Protocols */}
              <section className="bg-primary rounded-[2.5rem] p-8 text-white shadow-2xl shadow-primary/40 relative overflow-hidden group">
                 <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                 <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                          <Sliders size={24} className="text-secondary" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 leading-none">Messaging Logic</p>
                          <h4 className="text-xl font-black tracking-tight mt-1">Smart Routing</h4>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-80">
                          <span>Retry Exhaustion</span>
                          <span className="text-secondary">3 Times</span>
                       </div>
                       <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-secondary w-[40%] rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                       </div>
                       <p className="text-[9px] text-white/50 font-medium leading-relaxed italic">Global retry policy for failed webhook deliveries and API rate limits.</p>
                    </div>
                 </div>
              </section>

              {/* Advanced Controls */}
              <section className="bg-rose-50/50 rounded-[2.5rem] border border-rose-100 p-8 space-y-6">
                 <div className="flex items-center gap-4 text-rose-600">
                    <Database size={24} strokeWidth={2.5} />
                    <h4 className="text-sm font-black uppercase tracking-widest leading-none">Global Flush</h4>
                 </div>
                 <div className="space-y-3">
                    <button className="w-full py-4 bg-white text-rose-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl border border-rose-100 hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-95">
                       Clear Message Logs
                    </button>
                    <button className="w-full py-4 bg-white text-rose-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl border border-rose-100 hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-95">
                       Flush Template Cache
                    </button>
                 </div>
              </section>

           </div>
        </div>
      </div>
    </div>
  );
}
