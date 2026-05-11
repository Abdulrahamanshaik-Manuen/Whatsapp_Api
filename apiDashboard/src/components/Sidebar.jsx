import React, { useState } from 'react';
import {
  LayoutDashboard, Send, MessageSquare, LayoutTemplate,
  Users, Bot, BarChart2, Smartphone, Blocks, CreditCard,
  Settings, HelpCircle, Headphones, Crown, X, Zap, Menu,
  Clock, FolderOpen
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
    { name: 'Groups', icon: FolderOpen, path: '/groups' },
    { name: 'Automations', icon: Bot, path: '/automations' },
    { name: 'Analytics', icon: BarChart2, path: '/analytics' },
    { name: 'WhatsApp Setup', icon: Smartphone, path: '/setup' },
    { name: 'Billing & Plan', icon: CreditCard, path: '/billing' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside className={`
      fixed lg:static inset-y-0 left-0 z-50
      w-[260px] bg-primary text-white/70 flex flex-col flex-shrink-0 h-full border-r border-white/5
      transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-white shadow-lg shadow-secondary/20">
            <Zap size={22} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-white font-display font-black text-xl tracking-tight leading-none">MANUEN</h1>
            <p className="text-[9px] text-secondary font-black tracking-[0.2em] mt-1">INFOTECH</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden text-white/40 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar no-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => {
              setActiveTab(item.name);
              if (onNavigate) onNavigate(item.path);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === item.name
              ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/20'
              : 'hover:bg-white/5 hover:text-white'
              }`}
          >
            <item.icon size={18} className={activeTab === item.name ? 'text-secondary' : 'text-white/40 group-hover:text-white/60'} />
            <span className="text-xs font-bold tracking-wide">{item.name}</span>
            {activeTab === item.name && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_8px_rgba(99,193,50,0.6)]"></div>
            )}
          </button>
        ))}
      </nav>

      {/* Pro Plan Banner */}
      {showPlanBanner && (
        <div className="p-5 mx-4 mb-6 bg-white/5 rounded-2xl border border-white/10 relative overflow-hidden group">
          <button
            onClick={() => setShowPlanBanner(false)}
            className="absolute top-2 right-2 z-20 text-white/20 hover:text-white transition-colors p-1"
          >
            <X size={14} />
          </button>
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center mb-3">
              <Crown size={20} className="text-secondary" />
            </div>
            <h4 className="text-white text-sm font-black mb-1">Enterprise Pro</h4>
            <p className="text-[10px] text-white/50 mb-4 px-2 font-medium">Enjoy unlimited messaging and advanced automation tools.</p>
            <button className="w-full py-2.5 bg-secondary hover:brightness-110 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-secondary/20">
              Manage Subscription
            </button>
          </div>
        </div>
      )}

      {/* Support */}
      <div className="p-4 mx-4 mb-8 bg-white/5 rounded-2xl border border-white/5">
        <button className="w-full py-3 bg-transparent border border-white/10 hover:bg-white/5 text-white/60 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2">
          <Headphones size={14} />
          Technical Support
        </button>
      </div>
    </aside>
  );
}
