import React, { useState } from 'react';
import {
  LayoutDashboard, Send, MessageSquare, LayoutTemplate,
  Users, Bot, BarChart2, Smartphone, Blocks, CreditCard,
  Settings, HelpCircle, Headphones, Crown, X, Zap, Menu,
  Clock, FolderOpen, LogOut
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onNavigate, isOpen, setIsOpen, userData, onLogout, setShowSupport }) {
  const [showPlanBanner, setShowPlanBanner] = useState(true);

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Campaigns', icon: Send, path: '/campaigns' },
    { name: 'Messages', icon: MessageSquare, path: '/messages' },
    { name: 'Message History', icon: Clock, path: '/history' },
    { name: 'Templates', icon: LayoutTemplate, path: '/templates' },
    { name: 'Create Template', icon: Zap, path: '/templates/create', hidden: true },
    { name: 'Contacts', icon: Users, path: '/contacts' },
    { name: 'Groups', icon: FolderOpen, path: '/groups' },
    { name: 'Automations', icon: Bot, path: '/automations' },

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
      <div className="p-6">
        <div className="flex justify-center w-full relative">
          <h1 className="text-secondary font-bold text-2xl leading-tight tracking-widest uppercase text-center">
             Client<br/>Dashboard
          </h1>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden absolute right-0 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar no-scrollbar">
        {navItems.filter(item => !item.hidden).map((item) => (
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

      {/* Support & Logout */}
      <div className="p-4 mx-4 mb-8 space-y-3 bg-white/5 rounded-2xl border border-white/5">
        <button 
          onClick={() => setShowSupport(true)}
          className="w-full py-3 bg-transparent border border-white/10 hover:bg-white/5 text-white/60 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <Headphones size={14} />
          Technical Support
        </button>
        <button 
          onClick={onLogout}
          className="w-full py-3 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <LogOut size={14} />
          Log Out System
        </button>
      </div>
    </aside>
  );
}
