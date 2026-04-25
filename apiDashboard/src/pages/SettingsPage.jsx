import React, { useState } from 'react';
import {
  User,
  Settings,
  Bell,
  Shield,
  Users2,
  Globe,
  Smartphone,
  Mail,
  CheckCircle2,
  Camera,
  Save,
  ChevronRight,
  ExternalLink,
  Plus,
  Trash2,
  Lock,
  Eye,
  Info
} from 'lucide-react';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile');
  const [isSaved, setIsSaved] = useState(false);

  const sections = [
    { id: 'profile', label: 'Business Profile', icon: User },
    { id: 'general', label: 'General Settings', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security & Access', icon: Shield },
    { id: 'team', label: 'Team Management', icon: Users2 },
  ];

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {/* Top Bar Navigation */}
      <div className="bg-white border border-slate-200 rounded-3xl p-2 shadow-sm flex flex-wrap gap-1">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${activeSection === section.id
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
          >
            <section.icon size={18} />
            {section.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Profile Section */}
        {activeSection === 'profile' && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            {/* Header Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <User size={120} />
              </div>
              <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-3xl bg-emerald-500 text-white flex items-center justify-center text-3xl font-black shadow-xl shadow-emerald-200 border-4 border-white">
                    1
                  </div>
                  <button className="absolute -bottom-2 -right-2 p-2 bg-white border border-slate-200 rounded-xl shadow-lg text-slate-600 hover:text-emerald-500 transition-all">
                    <Camera size={16} />
                  </button>
                </div>
                <div className="text-center md:text-left space-y-1">
                  <h2 className="text-2xl font-black text-slate-800">1</h2>
                  <p className="text-slate-500 font-medium">Manage your public WhatsApp profile identity.</p>
                  <div className="flex items-center gap-2 pt-2 justify-center md:justify-start">
                    <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-emerald-100 flex items-center gap-1">
                      <CheckCircle2 size={12} /> OFFICIAL BUSINESS ACCOUNT
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase px-1">Display Name</label>
                    <input type="text" defaultValue="1" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase px-1">Category</label>
                    <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all appearance-none">
                      <option>Shopping & Retail</option>
                      <option>Professional Services</option>
                      <option>Education</option>
                      <option>Health & Wellness</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase px-1">Business Description</label>
                  <textarea rows="3" defaultValue="1" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all resize-none" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase px-1">Business Website</label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input type="text" defaultValue="1" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase px-1">Support Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input type="email" defaultValue="1" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                <button className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-white rounded-xl transition-all">Cancel</button>
                <button
                  onClick={handleSave}
                  className="px-8 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl shadow-lg shadow-slate-900/10 hover:bg-black transition-all flex items-center gap-2"
                >
                  {isSaved ? <CheckCircle2 size={18} className="text-emerald-400" /> : <Save size={18} />}
                  {isSaved ? 'Settings Saved' : 'Save Profile'}
                </button>
              </div>
            </div>

            {/* Compliance Info */}
            <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                <Info size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-blue-900">Official Business Account Verification</h4>
                <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                  To maintain your green badge, ensure your display name matches your legal business name exactly. Any changes may trigger a re-verification process by Meta.
                </p>
                <button className="mt-3 text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                  Learn more about verification <ExternalLink size={12} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Other sections would be handled similarly */}
        {activeSection !== 'profile' && (
          <div className="min-h-[400px]"></div>
        )}
      </div>
    </div>
  );
}
