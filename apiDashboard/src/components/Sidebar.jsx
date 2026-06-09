import React, { useState } from 'react';
import {
  LayoutDashboard, Send, MessageSquare, LayoutTemplate,
  Users, Bot, BarChart2, Smartphone, Blocks, CreditCard,
  Settings, HelpCircle, Headphones, Crown, X, Zap, Menu,
  Clock, FolderOpen, LogOut, ChevronLeft, ChevronRight
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onNavigate, isOpen, setIsOpen, userData, onLogout, setShowSupport, isCollapsed, setIsCollapsed }) {
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
      bg-[#003B6D] text-white/70 flex flex-col flex-shrink-0 h-full border-r border-white/5
      transition-all duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      ${isCollapsed ? 'w-[210px] lg:w-[72px]' : 'w-[210px] lg:w-[240px]'}
    `}>
      {/* Sidebar Logo Header */}
      <div className={`h-14 flex items-center border-b border-white/5 ${isCollapsed ? 'justify-center px-2' : 'px-4'}`}>
        <div className="flex items-center justify-between w-full relative">
          {!isCollapsed ? (
            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-md shadow-sm border border-slate-100">
              <img src="/manuen_square.png" alt="Icon" className="h-7 w-7 object-contain" />
              <img src="/manuen_logo.png" alt="Manuen" className="h-7 object-contain -ml-2" />
            </div>
          ) : (
            <>
              <div className="hidden lg:flex items-center justify-center w-full">
                <div className="bg-white p-1 rounded-md shadow-sm border border-slate-100 flex items-center justify-center">
                  <img src="/manuen_square.png" alt="Icon" className="h-6 w-6 object-contain" />
                </div>
              </div>
              <div className="lg:hidden flex items-center gap-1 bg-white px-2 py-1 rounded-md shadow-sm border border-slate-100">
                <img src="/manuen_square.png" alt="Icon" className="h-7 w-7 object-contain" />
                <img src="/manuen_logo.png" alt="Manuen" className="h-7 object-contain -ml-2" />
              </div>
            </>
          )}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden absolute right-0 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Navigation items list */}
      <nav className={`flex-1 space-y-1 overflow-y-auto custom-scrollbar no-scrollbar ${isCollapsed ? 'px-2 py-4' : 'px-3 py-4'}`}>
        {navItems.filter(item => !item.hidden).map((item) => (
          <button
            key={item.name}
            onClick={() => {
              setActiveTab(item.name);
              if (onNavigate) onNavigate(item.path);
            }}
            className={`w-full flex items-center rounded-lg transition-all duration-150 group relative ${isCollapsed ? 'lg:justify-center lg:px-2 lg:py-2.5 px-3.5 py-2.5' : 'gap-3 px-3.5 py-2.5'
              } ${activeTab === item.name
                ? 'bg-[#0D2E5C] text-white font-semibold'
                : 'hover:bg-white/5 hover:text-white'
              }`}
            title={isCollapsed ? item.name : undefined}
          >
            <item.icon size={16} className={activeTab === item.name ? 'text-secondary' : 'text-white/40 group-hover:text-white/60'} />
            <span className={`text-[13px] font-medium tracking-wide ${isCollapsed ? 'lg:hidden' : 'block'}`}>{item.name}</span>

            {activeTab === item.name && (
              <div className={`rounded-full bg-secondary shadow-[0_0_8px_rgba(99,193,50,0.6)] ${isCollapsed ? 'absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5' : 'ml-auto w-1.5 h-1.5'
                }`}></div>
            )}
          </button>
        ))}
      </nav>

      {/* Support & Logout */}
      <div className={`mx-3 mb-2 border-t border-white/10 pt-3 ${isCollapsed ? 'px-0' : 'px-1'}`}>
        {!isCollapsed && (
          <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1.5 px-1">SUPPORT</p>
        )}
        <button
          onClick={() => setShowSupport(true)}
          title="Technical Support"
          className={`w-full hover:bg-white/5 text-white/70 hover:text-white text-xs font-semibold rounded-lg transition-all flex items-center ${isCollapsed ? 'lg:justify-center lg:py-2.5 lg:px-0 gap-0' : 'py-2 px-1 gap-2.5'
            }`}
        >
          <Headphones size={16} className="text-white/40" />
          <span className={isCollapsed ? 'lg:hidden' : 'block'}>Technical Support</span>
        </button>
        <button
          onClick={onLogout}
          title="Log Out System"
          className={`w-full mt-3 bg-transparent border border-rose-500/30 hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 text-xs font-bold rounded-lg transition-all flex items-center justify-center py-2 px-3 ${isCollapsed ? 'lg:py-2.5 lg:px-0 gap-0 border border-rose-500/30' : 'gap-2'
            }`}
        >
          <LogOut size={14} />
          <span className={isCollapsed ? 'lg:hidden' : 'block'}>Log Out</span>
        </button>
      </div>

      {/* Collapse Toggle Button (Desktop only) */}
      <div className="hidden lg:flex justify-center border-t border-white/10 py-2.5 bg-black/10">
        <button
          onClick={setIsCollapsed}
          className="text-white/40 hover:text-white hover:bg-white/5 p-1 rounded-lg transition-colors flex items-center justify-center w-full"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}
