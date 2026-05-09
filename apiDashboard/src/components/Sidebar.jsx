import React, { useState } from 'react';
import {
  LayoutDashboard, Send, MessageSquare, LayoutTemplate,
  Users, Bot, BarChart2, Smartphone, Blocks, CreditCard,
  Settings, HelpCircle, Headphones, Crown, X, Zap, Menu,
  Clock
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onNavigate, isOpen, setIsOpen }) {
  const [showPlanBanner, setShowPlanBanner] = useState(true);

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Campaigns', icon: Send, path: '/campaigns' },
    { name: 'Messages', icon: MessageSquare, path: '/messages' },
    { name: 'Message History', icon: Clock, path: '/history' },
    { name: 'Templates', icon: LayoutTemplate, path: '/templates' },
    { name: 'Contacts', icon: Users, path: '/contacts' },
    { name: 'Automations', icon: Bot, path: '/automations' },
    { name: 'Analytics', icon: BarChart2, path: '/analytics' },
    { name: 'WhatsApp Setup', icon: Smartphone, path: '/setup' },
    { name: 'Billing & Plan', icon: CreditCard, path: '/billing' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside className={`
      fixed lg:static inset-y-0 left-0 z-50
      w-[250px] bg-[#0F172A] text-slate-400 flex flex-col flex-shrink-0 h-full border-r border-slate-800
      transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Zap size={20} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg tracking-tight uppercase">Manuen</h1>
            <p className="text-[9px] text-emerald-400 font-bold tracking-[0.2em] -mt-1">INFOTECH</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden text-slate-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => {
              setActiveTab(item.name);
              if (item.path === '/dashboard' && onNavigate) {
                onNavigate('/dashboard');
              }
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group ${activeTab === item.name
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/20'
              : 'hover:bg-slate-800/50 hover:text-white'
              }`}
          >
            <item.icon size={18} className={activeTab === item.name ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'} />
            <span className="text-xs font-semibold tracking-wide">{item.name}</span>
          </button>
        ))}
      </nav>

      {/* Pro Plan Banner */}
      {showPlanBanner && (
        <div className="p-4 mx-4 mb-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 relative overflow-hidden group">
          <button
            onClick={() => setShowPlanBanner(false)}
            className="absolute top-2 right-2 z-20 text-slate-500 hover:text-white transition-colors p-1"
          >
            <X size={14} />
          </button>
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-indigo-500/10 rounded-full blur-2xl"></div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-amber-400/10 rounded-full flex items-center justify-center mb-3">
              <Crown size={20} className="text-amber-400" />
            </div>
            <h4 className="text-white text-sm font-bold mb-1">You're on Pro Plan</h4>
            <p className="text-[11px] text-slate-400 mb-4 px-2">Great! You have access to all premium features.</p>
            <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-indigo-600/20">
              Manage Plan
            </button>
          </div>
        </div>
      )}

      {/* Support */}
      <div className="p-4 mx-4 mb-6 bg-slate-900/50 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
            <HelpCircle size={18} />
          </div>
          <div>
            <p className="text-xs font-bold text-white leading-none">Need Help?</p>
            <p className="text-[10px] text-slate-500 mt-1">We're here to help you.</p>
          </div>
        </div>
        <button className="w-full py-2.5 bg-transparent border border-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2">
          <Headphones size={14} />
          Contact Support
        </button>
      </div>
    </aside>
  );
}