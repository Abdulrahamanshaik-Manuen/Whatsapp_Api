import React, { useState, useEffect } from 'react';
import {
  Smartphone, Shield, Zap, CheckCircle2,
  ArrowRight, Globe, Code, MessageSquare,
  Lock, Copy, ExternalLink, Info, Check,
  Settings as SettingsIcon, Wand2, ShieldCheck,
  ChevronRight, AlertCircle, RefreshCcw, Headphones,
  Server, Link2, Activity, Database
} from 'lucide-react';

export default function WhatsAppSetupPage({ userData, onUpdate }) {
  const [view, setView] = useState('setup'); // 'setup' or 'success'
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    phone_number_id: userData?.phone_number_id || '',
    waba_id: userData?.waba_id || '',
    access_token: userData?.access_token || ''
  });

  const [liveStatus, setLiveStatus] = useState(null);

  const API_BASE = window.location.origin.includes('localhost')
    ? 'http://localhost:5000'
    : window.location.origin;

  const isConnected = liveStatus?.whatsapp_connected || userData?.whatsapp_connected;

  useEffect(() => {
    fetchStatus();

    const params = new URLSearchParams(window.location.search);
    if (params.get('status') === 'whatsapp_connected') {
      setActiveStep(2);
      onUpdate();
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Auto-detect success view if already connected
  useEffect(() => {
    if (isConnected && view === 'setup' && activeStep === 1) {
      setView('success');
    }
  }, [isConnected]);

  const fetchStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/whatsapp/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.webhook_url) {
        setLiveStatus(data);
        onUpdate(data);
        
        setSettings({
          phone_number_id: data.phone_number_id || '',
          waba_id: data.waba_id || '',
          access_token: data.access_token || ''
        });
      }
    } catch (err) {
      console.error("Failed to fetch latest status:", err);
    }
  };

  const handleMetaConnect = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/whatsapp/connect`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings.phone_number_id || !settings.waba_id || !settings.access_token) {
      alert("Please fill all required fields");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/whatsapp/save-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        onUpdate();
        setActiveStep(2);
        fetchStatus();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to save settings');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, title: 'API Config', icon: Code, desc: 'Connect Meta App' },
    { id: 2, title: 'Number Link', icon: Smartphone, desc: 'Verify Account' },
    { id: 3, title: 'Webhook Sync', icon: Zap, desc: 'Live Activation' },
  ];

  const CopyableField = ({ label, value }) => (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative group">
        <input
          readOnly
          value={value || 'Pending...'}
          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none pr-12 truncate"
        />
        <button
          onClick={() => {
            if (value) {
              navigator.clipboard.writeText(value);
              alert('Copied!');
            }
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-primary transition-all bg-white rounded-lg shadow-sm border border-slate-100"
        >
          <Copy size={14} />
        </button>
      </div>
    </div>
  );

  // Success View Component
  const SuccessView = () => (
    <div className="max-w-7xl mx-auto px-8 lg:px-12 pt-12 pb-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200/60 shadow-2xl shadow-slate-200/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8">
               <div className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full flex items-center gap-2 border border-emerald-100">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest">System Active</span>
               </div>
            </div>

            <div className="flex items-center gap-8 mb-12">
              <div className="w-24 h-24 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-emerald-500/30">
                <CheckCircle2 size={48} strokeWidth={2.5} />
              </div>
              <div className="space-y-1">
                <h2 className="text-4xl font-black text-slate-800 tracking-tight">Setup Success!</h2>
                <p className="text-sm text-slate-400 font-black uppercase tracking-widest leading-relaxed">Your Business API integration is live and running</p>
              </div>
            </div>

            <div className="space-y-8">
               <div className="flex items-center gap-3">
                  <Info size={16} className="text-primary" />
                  <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Active API Credentials</h4>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <CopyableField label="Phone Number ID" value={liveStatus?.phone_number_id || settings.phone_number_id} />
                  <CopyableField label="WABA Account ID" value={liveStatus?.waba_id || settings.waba_id} />
                  <CopyableField label="Webhook URL" value={liveStatus?.webhook_url || `${API_BASE}/api/webhook`} />
                  <CopyableField label="Verify Token" value={liveStatus?.verify_token || "whatsapp_token"} />
                  <div className="md:col-span-2">
                    <CopyableField label="Access Token" value={liveStatus?.access_token || settings.access_token} />
                  </div>
               </div>

               <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="flex -space-x-2">
                        {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-emerald-500 flex items-center justify-center text-white text-[10px] font-black"><Check size={12} strokeWidth={3} /></div>)}
                     </div>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">System Synchronized</p>
                  </div>
                  <button 
                    onClick={() => setView('setup')}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all active:scale-95 shadow-lg shadow-slate-900/20"
                  >
                     <SettingsIcon size={14} /> Edit Configuration
                  </button>
               </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white space-y-6 shadow-2xl shadow-slate-900/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <h4 className="text-xl font-black tracking-tight">Mission Control</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">Your instance is optimized for bulk messaging and automated workflows.</p>
              <div className="space-y-4">
                 <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Server Health</span>
                    <span className="text-xs font-black text-emerald-400">EXCELLENT</span>
                 </div>
                 <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Sync Status</span>
                    <span className="text-xs font-black text-emerald-400">ACTIVE</span>
                 </div>
              </div>
              <button className="w-full py-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-lg shadow-primary/20">
                 Open Inbox
              </button>
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] overflow-hidden">
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        
        {view === 'setup' ? (
          <>
            {/* Header Area - Only visible in Setup Mode */}
            <div className="px-8 lg:px-12 pt-12 pb-6 shrink-0 animate-in fade-in duration-500">
              <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="space-y-1">
                  <h1 className="text-3xl font-black text-primary tracking-tight">WhatsApp Setup</h1>
                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider leading-relaxed">
                    Activate your official Business API in a few simple steps
                  </p>
                </div>

                <div className="flex items-center bg-white p-1.5 rounded-2xl border border-slate-200/60 shadow-sm self-start lg:self-center">
                  {steps.map((step, i) => (
                    <React.Fragment key={step.id}>
                      <button
                        onClick={() => setActiveStep(step.id)}
                        className={`flex items-center gap-3 px-5 py-2.5 rounded-xl transition-all duration-300 ${
                          activeStep === step.id 
                          ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                          : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-[10px] ${
                          activeStep === step.id ? 'bg-white/20' : 'bg-slate-100'
                        }`}>
                          {activeStep > step.id ? <Check size={12} strokeWidth={3} /> : step.id}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">{step.title}</span>
                      </button>
                      {i < steps.length - 1 && (
                        <ArrowRight size={14} className="mx-2 text-slate-300" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 lg:px-12 pb-12 grid grid-cols-1 xl:grid-cols-12 gap-12">
              <div className="xl:col-span-8">
                {activeStep === 1 && (
                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200/60 shadow-xl shadow-slate-200/20 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="text-xl font-black text-slate-800 tracking-tight">API Integration</h3>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest opacity-70">Step 01: Secure Connection</p>
                        </div>
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                          <Code size={24} />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white space-y-6 relative overflow-hidden group">
                          <div className="relative z-10 space-y-4">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                              <Lock size={20} className="text-primary-light" />
                            </div>
                            <h4 className="text-xl font-black tracking-tight leading-tight">One-Click<br />Meta Integration</h4>
                            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">Sync your Business Manager automatically.</p>
                          </div>
                          <button onClick={handleMetaConnect} className="w-full py-4 bg-[#1877F2] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3">
                            Connect with Meta
                          </button>
                        </div>
                        <div className="space-y-6">
                          <div className="flex items-center gap-2 mb-2">
                            <Wand2 size={16} className="text-primary-light" />
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Manual Setup</h4>
                          </div>
                          <div className="space-y-5">
                            <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number ID</label>
                              <input type="text" value={settings.phone_number_id} onChange={e => setSettings({...settings, phone_number_id: e.target.value})} placeholder="Enter Phone ID" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">WABA Account ID</label>
                              <input type="text" value={settings.waba_id} onChange={e => setSettings({...settings, waba_id: e.target.value})} placeholder="Enter WABA ID" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Token</label>
                              <input type="password" value={settings.access_token} onChange={e => setSettings({...settings, access_token: e.target.value})} placeholder="Enter Token" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none" />
                            </div>
                            <button onClick={handleSaveSettings} disabled={loading} className="w-full py-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary-dark transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                              {loading ? <RefreshCcw size={14} className="animate-spin" /> : <ShieldCheck size={14} />} Save Configuration
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeStep === 2 && (
                    <div className="bg-white rounded-[2.5rem] p-12 border border-slate-200/60 shadow-xl shadow-slate-200/20 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="max-w-md mx-auto space-y-8">
                        <div className={`w-24 h-24 mx-auto rounded-[2.5rem] flex items-center justify-center ${isConnected ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20' : 'bg-slate-100 text-slate-300'}`}>
                          {isConnected ? <Check size={48} strokeWidth={3} /> : <Smartphone size={48} />}
                        </div>
                        <div className="space-y-3">
                          <h3 className="text-2xl font-black text-slate-800 tracking-tight">{isConnected ? 'Instance Verified' : 'Awaiting Connection'}</h3>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest opacity-70">Step 02: Verification Hub</p>
                        </div>
                        <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200/60 relative group">
                          <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${liveStatus?.phone_number_id || 'pending'}`} alt="QR" className={`w-36 h-36 transition-all duration-700 ${isConnected ? 'opacity-100' : 'opacity-20 grayscale blur-[2px]'}`} />
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-4">
                          <button onClick={() => setActiveStep(3)} className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isConnected ? 'bg-primary text-white shadow-lg' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                            Next: Webhook Activation
                          </button>
                          <button onClick={() => setActiveStep(1)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-all">Back to Step 1</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeStep === 3 && (
                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200/60 shadow-xl shadow-slate-200/20 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="text-xl font-black text-slate-800 tracking-tight">Live Activation</h3>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest opacity-70">Step 03: Webhook Sync</p>
                        </div>
                        <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500"><Zap size={24} /></div>
                      </div>
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Callback URL</label>
                              <div className="relative group">
                                  <input readOnly value={liveStatus?.webhook_url || `${API_BASE}/api/webhook`} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-primary focus:outline-none pr-12 truncate" />
                                  <button onClick={() => { navigator.clipboard.writeText(liveStatus?.webhook_url || `${API_BASE}/api/webhook`); alert('Copied!'); }} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-primary transition-all"><Copy size={16} /></button>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Verify Token</label>
                              <div className="relative group">
                                  <input readOnly value={liveStatus?.verify_token || "whatsapp_token"} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-primary focus:outline-none pr-12 truncate" />
                                  <button onClick={() => { navigator.clipboard.writeText(liveStatus?.verify_token || "whatsapp_token"); alert('Copied!'); }} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-primary transition-all"><Copy size={16} /></button>
                              </div>
                            </div>
                        </div>
                        <button 
                          onClick={() => {
                            if(isConnected) setView('success');
                            else alert('Connection not detected yet. Please ensure Meta settings are correct.');
                          }}
                          className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isConnected ? 'bg-secondary text-white shadow-lg shadow-secondary/20 hover:brightness-110' : 'bg-slate-100 text-slate-400'}`}
                        >
                          {isConnected ? 'Finish Setup & View Details' : 'Awaiting Connection...'}
                        </button>
                      </div>
                    </div>
                  )}
              </div>

              {/* Sidebar Tools */}
              <div className="xl:col-span-4 space-y-6">
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200/60 shadow-xl shadow-slate-200/10 space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <ShieldCheck size={20} />
                      </div>
                      <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Setup Guide</h4>
                    </div>
                    <p className="text-xs text-slate-500 font-bold leading-relaxed tracking-tight">
                      Follow the 3 steps to activate your Business API. We recommend keeping your Meta Developer Dashboard open in another tab.
                    </p>
                    <button className="w-full py-4 bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                      <Headphones size={14} /> Need Assistance?
                    </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <SuccessView />
        )}
      </main>
    </div>
  );
}
