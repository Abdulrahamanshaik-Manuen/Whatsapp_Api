import React, { useState, useEffect } from 'react';
import { 
  Smartphone, Shield, Zap, CheckCircle2, 
  ArrowRight, Globe, Code, MessageSquare,
  Lock, Copy, ExternalLink, Info
} from 'lucide-react';

export default function WhatsAppSetupPage({ userData, onUpdate }) {
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    phone_number_id: userData?.phone_number_id || '',
    waba_id: userData?.waba_id || '',
    access_token: userData?.access_token || ''
  });

  const [showManual, setShowManual] = useState(false);
  const [liveStatus, setLiveStatus] = useState(null);

  // Auto-detect success and fetch latest status
  useEffect(() => {
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
          // If already connected, jump to Step 2
          if (data.whatsapp_connected && activeStep === 1) {
            setActiveStep(2);
          }
          // Update the input fields with saved data
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

    fetchStatus();

    const params = new URLSearchParams(window.location.search);
    if (params.get('status') === 'whatsapp_connected') {
      setActiveStep(2);
      onUpdate();
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const API_BASE = window.location.origin.includes('localhost') 
    ? 'http://localhost:5000' 
    : window.location.origin;

  const handleMetaConnect = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/whatsapp/connect`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to Meta
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = async () => {
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
        alert('WhatsApp settings saved successfully!');
        onUpdate();
        setActiveStep(2);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, title: 'API Configuration', icon: Code, desc: 'Connect Meta Developer App' },
    { id: 2, title: 'Number Link', icon: Smartphone, desc: 'Verify WhatsApp Business' },
    { id: 3, title: 'Webhook Sync', icon: Zap, desc: 'Activate Real-time Sync' },
  ];

  return (
    <div className="h-full bg-[#F8FAFC] flex flex-col p-8 lg:p-12 space-y-12 overflow-y-auto custom-scrollbar">
      {/* Header & Stepper */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">WhatsApp <span className="text-indigo-600">Setup</span></h1>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest pl-1">Link your official business API in minutes</p>
        </div>

        {/* Custom Stepper */}
        <div className="flex items-center gap-4 bg-white p-4 rounded-[2.5rem] shadow-xl shadow-slate-200/20 border border-slate-100 overflow-x-auto no-scrollbar">
          {steps.map((step, i) => (
            <React.Fragment key={step.id}>
              <div 
                onClick={() => setActiveStep(step.id)}
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl cursor-pointer transition-all ${activeStep === step.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${activeStep === step.id ? 'bg-white/20' : 'bg-slate-100'}`}>
                  {activeStep > step.id ? <CheckCircle2 size={16} className="text-emerald-500" /> : step.id}
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest leading-none">{step.title}</p>
                  <p className={`text-[9px] font-bold mt-0.5 opacity-60 whitespace-nowrap ${activeStep === step.id ? 'text-white' : 'text-slate-400'}`}>{step.desc}</p>
                </div>
              </div>
              {i < steps.length - 1 && <ArrowRight size={14} className="text-slate-200" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        {/* Main Configuration Panel */}
        <div className="xl:col-span-2 space-y-10">
          {activeStep === 1 && (
            <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-2xl shadow-slate-200/40 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-16 h-16 bg-indigo-50 rounded-[1.5rem] flex items-center justify-center text-indigo-600">
                  <Globe size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800">Quick Connect</h3>
                  <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest mt-1">Automated onboarding via Meta Secure Login</p>
                </div>
              </div>

              <div className="p-12 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200 flex flex-col items-center text-center space-y-8">
                <div className="w-20 h-20 bg-white rounded-[2rem] shadow-xl flex items-center justify-center">
                  <Lock size={32} className="text-indigo-600" />
                </div>
                <div className="space-y-3 max-w-sm">
                  <h4 className="text-xl font-black text-slate-800">One-Click Onboarding</h4>
                  <p className="text-xs text-slate-400 font-bold leading-relaxed">Login with your Facebook account to automatically sync your Business Manager, WABA ID, and API tokens.</p>
                </div>
                <button 
                  onClick={handleMetaConnect}
                  className="px-12 py-5 bg-[#1877F2] text-white text-[11px] font-black uppercase tracking-widest rounded-3xl hover:bg-[#166fe5] transition-all shadow-xl shadow-[#1877F2]/20 active:scale-95 flex items-center gap-3"
                >
                  <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-[#1877F2]">
                    <span className="font-black text-lg -mt-1">f</span>
                  </div>
                  Connect with Meta
                </button>
              </div>

              <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                    <Code size={20} />
                  </div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Direct API Configuration</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Phone Number ID</label>
                    <input 
                      type="text" 
                      value={settings.phone_number_id}
                      onChange={e => setSettings({...settings, phone_number_id: e.target.value})}
                      placeholder="Paste Phone ID from Meta" 
                      className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all placeholder:text-slate-300"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Business Account ID (WABA)</label>
                    <input 
                      type="text" 
                      value={settings.waba_id}
                      onChange={e => setSettings({...settings, waba_id: e.target.value})}
                      placeholder="Paste WABA ID from Meta" 
                      className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all placeholder:text-slate-300"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Permanent Access Token</label>
                    <div className="relative">
                      <input 
                        type="password" 
                        value={settings.access_token}
                        onChange={e => setSettings({...settings, access_token: e.target.value})}
                        placeholder="Paste Token from Meta" 
                        className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all placeholder:text-slate-300"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <button 
                      onClick={handleSaveSettings}
                      disabled={loading}
                      className="px-12 py-5 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest rounded-3xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center gap-3"
                    >
                      {loading ? 'Connecting...' : 'Save & Connect WhatsApp'} <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-2xl shadow-slate-200/40 space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="flex items-center gap-4 mb-2">
                <div className={`w-16 h-16 ${liveStatus?.whatsapp_connected || userData?.whatsapp_connected ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'} rounded-[1.5rem] flex items-center justify-center`}>
                  <Smartphone size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800">Connection Status</h3>
                  <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest mt-1">
                    {(liveStatus?.whatsapp_connected || userData?.whatsapp_connected) ? 'Your business number is officially linked' : 'Complete the API setup to link your number'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center py-10 space-y-8 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
                <div className="w-48 h-48 bg-white p-4 rounded-[2rem] shadow-xl border border-slate-100 relative group overflow-hidden">
                  <div className={`absolute inset-0 ${(liveStatus?.whatsapp_connected || userData?.whatsapp_connected) ? 'bg-emerald-500/5' : 'bg-slate-500/5'} animate-pulse`}></div>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${liveStatus?.phone_number_id || userData?.phone_number_id || 'pending'}`} alt="QR Code" className="w-full h-full relative z-10 opacity-40 grayscale" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center p-6 space-y-2">
                    {(liveStatus?.whatsapp_connected || userData?.whatsapp_connected) ? <CheckCircle2 size={40} className="text-emerald-500" /> : <Info size={40} className="text-slate-300" />}
                    <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                      {(liveStatus?.whatsapp_connected || userData?.whatsapp_connected) ? 'Verified' : 'Pending'}
                    </p>
                  </div>
                </div>
                <div className="text-center space-y-2 max-w-sm">
                  <h4 className="text-lg font-black text-slate-800 leading-tight">
                    {(liveStatus?.whatsapp_connected || userData?.whatsapp_connected) ? `Active ID: ${liveStatus?.phone_number_id || userData?.phone_number_id}` : 'No Active Instance'}
                  </h4>
                  <p className="text-xs text-slate-400 font-bold leading-relaxed px-4">
                    {(liveStatus?.whatsapp_connected || userData?.whatsapp_connected) 
                      ? 'Your number is successfully verified and linked to our cloud API cluster.' 
                      : 'Please enter your credentials in Step 1 to activate your WhatsApp instance.'}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-2 px-6 py-3 ${(liveStatus?.whatsapp_connected || userData?.whatsapp_connected) ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'} rounded-2xl border`}>
                    <div className={`w-2 h-2 ${(liveStatus?.whatsapp_connected || userData?.whatsapp_connected) ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'} rounded-full`}></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {(liveStatus?.whatsapp_connected || userData?.whatsapp_connected) ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                  {(liveStatus?.whatsapp_connected || userData?.whatsapp_connected) && (
                    <button className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline">Disconnect Number</button>
                  )}
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <button onClick={() => setActiveStep(1)} className="px-10 py-5 bg-white text-slate-400 text-[11px] font-black uppercase tracking-widest rounded-3xl hover:bg-slate-50 transition-all border border-slate-200">Back</button>
                <button onClick={() => setActiveStep(3)} className="px-12 py-5 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest rounded-3xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20">Next Step</button>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-2xl shadow-slate-200/40 space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="flex items-center gap-4 mb-2">
                <div className="w-16 h-16 bg-amber-50 rounded-[1.5rem] flex items-center justify-center text-amber-600">
                  <Zap size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800">Webhook Integration</h3>
                  <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest mt-1">Receive real-time messages and status updates</p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Webhook Callback URL</label>
                  <div className="flex gap-3">
                    <input 
                      readOnly
                      value={liveStatus?.webhook_url || userData?.webhook_url || `${API_BASE}/api/webhook`} 
                      className="flex-1 px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-black text-indigo-600 select-all focus:outline-none"
                    />
                    <button 
                      onClick={() => {
                        const url = liveStatus?.webhook_url || userData?.webhook_url || `${API_BASE}/api/webhook`;
                        navigator.clipboard.writeText(url);
                        alert('Copied to clipboard!');
                      }}
                      className="px-6 py-5 bg-white text-slate-400 rounded-3xl border border-slate-200 hover:text-indigo-600 transition-all"
                    >
                      <Copy size={20} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Verify Token</label>
                  <div className="flex gap-3">
                    <input 
                      readOnly
                      value={liveStatus?.verify_token || userData?.verify_token || "whatsapp_token"} 
                      className="flex-1 px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-black text-indigo-600 select-all focus:outline-none"
                    />
                    <button 
                      onClick={() => {
                        const token = liveStatus?.verify_token || userData?.verify_token || "whatsapp_token";
                        navigator.clipboard.writeText(token);
                        alert('Copied to clipboard!');
                      }}
                      className="px-6 py-5 bg-white text-slate-400 rounded-3xl border border-slate-200 hover:text-indigo-600 transition-all"
                    >
                      <Copy size={20} />
                    </button>
                  </div>
                </div>

                <div className="p-10 bg-slate-900 rounded-[3rem] text-white relative overflow-hidden">
                  <div className="absolute bottom-0 right-0 p-8 opacity-10">
                    <Shield size={120} />
                  </div>
                  <div className="relative z-10 space-y-6">
                    <h5 className="text-lg font-black tracking-tight">Security Check Required</h5>
                    <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-md">Copy the credentials above and paste them into your Meta Developer App → WhatsApp → Configuration section.</p>
                    <a 
                      href="https://developers.facebook.com/apps/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-indigo-400 text-xs font-black uppercase tracking-widest hover:text-indigo-300 transition-all"
                    >
                      Go to Meta Dashboard <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <button onClick={() => setActiveStep(2)} className="px-10 py-5 bg-white text-slate-400 text-[11px] font-black uppercase tracking-widest rounded-3xl hover:bg-slate-50 transition-all border border-slate-200">Back</button>
                <button 
                  onClick={() => userData?.whatsapp_connected ? alert('WhatsApp CRM is already active!') : alert('Please finish the setup in Step 1 & 2 first!')} 
                  className={`px-16 py-5 ${userData?.whatsapp_connected ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-slate-200 text-slate-400 cursor-not-allowed'} text-white text-[11px] font-black uppercase tracking-widest rounded-3xl transition-all shadow-xl active:scale-95`}
                >
                  Complete Setup
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Help */}
        <div className="space-y-8">
          <div className="p-10 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[3rem] shadow-2xl text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all duration-700"></div>
            <div className="relative z-10 space-y-6">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <Shield size={24} className="text-indigo-200" />
              </div>
              <div className="space-y-2">
                <h4 className="text-2xl font-black leading-tight">Official Meta<br />Business Partner</h4>
                <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest opacity-80 leading-relaxed">Your data is secured with Enterprise Grade Encryption</p>
              </div>
            </div>
          </div>

          <div className="p-10 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/20 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                <Info size={20} />
              </div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Pre-setup Checklist</h4>
            </div>
            <ul className="space-y-6">
              {[
                { title: 'Meta Developer App', status: true },
                { title: 'Verified Business ID', status: true },
                { title: 'Payment Method Linked', status: false },
                { title: 'Privacy Policy URL', status: false },
              ].map((item, i) => (
                <li key={i} className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{item.title}</span>
                  {item.status ? (
                    <div className="w-5 h-5 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500">
                      <CheckCircle2 size={12} />
                    </div>
                  ) : (
                    <div className="w-5 h-5 bg-slate-50 rounded-lg border border-slate-100"></div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
