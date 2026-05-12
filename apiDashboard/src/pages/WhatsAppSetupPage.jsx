import React, { useState, useEffect } from 'react';
import {
  Smartphone, Shield, Zap, CheckCircle2,
  ArrowRight, Globe, Code, MessageSquare,
  Lock, Copy, ExternalLink, Info, Check,
  Settings as SettingsIcon, Wand2, ShieldCheck,
  ChevronRight, AlertCircle, RefreshCcw, Headphones
} from 'lucide-react';

export default function WhatsAppSetupPage({ userData, onUpdate }) {
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

  // Auto-detect success and fetch latest status
  useEffect(() => {
    fetchStatus();

    const params = new URLSearchParams(window.location.search);
    if (params.get('status') === 'whatsapp_connected') {
      setActiveStep(2);
      onUpdate();
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

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
        if (data.whatsapp_connected && activeStep === 1) {
          setActiveStep(2);
        }
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

  const isConnected = liveStatus?.whatsapp_connected || userData?.whatsapp_connected;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] overflow-hidden">
      {/* Main Scrollable Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Top Header Section - Now inside scroll area */}
        <div className="px-8 lg:px-12 pt-12 pb-6 shrink-0">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-primary tracking-tight flex items-center gap-3">
                WhatsApp Setup
              </h1>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider leading-relaxed">
                Activate your official Business API in a few simple steps
              </p>
            </div>

            {/* Minimalist Stepper */}
            <div className="flex items-center bg-white p-1.5 rounded-2xl border border-slate-200/60 shadow-sm self-start lg:self-center">
              {steps.map((step, i) => (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => setActiveStep(step.id)}
                    className={`flex items-center gap-3 px-5 py-2.5 rounded-xl transition-all duration-300 ${activeStep === step.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-[10px] ${activeStep === step.id ? 'bg-white/20' : 'bg-slate-100'}`}>
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

        <div className="max-w-6xl mx-auto px-8 lg:px-12 pb-12 grid grid-cols-1 xl:grid-cols-12 gap-12">

          {/* Left Column - Steps Content */}
          <div className="xl:col-span-8">

            {/* Step 1: Configuration */}
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
                  {/* Meta Connect Card */}
                  <div className="p-8 bg-slate-900 rounded-[2rem] text-white space-y-6 relative overflow-hidden group">
                    <div className="relative z-10 space-y-4">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                        <Lock size={20} className="text-primary-light" />
                      </div>
                      <h4 className="text-lg font-black tracking-tight leading-tight">One-Click<br />Meta Integration</h4>
                      <p className="text-[11px] text-slate-400 font-medium leading-relaxed">Sync your Business Manager, WABA ID, and tokens automatically.</p>
                    </div>
                    <button
                      onClick={handleMetaConnect}
                      className="w-full py-4 bg-[#1877F2] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3"
                    >
                      <div className="w-5 h-5 bg-white rounded flex items-center justify-center text-[#1877F2]">
                        <span className="font-black text-sm -mt-0.5">f</span>
                      </div>
                      Connect with Meta
                    </button>
                  </div>

                  {/* Manual Form Card */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Wand2 size={16} className="text-primary-light" />
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Manual Setup</h4>
                    </div>

                    <div className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number ID</label>
                        <input
                          type="text"
                          value={settings.phone_number_id}
                          onChange={e => setSettings({ ...settings, phone_number_id: e.target.value })}
                          placeholder="Enter Phone ID"
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Account ID (WABA)</label>
                        <input
                          type="text"
                          value={settings.waba_id}
                          onChange={e => setSettings({ ...settings, waba_id: e.target.value })}
                          placeholder="Enter WABA ID"
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Token</label>
                        <input
                          type="password"
                          value={settings.access_token}
                          onChange={e => setSettings({ ...settings, access_token: e.target.value })}
                          placeholder="Enter Token"
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-300"
                        />
                      </div>
                      <button
                        onClick={handleSaveSettings}
                        disabled={loading}
                        className="w-full py-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary-dark transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? <RefreshCcw size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                        Save Configuration
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Verification */}
            {activeStep === 2 && (
              <div className="bg-white rounded-[2.5rem] p-12 border border-slate-200/60 shadow-xl shadow-slate-200/20 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="max-w-md mx-auto space-y-8">
                  <div className={`w-20 h-20 mx-auto rounded-[2rem] flex items-center justify-center ${isConnected ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20' : 'bg-slate-100 text-slate-300'}`}>
                    {isConnected ? <Check size={40} strokeWidth={3} /> : <Smartphone size={40} />}
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                      {isConnected ? 'Instance Verified' : 'Awaiting Connection'}
                    </h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest opacity-70">Step 02: Verification Hub</p>
                  </div>

                  <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-200/60 relative group">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${liveStatus?.phone_number_id || 'pending'}`}
                          alt="QR"
                          className={`w-32 h-32 transition-all duration-700 ${isConnected ? 'opacity-100' : 'opacity-20 grayscale blur-[2px]'}`}
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Phone ID</p>
                        <p className="text-xs font-bold text-slate-500 font-mono tracking-tighter">{liveStatus?.phone_number_id || '---- ---- ----'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border ${isConnected ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'}`}></div>
                      <span className="text-[10px] font-black uppercase tracking-widest">{isConnected ? 'System Live' : 'Disconnected'}</span>
                    </div>

                    <div className="flex items-center justify-center gap-4">
                      <button onClick={() => setActiveStep(1)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-all">Previous Step</button>
                      <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                      <button onClick={() => setActiveStep(3)} className="text-[10px] font-black text-primary-light uppercase tracking-widest hover:underline">Activate Webhooks</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Webhooks */}
            {activeStep === 3 && (
              <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200/60 shadow-xl shadow-slate-200/20 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Webhook Sync</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest opacity-70">Step 03: Live Interaction</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                    <Zap size={24} />
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Callback URL</label>
                      <div className="relative group">
                        <input
                          readOnly
                          value={liveStatus?.webhook_url || `${API_BASE}/api/webhook`}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-primary focus:outline-none pr-12 truncate"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(liveStatus?.webhook_url || `${API_BASE}/api/webhook`);
                            alert('Copied!');
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-primary transition-all"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Verify Token</label>
                      <div className="relative group">
                        <input
                          readOnly
                          value={liveStatus?.verify_token || "whatsapp_token"}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-primary focus:outline-none pr-12 truncate"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(liveStatus?.verify_token || "whatsapp_token");
                            alert('Copied!');
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-primary transition-all"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 bg-slate-900 rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-primary-light">
                        <Shield size={28} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-lg font-black tracking-tight">Setup Required</h4>
                        <p className="text-[11px] text-slate-400 font-medium leading-relaxed max-w-xs">Enter these credentials into your Meta Developer Dashboard to activate live syncing.</p>
                      </div>
                    </div>
                    <a
                      href="https://developers.facebook.com/apps/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-8 py-3.5 bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all active:scale-95 flex items-center gap-2 shrink-0 shadow-xl"
                    >
                      Meta Dashboard <ExternalLink size={14} />
                    </a>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <button onClick={() => setActiveStep(2)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-all flex items-center gap-2">
                      <ChevronRight size={14} className="rotate-180" /> Back
                    </button>
                    <button
                      onClick={() => isConnected ? alert('Setup verified!') : alert('Please complete Step 1 first')}
                      className={`px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isConnected ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:brightness-110' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                    >
                      Complete Activation
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Help & Checklist */}
          <div className="xl:col-span-4 space-y-6">
            <div className="bg-white rounded-[2rem] p-8 border border-slate-200/60 shadow-xl shadow-slate-200/10 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <ShieldCheck size={20} />
                </div>
                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Partner Assurance</h4>
              </div>
              <div className="space-y-4">
                <p className="text-xs text-slate-500 font-bold leading-relaxed tracking-tight">
                  We are an authorized Meta Cloud Provider. Your API tokens and business data are protected by multi-layer encryption.
                </p>
                <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                  <CheckCircle2 size={14} />
                  GDPR & SOC2 Compliant
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] p-8 border border-slate-200/60 shadow-xl shadow-slate-200/10 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                  <AlertCircle size={20} />
                </div>
                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Setup Checklist</h4>
              </div>
              <div className="space-y-4">
                {[
                  { name: 'Developer Account', status: true },
                  { name: 'Verified WABA', status: true },
                  { name: 'Webhook Config', status: false },
                  { name: 'Live Verification', status: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{item.name}</span>
                    {item.status ? <Check size={14} className="text-emerald-500" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>}
                  </div>
                ))}
              </div>
              <button className="w-full py-4 bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                <Headphones size={14} />
                Need Assistance?
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
