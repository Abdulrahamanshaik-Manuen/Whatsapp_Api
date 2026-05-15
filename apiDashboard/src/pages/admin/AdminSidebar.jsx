import React from 'react';
import {
  LayoutDashboard, LayoutTemplate, Users, Bot, 
  Clock, X, Zap, Crown, Headphones, BarChart2, CreditCard, Settings, LogOut, ChevronRight
} from 'lucide-react';

export default function AdminSidebar({ activeTab, setActiveTab, onNavigate, isOpen, setIsOpen, userData }) {
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { name: 'User Management', icon: Users, path: '/admin/users' },
    { name: 'Template Requests', icon: LayoutTemplate, path: '/admin/templates' },
    { name: 'Automation Hub', icon: Bot, path: '/admin/automations' },
    { name: 'Message Logs', icon: Clock, path: '/admin/logs' },
    { name: 'Billing & Subscriptions', icon: CreditCard, path: '/admin/billing' },
    { name: 'System Settings', icon: Settings, path: '/admin/settings' },
  ];

  return (
    <aside className={`
      fixed lg:static inset-y-0 left-0 z-50
      w-[260px] bg-primary text-white/70 flex flex-col flex-shrink-0 h-full border-r border-white/5
      transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      {/* Branding */}
      <div className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center p-2.5 shadow-xl shadow-white/5 overflow-hidden">
             <img src="/manuen_square.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-white font-black text-xs tracking-widest uppercase flex items-center gap-2">
               Admin Dashboard
            </h1>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden ml-auto text-white/40 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar no-scrollbar">
        {navItems.map((item) => {
          const isActive = activeTab === item.name;
          return (
            <button
              key={item.name}
              onClick={() => {
                setActiveTab(item.name);
                if (onNavigate) onNavigate(item.path);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/20'
                : 'hover:bg-white/5 hover:text-white'
                }`}
            >
              <item.icon size={18} className={isActive ? 'text-secondary' : 'text-white/40 group-hover:text-white/60'} />
              <span className="text-xs font-bold tracking-wide">{item.name}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_8px_rgba(99,193,50,0.6)]"></div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout Section */}
      <div className="p-4 mx-4 mb-8">
        <button 
          onClick={() => {
            localStorage.clear();
            if (onNavigate) onNavigate('/login');
          }}
          className="w-full py-3 bg-white/5 border border-white/10 hover:bg-rose-500/10 hover:border-rose-500/20 text-white/60 hover:text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 group"
        >
          <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" />
          Terminate Session
        </button>
      </div>
    </aside>
  );
}
