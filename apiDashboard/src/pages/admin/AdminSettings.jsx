import React, { useState, useEffect } from 'react';
import {
  Shield, Globe, Database, Save, AlertCircle, Lock, Eye, EyeOff,
  Terminal, RefreshCw, Trash2, Activity, Loader2, Palette,
  Layout, Smartphone, BellRing, UserPlus, Sliders, CheckCircle2,
  Image as ImageIcon, Type, Link as LinkIcon, ShieldCheck, X,
  ChevronRight, Settings2, Cpu, Key, Server, Webhook, User,
  Mail, FileText, MapPin
} from 'lucide-react';

export default function AdminSettings() {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [activeTab, setActiveTab] = useState('Branding');
  const [showSecrets, setShowSecrets] = useState({});

  const tabs = [
    { id: 'Branding', label: 'Company Branding', icon: Palette },
    { id: 'Limits', label: 'Limits & Maintenance', icon: Sliders },
    { id: 'Meta', label: 'Meta API', icon: Globe },
    { id: 'Webhooks', label: 'Webhooks', icon: Webhook },
    { id: 'Security', label: 'Security', icon: Shield },
    { id: 'Infrastructure', label: 'Infrastructure', icon: Server },
    { id: 'Admins', label: 'Admins', icon: UserPlus },
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setConfig(data || {});
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch settings:", err);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/settings', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });
      
      if (response.ok) {
        alert("Configuration saved successfully!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setSaving(false), 800);
    }
  };

  const handleChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const toggleSecret = (key) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F9FAFB]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-primary" size={40} strokeWidth={2.5} />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Initializing Core</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F9FAFB] overflow-hidden">
      
      {/* Header Section */}
      <div className="px-8 pt-8 pb-2 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-primary tracking-tight">Admin Settings</h1>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Global platform configuration & infrastructure nodes</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-3 bg-[#003B6D] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-lg shadow-[#003B6D]/20 active:scale-95 flex items-center gap-2"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Syncing...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto custom-scrollbar px-8 py-6">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Sidebar Navigation - Matching Client Settings */}
            <div className="lg:col-span-3">
              <div className="bg-white p-2 rounded-[1.5rem] border border-slate-100 shadow-sm animate-in fade-in slide-in-from-left duration-300">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-300 ${activeTab === tab.id 
                      ? 'bg-primary text-white shadow-xl shadow-primary/20' 
                      : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
                  >
                    <tab.icon size={16} strokeWidth={activeTab === tab.id ? 2.5 : 2} className="shrink-0" />
                    <span className={`whitespace-nowrap text-[8.5px] font-black uppercase tracking-widest ${activeTab === tab.id ? 'opacity-100' : 'opacity-70'}`}>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-9">
              <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
                
                {/* Branding Tab */}
                {activeTab === 'Branding' && (
                  <div className="p-10 space-y-10 animate-in fade-in duration-500">
                    <div className="flex items-center gap-6 pb-8 border-b border-slate-50">
                      <div className="w-16 h-16 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center border border-pink-100">
                        <Palette size={28} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-[#003B6D] tracking-tight">Company Branding</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Configure White-Label parameters & PDF invoice headers</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company Name</label>
                        <div className="relative group/input">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                            <Type size={16} />
                          </div>
                          <input 
                            type="text"
                            value={config.COMPANY_NAME || ''}
                            onChange={(e) => handleChange('COMPANY_NAME', e.target.value)}
                            placeholder="Maneun Infotech (OPC) Private Limited"
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none" 
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Support Email</label>
                        <div className="relative group/input">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                            <Mail size={16} />
                          </div>
                          <input 
                            type="email"
                            value={config.SUPPORT_EMAIL || ''}
                            onChange={(e) => handleChange('SUPPORT_EMAIL', e.target.value)}
                            placeholder="support@maneun.com"
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none" 
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Support Phone</label>
                        <div className="relative group/input">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                            <Smartphone size={16} />
                          </div>
                          <input 
                            type="text"
                            value={config.SUPPORT_PHONE || ''}
                            onChange={(e) => handleChange('SUPPORT_PHONE', e.target.value)}
                            placeholder="+91 9876543210"
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none" 
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tax/GST Number</label>
                        <div className="relative group/input">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                            <FileText size={16} />
                          </div>
                          <input 
                            type="text"
                            value={config.COMPANY_TAX_NUMBER || ''}
                            onChange={(e) => handleChange('COMPANY_TAX_NUMBER', e.target.value)}
                            placeholder="37AAAAA1111A1Z1"
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none" 
                          />
                        </div>
                      </div>

                      <div className="space-y-3 col-span-full">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company Address</label>
                        <div className="relative group/input">
                          <div className="absolute left-5 top-6 text-slate-300">
                            <MapPin size={16} />
                          </div>
                          <textarea 
                            rows="3" 
                            value={config.COMPANY_ADDRESS || ''}
                            onChange={(e) => handleChange('COMPANY_ADDRESS', e.target.value)}
                            placeholder="123 Corporate Node, Tech Park, India"
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none leading-relaxed"
                          ></textarea>
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-slate-50">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-4 block">Visual Identity Assets</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col items-center gap-3 text-center group/logo cursor-pointer hover:bg-white transition-all">
                          <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover/logo:text-primary transition-colors">
                            <ImageIcon size={24} />
                          </div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Admin Logo</p>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col items-center gap-3 text-center group/logo cursor-pointer hover:bg-white transition-all">
                          <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover/logo:text-primary transition-colors">
                            <ImageIcon size={24} />
                          </div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Favicon</p>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col items-center gap-3 text-center group/logo cursor-pointer hover:bg-white transition-all">
                          <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover/logo:text-primary transition-colors">
                            <Palette size={24} />
                          </div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Primary Theme</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Limits & Maintenance Tab */}
                {activeTab === 'Limits' && (
                  <div className="p-10 space-y-10 animate-in fade-in duration-500">
                    <div className="flex items-center gap-6 pb-8 border-b border-slate-50">
                      <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-100">
                        <Sliders size={28} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-[#003B6D] tracking-tight">Limits & Maintenance</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Configure global constraints & system switches</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center">
                            <AlertCircle size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900">Maintenance Mode</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Platform offline for scheduled node operations</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={!!config.MAINTENANCE_MODE}
                            onChange={(e) => handleChange('MAINTENANCE_MODE', e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                        </label>
                      </div>

                      <div className="pt-4 space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Default Contact Limit</label>
                        <div className="relative group/input">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                            <User size={16} />
                          </div>
                          <input 
                            type="number"
                            value={config.DEFAULT_CONTACT_LIMIT || ''}
                            onChange={(e) => handleChange('DEFAULT_CONTACT_LIMIT', parseInt(e.target.value) || 0)}
                            placeholder="5000"
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Meta API Configuration */}
                {activeTab === 'Meta' && (
                  <div className="p-10 space-y-10 animate-in fade-in duration-500">
                    <div className="flex items-center gap-6 pb-8 border-b border-slate-50">
                      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100">
                        <Globe size={28} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-[#003B6D] tracking-tight">Meta Infrastructure</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Core Graph API & WhatsApp Credentials</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Meta App ID</label>
                        <div className="relative">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                            <Terminal size={16} />
                          </div>
                          <input 
                            type="text"
                            value={config.APP_ID || ''}
                            onChange={(e) => handleChange('APP_ID', e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none" 
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">App Secret</label>
                        <div className="relative group/input">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                            <Lock size={16} />
                          </div>
                          <input 
                            type={showSecrets.APP_SECRET ? 'text' : 'password'}
                            value={config.APP_SECRET || ''}
                            onChange={(e) => handleChange('APP_SECRET', e.target.value)}
                            className="w-full pl-14 pr-14 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none" 
                          />
                          <button 
                            type="button"
                            onClick={() => toggleSecret('APP_SECRET')}
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary transition-colors"
                          >
                            {showSecrets.APP_SECRET ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WABA ID</label>
                        <div className="relative">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                            <Cpu size={16} />
                          </div>
                          <input 
                            type="text"
                            value={config.WHATSAPP_BUSINESS_ACCOUNT_ID || ''}
                            onChange={(e) => handleChange('WHATSAPP_BUSINESS_ACCOUNT_ID', e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none" 
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone ID</label>
                        <div className="relative">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                            <Smartphone size={16} />
                          </div>
                          <input 
                            type="text"
                            value={config.PHONE_NUMBER_ID || ''}
                            onChange={(e) => handleChange('PHONE_NUMBER_ID', e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none" 
                          />
                        </div>
                      </div>

                      <div className="space-y-3 col-span-full">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Token</label>
                        <div className="relative">
                          <div className="absolute left-5 top-6 text-slate-300">
                            <Key size={16} />
                          </div>
                          <textarea 
                            rows="4" 
                            value={config.ACCESSTOKEN || ''}
                            onChange={(e) => handleChange('ACCESSTOKEN', e.target.value)}
                            style={{ WebkitTextSecurity: showSecrets.ACCESSTOKEN ? 'none' : 'disc' }}
                            className="w-full pl-14 pr-14 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-mono font-bold text-slate-700 focus:bg-white transition-all outline-none leading-relaxed"
                          ></textarea>
                          <button 
                            type="button"
                            onClick={() => toggleSecret('ACCESSTOKEN')}
                            className="absolute right-5 top-5 text-slate-300 hover:text-primary transition-colors"
                          >
                            {showSecrets.ACCESSTOKEN ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Webhooks Configuration */}
                {activeTab === 'Webhooks' && (
                  <div className="p-10 space-y-10 animate-in fade-in duration-500">
                    <div className="flex items-center gap-6 pb-8 border-b border-slate-50">
                      <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center border border-purple-100">
                        <Webhook size={28} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-[#003B6D] tracking-tight">Webhooks & Routing</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Endpoint nodes for real-time events</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                      {[
                        { label: 'Verify Token', key: 'WEBHOOKVERIFYTOKEN', icon: Shield },
                        { label: 'Callback URL', key: 'WEBHOOKCALLBACKURL', icon: LinkIcon },
                        { label: 'Meta Redirect', key: 'META_REDIRECT_URI', icon: Globe },
                        { label: 'Frontend Node', key: 'FRONTEND_URL', icon: Smartphone }
                      ].map(field => (
                        <div key={field.key} className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                          <div className="relative">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                              <field.icon size={16} />
                            </div>
                            <input 
                              type="text"
                              value={config[field.key] || ''}
                              onChange={(e) => handleChange(field.key, e.target.value)}
                              className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none" 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Security Configuration */}
                {activeTab === 'Security' && (
                  <div className="p-10 space-y-10 animate-in fade-in duration-500">
                    <div className="flex items-center gap-6 pb-8 border-b border-slate-50">
                      <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100">
                        <Shield size={28} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-[#003B6D] tracking-tight">Security Protocol</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Authentication & encryption nodes</p>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">JWT Secret Node</label>
                        <div className="relative group/input">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                            <Lock size={16} />
                          </div>
                          <input 
                            type={showSecrets.JWT_SECRET ? 'text' : 'password'}
                            value={config.JWT_SECRET || ''}
                            onChange={(e) => handleChange('JWT_SECRET', e.target.value)}
                            className="w-full pl-14 pr-14 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none" 
                          />
                          <button 
                            type="button"
                            onClick={() => toggleSecret('JWT_SECRET')}
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary transition-colors"
                          >
                            {showSecrets.JWT_SECRET ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-6">
                        {[
                          { label: 'Token TTL', key: 'JWT_EXPIRY', icon: Key },
                          { label: 'OTP TTL', key: 'OTP_EXPIRY', icon: RefreshCw },
                          { label: 'Max Attempts', key: 'MAX_OTP_ATTEMPTS', type: 'number', icon: AlertCircle }
                        ].map(field => (
                          <div key={field.key} className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                            <div className="relative">
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                                <field.icon size={14} />
                              </div>
                              <input 
                                type={field.type || 'text'}
                                value={config[field.key] || ''}
                                onChange={(e) => handleChange(field.key, e.target.value)}
                                className="w-full pl-11 pr-3 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black text-slate-900 focus:bg-white transition-all outline-none" 
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Global Admin Email</label>
                        <div className="relative">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                            <User size={16} />
                          </div>
                          <input 
                            type="email"
                            value={config.USER_EMAIL || ''}
                            onChange={(e) => handleChange('USER_EMAIL', e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Infrastructure Configuration */}
                {activeTab === 'Infrastructure' && (
                  <div className="p-10 space-y-10 animate-in fade-in duration-500">
                    <div className="flex items-center gap-6 pb-8 border-b border-slate-50">
                      <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center border border-orange-100">
                        <Server size={28} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-[#003B6D] tracking-tight">Data & Assets</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Persistence & media nodes</p>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">MongoDB Connection (MONGO_URI)</label>
                        <div className="relative group/input">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                            <Database size={16} />
                          </div>
                          <input 
                            type={showSecrets.MONGO_URI ? 'text' : 'password'}
                            value={config.MONGO_URI || ''}
                            onChange={(e) => handleChange('MONGO_URI', e.target.value)}
                            className="w-full pl-14 pr-14 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none" 
                          />
                          <button 
                            type="button"
                            onClick={() => toggleSecret('MONGO_URI')}
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary transition-colors"
                          >
                            {showSecrets.MONGO_URI ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Redis Cache (REDIS_URI)</label>
                        <div className="relative group/input">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                            <Server size={16} />
                          </div>
                          <input 
                            type={showSecrets.REDIS_URI ? 'text' : 'password'}
                            value={config.REDIS_URI || ''}
                            onChange={(e) => handleChange('REDIS_URI', e.target.value)}
                            className="w-full pl-14 pr-14 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none" 
                          />
                          <button 
                            type="button"
                            onClick={() => toggleSecret('REDIS_URI')}
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary transition-colors"
                          >
                            {showSecrets.REDIS_URI ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cloudinary Key</label>
                          <div className="relative">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                              <Key size={16} />
                            </div>
                            <input 
                              type="text"
                              value={config.CLOUDINARY_API_KEY || ''}
                              onChange={(e) => handleChange('CLOUDINARY_API_KEY', e.target.value)}
                              className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none" 
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cloudinary Secret</label>
                          <div className="relative group/input">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                              <Lock size={16} />
                            </div>
                            <input 
                              type={showSecrets.CLOUDINARY_API_SECRET ? 'text' : 'password'}
                              value={config.CLOUDINARY_API_SECRET || ''}
                              onChange={(e) => handleChange('CLOUDINARY_API_SECRET', e.target.value)}
                              className="w-full pl-14 pr-14 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none" 
                            />
                            <button 
                              type="button"
                              onClick={() => toggleSecret('CLOUDINARY_API_SECRET')}
                              className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary transition-colors"
                            >
                              {showSecrets.CLOUDINARY_API_SECRET ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Admins Tab */}
                {activeTab === 'Admins' && (
                  <div className="p-12 space-y-12 animate-in fade-in duration-500 text-center">
                    <div className="w-20 h-20 bg-primary/5 rounded-[2rem] flex items-center justify-center text-primary mx-auto">
                      <ShieldCheck size={40} />
                    </div>
                    <div className="space-y-4 max-w-md mx-auto">
                      <h3 className="text-2xl font-black text-[#003B6D] tracking-tight">Access Management</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] leading-relaxed">Configure privileged administrative accounts and platform permissions.</p>
                    </div>
                    <button
                        onClick={() => setShowAdminModal(true)}
                        className="px-10 py-5 bg-[#003B6D] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-[#003B6D]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 mx-auto"
                    >
                        <UserPlus size={20} />
                        Grant Access
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Admin Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[500px] rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 border border-slate-100">
            <div className="p-10 bg-primary text-white relative">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur-md">
                    <ShieldCheck size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight uppercase">Access Node</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Administrative Protocol</p>
                  </div>
                </div>
                <button onClick={() => setShowAdminModal(false)} className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Identity</label>
                  <input type="text" placeholder="Name" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3.5 text-xs font-bold text-slate-900 focus:bg-white transition-all outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Node</label>
                  <input type="text" placeholder="+91..." className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3.5 text-xs font-bold text-slate-900 focus:bg-white transition-all outline-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Email</label>
                <input type="email" placeholder="admin@manuen.com" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-bold text-slate-900 focus:bg-white transition-all outline-none" />
              </div>

              <div className="space-y-4">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Node Permissions</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Manage Users', 'System Config', 'Billing Hub', 'Audit Logs'].map(perm => (
                    <label key={perm} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:bg-white transition-all group">
                      <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight group-hover:text-primary">{perm}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button onClick={() => setShowAdminModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all">
                  Abort
                </button>
                <button className="flex-[2] py-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                  Establish Node
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
