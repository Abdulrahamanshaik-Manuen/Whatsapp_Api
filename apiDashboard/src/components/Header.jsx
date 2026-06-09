import React, { useState, useEffect, useRef } from 'react';
import {
  Menu, Bell, ChevronDown, Search, Zap,
  LayoutDashboard, MessageSquare, FileText, Users,
  Megaphone, Settings, Bot, X
} from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

/* ── Quick-launch items for global search ── */
const NAV_ITEMS = [
  { label: 'Dashboard',      icon: LayoutDashboard, tab: 'Dashboard',       path: '/dashboard' },
  { label: 'Inbox',          icon: MessageSquare,   tab: 'Messages',        path: '/messages' },
  { label: 'Campaigns',      icon: Megaphone,       tab: 'Campaigns',       path: '/campaigns' },
  { label: 'Templates',      icon: FileText,        tab: 'Templates',       path: '/templates' },
  { label: 'Contacts',       icon: Users,           tab: 'Contacts',        path: '/contacts' },
  { label: 'Automations',    icon: Bot,             tab: 'Automations',     path: '/automations' },
  { label: 'Settings',       icon: Settings,        tab: 'Settings',        path: '/settings' },
];

export default function Header({ activeTab, toggleSidebar, isCollapsed, setIsCollapsed, onNavigate, userData, businessData, onLogout, setActiveTab }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const notificationsRef = useRef(null);

  const user = userData || {};
  const userName = user.name || JSON.parse(localStorage.getItem('user') || '{}').name || 'User';

  /* Filter nav items by search query */
  const results = searchQuery.trim()
    ? NAV_ITEMS.filter(i => i.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : NAV_ITEMS;

  /* Open on Ctrl+K / Cmd+K */
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  /* Close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* Close notifications on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) setUnreadCount(data.filter(n => !n.isRead).length);
    } catch {}
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const navigate = (item) => {
    if (setActiveTab) setActiveTab(item.tab);
    if (onNavigate) onNavigate(item.path);
    setSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 md:px-5 flex items-center justify-between sticky top-0 z-20 gap-4">

      {/* Left: hamburger */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => {
            if (window.innerWidth < 1024) toggleSidebar();
            else if (setIsCollapsed) setIsCollapsed();
          }}
          className="text-slate-500 hover:text-slate-800 transition-colors cursor-pointer p-1 hover:bg-slate-50 rounded-md flex items-center justify-center"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Centre: Global search */}
      <div className="flex-1 max-w-md relative" ref={searchRef}>
        <button
          onClick={() => {
            setSearchOpen(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className="w-full flex items-center gap-2.5 h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-left hover:border-slate-300 hover:bg-white transition-all group cursor-text"
        >
          <Search size={13} className="text-slate-400 shrink-0" />
          <span className="text-xs text-slate-400 font-medium flex-1">Search pages, templates…</span>
          <span className="hidden sm:inline-flex items-center gap-0.5">
            <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-bold text-slate-400 shadow-sm leading-none">Ctrl</kbd>
            <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-bold text-slate-400 shadow-sm leading-none">K</kbd>
          </span>
        </button>

        {/* Dropdown */}
        {searchOpen && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Search input */}
            <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-slate-100">
              <Search size={13} className="text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search pages…"
                className="flex-1 text-xs font-medium text-slate-700 outline-none placeholder:text-slate-300 bg-transparent"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-slate-300 hover:text-slate-500 cursor-pointer">
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Results */}
            <div className="py-1.5 max-h-64 overflow-y-auto">
              {results.length === 0 ? (
                <p className="px-4 py-3 text-[11px] text-slate-400 font-medium">No results found</p>
              ) : (
                <>
                  <p className="px-3 pb-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    {searchQuery ? 'Results' : 'Quick Navigation'}
                  </p>
                  {results.map((item) => (
                    <button
                      key={item.tab}
                      onClick={() => navigate(item)}
                      className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 transition-colors cursor-pointer text-left ${activeTab === item.tab ? 'bg-blue-50/50' : ''}`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${activeTab === item.tab ? 'bg-[#003B6D] text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <item.icon size={13} />
                      </div>
                      <span className={`text-xs font-semibold ${activeTab === item.tab ? 'text-[#003B6D]' : 'text-slate-700'}`}>
                        {item.label}
                      </span>
                      {activeTab === item.tab && (
                        <span className="ml-auto text-[9px] font-black text-[#003B6D] bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-wider">Current</span>
                      )}
                    </button>
                  ))}
                </>
              )}
            </div>

            <div className="px-3 py-2 border-t border-slate-100 flex items-center gap-3">
              <span className="text-[9px] text-slate-300 font-semibold">↵ to navigate</span>
              <span className="text-[9px] text-slate-300 font-semibold">Esc to close</span>
            </div>
          </div>
        )}
      </div>

      {/* Right: bell + profile */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Notification bell */}
        <div className="static sm:relative" ref={notificationsRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg relative cursor-pointer transition-colors"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            )}
          </button>
          {showNotifications && (
            <NotificationDropdown onClose={() => setShowNotifications(false)} />
          )}
        </div>

        <div className="h-6 w-[1px] bg-slate-200 mx-1" />

        {/* Profile */}
        <div
          onClick={() => {
            if (setActiveTab) setActiveTab('Settings');
            if (onNavigate) onNavigate('/settings');
          }}
          className="flex items-center gap-2 cursor-pointer group pl-1"
        >
          <div className="w-8 h-8 rounded-full bg-[#0A2540] text-white flex items-center justify-center font-bold text-xs shadow-sm group-hover:scale-105 transition-transform">
            {userName[0]}
          </div>
          <div className="hidden sm:flex items-center gap-1">
            <span className="text-xs font-bold text-slate-800 group-hover:text-primary transition-colors">
              {userName.split(' ')[0]}
            </span>
            <ChevronDown size={12} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
          </div>
        </div>
      </div>
    </header>
  );
}
