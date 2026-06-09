import React, { useState, useEffect } from 'react';
import {
  Shield, Globe, Database, Save, AlertCircle, Lock, Eye, EyeOff,
  Terminal, RefreshCw, Trash2, Activity, Loader2, Palette,
  Layout, Smartphone, BellRing, UserPlus, Sliders, CheckCircle2,
  Type, Link as LinkIcon, ShieldCheck, X,
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
      <main className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-[#F8FAFC]">
        <div className="space-y-4 pb-12">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 gap-3 shrink-0">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">Admin Settings</h1>
              <p className="text-xs text-slate-400 font-semibold mt-2 leading-none">Global platform configuration & infrastructure nodes</p>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="flex items-center justify-center gap-1.5 h-8 px-3.5 bg-[#003B6D] text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-all active:scale-95 shadow-sm"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                <span>{saving ? 'Syncing...' : 'Save Configuration'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-3">
              <div className="bg-white p-1.5 rounded-lg border border-slate-200 shadow-sm flex lg:flex-col overflow-x-auto no-scrollbar gap-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 whitespace-nowrap shrink-0 lg:w-full ${activeTab === tab.id 
                      ? 'bg-[#003B6D] text-white shadow-sm' 
                      : 'text-slate-455 hover:bg-slate-50 hover:text-slate-700'}`}
                  >
                    <tab.icon size={14} strokeWidth={2.5} className="shrink-0" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-9">
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                
                {/* Branding Tab */}
                {activeTab === 'Branding' && (
                  <div className="p-4 space-y-3 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 mb-3">
                      <div className="w-8 h-8 bg-pink-50 text-pink-600 rounded-lg flex items-center justify-center border border-pink-100 flex-shrink-0">
                        <Palette size={15} />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-800 tracking-tight leading-none">Company Branding</h3>
                        <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mt-1 leading-none">Configure White-Label parameters & PDF invoice headers</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Company Name</label>
                        <div className="relative group/input">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-350">
                            <Type size={14} />
                          </div>
                          <input 
                            type="text"
                            value={config.COMPANY_NAME || ''}
                            onChange={(e) => handleChange('COMPANY_NAME', e.target.value)}
                            placeholder="Maneun Infotech (OPC) Private Limited"
                            className="w-full pl-9 pr-3.5 h-8 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-slate-450 outline-none transition-all placeholder:text-slate-300" 
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Support Email</label>
                        <div className="relative group/input">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-355">
                            <Mail size={14} />
                          </div>
                          <input 
                            type="email"
                            value={config.SUPPORT_EMAIL || ''}
                            onChange={(e) => handleChange('SUPPORT_EMAIL', e.target.value)}
                            placeholder="support@maneun.com"
                            className="w-full pl-9 pr-3.5 h-8 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-slate-455 outline-none transition-all placeholder:text-slate-300" 
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Support Phone</label>
                        <div className="relative group/input">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-355">
                            <Smartphone size={14} />
                          </div>
                          <input 
                            type="text"
                            value={config.SUPPORT_PHONE || ''}
                            onChange={(e) => handleChange('SUPPORT_PHONE', e.target.value)}
                            placeholder="+91 9876543210"
                            className="w-full pl-9 pr-3.5 h-8 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-slate-455 outline-none transition-all placeholder:text-slate-300" 
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Tax/GST Number</label>
                        <div className="relative group/input">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-355">
                            <FileText size={14} />
                          </div>
                          <input 
                            type="text"
                            value={config.COMPANY_TAX_NUMBER || ''}
                            onChange={(e) => handleChange('COMPANY_TAX_NUMBER', e.target.value)}
                            placeholder="37AAAAA1111A1Z1"
                            className="w-full pl-9 pr-3.5 h-8 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-slate-455 outline-none transition-all placeholder:text-slate-300" 
                          />
                        </div>
                      </div>

                      <div className="space-y-1 col-span-full">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Company Address</label>
                        <div className="relative group/input">
                          <div className="absolute left-3 top-3 text-slate-355">
                            <MapPin size={14} />
                          </div>
                          <textarea 
                            rows="2" 
                            value={config.COMPANY_ADDRESS || ''}
                            onChange={(e) => handleChange('COMPANY_ADDRESS', e.target.value)}
                            placeholder="123 Corporate Node, Tech Park, India"
                            className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-slate-455 outline-none transition-all leading-normal placeholder:text-slate-300 resize-none"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Limits & Maintenance Tab */}
                {activeTab === 'Limits' && (
                  <div className="p-4 space-y-3 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 mb-3">
                      <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center border border-amber-100 flex-shrink-0">
                        <Sliders size={15} />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-800 tracking-tight leading-none">Limits & Maintenance</h3>
                        <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mt-1 leading-none">Configure global constraints & system switches</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 hover:bg-white transition-all">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center flex-shrink-0 border border-rose-100/50">
                            <AlertCircle size={13} />
                          </div>
                          <div className="leading-none">
                            <p className="text-xs font-bold text-slate-800">Maintenance Mode</p>
                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Platform offline for scheduled node operations</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={!!config.MAINTENANCE_MODE}
                            onChange={(e) => handleChange('MAINTENANCE_MODE', e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                        </label>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Default Contact Limit</label>
                        <div className="relative group/input">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-355">
                            <User size={14} />
                          </div>
                          <input 
                            type="number"
                            value={config.DEFAULT_CONTACT_LIMIT || ''}
                            onChange={(e) => handleChange('DEFAULT_CONTACT_LIMIT', parseInt(e.target.value) || 0)}
                            placeholder="5000"
                            className="w-full pl-9 pr-3.5 h-8 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-slate-455 outline-none transition-all placeholder:text-slate-300" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Meta API Configuration */}
                {activeTab === 'Meta' && (
                  <div className="p-4 space-y-3 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 mb-3">
                      <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center border border-blue-100 flex-shrink-0">
                        <Globe size={15} />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-800 tracking-tight leading-none">Meta Infrastructure</h3>
                        <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mt-1 leading-none">Core Graph API & WhatsApp Credentials</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Meta App ID</label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-355">
                            <Terminal size={14} />
                          </div>
                          <input 
                            type="text"
                            value={config.APP_ID || ''}
                            onChange={(e) => handleChange('APP_ID', e.target.value)}
                            className="w-full pl-9 pr-3.5 h-8 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-slate-455 outline-none transition-all placeholder:text-slate-300" 
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">App Secret</label>
                        <div className="relative group/input">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-355">
                            <Lock size={14} />
                          </div>
                          <input 
                            type={showSecrets.APP_SECRET ? 'text' : 'password'}
                            value={config.APP_SECRET || ''}
                            onChange={(e) => handleChange('APP_SECRET', e.target.value)}
                            className="w-full pl-9 pr-9 h-8 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-slate-455 outline-none transition-all placeholder:text-slate-300" 
                          />
                          <button 
                            type="button"
                            onClick={() => toggleSecret('APP_SECRET')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-355 hover:text-slate-655 transition-colors"
                          >
                            {showSecrets.APP_SECRET ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">WABA ID</label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-355">
                            <Cpu size={14} />
                          </div>
                          <input 
                            type="text"
                            value={config.WHATSAPP_BUSINESS_ACCOUNT_ID || ''}
                            onChange={(e) => handleChange('WHATSAPP_BUSINESS_ACCOUNT_ID', e.target.value)}
                            className="w-full pl-9 pr-3.5 h-8 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-slate-455 outline-none transition-all placeholder:text-slate-300" 
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Phone ID</label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-355">
                            <Smartphone size={14} />
                          </div>
                          <input 
                            type="text"
                            value={config.PHONE_NUMBER_ID || ''}
                            onChange={(e) => handleChange('PHONE_NUMBER_ID', e.target.value)}
                            className="w-full pl-9 pr-3.5 h-8 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-slate-455 outline-none transition-all placeholder:text-slate-300" 
                          />
                        </div>
                      </div>

                      <div className="space-y-1 col-span-full">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Access Token</label>
                        <div className="relative">
                          <div className="absolute left-3 top-3 text-slate-355">
                            <Key size={14} />
                          </div>
                          <textarea 
                            rows="3" 
                            value={config.ACCESSTOKEN || ''}
                            onChange={(e) => handleChange('ACCESSTOKEN', e.target.value)}
                            style={{ WebkitTextSecurity: showSecrets.ACCESSTOKEN ? 'none' : 'disc' }}
                            className="w-full pl-9 pr-9 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-mono font-bold text-slate-700 focus:bg-white focus:border-slate-400 transition-all outline-none leading-relaxed resize-none"
                          ></textarea>
                          <button 
                            type="button"
                            onClick={() => toggleSecret('ACCESSTOKEN')}
                            className="absolute right-3 top-3 text-slate-355 hover:text-slate-655 transition-colors"
                          >
                            {showSecrets.ACCESSTOKEN ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Webhooks Configuration */}
                {activeTab === 'Webhooks' && (
                  <div className="p-4 space-y-3 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 mb-3">
                      <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center border border-purple-100 flex-shrink-0">
                        <Webhook size={15} />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-800 tracking-tight leading-none">Webhooks & Routing</h3>
                        <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mt-1 leading-none">Endpoint nodes for real-time events</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3.5">
                      {[
                        { label: 'Verify Token', key: 'WEBHOOKVERIFYTOKEN', icon: Shield },
                        { label: 'Callback URL', key: 'WEBHOOKCALLBACKURL', icon: LinkIcon },
                        { label: 'Meta Redirect', key: 'META_REDIRECT_URI', icon: Globe },
                        { label: 'Frontend Node', key: 'FRONTEND_URL', icon: Smartphone }
                      ].map(field => (
                        <div key={field.key} className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">{field.label}</label>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-355">
                              <field.icon size={14} />
                            </div>
                            <input 
                              type="text"
                              value={config[field.key] || ''}
                              onChange={(e) => handleChange(field.key, e.target.value)}
                              className="w-full pl-9 pr-3.5 h-8 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-slate-400 outline-none transition-all placeholder:text-slate-300" 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Security Configuration */}
                {activeTab === 'Security' && (
                  <div className="p-4 space-y-3 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 mb-3">
                      <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center border border-emerald-100 flex-shrink-0">
                        <Shield size={15} />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-800 tracking-tight leading-none">Security Protocol</h3>
                        <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mt-1 leading-none">Authentication & encryption nodes</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">JWT Secret Node</label>
                        <div className="relative group/input">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-355">
                            <Lock size={14} />
                          </div>
                          <input 
                            type={showSecrets.JWT_SECRET ? 'text' : 'password'}
                            value={config.JWT_SECRET || ''}
                            onChange={(e) => handleChange('JWT_SECRET', e.target.value)}
                            className="w-full pl-9 pr-9 h-8 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-slate-400 outline-none transition-all placeholder:text-slate-300" 
                          />
                          <button 
                            type="button"
                            onClick={() => toggleSecret('JWT_SECRET')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-355 hover:text-slate-655 transition-colors"
                          >
                            {showSecrets.JWT_SECRET ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { label: 'Token TTL', key: 'JWT_EXPIRY', icon: Key },
                          { label: 'OTP TTL', key: 'OTP_EXPIRY', icon: RefreshCw },
                          { label: 'Max Attempts', key: 'MAX_OTP_ATTEMPTS', type: 'number', icon: AlertCircle }
                        ].map(field => (
                          <div key={field.key} className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">{field.label}</label>
                            <div className="relative">
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-355">
                                <field.icon size={12} />
                              </div>
                              <input 
                                type={field.type || 'text'}
                                value={config[field.key] || ''}
                                onChange={(e) => handleChange(field.key, e.target.value)}
                                className="w-full pl-7.5 pr-2.5 h-8 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-slate-400 transition-all outline-none" 
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Global Admin Email</label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-355">
                            <User size={14} />
                          </div>
                          <input 
                            type="email"
                            value={config.USER_EMAIL || ''}
                            onChange={(e) => handleChange('USER_EMAIL', e.target.value)}
                            className="w-full pl-9 pr-3.5 h-8 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-slate-400 outline-none transition-all placeholder:text-slate-300" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Infrastructure Configuration */}
                {activeTab === 'Infrastructure' && (
                  <div className="p-4 space-y-3 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 mb-3">
                      <div className="w-8 h-8 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center border border-orange-100 flex-shrink-0">
                        <Server size={15} />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-800 tracking-tight leading-none">Data & Assets</h3>
                        <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mt-1 leading-none">Persistence & media nodes</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">MongoDB Connection (MONGO_URI)</label>
                        <div className="relative group/input">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-355">
                            <Database size={14} />
                          </div>
                          <input 
                            type={showSecrets.MONGO_URI ? 'text' : 'password'}
                            value={config.MONGO_URI || ''}
                            onChange={(e) => handleChange('MONGO_URI', e.target.value)}
                            className="w-full pl-9 pr-9 h-8 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-slate-400 outline-none transition-all placeholder:text-slate-300" 
                          />
                          <button 
                            type="button"
                            onClick={() => toggleSecret('MONGO_URI')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-355 hover:text-slate-655 transition-colors"
                          >
                            {showSecrets.MONGO_URI ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Redis Cache (REDIS_URI)</label>
                        <div className="relative group/input">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-355">
                            <Server size={14} />
                          </div>
                          <input 
                            type={showSecrets.REDIS_URI ? 'text' : 'password'}
                            value={config.REDIS_URI || ''}
                            onChange={(e) => handleChange('REDIS_URI', e.target.value)}
                            className="w-full pl-9 pr-9 h-8 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-slate-400 outline-none transition-all placeholder:text-slate-350" 
                          />
                          <button 
                            type="button"
                            onClick={() => toggleSecret('REDIS_URI')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-355 hover:text-slate-655 transition-colors"
                          >
                            {showSecrets.REDIS_URI ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Cloudinary Key</label>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-355">
                              <Key size={14} />
                            </div>
                            <input 
                              type="text"
                              value={config.CLOUDINARY_API_KEY || ''}
                              onChange={(e) => handleChange('CLOUDINARY_API_KEY', e.target.value)}
                              className="w-full pl-9 pr-3.5 h-8 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-slate-400 outline-none transition-all placeholder:text-slate-300" 
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Cloudinary Secret</label>
                          <div className="relative group/input">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-355">
                              <Lock size={14} />
                            </div>
                            <input 
                              type={showSecrets.CLOUDINARY_API_SECRET ? 'text' : 'password'}
                              value={config.CLOUDINARY_API_SECRET || ''}
                              onChange={(e) => handleChange('CLOUDINARY_API_SECRET', e.target.value)}
                              className="w-full pl-9 pr-9 h-8 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-slate-400 outline-none transition-all placeholder:text-slate-300" 
                            />
                            <button 
                              type="button"
                              onClick={() => toggleSecret('CLOUDINARY_API_SECRET')}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-355 hover:text-slate-655 transition-colors"
                            >
                              {showSecrets.CLOUDINARY_API_SECRET ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Admins Tab */}
                {activeTab === 'Admins' && (
                  <div className="p-6 space-y-3.5 animate-in fade-in duration-300 text-center">
                    <div className="w-12 h-12 bg-[#003B6D]/5 rounded-lg flex items-center justify-center text-[#003B6D] mx-auto">
                      <ShieldCheck size={24} />
                    </div>
                    <div className="space-y-1 max-w-xs mx-auto">
                      <h3 className="text-xs font-bold text-slate-800 tracking-tight leading-none">Access Management</h3>
                      <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider leading-relaxed">Configure privileged administrative accounts and platform permissions.</p>
                    </div>
                    <button
                        onClick={() => setShowAdminModal(true)}
                        className="px-4 py-2 bg-[#003B6D] text-white rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 mx-auto"
                    >
                        <UserPlus size={12} />
                        <span>Grant Access</span>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-lg shadow-xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-4 bg-[#003B6D] text-white relative flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider">Access Node / Grant Permission</h3>
                </div>
              </div>
              <button onClick={() => setShowAdminModal(false)} className="text-white/60 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="p-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Full Identity</label>
                  <input type="text" placeholder="Name" className="w-full h-8 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-[#003B6D] outline-none transition-all placeholder:text-slate-300" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Phone Node</label>
                  <input type="text" placeholder="+91..." className="w-full h-8 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-[#003B6D] outline-none transition-all placeholder:text-slate-300" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Secure Email</label>
                <input type="email" placeholder="admin@manuen.com" className="w-full h-8 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-[#003B6D] outline-none transition-all placeholder:text-slate-300" />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Node Permissions</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Manage Users', 'System Config', 'Billing Hub', 'Audit Logs'].map(perm => (
                    <label key={perm} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-white transition-all group">
                      <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-350 text-[#003B6D] focus:ring-[#003B6D]/20 cursor-pointer" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight group-hover:text-[#003B6D]">{perm}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button onClick={() => setShowAdminModal(false)} className="h-8 px-4 bg-white border border-slate-200 text-slate-500 text-xs font-bold rounded-lg hover:bg-slate-50 cursor-pointer transition-all">
                  Abort
                </button>
                <button onClick={() => setShowAdminModal(false)} className="h-8 px-4 bg-[#003B6D] text-white text-xs font-bold rounded-lg hover:opacity-90 active:scale-95 shadow-sm transition-all">
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
