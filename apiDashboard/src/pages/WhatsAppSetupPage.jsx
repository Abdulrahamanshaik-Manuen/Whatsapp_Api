import React, { useState, useEffect } from 'react';
import {
  Smartphone, Shield, Zap, CheckCircle2,
  ArrowRight, Globe, Code, MessageSquare,
  Lock, Copy, ExternalLink, Info, Check,
  Settings as SettingsIcon, Wand2, ShieldCheck,
  ChevronRight, AlertCircle, RefreshCcw, Headphones,
  Server, Link2, Activity, Database, ChevronDown, ChevronUp
} from 'lucide-react';

export default function WhatsAppSetupPage({ userData, onUpdate }) {
  const [liveStatus, setLiveStatus] = useState(() => {
    const saved = localStorage.getItem('whatsapp_liveStatus');
    return saved ? JSON.parse(saved) : null;
  });

  const isConnected = liveStatus?.whatsapp_connected || userData?.whatsapp_connected;
  const [view, setView] = useState(isConnected ? 'success' : 'setup');
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [settings, setSettings] = useState({
    phone_number_id: userData?.phone_number_id || '',
    waba_id: userData?.waba_id || '',
    access_token: userData?.access_token || ''
  });

  const API_BASE = window.location.origin.includes('localhost')
    ? 'http://localhost:5000'
    : window.location.origin;

  useEffect(() => {
    fetchStatus();
    const params = new URLSearchParams(window.location.search);
    if (params.get('status') === 'whatsapp_connected') {
      setActiveStep(2);
      onUpdate();
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

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
        localStorage.setItem('whatsapp_liveStatus', JSON.stringify(data));
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
      if (data.url) window.location.href = data.url;
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
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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

  const copyToClipboard = (value, key) => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const steps = [
    { id: 1, label: 'API Config' },
    { id: 2, label: 'Number' },
    { id: 3, label: 'Webhook' },
  ];

  // Compact inline copy field
  const CopyField = ({ label, value, masked = false, id }) => {
    const display = masked && value && value.length > 10
      ? `${value.substring(0, 14)}${'•'.repeat(16)}`
      : (value || '—');
    const isCopied = copiedKey === id;
    return (
      <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0 group">
        <div className="min-w-0 flex-1 mr-3">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
          <p className="text-xs font-semibold text-slate-700 truncate font-mono">{display}</p>
        </div>
        <button
          onClick={() => copyToClipboard(value, id)}
          title="Copy"
          className={`shrink-0 w-7 h-7 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
            isCopied
              ? 'bg-emerald-50 border-emerald-200 text-emerald-500'
              : 'bg-white border-slate-200 text-slate-400 hover:text-[#004277] hover:border-[#004277]/30'
          }`}
        >
          {isCopied ? <Check size={11} strokeWidth={3} /> : <Copy size={11} />}
        </button>
      </div>
    );
  };

  // Compact stepper bar
  const Stepper = () => (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => {
        const done = activeStep > step.id;
        const active = activeStep === step.id;
        return (
          <React.Fragment key={step.id}>
            <button
              onClick={() => setActiveStep(step.id)}
              className={`flex items-center gap-1.5 px-2.5 h-7 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                active
                  ? 'bg-[#004277] text-white'
                  : done
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span className={`w-4 h-4 rounded flex items-center justify-center text-[9px] font-black ${
                active ? 'bg-white/20' : done ? 'bg-emerald-100' : 'bg-slate-100'
              }`}>
                {done ? <Check size={9} strokeWidth={3.5} /> : step.id}
              </span>
              <span>{step.label}</span>
            </button>
            {i < steps.length - 1 && (
              <ChevronRight size={12} className={`text-slate-300 shrink-0 ${done ? 'text-emerald-300' : ''}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  // Success / Connected View
  const SuccessView = () => {
    const timeline = [
      { label: 'API Configured', done: true },
      { label: 'Number Linked', done: isConnected },
      { label: 'Webhook Active', done: !!(liveStatus?.webhook_url) },
      { label: 'System Live', done: isConnected && !!(liveStatus?.webhook_url) },
    ];

    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-400">

        {/* Status banner */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center border border-emerald-100">
              <CheckCircle2 size={18} className="text-emerald-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">WhatsApp Connected</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Business API integration is live and active</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest">Active</span>
            </div>
            <button
              onClick={() => setView('setup')}
              className="flex items-center gap-1.5 h-8 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-[10px] font-bold rounded-lg transition-all cursor-pointer shadow-sm"
            >
              <SettingsIcon size={12} />
              <span>Edit</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Credentials Panel */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <Database size={13} className="text-[#004277]" />
              <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">API Credentials</h4>
            </div>
            <div className="px-4 pb-1">
              <CopyField id="phone" label="Phone Number ID" value={liveStatus?.phone_number_id || settings.phone_number_id} />
              <CopyField id="waba" label="WABA Account ID" value={liveStatus?.waba_id || settings.waba_id} />
              <CopyField id="webhook" label="Webhook URL" value={liveStatus?.webhook_url || `${API_BASE}/api/webhook`} />
              <CopyField id="token_verify" label="Verify Token" value={liveStatus?.verify_token || "whatsapp_token"} />
              <CopyField id="token_access" label="Access Token" value={liveStatus?.access_token || settings.access_token} masked />
            </div>
          </div>

          {/* Status Timeline */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <Activity size={13} className="text-[#004277]" />
              <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Connection Status</h4>
            </div>
            <div className="p-4 space-y-3">
              {timeline.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    item.done ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-300'
                  }`}>
                    {item.done ? <Check size={10} strokeWidth={3} /> : <span className="text-[8px] font-black">{i + 1}</span>}
                  </div>
                  <span className={`text-xs font-semibold ${item.done ? 'text-slate-700' : 'text-slate-400'}`}>{item.label}</span>
                  {item.done && <span className="ml-auto text-[9px] text-emerald-500 font-bold uppercase">✓</span>}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-4">

        {/* Page Header — single, compact */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">WhatsApp Setup</h1>
            <p className="text-xs text-slate-400 font-semibold mt-2 leading-none">Configure your WhatsApp Business API</p>
          </div>

          {/* Stepper — only in setup mode */}
          {view === 'setup' && (
            <div className="shrink-0">
              <Stepper />
            </div>
          )}

          {/* In success mode show reconnect */}
          {view === 'success' && (
            <button
              onClick={fetchStatus}
              className="flex items-center gap-1.5 h-8 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-bold rounded-lg transition-all cursor-pointer shadow-sm shrink-0"
            >
              <RefreshCcw size={12} />
              <span>Refresh Status</span>
            </button>
          )}
        </div>

        {view === 'success' ? (
          <SuccessView />
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

            {/* Main Step Panel */}
            <div className="xl:col-span-2">

              {/* Step 1: API Config */}
              {activeStep === 1 && (
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-400">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                    <div className="w-6 h-6 bg-[#004277]/10 rounded-md flex items-center justify-center">
                      <Code size={12} className="text-[#004277]" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-800">API Integration</h3>
                      <p className="text-[9px] text-slate-400 font-semibold">Step 1 · Secure Connection</p>
                    </div>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Meta OAuth button */}
                    <div className="p-4 bg-slate-900 rounded-lg flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">One-Click Meta Integration</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">Sync your Business Manager automatically</p>
                      </div>
                      <button
                        onClick={handleMetaConnect}
                        className="shrink-0 h-9 px-4 bg-[#1877F2] text-white text-xs font-bold rounded-lg hover:brightness-110 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                      >
                        <Globe size={13} />
                        Connect with Meta
                      </button>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-slate-100" />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Or manual setup</span>
                      <div className="flex-1 h-px bg-slate-100" />
                    </div>

                    {/* Manual fields */}
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Phone Number ID</label>
                        <input
                          type="text"
                          value={settings.phone_number_id}
                          onChange={e => setSettings({ ...settings, phone_number_id: e.target.value })}
                          placeholder="e.g. 123456789012345"
                          className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-[#004277] focus:ring-1 focus:ring-[#004277]/10 outline-none transition-all placeholder:text-slate-300"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5">WABA Account ID</label>
                        <input
                          type="text"
                          value={settings.waba_id}
                          onChange={e => setSettings({ ...settings, waba_id: e.target.value })}
                          placeholder="e.g. 987654321098765"
                          className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-[#004277] focus:ring-1 focus:ring-[#004277]/10 outline-none transition-all placeholder:text-slate-300"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Access Token</label>
                        <input
                          type="password"
                          value={settings.access_token}
                          onChange={e => setSettings({ ...settings, access_token: e.target.value })}
                          placeholder="EAAxxxx..."
                          className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-[#004277] focus:ring-1 focus:ring-[#004277]/10 outline-none transition-all placeholder:text-slate-300"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleSaveSettings}
                      disabled={loading}
                      className="w-full h-9 bg-[#004277] hover:brightness-105 text-white text-xs font-bold rounded-lg transition-all active:scale-98 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? <RefreshCcw size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
                      Save & Continue
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Number Link / QR */}
              {activeStep === 2 && (
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-400">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                    <div className="w-6 h-6 bg-emerald-50 rounded-md flex items-center justify-center">
                      <Smartphone size={12} className="text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-800">Number Verification</h3>
                      <p className="text-[9px] text-slate-400 font-semibold">Step 2 · Verify Account</p>
                    </div>
                    <div className="ml-auto">
                      {isConnected ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 text-[9px] font-black uppercase tracking-widest">
                          <Check size={9} strokeWidth={3} /> Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full border border-amber-100 text-[9px] font-black uppercase tracking-widest">
                          <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                          Awaiting
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex flex-col items-center gap-5">
                      {/* QR Code */}
                      <div className={`p-3 bg-white border rounded-xl shadow-sm ${isConnected ? 'border-emerald-200' : 'border-slate-200'}`}>
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${liveStatus?.phone_number_id || 'pending'}`}
                          alt="WhatsApp QR"
                          className={`w-32 h-32 transition-all duration-500 ${isConnected ? 'opacity-100' : 'opacity-30 grayscale blur-[1.5px]'}`}
                        />
                      </div>

                      <div className="text-center space-y-1">
                        <h4 className="text-sm font-bold text-slate-800">
                          {isConnected ? 'Instance Verified ✓' : 'Scan with WhatsApp'}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-semibold">
                          {isConnected
                            ? 'Your number is linked and ready.'
                            : 'Open WhatsApp → Linked Devices → Link a Device'}
                        </p>
                      </div>

                      <div className="w-full flex gap-2">
                        <button
                          onClick={() => setActiveStep(1)}
                          className="flex-1 h-8 bg-white border border-slate-200 text-slate-500 text-xs font-bold rounded-lg hover:bg-slate-50 transition-all cursor-pointer"
                        >
                          ← Back
                        </button>
                        <button
                          onClick={() => setActiveStep(3)}
                          disabled={!isConnected}
                          className={`flex-1 h-8 text-xs font-bold rounded-lg transition-all ${
                            isConnected
                              ? 'bg-[#004277] text-white hover:brightness-105 cursor-pointer active:scale-98'
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          Next: Webhook →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Webhook */}
              {activeStep === 3 && (
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-400">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                    <div className="w-6 h-6 bg-amber-50 rounded-md flex items-center justify-center">
                      <Zap size={12} className="text-amber-500" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-800">Webhook Sync</h3>
                      <p className="text-[9px] text-slate-400 font-semibold">Step 3 · Live Activation</p>
                    </div>
                  </div>

                  <div className="p-4 space-y-4">
                    <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                      Add these values to your Meta App → WhatsApp → Configuration → Webhook section.
                    </p>

                    {/* Callback URL */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Callback URL</label>
                      <div className="relative group flex">
                        <input
                          readOnly
                          value={liveStatus?.webhook_url || `${API_BASE}/api/webhook`}
                          className="flex-1 h-9 pl-3 pr-10 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-[#004277] focus:outline-none truncate font-mono"
                        />
                        <button
                          onClick={() => copyToClipboard(liveStatus?.webhook_url || `${API_BASE}/api/webhook`, 'cb_url')}
                          className={`absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded flex items-center justify-center transition-all cursor-pointer ${copiedKey === 'cb_url' ? 'text-emerald-500' : 'text-slate-400 hover:text-[#004277]'}`}
                        >
                          {copiedKey === 'cb_url' ? <Check size={11} strokeWidth={3} /> : <Copy size={11} />}
                        </button>
                      </div>
                    </div>

                    {/* Verify Token */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Verify Token</label>
                      <div className="relative flex">
                        <input
                          readOnly
                          value={liveStatus?.verify_token || "whatsapp_token"}
                          className="flex-1 h-9 pl-3 pr-10 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-[#004277] focus:outline-none truncate font-mono"
                        />
                        <button
                          onClick={() => copyToClipboard(liveStatus?.verify_token || "whatsapp_token", 'verify_tok')}
                          className={`absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded flex items-center justify-center transition-all cursor-pointer ${copiedKey === 'verify_tok' ? 'text-emerald-500' : 'text-slate-400 hover:text-[#004277]'}`}
                        >
                          {copiedKey === 'verify_tok' ? <Check size={11} strokeWidth={3} /> : <Copy size={11} />}
                        </button>
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg flex gap-2 text-[#004277]">
                      <AlertCircle size={13} className="shrink-0 mt-0.5 text-blue-400" />
                      <p className="text-[10px] font-semibold leading-relaxed">Subscribe to the <strong>messages</strong> field under Webhook Fields in your Meta App Dashboard.</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setActiveStep(2)}
                        className="flex-1 h-9 bg-white border border-slate-200 text-slate-500 text-xs font-bold rounded-lg hover:bg-slate-50 transition-all cursor-pointer"
                      >
                        ← Back
                      </button>
                      <button
                        onClick={() => {
                          if (isConnected) setView('success');
                          else alert('Connection not detected yet. Ensure your Meta settings are correct.');
                        }}
                        className={`flex-2 h-9 px-5 text-xs font-bold rounded-lg transition-all active:scale-98 ${
                          isConnected
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600 cursor-pointer shadow-sm'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {isConnected ? 'Finish Setup ✓' : 'Awaiting Connection...'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Collapsible Help Panel */}
            <div className="xl:col-span-1 space-y-3">

              {/* Help Panel */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <button
                  onClick={() => setShowHelp(!showHelp)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Headphones size={13} className="text-[#004277]" />
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Need Help?</span>
                  </div>
                  {showHelp ? <ChevronUp size={13} className="text-slate-400" /> : <ChevronDown size={13} className="text-slate-400" />}
                </button>

                {showHelp && (
                  <div className="px-4 pb-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                      Keep your Meta Developer Dashboard open in another tab while completing setup.
                    </p>
                    <a
                      href="https://developers.facebook.com/apps/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 h-8 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all w-full cursor-pointer"
                    >
                      <ExternalLink size={11} />
                      Open Meta Dashboard
                    </a>
                    <a
                      href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 h-8 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all w-full cursor-pointer"
                    >
                      <Globe size={11} />
                      View Documentation
                    </a>
                  </div>
                )}
              </div>

              {/* Quick Step Summary */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 space-y-3">
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Setup Progress</h4>
                {steps.map((step) => {
                  const done = activeStep > step.id;
                  const active = activeStep === step.id;
                  return (
                    <div key={step.id} className="flex items-center gap-2.5">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[9px] font-black ${
                        done ? 'bg-emerald-500 text-white' : active ? 'bg-[#004277] text-white' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {done ? <Check size={10} strokeWidth={3} /> : step.id}
                      </div>
                      <span className={`text-xs font-semibold ${done ? 'text-emerald-600 line-through' : active ? 'text-slate-800' : 'text-slate-400'}`}>
                        {step.label}
                      </span>
                      {active && <span className="ml-auto text-[9px] text-[#004277] font-black">Current</span>}
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
