import React from 'react';
import {
  LayoutDashboard, LayoutTemplate, Users, Bot,
  Clock, X, CreditCard, Settings, LogOut, ChevronRight, ChevronLeft
} from 'lucide-react';

export default function AdminSidebar({ activeTab, setActiveTab, onNavigate, isOpen, setIsOpen, userData, isCollapsed, setIsCollapsed }) {
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
      bg-primary text-white/70 flex flex-col flex-shrink-0 h-full border-r border-white/5
      transition-all duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      ${isCollapsed ? 'w-[210px] lg:w-[72px]' : 'w-[210px] lg:w-[240px]'}
    `}>
      {/* Branding */}
      <div className={`h-14 flex items-center border-b border-white/5 ${isCollapsed ? 'justify-center px-2' : 'px-4'}`}>
        <div className="flex items-center justify-between w-full relative">
          {!isCollapsed ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center p-1.5 shadow-md overflow-hidden shrink-0">
                <img src="/manuen_square.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col min-w-0">
                <h1 className="text-white font-black text-xs tracking-widest uppercase flex items-center gap-1.5 truncate">
                  Admin Panel
                </h1>
              </div>
            </div>
          ) : (
            <>
              <div className="hidden lg:flex items-center justify-center w-full">
                <div className="bg-white p-1.5 rounded-lg shadow-md border border-slate-100 flex items-center justify-center w-8 h-8">
                  <img src="/manuen_square.png" alt="Icon" className="w-full h-full object-contain" />
                </div>
              </div>
              <div className="lg:hidden flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center p-1.5 shadow-md overflow-hidden shrink-0">
                  <img src="/manuen_square.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <h1 className="text-white font-black text-xs tracking-widest uppercase truncate">
                  Admin Panel
                </h1>
              </div>
            </>
          )}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden absolute right-0 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors shrink-0 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 space-y-1 overflow-y-auto custom-scrollbar no-scrollbar ${isCollapsed ? 'px-2 py-4' : 'px-3 py-4'}`}>
        {navItems.map((item) => {
          const isActive = activeTab === item.name;
          return (
            <button
              key={item.name}
              onClick={() => {
                setActiveTab(item.name);
                if (onNavigate) onNavigate(item.path);
              }}
              className={`w-full flex items-center rounded-lg transition-all duration-150 group relative gap-3 px-3.5 py-2.5 ${isCollapsed ? 'lg:justify-center lg:px-2 lg:py-2.5 lg:gap-0' : ''
                } ${isActive
                  ? 'bg-white/10 text-white font-semibold'
                  : 'hover:bg-white/5 hover:text-white'
                }`}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon size={16} className={isActive ? 'text-secondary' : 'text-white/40 group-hover:text-white/60'} />
              <span className={`text-[13px] font-medium tracking-wide ${isCollapsed ? 'lg:hidden' : 'block'}`}>{item.name}</span>
              {isActive && (
                <div className={`rounded-full bg-secondary shadow-[0_0_8px_rgba(99,193,50,0.6)] ${isCollapsed ? 'absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5' : 'ml-auto w-1.5 h-1.5'
                  }`}></div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout Section */}
      <div className={`mx-3 mb-2 border-t border-white/10 pt-3 ${isCollapsed ? 'px-0' : 'px-1'}`}>
        <button
          onClick={() => {
            localStorage.clear();
            if (onNavigate) onNavigate('/login');
          }}
          title="Logout"
          className={`w-full bg-white/5 border border-white/10 hover:bg-rose-500/10 hover:border-rose-500/20 text-rose-455 hover:text-rose-300 text-xs font-bold rounded-lg transition-all flex items-center justify-center py-2 px-3 gap-2 cursor-pointer ${isCollapsed ? 'lg:py-2.5 lg:px-0 lg:gap-0' : ''
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
          className="text-white/40 hover:text-white hover:bg-white/5 p-1 rounded-lg transition-colors flex items-center justify-center w-full cursor-pointer"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}
